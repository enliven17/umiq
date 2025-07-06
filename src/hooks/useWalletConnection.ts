import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserDefiQ } from '@/store/marketsSlice';

export function useWalletConnection() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Wallet connection state'ini takip et
  useEffect(() => {
    const checkWalletConnection = () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const currentAddress = window.ethereum.selectedAddress;
        setAddress(currentAddress);
        setIsConnected(true);
        
        // DeFiQ puanını yükle
        const existingDefiQ = localStorage.getItem(`defiq_${currentAddress}`);
        if (existingDefiQ) {
          dispatch(setUserDefiQ({ address: currentAddress, score: Number(existingDefiQ) }));
        }
      } else {
        setAddress(null);
        setIsConnected(false);
      }
    };

    checkWalletConnection();
    
    // Wallet değişikliklerini dinle
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkWalletConnection);
      window.ethereum.on('connect', checkWalletConnection);
      window.ethereum.on('disconnect', () => {
        setAddress(null);
        setIsConnected(false);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkWalletConnection);
        window.ethereum.removeListener('connect', checkWalletConnection);
        window.ethereum.removeListener('disconnect', () => {
          setAddress(null);
          setIsConnected(false);
        });
      }
    };
  }, [dispatch]);

  return {
    address,
    isConnected,
    loading,
    setLoading
  };
} 