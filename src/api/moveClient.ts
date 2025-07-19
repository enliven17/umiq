import { AptosClient, AptosAccount, TxnBuilderTypes, BCS, MaybeHexString } from "@aptos-labs/ts-sdk";

// Umi devnet configuration
const UMI_DEVNET_URL = "https://devnet.uminetwork.com";
const CONTRACT_ADDRESS = "0x1"; // Will be updated after deployment
const MODULE_NAME = "umiq::prediction_market";

// Market status constants
export const MARKET_STATUS = {
  OPEN: 0,
  CLOSED: 1,
  RESOLVED: 2,
} as const;

// Bet side constants
export const BET_SIDE = {
  YES: 0,
  NO: 1,
} as const;

// Types
export interface MoveMarket {
  id: string;
  title: string;
  description: string;
  creator: string;
  created_at: string;
  closes_at: string;
  initial_pool: string;
  min_bet: string;
  max_bet: string;
  status: number;
  total_yes_bets: string;
  total_no_bets: string;
  result: { vec: number[] } | null;
  total_participants: string;
}

export interface MoveBet {
  user: string;
  market_id: string;
  amount: string;
  side: number;
  timestamp: string;
}

export interface MoveUserBet {
  market_id: string;
  amount: string;
  side: number;
  timestamp: string;
}

export interface CreateMarketParams {
  title: string;
  description: string;
  closesAt: number;
  initialPool: number;
  minBet: number;
  maxBet: number;
}

export interface PlaceBetParams {
  marketId: number;
  amount: number;
  side: number;
}

class MoveClient {
  private client: AptosClient;
  private account: AptosAccount | null = null;

  constructor() {
    this.client = new AptosClient(UMI_DEVNET_URL);
  }

