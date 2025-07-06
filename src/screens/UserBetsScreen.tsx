"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import styled from "styled-components";
import { useAccount } from 'wagmi';

export default function UserBetsScreen() {
  const { address } = useAccount();
  const markets = useSelector((state: RootState) => state.markets.markets);
  const rewards = useSelector((state: RootState) => state.markets.claimableRewards);

  // Kullanıcının tüm bahisleri
  const myBets = markets.flatMap(m => m.bets.filter(b => b.userId === address).map(b => ({ ...b, market: m })));

  // Kazanılan bahisler (ödül claim edilebilir veya edildi)
  const myRewards = rewards.filter(r => r.userId === address);

  return (
    <Container>
      <Title>Bahis Geçmişim</Title>
      <SectionTitle>Bahislerim</SectionTitle>
      {myBets.length === 0 && <EmptyText>Henüz bahis yapmadınız.</EmptyText>}
      {myBets.map(bet => (
        <BetItem key={bet.id}>
          <BetMarket>{bet.market.title}</BetMarket>
          <span>{bet.side === "yes" ? "Evet" : "Hayır"}</span>
          <span>{bet.amount} ETH</span>
          <span>{new Date(bet.timestamp).toLocaleString()}</span>
          <BetStatus>
            {bet.market.status === "resolved"
              ? bet.market.result === bet.side
                ? <Win>Kazandı</Win>
                : <Lose>Kaybetti</Lose>
              : <Open>Açık</Open>}
          </BetStatus>
        </BetItem>
      ))}
      <SectionTitle>Kazançlarım</SectionTitle>
      {myRewards.length === 0 && <EmptyText>Kazancınız yok.</EmptyText>}
      {myRewards.map(r => (
        <RewardItem key={r.marketId}>
          <span>Market ID: {r.marketId}</span>
          <span>Miktar: {r.amount.toFixed(4)} ETH</span>
          <span>{r.claimed ? "Çekildi" : "Çekilebilir"}</span>
        </RewardItem>
      ))}
    </Container>
  );
}

const Container = styled.div`
  max-width: 700px;
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
  margin-bottom: 24px;
  font-size: 1.5rem;
  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
`;
const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 24px 0 8px 0;
  font-size: 1.1rem;
  @media (max-width: 600px) {
    font-size: 1rem;
    margin: 14px 0 4px 0;
  }
`;
const EmptyText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-bottom: 8px;
  @media (max-width: 600px) {
    font-size: 12px;
  }
`;
const BetItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 600px) {
    gap: 6px;
    font-size: 13px;
    flex-wrap: wrap;
  }
`;
const BetMarket = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
`;
const BetStatus = styled.span`
  margin-left: auto;
`;
const Win = styled.span`
  color: ${({ theme }) => theme.colors.accentGreen};
  font-weight: bold;
`;
const Lose = styled.span`
  color: ${({ theme }) => theme.colors.accentRed};
  font-weight: bold;
`;
const Open = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const RewardItem = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 600px) {
    gap: 8px;
    font-size: 13px;
    flex-wrap: wrap;
  }
`; 