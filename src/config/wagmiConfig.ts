import { umiDevnet } from './umiChain';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'dummydummydummydummydummydummydummydummy';

export const metadata = {
  name: 'UMIq',
  description: 'UMIq Polymarket Clone',
  url: 'https://umiq.app',
  icons: ['https://devnet.explorer.moved.network/favicon.ico'],
};

let wagmiConfig: any = undefined;
if (typeof window !== "undefined") {
  const { defaultWagmiConfig } = require('@web3modal/wagmi/react/config');
  const { umiDevnet } = require('./umiChain');
  wagmiConfig = defaultWagmiConfig({
    chains: [umiDevnet],
    projectId,
    metadata,
    ssr: false,
  });
}
export { wagmiConfig }; 