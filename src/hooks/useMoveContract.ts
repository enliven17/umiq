import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMoveMarkets, 
  createMoveMarket, 
  placeMoveBet,
  resolveMoveMarket,
  closeMoveMarket,
  selectMoveMarkets,
  selectMoveMarketsLoading,
  selectMoveMarketsError,
  selectLastTransactionHash,
  clearError,
  clearTransactionHash
} from '@/store/moveMarketsSlice';
import { moveClient } from '@/api/moveClient';
import { MOVE_CONFIG, MOVE_ERRORS } from '@/config/moveConfig';
import { Market, BetSide } from '@/types/market';
import { CreateMarketParams, PlaceBetParams } from '@/api/moveClient';

export const useMoveContract = () => {
  const dispatch = useDispatch();
  const markets = useSelector(selectMoveMarkets);
  const loading = useSelector(selectMoveMarketsLoading);
  const error = useSelector(selectMoveMarketsError);
  const lastTransactionHash = useSelector(selectLastTransactionHash);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Initialize the Move client
  const initialize = useCallback(async (privateKeyHex?: string, walletAddress?: string) => {
    try {
      if (privateKeyHex) {
        const address = await moveClient.initialize(privateKeyHex);
        setUserAddress(address);
      } else if (walletAddress) {
        await moveClient.initializeWithWallet(walletAddress);
        setUserAddress(walletAddress);
      } else {
        throw new Error(MOVE_ERRORS.WALLET_NOT_CONNECTED);
      }
      setIsInitialized(true);
      return true;
    } catch (err) {
      console.error('Failed to initialize Move client:', err);
      return false;
    }
  }, []);

  // Fetch all markets
  const fetchMarkets = useCallback(async () => {
    if (!isInitialized) {
      throw new Error(MOVE_ERRORS.CONTRACT_NOT_DEPLOYED);
    }
    dispatch(fetchMoveMarkets());
  }, [dispatch, isInitialized]);

  // Create a new market
  const createMarket = useCallback(async (params: {
    title: string;
    description: string;
    closesAt: Date;
    initialPool: number;
    minBet: number;
    maxBet: number;
  }) => {
    if (!isInitialized) {
      throw new Error(MOVE_ERRORS.CONTRACT_NOT_DEPLOYED);
    }

    // Validate parameters
    if (params.initialPool < MOVE_CONFIG.MIN_INITIAL_POOL || params.initialPool > MOVE_CONFIG.MAX_INITIAL_POOL) {
      throw new Error(`Initial pool must be between ${MOVE_CONFIG.MIN_INITIAL_POOL} and ${MOVE_CONFIG.MAX_INITIAL_POOL} ETH`);
    }

    if (params.minBet < MOVE_CONFIG.MIN_BET_AMOUNT || params.maxBet > MOVE_CONFIG.MAX_BET_AMOUNT) {
      throw new Error(`Bet amounts must be between ${MOVE_CONFIG.MIN_BET_AMOUNT} and ${MOVE_CONFIG.MAX_BET_AMOUNT} ETH`);
    }

    if (params.minBet >= params.maxBet) {
      throw new Error('Minimum bet must be less than maximum bet');
    }

    const closesAtTimestamp = Math.floor(params.closesAt.getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    if (closesAtTimestamp <= now) {
      throw new Error(MOVE_ERRORS.INVALID_CLOSING_TIME);
    }

    if (closesAtTimestamp - now < MOVE_CONFIG.MIN_MARKET_DURATION) {
      throw new Error(`Market duration must be at least ${MOVE_CONFIG.MIN_MARKET_DURATION / 3600} hours`);
    }

    const moveParams: CreateMarketParams = {
      title: params.title,
      description: params.description,
      closesAt: closesAtTimestamp,
      initialPool: params.initialPool,
      minBet: params.minBet,
      maxBet: params.maxBet,
    };

    dispatch(createMoveMarket(moveParams));
  }, [dispatch, isInitialized]);

  // Place a bet
  const placeBet = useCallback(async (params: {
    marketId: number;
    amount: number;
    side: BetSide;
  }) => {
    if (!isInitialized) {
      throw new Error(MOVE_ERRORS.CONTRACT_NOT_DEPLOYED);
    }

    // Validate parameters
    if (params.amount < MOVE_CONFIG.MIN_BET_AMOUNT || params.amount > MOVE_CONFIG.MAX_BET_AMOUNT) {
      throw new Error(`Bet amount must be between ${MOVE_CONFIG.MIN_BET_AMOUNT} and ${MOVE_CONFIG.MAX_BET_AMOUNT} ETH`);
    }

    const moveParams: PlaceBetParams = {
      marketId: params.marketId,
      amount: params.amount,
      side: params.side === 'yes' ? 0 : 1,
    };

    dispatch(placeMoveBet(moveParams));
  }, [dispatch, isInitialized]);

  // Resolve a market (oracle only)
  const resolveMarket = useCallback(async (marketId: number, result: BetSide) => {
    if (!isInitialized) {
      throw new Error(MOVE_ERRORS.CONTRACT_NOT_DEPLOYED);
    }

    dispatch(resolveMoveMarket({ marketId, result }));
  }, [dispatch, isInitialized]);

  // Close a market
  const closeMarket = useCallback(async (marketId: number) => {
    if (!isInitialized) {
      throw new Error(MOVE_ERRORS.CONTRACT_NOT_DEPLOYED);
    }

    dispatch(closeMoveMarket(marketId));
  }, [dispatch, isInitialized]);

  // Get market by ID
  const getMarket = useCallback(async (marketId: number) => {
    if (!isInitialized) {
      throw new Error(MOVE_ERRORS.CONTRACT_NOT_DEPLOYED);
    }

    return await moveClient.getMarket(marketId);
  }, [isInitialized]);

  // Get user bets
  const getUserBets = useCallback(async (address: string) => {
    if (!isInitialized) {
      throw new Error(MOVE_ERRORS.CONTRACT_NOT_DEPLOYED);
    }

    return await moveClient.getUserBets(address);
  }, [isInitialized]);

  // Get oracle address
  const getOracle = useCallback(async () => {
    if (!isInitialized) {
      throw new Error(MOVE_ERRORS.CONTRACT_NOT_DEPLOYED);
    }

    return await moveClient.getOracle();
  }, [isInitialized]);

  // Clear error
  const clearContractError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear transaction hash
  const clearTransaction = useCallback(() => {
    dispatch(clearTransactionHash());
  }, [dispatch]);

  // Check if user is oracle
  const isOracle = useCallback(async (address: string) => {
    try {
      const oracleAddress = await getOracle();
      return address.toLowerCase() === oracleAddress.toLowerCase();
    } catch (err) {
      return false;
    }
  }, [getOracle]);

  // Auto-refresh markets
  useEffect(() => {
    if (isInitialized) {
      fetchMarkets();
      
      // Set up periodic refresh
      const interval = setInterval(() => {
        fetchMarkets();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isInitialized, fetchMarkets]);

  return {
    // State
    markets,
    loading,
    error,
    lastTransactionHash,
    isInitialized,
    userAddress,
    
    // Actions
    initialize,
    fetchMarkets,
    createMarket,
    placeBet,
    resolveMarket,
    closeMarket,
    getMarket,
    getUserBets,
    getOracle,
    isOracle,
    
    // Utilities
    clearContractError,
    clearTransaction,
    
    // Constants
    config: MOVE_CONFIG,
    errors: MOVE_ERRORS,
  };
}; 