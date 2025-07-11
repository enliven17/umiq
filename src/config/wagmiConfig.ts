import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { umiDevnet } from './umiChain';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'dummydummydummydummydummydummydummydummy';

export const metadata = {
  name: 'UMIq',
  description: 'UMIq Polymarket Clone',
  url: 'https://umiq.app',
  icons: ['https://devnet.explorer.moved.network/favicon.ico'],
};

export const wagmiConfig = typeof window !== 'undefined'
  ? defaultWagmiConfig({
      chains: [umiDevnet],
      projectId,
      metadata,
      ssr: false,
    })
  : undefined; 