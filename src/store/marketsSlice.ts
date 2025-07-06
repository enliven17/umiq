import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Market, Bet, MarketStatus, BetSide } from "@/types/market";

// Dummy data: Demo amaçlı açılmış marketler ve bahisler
const initialMarkets: Market[] = [
  {
    id: "1",
    title: "Will Trump be president in 2025?",
    description: "Will Donald Trump win the 2024 US presidential election and be president in 2025?",
    creatorId: "user1",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    initialPool: 1,
    minBet: 0.01,
    maxBet: 2,
    status: "open",
    bets: [
      { id: "b1", userId: "user2", marketId: "1", amount: 0.5, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 },
      { id: "b2", userId: "user3", marketId: "1", amount: 0.2, side: "no", timestamp: Date.now() - 1000 * 60 * 30 },
      { id: "b3", userId: "user4", marketId: "1", amount: 0.8, side: "yes", timestamp: Date.now() - 1000 * 60 * 90 },
      { id: "b4", userId: "user5", marketId: "1", amount: 0.3, side: "no", timestamp: Date.now() - 1000 * 60 * 120 },
      { id: "b5", userId: "user6", marketId: "1", amount: 0.6, side: "yes", timestamp: Date.now() - 1000 * 60 * 180 }
    ]
  },
  {
    id: "2",
    title: "Will ETH price reach $5000 by 2025?",
    description: "Will Ethereum (ETH) price hit $5000 before 2025?",
    creatorId: "user2",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 5,
    initialPool: 0.5,
    minBet: 0.01,
    maxBet: 1,
    status: "open",
    bets: [
      { id: "b6", userId: "user1", marketId: "2", amount: 0.1, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 2 },
      { id: "b7", userId: "user3", marketId: "2", amount: 0.3, side: "no", timestamp: Date.now() - 1000 * 60 * 60 * 3 },
      { id: "b8", userId: "user5", marketId: "2", amount: 0.2, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 4 }
    ]
  },
  {
    id: "3",
    title: "Will BTC reach $100,000 by 2025?",
    description: "Will Bitcoin (BTC) price hit $100,000 before 2025?",
    creatorId: "user3",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 60,
    initialPool: 0.8,
    minBet: 0.01,
    maxBet: 2,
    status: "open",
    bets: [
      { id: "b9", userId: "user2", marketId: "3", amount: 0.4, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 5 },
      { id: "b10", userId: "user4", marketId: "3", amount: 0.2, side: "no", timestamp: Date.now() - 1000 * 60 * 60 * 6 },
      { id: "b11", userId: "user5", marketId: "3", amount: 0.5, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 7 }
    ]
  },
  {
    id: "4",
    title: "Will Apple release a foldable iPhone in 2025?",
    description: "Will Apple announce and release a foldable iPhone model in 2025?",
    creatorId: "user4",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 90,
    initialPool: 0.4,
    minBet: 0.01,
    maxBet: 1,
    status: "open",
    bets: [
      { id: "b12", userId: "user1", marketId: "4", amount: 0.1, side: "no", timestamp: Date.now() - 1000 * 60 * 60 * 8 },
      { id: "b13", userId: "user3", marketId: "4", amount: 0.2, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 9 }
    ]
  },
  {
    id: "5",
    title: "Will AI pass the Turing Test by 2030?",
    description: "Will any AI system pass a public Turing Test by 2030?",
    creatorId: "user5",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 120,
    initialPool: 0.7,
    minBet: 0.01,
    maxBet: 2,
    status: "open",
    bets: [
      { id: "b14", userId: "user2", marketId: "5", amount: 0.3, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 10 },
      { id: "b15", userId: "user6", marketId: "5", amount: 0.2, side: "no", timestamp: Date.now() - 1000 * 60 * 60 * 11 },
      { id: "b16", userId: "user7", marketId: "5", amount: 0.4, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 12 }
    ]
  },
  {
    id: "6",
    title: "Will SpaceX land humans on Mars by 2030?",
    description: "Will SpaceX successfully land humans on Mars before 2030?",
    creatorId: "user6",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
    initialPool: 0.9,
    minBet: 0.01,
    maxBet: 2,
    status: "open",
    bets: [
      { id: "b17", userId: "user1", marketId: "6", amount: 0.2, side: "no", timestamp: Date.now() - 1000 * 60 * 60 * 13 },
      { id: "b18", userId: "user4", marketId: "6", amount: 0.3, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 14 }
    ]
  },
  {
    id: "7",
    title: "Will Bitcoin be above $200,000 by 2026?",
    description: "Will Bitcoin (BTC) price be above $200,000 at any point in 2026?",
    creatorId: "user7",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 200,
    initialPool: 0.6,
    minBet: 0.01,
    maxBet: 2,
    status: "open",
    bets: [
      { id: "b19", userId: "user2", marketId: "7", amount: 0.5, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 15 },
      { id: "b20", userId: "user5", marketId: "7", amount: 0.2, side: "no", timestamp: Date.now() - 1000 * 60 * 60 * 16 }
    ]
  },
  {
    id: "8",
    title: "Will a cure for cancer be announced by 2035?",
    description: "Will a scientifically recognized cure for cancer be announced by 2035?",
    creatorId: "user8",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 400,
    initialPool: 0.5,
    minBet: 0.01,
    maxBet: 2,
    status: "open",
    bets: [
      { id: "b21", userId: "user3", marketId: "8", amount: 0.3, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 17 },
      { id: "b22", userId: "user6", marketId: "8", amount: 0.4, side: "no", timestamp: Date.now() - 1000 * 60 * 60 * 18 }
    ]
  },
];

