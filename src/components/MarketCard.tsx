import styled from "styled-components";
import { Market } from "@/types/market";
import Link from "next/link";

interface Props {
  market: Market;
  onClick?: () => void;
}

export function MarketCard({ market }: Props) {
  return (
    <Link href={`/market/${market.id}`} passHref legacyBehavior>
      <Card as="a">
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
            <Label>Status</Label>
            <Value>{market.status === "open" ? "Open" : market.status === "closed" ? "Closed" : "Resolved"}</Value>
          </Info>
        </InfoRow>
      </Card>
    </Link>
  );
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 24px;
  margin: 8px 0;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 16px rgba(91,140,255,0.15);
  }
  @media (max-width: 600px) {
    padding: 12px;
    margin: 4px 0;
  }
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  @media (max-width: 600px) {
    font-size: 1rem;
    margin-bottom: 4px;
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 16px 0;
  font-size: 1rem;
  @media (max-width: 600px) {
    font-size: 0.92rem;
    margin-bottom: 8px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  gap: 32px;
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