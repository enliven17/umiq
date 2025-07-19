import { configureStore } from "@reduxjs/toolkit";
import marketsReducer from "@/store/marketsSlice";
import walletReducer from "@/store/walletSlice";
import moveMarketsReducer from "@/store/moveMarketsSlice";

export const store = configureStore({
  reducer: {
    markets: marketsReducer,
    wallet: walletReducer,
    moveMarkets: moveMarketsReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 