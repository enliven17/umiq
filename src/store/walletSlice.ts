import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  balances: Record<string, number>; // address -> ETH bakiyesi
}

// localStorage'dan balance'ları yükle
const loadBalancesFromStorage = (): Record<string, number> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('umiq_balances');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading balances from localStorage:', error);
    return {};
  }
};

// Balance'ları localStorage'a kaydet
const saveBalancesToStorage = (balances: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('umiq_balances', JSON.stringify(balances));
  } catch (error) {
    console.error('Error saving balances to localStorage:', error);
  }
};

const initialState: WalletState = {
  address: null,
  isConnected: false,
  balances: loadBalancesFromStorage(),
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    connectWallet(state, action: PayloadAction<string>) {
      state.address = action.payload;
      state.isConnected = true;
      // Eğer yeni kullanıcıysa bakiyesini başlat
      if (state.balances[action.payload] === undefined) {
        state.balances[action.payload] = 0;
        saveBalancesToStorage(state.balances);
      }
    },
    disconnectWallet(state) {
      state.address = null;
      state.isConnected = false;
    },
    depositBalance(state, action: PayloadAction<{ address: string; amount: number }>) {
      if (!state.balances[action.payload.address]) {
        state.balances[action.payload.address] = 0;
      }
      state.balances[action.payload.address] += action.payload.amount;
      saveBalancesToStorage(state.balances);
    },
    withdrawBalance(state, action: PayloadAction<{ address: string; amount: number }>) {
      if (!state.balances[action.payload.address]) {
        state.balances[action.payload.address] = 0;
      }
      state.balances[action.payload.address] = Math.max(0, state.balances[action.payload.address] - action.payload.amount);
      saveBalancesToStorage(state.balances);
    },
    spendBalance(state, action: PayloadAction<{ address: string; amount: number }>) {
      if (!state.balances[action.payload.address]) {
        state.balances[action.payload.address] = 0;
      }
      state.balances[action.payload.address] = Math.max(0, state.balances[action.payload.address] - action.payload.amount);
      saveBalancesToStorage(state.balances);
    },
    setBalance(state, action: PayloadAction<{ address: string; amount: number }>) {
      state.balances[action.payload.address] = action.payload.amount;
      saveBalancesToStorage(state.balances);
    },
  },
});

export const { connectWallet, disconnectWallet, depositBalance, withdrawBalance, spendBalance, setBalance } = walletSlice.actions;
export default walletSlice.reducer;
export type { WalletState }; 