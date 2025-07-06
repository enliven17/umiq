"use client";
import React, { useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

function shortenAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function ConnectWalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!window.ethereum) {
        setError('No Ethereum wallet (like MetaMask) found.');
        setLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAddress(accounts[0]);
    } catch (err: any) {
      setError('Connection rejected or an error occurred.');
    }
    setLoading(false);
  };

  const disconnectWallet = () => {
    setAddress(null);
    setError(null);
  };

  return (
    <>
      <ModernConnectButtonWrapper>
        {address ? (
          <ConnectedBox>
            {shortenAddress(address)}
            <DisconnectButton onClick={disconnectWallet} title="Disconnect Wallet">Disconnect</DisconnectButton>
          </ConnectedBox>
        ) : (
          <CustomButton onClick={connectWallet} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </CustomButton>
        )}
      </ModernConnectButtonWrapper>
      {error && <ErrorBox>{error}</ErrorBox>}
    </>
  );
}

const ModernConnectButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CustomButton = styled.button`
  min-width: 120px;
  min-height: 36px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  padding: 8px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.accentGreen};
    color: #fff;
  }
  @media (max-width: 800px) {
    min-width: 90px;
    min-height: 32px;
    font-size: 0.95rem;
    padding: 6px 10px;
  }
`;

const ConnectedBox = styled.div`
  min-width: 120px;
  min-height: 36px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  padding: 8px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const DisconnectButton = styled.button`
  background: ${({ theme }) => theme.colors.accentRed};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.95rem;
  font-weight: 500;
  margin-left: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #c0392b;
  }
`;

const ErrorBox = styled.div`
  color: ${({ theme }) => theme.colors.accentRed};
  font-size: 0.95rem;
  margin-top: 8px;
  text-align: center;
`;
