// Move contract configuration for Umi devnet
export const MOVE_CONFIG = {
  // Umi devnet settings
  UMI_DEVNET_URL: "https://devnet.uminetwork.com",
  UMI_DEVNET_CHAIN_ID: 42069,
  UMI_DEVNET_EXPLORER: "https://devnet.explorer.moved.network",
  
  // Contract settings (will be updated after deployment)
  CONTRACT_ADDRESS: "0x1", // Placeholder - will be updated after deployment
  MODULE_NAME: "umiq::prediction_market",
  
  // Gas settings
  DEFAULT_GAS_LIMIT: 2000000,
  DEFAULT_GAS_PRICE: 100,
  
  // Transaction settings
  TRANSACTION_TIMEOUT: 30000, // 30 seconds
  
  // Market settings
  MIN_INITIAL_POOL: 0.1, // Minimum initial pool in ETH
  MAX_INITIAL_POOL: 100, // Maximum initial pool in ETH
  MIN_BET_AMOUNT: 0.001, // Minimum bet amount in ETH
  MAX_BET_AMOUNT: 10, // Maximum bet amount in ETH
  MIN_MARKET_DURATION: 3600, // Minimum market duration in seconds (1 hour)
  MAX_MARKET_DURATION: 31536000, // Maximum market duration in seconds (1 year)
} as const;

// Error messages
export const MOVE_ERRORS = {
  CONTRACT_NOT_DEPLOYED: "Contract not deployed. Please deploy the contract first.",
  WALLET_NOT_CONNECTED: "Wallet not connected. Please connect your wallet.",
  INSUFFICIENT_BALANCE: "Insufficient balance for this transaction.",
  INVALID_MARKET_ID: "Invalid market ID.",
  MARKET_NOT_FOUND: "Market not found.",
  MARKET_CLOSED: "Market is closed for betting.",
  MARKET_RESOLVED: "Market is already resolved.",
  INVALID_BET_AMOUNT: "Invalid bet amount.",
  INVALID_CLOSING_TIME: "Invalid closing time.",
  NOT_ORACLE: "Only the oracle can resolve markets.",
  TRANSACTION_FAILED: "Transaction failed. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
} as const;

// Event types for Move contract events
export const MOVE_EVENTS = {
  MARKET_CREATED: "MarketCreatedEvent",
  BET_PLACED: "BetPlacedEvent", 
  MARKET_RESOLVED: "MarketResolvedEvent",
  REWARD_CLAIMED: "RewardClaimedEvent",
} as const;

// Helper functions
export const formatMoveAmount = (amount: number): string => {
  // Convert ETH to octas (1 ETH = 100,000,000 octas)
  return Math.floor(amount * 100000000).toString();
};

export const parseMoveAmount = (amount: string): number => {
  // Convert octas to ETH
  return parseInt(amount) / 100000000;
};

export const formatMoveTimestamp = (timestamp: string): number => {
  // Convert Move timestamp to JavaScript timestamp
  return parseInt(timestamp) * 1000;
};

export const parseMoveTimestamp = (timestamp: number): string => {
  // Convert JavaScript timestamp to Move timestamp
  return Math.floor(timestamp / 1000).toString();
}; 