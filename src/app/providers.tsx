"use client";
import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { ThemeProvider } from "styled-components";
import { theme } from "@/theme";
import { wagmiConfig, projectId } from "@/config/wagmiConfig";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi/react";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      enableAnalytics: true,
    });
  }, []);

  if (typeof window !== "undefined" && typeof indexedDB === "undefined") {
    // Polyfill indexedDB with a dummy object to avoid ReferenceError
    window.indexedDB = {} as IDBFactory;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 