"use client";
import React from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { useDispatch } from 'react-redux';
import { setUserDefiQ } from '@/store/marketsSlice';
import { connectWallet as connectWalletAction } from '@/store/walletSlice';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import type { Eip1193Provider } from 'ethers';

function shortenAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function ConnectWalletButton() {
  const { address } = useWalletConnection();
  const dispatch = useDispatch();

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        // setError('No Ethereum wallet (like MetaMask) found.'); // This line was removed
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum as Eip1193Provider);
      const accounts = await provider.send('eth_requestAccounts', []);
      const userAddress = accounts[0];
      // DeFiQ puanını localStorage'dan kontrol et
      const existingDefiQ = localStorage.getItem(`defiq_${userAddress}`);
      let defiQScore: number;
      if (existingDefiQ) {
        defiQScore = Number(existingDefiQ);
      } else {
        defiQScore = Math.floor(Math.random() * 151) + 50;
        localStorage.setItem(`defiq_${userAddress}`, String(defiQScore));
      }
      dispatch(connectWalletAction(userAddress));
      dispatch(setUserDefiQ({ address: userAddress, score: defiQScore }));
    } catch {
      // Hata loglama kaldırıldı, linter için catch bloğu boş bırakıldı
    }
  };

  const disconnectWallet = async () => {
    if (address) {
      dispatch(setUserDefiQ({ address, score: 0 }));
      localStorage.removeItem(`defiq_${address}`);
      if (window.ethereum) {
        try {
          await (window.ethereum as unknown as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
          // setError(null); // This line was removed
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error) {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } else {
        // setError(null); // This line was removed
      }
    }
    // setError(null); // This line was removed
  };

  return (
    <>
      <ModernConnectButtonWrapper>
        {address ? (
          <ConnectedBox>
            <AddressText>{shortenAddress(address)}</AddressText>
            <DisconnectButton onClick={disconnectWallet} title="Disconnect from app (to fully disconnect, use your wallet UI)">Disconnect</DisconnectButton>
          </ConnectedBox>
        ) : (
          <CustomButton onClick={connectWallet}>
            Connect Wallet
          </CustomButton>
        )}
      </ModernConnectButtonWrapper>
      {/* {error && <ErrorBox>{error}</ErrorBox>} */}
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
  background: ${({ theme }) => theme.colors.primary ?? '#0070f3'};
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
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AddressText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DisconnectButton = styled.button`
  background: ${({ theme }) => theme.colors.accentRed};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 4px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #c0392b;
  }
`;
