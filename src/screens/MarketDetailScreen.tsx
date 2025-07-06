"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { addBet, closeMarket, claimReward } from "@/store/marketsSlice";
import { Market, BetSide } from "@/types/market";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from 'wagmi';

export default function MarketDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const market: Market | undefined = useSelector((state: RootState) => state.markets.markets.find(m => m.id === id));
  const dispatch = useDispatch();
  const [amount, setAmount] = useState("");
  const [side, setSide] = useState<BetSide>("yes");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const rewards = useSelector((state: RootState) => state.markets.claimableRewards);
  const { address, isConnected } = useAccount();
  const myReward = rewards.find(r => r.userId === address && r.marketId === market.id);

  if (!market) return <Container>Market not found.</Container>;

  const totalYes = market.bets.filter(b => b.side === "yes").reduce((sum, b) => sum + b.amount, 0);
  const totalNo = market.bets.filter(b => b.side === "no").reduce((sum, b) => sum + b.amount, 0);

  const handleBet = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const betAmount = Number(amount);
    if (isNaN(betAmount) || betAmount < market.minBet || betAmount > market.maxBet) {
      setError(`Bet amount must be between ${market.minBet} - ${market.maxBet} ETH.`);
      return;
    }
    if (!isConnected || !address) {
      setError("Wallet is not connected.");
      return;
    }
    dispatch(addBet({
      id: uuidv4(),
      userId: address,
      marketId: market.id,
      amount: betAmount,
      side,
      timestamp: Date.now()
    }));
    setSuccess("Bet placed successfully!");
    setAmount("");
  };

  const handleCloseMarket = (result: BetSide) => {
    dispatch(closeMarket({ marketId: market.id, result }));
  };

  const handleClaim = () => {
    dispatch(claimReward({ userId: address, marketId: market.id }));
  };

  return (
    <Container>
      <Title>{market.title}</Title>
      <Description>{market.description}</Description>
      <InfoRow>
        <Info>
          <Label>Pool</Label>
          <Value>{market.initialPool + market.bets.reduce((sum, b) => sum + b.amount, 0)} ETH</Value>
        </Info>
        <Info>
          <Label>Min/Max</Label>
          <Value>{market.minBet} / {market.maxBet} ETH</Value>
        </Info>
        <Info>
          <Label>Closing</Label>
          <Value>{new Date(market.closesAt).toLocaleString()}</Value>
        </Info>
      </InfoRow>
      <BetStats>
        <Stat color="green">Yes: {totalYes} ETH</Stat>
        <Stat color="red">No: {totalNo} ETH</Stat>
      </BetStats>
      {market.status === "open" ? (
        <BetForm onSubmit={handleBet}>
          <Label>Bet Amount (ETH)</Label>
          <Input type="number" step="0.01" min={market.minBet} max={market.maxBet} value={amount} onChange={e => setAmount(e.target.value)} required />
          <Label>Side</Label>
          <SideRow>
            <SideButton type="button" $active={side === "yes"} onClick={() => setSide("yes")}>Yes</SideButton>
            <SideButton type="button" $active={side === "no"} onClick={() => setSide("no")}>No</SideButton>
          </SideRow>
          {error && <Error>{error}</Error>}
          {success && <Success>{success}</Success>}
          <Submit type="submit">Place Bet</Submit>
        </BetForm>
      ) : (
        <ClosedText>Market closed.</ClosedText>
      )}
      {market.status === "resolved" && (
        <>
          <ResolvedBox>
            Result: <b>{market.result === "yes" ? "Yes" : "No"}</b>
          </ResolvedBox>
          {myReward && !myReward.claimed && (
            <ClaimBox>
              Your reward: <b>{myReward.amount.toFixed(4)} ETH</b>
              <ClaimButton onClick={handleClaim}>Claim Reward</ClaimButton>
            </ClaimBox>
          )}
          {myReward && myReward.claimed && (
            <ClaimedText>Your reward has been claimed!</ClaimedText>
          )}
        </>
      )}
      {/* Dummy oracle: marketi kapat butonları (sadece demoUser için) */}
      {market.status === "open" && (
        <OracleBox>
          <OracleLabel>Set Market Result (Demo Oracle)</OracleLabel>
          <OracleButton onClick={() => handleCloseMarket("yes")}>Yes</OracleButton>
          <OracleButton onClick={() => handleCloseMarket("no")}>No</OracleButton>
        </OracleBox>
      )}
      <BetsList>
        <BetsTitle>Bets</BetsTitle>
        {market.bets.length === 0 && <NoBets>No bets yet.</NoBets>}
        {market.bets.map(bet => (
          <BetItem key={bet.id}>
            <span>{bet.side === "yes" ? "Yes" : "No"}</span>
            <span>{bet.amount} ETH</span>
            <span>{new Date(bet.timestamp).toLocaleString()}</span>
          </BetItem>
        ))}
      </BetsList>
    </Container>
  );
}

const Container = styled.div`
  max-width: 600px;
  margin: 32px auto;
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 32px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  @media (max-width: 600px) {
    padding: 14px 4px;
    margin: 12px 0;
  }
`;
const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
  font-size: 1.5rem;
  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
`;
const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 16px;
  font-size: 1rem;
  @media (max-width: 600px) {
    font-size: 0.92rem;
    margin-bottom: 8px;
  }
`;
const InfoRow = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
  @media (max-width: 600px) {
    gap: 10px;
    flex-direction: column;
  }
`;
const Info = styled.div`
  display: flex;
  flex-direction: column;
`;
const Label = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;
const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  font-size: 16px;
`;
const BetStats = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
`;
const Stat = styled.div<{ color: "green" | "red" }>`
  color: ${({ color, theme }) => color === "green" ? theme.colors.accentGreen : theme.colors.accentRed};
  font-weight: bold;
`;
const BetForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;
const Input = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;
const SideRow = styled.div`
  display: flex;
  gap: 12px;
`;
const SideButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) => $active ? "#fff" : theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 8px 24px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
`;
const Error = styled.div`
  color: ${({ theme }) => theme.colors.accentRed};
  font-size: 14px;
`;
const Success = styled.div`
  color: ${({ theme }) => theme.colors.accentGreen};
  font-size: 14px;
`;
const Submit = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.accentGreen};
  }
`;
const ClosedText = styled.div`
  color: ${({ theme }) => theme.colors.accentRed};
  font-weight: bold;
  margin: 16px 0;
`;
const BetsList = styled.div`
  margin-top: 32px;
`;
const BetsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`;
const NoBets = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;
const BetItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;
const ResolvedBox = styled.div`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.primary};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 18px;
`;
const ClaimBox = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.accentGreen};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;
const ClaimButton = styled.button`
  background: ${({ theme }) => theme.colors.accentGreen};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: bold;
  cursor: pointer;
`;
const ClaimedText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  margin-bottom: 8px;
`;
const OracleBox = styled.div`
  margin: 24px 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;
const OracleLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;
const OracleButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.accentGreen};
  }
`; 