  // Initialize with private key
  async initialize(privateKeyHex: string) {
    const privateKeyBytes = new Uint8Array(
      privateKeyHex.startsWith("0x") 
        ? privateKeyHex.slice(2).match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        : privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    this.account = new AptosAccount(privateKeyBytes);
    return this.account.address().toString();
  }

  // Initialize with wallet connection
  async initializeWithWallet(walletAddress: string) {
    // For wallet integration, we'll use the wallet's signer
    // This is a placeholder for wallet integration
    return walletAddress;
  }

  // Get all markets
  async getAllMarkets(): Promise<MoveMarket[]> {
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_all_markets`,
        type_arguments: [],
        arguments: [],
      };

      const response = await this.client.view(payload);
      return response as MoveMarket[];
    } catch (error) {
      console.error("Error fetching markets:", error);
      return [];
    }
  }

  // Get market by ID
  async getMarket(marketId: number): Promise<MoveMarket | null> {
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_market`,
        type_arguments: [],
        arguments: [marketId.toString()],
      };

      const response = await this.client.view(payload);
      return response as MoveMarket;
    } catch (error) {
      console.error("Error fetching market:", error);
      return null;
    }
  }

  // Get user bets
  async getUserBets(userAddress: string): Promise<MoveUserBet[]> {
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_user_bets`,
        type_arguments: [],
        arguments: [userAddress],
      };

      const response = await this.client.view(payload);
      return response as MoveUserBet[];
    } catch (error) {
      console.error("Error fetching user bets:", error);
      return [];
    }
  }

  // Get market bets
  async getMarketBets(): Promise<MoveBet[]> {
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_market_bets`,
        type_arguments: [],
        arguments: [],
      };

      const response = await this.client.view(payload);
      return response as MoveBet[];
    } catch (error) {
      console.error("Error fetching market bets:", error);
      return [];
    }
  }

  // Create market
  async createMarket(params: CreateMarketParams): Promise<string> {
    if (!this.account) {
      throw new Error("Account not initialized");
    }

    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::create_market`,
        type_arguments: [],
        arguments: [
          params.title,
          params.description,
          params.closesAt.toString(),
          params.initialPool.toString(),
          params.minBet.toString(),
          params.maxBet.toString(),
        ],
      };

      const transaction = await this.client.generateTransaction(
        this.account.address(),
        payload
      );

      const signedTxn = await this.client.signTransaction(this.account, transaction);
      const result = await this.client.submitTransaction(signedTxn);
      await this.client.waitForTransaction(result.hash);

      return result.hash;
    } catch (error) {
      console.error("Error creating market:", error);
      throw error;
    }
  }

  // Place bet
  async placeBet(params: PlaceBetParams): Promise<string> {
    if (!this.account) {
      throw new Error("Account not initialized");
    }

    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::place_bet`,
        type_arguments: [],
        arguments: [
          params.marketId.toString(),
          params.amount.toString(),
          params.side.toString(),
        ],
      };

      const transaction = await this.client.generateTransaction(
        this.account.address(),
        payload
      );

      const signedTxn = await this.client.signTransaction(this.account, transaction);
      const result = await this.client.submitTransaction(signedTxn);
      await this.client.waitForTransaction(result.hash);

      return result.hash;
    } catch (error) {
      console.error("Error placing bet:", error);
      throw error;
    }
  }

  // Resolve market (oracle only)
  async resolveMarket(marketId: number, result: number): Promise<string> {
    if (!this.account) {
      throw new Error("Account not initialized");
    }

    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::resolve_market`,
        type_arguments: [],
        arguments: [
          marketId.toString(),
          result.toString(),
        ],
      };

      const transaction = await this.client.generateTransaction(
        this.account.address(),
        payload
      );

      const signedTxn = await this.client.signTransaction(this.account, transaction);
      const result_txn = await this.client.submitTransaction(signedTxn);
      await this.client.waitForTransaction(result_txn.hash);

      return result_txn.hash;
    } catch (error) {
      console.error("Error resolving market:", error);
      throw error;
    }
  }

  // Close market
  async closeMarket(marketId: number): Promise<string> {
    if (!this.account) {
      throw new Error("Account not initialized");
    }

    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::close_market`,
        type_arguments: [],
        arguments: [marketId.toString()],
      };

      const transaction = await this.client.generateTransaction(
        this.account.address(),
        payload
      );

      const signedTxn = await this.client.signTransaction(this.account, transaction);
      const result = await this.client.submitTransaction(signedTxn);
      await this.client.waitForTransaction(result.hash);

      return result.hash;
    } catch (error) {
      console.error("Error closing market:", error);
      throw error;
    }
  }

  // Get oracle address
  async getOracle(): Promise<string> {
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_oracle`,
        type_arguments: [],
        arguments: [],
      };

      const response = await this.client.view(payload);
      return response as string;
    } catch (error) {
      console.error("Error fetching oracle:", error);
      throw error;
    }
  }

  // Convert Move market to frontend market format
  convertMoveMarketToMarket(moveMarket: MoveMarket) {
    return {
      id: moveMarket.id,
      title: moveMarket.title,
      description: moveMarket.description,
      creatorId: moveMarket.creator,
      createdAt: parseInt(moveMarket.created_at) * 1000, // Convert to milliseconds
      closesAt: parseInt(moveMarket.closes_at) * 1000,
      initialPool: parseFloat(moveMarket.initial_pool) / 1e8, // Convert from octas
      minBet: parseFloat(moveMarket.min_bet) / 1e8,
      maxBet: parseFloat(moveMarket.max_bet) / 1e8,
      status: this.convertMoveStatus(moveMarket.status),
      bets: [], // Will be populated separately
      result: moveMarket.result ? this.convertMoveResult(moveMarket.result.vec[0]) : undefined,
    };
  }

  // Convert Move bet to frontend bet format
  convertMoveBetToBet(moveBet: MoveBet, marketId: string) {
    return {
      id: `${marketId}-${moveBet.user}-${moveBet.timestamp}`,
      userId: moveBet.user,
      marketId,
      amount: parseFloat(moveBet.amount) / 1e8,
      side: this.convertMoveSide(moveBet.side),
      timestamp: parseInt(moveBet.timestamp) * 1000,
    };
  }

  // Helper methods for conversions
  private convertMoveStatus(status: number): "open" | "closed" | "resolved" {
    switch (status) {
      case MARKET_STATUS.OPEN:
        return "open";
      case MARKET_STATUS.CLOSED:
        return "closed";
      case MARKET_STATUS.RESOLVED:
        return "resolved";
      default:
        return "open";
    }
  }

  private convertMoveSide(side: number): "yes" | "no" {
    return side === BET_SIDE.YES ? "yes" : "no";
  }

  private convertMoveResult(result: number): "yes" | "no" {
    return result === BET_SIDE.YES ? "yes" : "no";
  }
}

// Export singleton instance
export const moveClient = new MoveClient(); 