"use client";
import { ConnectButton } from '@rainbow-me/rainbowkit';

function shortenAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function ConnectWalletButton() {
  return <ConnectButton />;
}

import styled from 'styled-components';
const ConnectedBox = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: bold;
`; 