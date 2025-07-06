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
      { id: "b2", userId: "user3", marketId: "1", amount: 0.2, side: "no", timestamp: Date.now() - 1000 * 60 * 30 }
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
      { id: "b3", userId: "user1", marketId: "2", amount: 0.1, side: "yes", timestamp: Date.now() - 1000 * 60 * 60 * 2 }
    ]
  }
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
}

const initialState: MarketsState = {
  markets: initialMarkets,
  claimableRewards: []
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
          });
        }
      }
    },
    claimReward(state, action: PayloadAction<{ userId: string; marketId: string }>) {
      const reward = state.claimableRewards.find(r => r.userId === action.payload.userId && r.marketId === action.payload.marketId && !r.claimed);
      if (reward) {
        reward.claimed = true;
      }
    }
  }
});

export const { addMarket, addBet, closeMarket, claimReward } = marketsSlice.actions;
export default marketsSlice.reducer;
export type { ClaimableReward }; 