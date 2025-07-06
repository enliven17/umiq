"use client";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

function shortenAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function ConnectWalletButton() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  return isConnected && address ? (
    <ConnectedBox>{shortenAddress(address)}</ConnectedBox>
  ) : (
    <button onClick={() => open()}>Cüzdan Bağla</button>
  );
}

import styled from 'styled-components';
const ConnectedBox = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: bold;
`; 