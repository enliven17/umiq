import { Chain } from 'wagmi/chains';

export const umiDevnet: Chain = {
  id: 42069,
  name: 'Umi Devnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://devnet.uminetwork.com'] },
    public: { http: ['https://devnet.uminetwork.com'] },
  },
  blockExplorers: {
    default: { name: 'Umi Explorer', url: 'https://devnet.explorer.moved.network' },
  },
  testnet: true,
}; 