import { configureStore } from "@reduxjs/toolkit";
import marketsReducer from "@/store/marketsSlice";

export const store = configureStore({
  reducer: {
    markets: marketsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 