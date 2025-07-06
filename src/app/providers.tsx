"use client";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { ThemeProvider } from "styled-components";
import { theme } from "@/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { umiDevnet } from '@/config/umiChain';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'UMIq',
  chains: [umiDevnet],
  projectId: 'umi-devnet', // Gerekirse gerçek bir WalletConnect projectId eklenebilir
  ssr: false,
});

export function AppProviders({ children }: { children: ReactNode }) {
  if (typeof window !== "undefined" && typeof indexedDB === "undefined") {
    // Polyfill indexedDB with a dummy object to avoid ReferenceError
    window.indexedDB = {} as IDBFactory;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: theme.colors.primary,
            accentColorForeground: '#fff',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          modalSize="compact"
        >
          <Provider store={store}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </Provider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
} 