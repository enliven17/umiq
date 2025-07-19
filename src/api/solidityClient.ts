import { ethers } from 'ethers';
import { PredictionMarket__factory } from '../types/contracts';

// Contract ABI and address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const RPC_URL = 'https://devnet.uminetwork.com';

// Contract interface
export interface Market {
  id: number;
  creator: string;
  title: string;
  description: string;
  closingTime: number;
  totalYesBets: string;
  totalNoBets: string;
  minBet: string;
  maxBet: string;
  initialPool: string;
  isResolved: boolean;
  outcome: boolean;
  isClosed: boolean;
  totalBets: number;
  totalPool: string;
}

export interface Bet {
  user: string;
  amount: string;
  prediction: boolean;
  timestamp: number;
  claimed: boolean;
}

export interface CreateMarketParams {
  title: string;
  description: string;
  closingTime: number;
  minBet: string;
  maxBet: string;
  initialPool: string;
}

export interface PlaceBetParams {
  marketId: number;
  amount: string;
  prediction: boolean;
}

export interface MarketStats {
  totalYesBets: string;
  totalNoBets: string;
  totalBets: number;
  totalPool: string;
  isResolved: boolean;
  outcome: boolean;
}

class SolidityClient {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
  }

  /**
   * Initialize the client with a signer
   */
  async initialize(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = PredictionMarket__factory.connect(CONTRACT_ADDRESS, signer);
    return this.contract;
  }

  /**
   * Get contract instance
   */
  getContract(): ethers.Contract | null {
    return this.contract;
  }

  /**
   * Get provider
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get signer
   */
  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  /**
   * Create a new market
   */
  async createMarket(params: CreateMarketParams): Promise<ethers.ContractTransaction> {
    if (!this.contract) throw new Error('Contract not initialized');

    const initialPoolWei = ethers.parseEther(params.initialPool);
    const minBetWei = ethers.parseEther(params.minBet);
    const maxBetWei = ethers.parseEther(params.maxBet);

    return await this.contract.createMarket(
      params.title,
      params.description,
      params.closingTime,
      minBetWei,
      maxBetWei,
      { value: initialPoolWei }
    );
  }

  /**
   * Place a bet on a market
   */
  async placeBet(params: PlaceBetParams): Promise<ethers.ContractTransaction> {
    if (!this.contract) throw new Error('Contract not initialized');

    const amountWei = ethers.parseEther(params.amount);

    return await this.contract.placeBet(
      params.marketId,
      params.prediction,
      { value: amountWei }
    );
  }

  /**
   * Resolve a market
   */
  async resolveMarket(marketId: number, outcome: boolean): Promise<ethers.ContractTransaction> {
    if (!this.contract) throw new Error('Contract not initialized');

    return await this.contract.resolveMarket(marketId, outcome);
  }

  /**
   * Close a market
   */
  async closeMarket(marketId: number): Promise<ethers.ContractTransaction> {
    if (!this.contract) throw new Error('Contract not initialized');

    return await this.contract.closeMarket(marketId);
  }

  /**
   * Claim rewards for a market
   */
  async claimReward(marketId: number): Promise<ethers.ContractTransaction> {
    if (!this.contract) throw new Error('Contract not initialized');

    return await this.contract.claimReward(marketId);
  }

  /**
   * Withdraw user balance
   */
  async withdrawBalance(): Promise<ethers.ContractTransaction> {
    if (!this.contract) throw new Error('Contract not initialized');

    return await this.contract.withdrawBalance();
  }

  /**
   * Get all markets
   */
  async getAllMarkets(): Promise<Market[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    const marketCount = await this.contract.getMarketCount();
    const markets: Market[] = [];

    for (let i = 1; i <= marketCount; i++) {
      try {
        const market = await this.contract.getMarket(i);
        markets.push({
          id: Number(market.id),
          creator: market.creator,
          title: market.title,
          description: market.description,
          closingTime: Number(market.closingTime),
          totalYesBets: market.totalYesBets.toString(),
          totalNoBets: market.totalNoBets.toString(),
          minBet: market.minBet.toString(),
          maxBet: market.maxBet.toString(),
          initialPool: market.initialPool.toString(),
          isResolved: market.isResolved,
          outcome: market.outcome,
          isClosed: market.isClosed,
          totalBets: Number(market.totalBets),
          totalPool: market.totalPool.toString()
        });
      } catch (error) {
        console.error(`Error fetching market ${i}:`, error);
      }
    }

    return markets;
  }

  /**
   * Get a specific market
   */
  async getMarket(marketId: number): Promise<Market | null> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const market = await this.contract.getMarket(marketId);
      return {
        id: Number(market.id),
        creator: market.creator,
        title: market.title,
        description: market.description,
        closingTime: Number(market.closingTime),
        totalYesBets: market.totalYesBets.toString(),
        totalNoBets: market.totalNoBets.toString(),
        minBet: market.minBet.toString(),
        maxBet: market.maxBet.toString(),
        initialPool: market.initialPool.toString(),
        isResolved: market.isResolved,
        outcome: market.outcome,
        isClosed: market.isClosed,
        totalBets: Number(market.totalBets),
        totalPool: market.totalPool.toString()
      };
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error);
      return null;
    }
  }

  /**
   * Get market bets
   */
  async getMarketBets(marketId: number): Promise<Bet[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const bets = await this.contract.getMarketBets(marketId);
      return bets.map((bet: any) => ({
        user: bet.user,
        amount: bet.amount.toString(),
        prediction: bet.prediction,
        timestamp: Number(bet.timestamp),
        claimed: bet.claimed
      }));
    } catch (error) {
      console.error(`Error fetching bets for market ${marketId}:`, error);
      return [];
    }
  }

  /**
   * Get user bets
   */
  async getUserBets(userAddress: string): Promise<number[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const marketIds = await this.contract.getUserBets(userAddress);
      return marketIds.map((id: any) => Number(id));
    } catch (error) {
      console.error(`Error fetching bets for user ${userAddress}:`, error);
      return [];
    }
  }

  /**
   * Get user balance
   */
  async getUserBalance(userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const balance = await this.contract.getUserBalance(userAddress);
      return balance.toString();
    } catch (error) {
      console.error(`Error fetching balance for user ${userAddress}:`, error);
      return '0';
    }
  }

  /**
   * Get market stats
   */
  async getMarketStats(marketId: number): Promise<MarketStats | null> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const stats = await this.contract.getMarketStats(marketId);
      return {
        totalYesBets: stats.totalYesBets.toString(),
        totalNoBets: stats.totalNoBets.toString(),
        totalBets: Number(stats.totalBets),
        totalPool: stats.totalPool.toString(),
        isResolved: stats.isResolved,
        outcome: stats.outcome
      };
    } catch (error) {
      console.error(`Error fetching stats for market ${marketId}:`, error);
      return null;
    }
  }

  /**
   * Get user bet amount for a specific market
   */
  async getUserBetAmount(marketId: number, userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const amount = await this.contract.getUserBetAmount(marketId, userAddress);
      return amount.toString();
    } catch (error) {
      console.error(`Error fetching bet amount for user ${userAddress} in market ${marketId}:`, error);
      return '0';
    }
  }

  /**
   * Format ETH amount from wei
   */
  formatEth(wei: string): string {
    return ethers.formatEther(wei);
  }

  /**
   * Parse ETH amount to wei
   */
  parseEth(eth: string): string {
    return ethers.parseEther(eth).toString();
  }

  /**
   * Get current block timestamp
   */
  async getCurrentTimestamp(): Promise<number> {
    const block = await this.provider.getBlock('latest');
    return block?.timestamp || Math.floor(Date.now() / 1000);
  }
}

// Export singleton instance
export const solidityClient = new SolidityClient();
export default solidityClient; 