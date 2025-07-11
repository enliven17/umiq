"use client";
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { depositBalance, withdrawBalance } from '@/store/walletSlice';
import { RootState } from '@/store';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { FaCoins, FaArrowUp, FaArrowDown, FaTimes } from 'react-icons/fa';
import { ethers } from 'ethers';

const CENTRAL_WALLET = '0xcc78505FE8707a1D85229BA0E7177aE26cE0f17D';

export function BalanceManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const dispatch = useDispatch();
  const { address } = useWalletConnection();
  
  const balance = useSelector((state: RootState) => {
    if (!address) return 0;
    return state.wallet.balances[address] || 0;
  });

  const handleDeposit = async () => {
    setError('');
    setSuccess('');
    const amount = Number(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    if (amount > 10) {
      setError('Maximum deposit amount is 10 ETH.');
      return;
    }
    
    if (!window.ethereum) {
      setError('Ethereum wallet not found.');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: CENTRAL_WALLET,
        value: ethers.parseEther(amount.toString()),
      });
      setSuccess('Transaction sent! Hash: ' + tx.hash + '\n(UMI Devnet: Confirmation is not awaited due to chain compatibility.)');
      dispatch(depositBalance({ address: address!, amount }));
      setDepositAmount('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Transaction failed.');
    }
  };

  const handleWithdraw = async () => {
    setError('');
    setSuccess('');
    const amount = Number(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    if (amount > balance) {
      setError(`Insufficient balance. You have ${balance.toFixed(4)} ETH.`);
      return;
    }
    
    // On-chain withdraw: Needs backend or contract. For now, show info.
    setSuccess('Withdrawal request sent! (In production, this would trigger a backend or contract withdrawal.)');
    dispatch(withdrawBalance({ address: address!, amount }));
    setWithdrawAmount('');
    setTimeout(() => setSuccess(''), 4000);
  };

  if (!address) {
    return null;
  }

  return (
    <>
      <BalanceButton onClick={() => setIsOpen(true)}>
        <FaCoins />
        Manage Balance
      </BalanceButton>
      
      {isOpen && (
        <ModalOverlay onClick={() => setIsOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Balance Management</ModalTitle>
              <CloseButton onClick={() => setIsOpen(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <CurrentBalance>
              <BalanceLabel>Current Balance:</BalanceLabel>
              <BalanceAmount>{balance.toFixed(4)} ETH</BalanceAmount>
            </CurrentBalance>
            
            <TabContainer>
              <TabButton 
                $active={activeTab === 'deposit'} 
                onClick={() => setActiveTab('deposit')}
              >
                <FaArrowUp />
                Deposit
              </TabButton>
              <TabButton 
                $active={activeTab === 'withdraw'} 
                onClick={() => setActiveTab('withdraw')}
              >
                <FaArrowDown />
                Withdraw
              </TabButton>
            </TabContainer>
            
            {activeTab === 'deposit' ? (
              <TabContent>
                <InputGroup>
                  <InputLabel>Amount to Deposit (ETH)</InputLabel>
                  <AmountInput
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="10"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0"
                  />
                  <QuickAmounts>
                    <QuickButton onClick={() => setDepositAmount('0.1')}>0.1</QuickButton>
                    <QuickButton onClick={() => setDepositAmount('0.5')}>0.5</QuickButton>
                    <QuickButton onClick={() => setDepositAmount('1')}>1.0</QuickButton>
                    <QuickButton onClick={() => setDepositAmount('5')}>5.0</QuickButton>
                  </QuickAmounts>
                </InputGroup>
                <ActionButton onClick={handleDeposit}>
                  <FaArrowUp />
                  Deposit ETH
                </ActionButton>
              </TabContent>
            ) : (
              <TabContent>
                <InputGroup>
                  <InputLabel>Amount to Withdraw (ETH)</InputLabel>
                  <AmountInput
                    type="number"
                    step="0.001"
                    min="0.001"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.0"
                  />
                  <QuickAmounts>
                    <QuickButton onClick={() => setWithdrawAmount('0.1')}>0.1</QuickButton>
                    <QuickButton onClick={() => setWithdrawAmount('0.5')}>0.5</QuickButton>
                    <QuickButton onClick={() => setWithdrawAmount('1')}>1.0</QuickButton>
                    <QuickButton onClick={() => setWithdrawAmount(balance.toString())}>All</QuickButton>
                  </QuickAmounts>
                </InputGroup>
                <ActionButton onClick={handleWithdraw}>
                  <FaArrowDown />
                  Withdraw ETH
                </ActionButton>
              </TabContent>
            )}
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <InfoText>
              Note: This is a demo system. In a real application, deposits and withdrawals would be processed through blockchain transactions.
            </InfoText>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}

const BalanceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentGreen};
    transform: translateY(-1px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  margin-top: 32px;
  margin-bottom: 32px;
  pointer-events: auto;
  @media (max-width: 600px) {
    max-width: 98vw;
    padding: 12px 4px;
    min-height: 0;
    max-height: 95vh;
    margin-top: 8px;
    margin-bottom: 8px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const CurrentBalance = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
`;

const BalanceLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-bottom: 4px;
`;

const BalanceAmount = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 700;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.primary}20;
  }
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

const AmountInput = styled.input`
  padding: 12px 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const QuickButton = styled.button`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.accentGreen};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #17a96b;
    transform: translateY(-1px);
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.accentRed};
  background: ${({ theme }) => theme.colors.accentRed}10;
  border: 1px solid ${({ theme }) => theme.colors.accentRed}30;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.accentGreen};
  background: ${({ theme }) => theme.colors.accentGreen}10;
  border: 1px solid ${({ theme }) => theme.colors.accentGreen}30;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
`;

const InfoText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  text-align: center;
  margin-top: 16px;
  line-height: 1.4;
`; 