interface ClaimableReward {
  userId: string;
  marketId: string;
  amount: number;
  claimed: boolean;
}

interface MarketsState {
  markets: Market[];
  claimableRewards: ClaimableReward[];
  userDefiQ: Record<string, number>; // address -> DEFiq puanı
}

const initialState: MarketsState = {
  markets: initialMarkets,
  claimableRewards: [],
  userDefiQ: {
    // Demo kullanıcılar için temsili DEFiq puanları
    "user1": 85,
    "user2": 120,
    "user3": 65,
    "user4": 95,
    "user5": 150,
    "user6": 75,
    "user7": 110,
    "user8": 45,
  },
};

const marketsSlice = createSlice({
  name: "markets",
  initialState,
  reducers: {
    addMarket(state, action: PayloadAction<Market>) {
      state.markets.push(action.payload);
    },
    addBet(state, action: PayloadAction<Bet>) {
      const market = state.markets.find(m => m.id === action.payload.marketId);
      if (market) {
        market.bets.push(action.payload);
      }
    },
    closeMarket(state, action: PayloadAction<{ marketId: string; result: BetSide }>) {
      const market = state.markets.find(m => m.id === action.payload.marketId);
      if (market) {
        market.status = "resolved";
        market.result = action.payload.result;
        // Payout hesapla
        const totalPool = market.initialPool + market.bets.reduce((sum, b) => sum + b.amount, 0);
        const winners = market.bets.filter(b => b.side === action.payload.result);
        const totalWinnerBet = winners.reduce((sum, b) => sum + b.amount, 0);
        if (totalWinnerBet > 0) {
          winners.forEach(bet => {
            const pay = (bet.amount / totalWinnerBet) * totalPool;
            state.claimableRewards.push({
              userId: bet.userId,
              marketId: market.id,
              amount: pay,
              claimed: false
            });
            // DEFiq puanını güncelle (ör: +10 her kazanç için)
            if (!state.userDefiQ[bet.userId]) state.userDefiQ[bet.userId] = 0;
            state.userDefiQ[bet.userId] += 10;
          });
        }
      }
    },
    claimReward(state, action: PayloadAction<{ userId: string; marketId: string }>) {
      const reward = state.claimableRewards.find(r => r.userId === action.payload.userId && r.marketId === action.payload.marketId && !r.claimed);
      if (reward) {
        reward.claimed = true;
      }
    },
    setUserDefiQ(state, action: PayloadAction<{ address: string; score: number }>) {
      state.userDefiQ[action.payload.address] = action.payload.score;
    }
  }
});

export const { addMarket, addBet, closeMarket, claimReward, setUserDefiQ } = marketsSlice.actions;
export default marketsSlice.reducer;
export type { ClaimableReward }; 