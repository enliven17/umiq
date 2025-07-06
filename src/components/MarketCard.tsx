import styled from "styled-components";
import { Market } from "@/types/market";
import Link from "next/link";
import { useState } from "react";

interface Props {
  market: Market;
  onClick?: () => void;
}

export function MarketCard({ market }: Props) {
  const [modal, setModal] = useState<null | "yes" | "no">(null);
  const [amount, setAmount] = useState(10);

  const handleBuy = (side: "yes" | "no") => setModal(side);
  const closeModal = () => setModal(null);

  // Kartın boş alanına tıklanınca detay sayfasına yönlendir
  const handleCardClick = (e: React.MouseEvent) => {
    if (modal) return; // Modal açıkken yönlendirme yapma
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    window.location.href = `/market/${market.id}`;
  };

  // Basit bir kazanç hesaplama örneği (dummy)
  const getToWin = () => {
    if (!amount || amount <= 0) return "$0.00";
    // Örnek: 2.273x kazanç oranı
    const odds = modal === "yes" ? 2.273 : 1.754;
    return `$${(amount * odds).toFixed(2)}`;
  };

  const handleAmountChange = (val: number) => {
    if (val < 0) val = 0;
    setAmount(val);
  };

  return (
    <Card onClick={handleCardClick}>
      <Link href={`/market/${market.id}`}>
        <div style={{ cursor: "pointer" }}>
          <Title>{market.title}</Title>
          <Description>{market.description}</Description>
        </div>
      </Link>
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
      <ButtonRow>
        <BuyYesButton onClick={e => { e.stopPropagation(); handleBuy("yes"); }}>Buy Yes</BuyYesButton>
        <BuyNoButton onClick={e => { e.stopPropagation(); handleBuy("no"); }}>Buy No</BuyNoButton>
      </ButtonRow>
      {modal && (
        <FullCoverModal $open={!!modal}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{market.title}</ModalTitle>
              <CloseButton onClick={closeModal}>×</CloseButton>
            </ModalHeader>
            <AmountRow>
              <AmountInput
                type="number"
                min={0}
                value={amount}
                onChange={e => handleAmountChange(Number(e.target.value))}
              />
              <AmountButton onClick={() => handleAmountChange(amount + 1)}>+1</AmountButton>
              <AmountButton onClick={() => handleAmountChange(amount + 10)}>+10</AmountButton>
            </AmountRow>
            <SliderRow>
              <Slider
                type="range"
                min={0}
                max={100}
                value={amount}
                onChange={e => handleAmountChange(Number(e.target.value))}
              />
            </SliderRow>
            <ConfirmButton $side={modal}>
              Buy {modal === "yes" ? "Yes" : "No"}
              <ToWin>
                To win {getToWin()}
              </ToWin>
            </ConfirmButton>
          </ModalContent>
        </FullCoverModal>
      )}
    </Card>
  );
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 16px;
  margin: 8px 0;
  cursor: pointer;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  height: auto;
  position: relative;
  &:hover {
    box-shadow: 0 4px 16px rgba(91,140,255,0.15);
  }
  @media (max-width: 600px) {
    padding: 8px;
    margin: 4px 0;
    min-height: 140px;
    height: auto;
  }
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 6px 0;
  font-size: 1rem;
  @media (max-width: 600px) {
    font-size: 0.92rem;
    margin-bottom: 2px;
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 10px 0;
  font-size: 0.92rem;
  @media (max-width: 600px) {
    font-size: 0.85rem;
    margin-bottom: 4px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  gap: 16px;
  @media (max-width: 600px) {
    gap: 6px;
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

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const BuyYesButton = styled.button`
  flex: 1;
  background: #1ecb81;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #17a96b; }
`;

const BuyNoButton = styled.button`
  flex: 1;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #c0392b; }
`;

const FullCoverModal = styled.div<{ $open: boolean }>`
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.card};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  opacity: ${props => props.$open ? 1 : 0};
  pointer-events: ${props => props.$open ? 'auto' : 'none'};
  transform: ${props => props.$open ? 'scale(1)' : 'scale(0.98)'};
  transition: opacity 0.25s cubic-bezier(.4,2,.6,1), transform 0.25s cubic-bezier(.4,2,.6,1);
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const ModalContent = styled.div`
  width: 100%;
  height: auto;
  padding: 16px;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  box-sizing: border-box;
  background: transparent;
`;

const ModalHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 12px;
  font-size: 1.1rem;
`;

const AmountRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-bottom: 2px;
`;

const AmountInput = styled.input`
  width: 70px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #333;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;

const AmountButton = styled.button`
  background: #23272f;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 1rem;
  cursor: pointer;
  &:hover { background: #444; }
`;

const SliderRow = styled.div`
  width: 100%;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

const Slider = styled.input`
  width: 100%;
  accent-color: #8b5cf6;
`;

const ConfirmButton = styled.button<{ $side: "yes" | "no" | null }>`
  background: ${({ $side }) => $side === "yes" ? "#1ecb81" : $side === "no" ? "#e74c3c" : "#888"};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 0 6px 0;
  font-weight: bold;
  font-size: 1.05rem;
  width: 100%;
  cursor: pointer;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ToWin = styled.span`
  font-size: 0.95rem;
  font-weight: 400;
  color: #e0e0e0;
  margin-top: 2px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 8px;
`; 