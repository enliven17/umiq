import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Market, Bet, MarketStatus, BetSide } from "@/types/market";
import { moveClient, CreateMarketParams, PlaceBetParams, MARKET_STATUS, BET_SIDE } from "@/api/moveClient";
import { AppDispatch, RootState } from './index';

// Async thunks for Move contract interactions
export const fetchMoveMarkets = createAsyncThunk(
  'moveMarkets/fetchMarkets',
  async () => {
    const moveMarkets = await moveClient.getAllMarkets();
    const moveBets = await moveClient.getMarketBets();
    
    // Convert Move markets to frontend format
    const markets: Market[] = moveMarkets.map(moveMarket => {
      const market = moveClient.convertMoveMarketToMarket(moveMarket);
      
      // Add bets for this market
      const marketBets = moveBets
        .filter(bet => bet.market_id === moveMarket.id)
        .map(bet => moveClient.convertMoveBetToBet(bet, moveMarket.id));
      
      return {
        ...market,
        bets: marketBets,
      };
    });
    
    return markets;
  }
);

export const createMoveMarket = createAsyncThunk(
  'moveMarkets/createMarket',
  async (params: CreateMarketParams, { rejectWithValue }) => {
    try {
      const txHash = await moveClient.createMarket(params);
      return { txHash, market: params };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create market');
    }
  }
);

export const placeMoveBet = createAsyncThunk(
  'moveMarkets/placeBet',
  async (params: PlaceBetParams, { rejectWithValue }) => {
    try {
      const txHash = await moveClient.placeBet(params);
      return { txHash, bet: params };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to place bet');
    }
  }
);

export const resolveMoveMarket = createAsyncThunk(
  'moveMarkets/resolveMarket',
  async ({ marketId, result }: { marketId: number; result: BetSide }, { rejectWithValue }) => {
    try {
      const moveResult = result === 'yes' ? BET_SIDE.YES : BET_SIDE.NO;
      const txHash = await moveClient.resolveMarket(marketId, moveResult);
      return { txHash, marketId, result };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to resolve market');
    }
  }
);

export const closeMoveMarket = createAsyncThunk(
  'moveMarkets/closeMarket',
  async (marketId: number, { rejectWithValue }) => {
    try {
      const txHash = await moveClient.closeMarket(marketId);
      return { txHash, marketId };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to close market');
    }
  }
);

interface MoveMarketsState {
  markets: Market[];
  loading: boolean;
  error: string | null;
  lastTransactionHash: string | null;
  userBets: Record<string, Bet[]>; // userId -> bets
}

const initialState: MoveMarketsState = {
  markets: [],
  loading: false,
  error: null,
  lastTransactionHash: null,
  userBets: {},
};

const moveMarketsSlice = createSlice({
  name: "moveMarkets",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransactionHash: (state) => {
      state.lastTransactionHash = null;
    },
    setUserBets: (state, action: PayloadAction<{ userId: string; bets: Bet[] }>) => {
      state.userBets[action.payload.userId] = action.payload.bets;
    },
  },
  extraReducers: (builder) => {
    // Fetch markets
    builder
      .addCase(fetchMoveMarkets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMoveMarkets.fulfilled, (state, action) => {
        state.loading = false;
        state.markets = action.payload;
      })
      .addCase(fetchMoveMarkets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch markets';
      });

    // Create market
    builder
      .addCase(createMoveMarket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMoveMarket.fulfilled, (state, action) => {
        state.loading = false;
        state.lastTransactionHash = action.payload.txHash;
        // Refresh markets after creation
        // In a real app, you might want to add the new market to the state
        // or refetch all markets
      })
      .addCase(createMoveMarket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create market';
      });

    // Place bet
    builder
      .addCase(placeMoveBet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeMoveBet.fulfilled, (state, action) => {
        state.loading = false;
        state.lastTransactionHash = action.payload.txHash;
        // Refresh markets after placing bet
      })
      .addCase(placeMoveBet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to place bet';
      });

    // Resolve market
    builder
      .addCase(resolveMoveMarket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveMoveMarket.fulfilled, (state, action) => {
        state.loading = false;
        state.lastTransactionHash = action.payload.txHash;
        // Update market status
        const market = state.markets.find(m => m.id === action.payload.marketId.toString());
        if (market) {
          market.status = 'resolved';
          market.result = action.payload.result;
        }
      })
      .addCase(resolveMoveMarket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to resolve market';
      });

    // Close market
    builder
      .addCase(closeMoveMarket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeMoveMarket.fulfilled, (state, action) => {
        state.loading = false;
        state.lastTransactionHash = action.payload.txHash;
        // Update market status
        const market = state.markets.find(m => m.id === action.payload.marketId.toString());
        if (market) {
          market.status = 'closed';
        }
      })
      .addCase(closeMoveMarket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to close market';
      });
  },
});

export const { clearError, clearTransactionHash, setUserBets } = moveMarketsSlice.actions;

// Selectors
export const selectMoveMarkets = (state: RootState) => state.moveMarkets.markets;
export const selectMoveMarketsLoading = (state: RootState) => state.moveMarkets.loading;
export const selectMoveMarketsError = (state: RootState) => state.moveMarkets.error;
export const selectLastTransactionHash = (state: RootState) => state.moveMarkets.lastTransactionHash;
export const selectUserBets = (state: RootState, userId: string) => state.moveMarkets.userBets[userId] || [];

export default moveMarketsSlice.reducer; 