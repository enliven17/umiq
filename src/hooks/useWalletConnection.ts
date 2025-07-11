import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnectWallet } from '@/store/walletSlice';
import type { RootState } from '@/store';

export function useWalletConnection() {
  const dispatch = useDispatch();
  const address = useSelector((state: RootState) => state.wallet.address);
  const isConnected = useSelector((state: RootState) => state.wallet.isConnected);

  useEffect(() => {
    const checkWalletConnection = () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const currentAddress = window.ethereum.selectedAddress;
        dispatch(connectWallet(currentAddress));
      } else {
        dispatch(disconnectWallet());
      }
    };

    checkWalletConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkWalletConnection);
      window.ethereum.on('connect', checkWalletConnection);
      window.ethereum.on('disconnect', () => dispatch(disconnectWallet()));
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkWalletConnection);
        window.ethereum.removeListener('connect', checkWalletConnection);
        window.ethereum.removeListener('disconnect', () => dispatch(disconnectWallet()));
      }
    };
  }, [dispatch]);

  return {
    address,
    isConnected,
  };
} 