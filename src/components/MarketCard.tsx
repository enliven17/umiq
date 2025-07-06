import styled from "styled-components";
import { Market } from "@/types/market";
import Link from "next/link";
import { useState } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle, FaCoins, FaUsers, FaCalendarAlt } from 'react-icons/fa';

interface Props {
  market: Market;
  onClick?: () => void;
}

const MIN_BET = 0.001;
const MAX_BET = 5;

export function MarketCard({ market }: Props) {
  const [modal, setModal] = useState<null | "yes" | "no">(null);
  const [amount, setAmount] = useState(MIN_BET);
  const [error, setError] = useState("");

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
    if (!amount || amount <= 0) return "0.00 ETH";
    // Örnek: 2.273x kazanç oranı
    const odds = modal === "yes" ? 2.273 : 1.754;
    return `${(amount * odds).toFixed(4)} ETH`;
  };

  const handleAmountChange = (val: number) => {
    if (val < MIN_BET) {
      setAmount(val);
      setError(`Minimum bet is ${MIN_BET} ETH`);
      return;
    }
    if (val > MAX_BET) {
      setAmount(val);
      setError(`Maximum bet is ${MAX_BET} ETH`);
      return;
    }
    setAmount(val);
    setError("");
  };

  const getStatusIcon = () => {
    if (market.status === "resolved") {
      return market.result === "yes" ? <FaCheckCircle /> : <FaTimesCircle />;
    }
    return <FaClock />;
  };

  const getStatusColor = () => {
    if (market.status === "resolved") {
      return market.result === "yes" ? "green" : "red";
    }
    return "blue";
  };

  const totalPool = market.initialPool + market.bets.reduce((sum, b) => sum + b.amount, 0);
  const totalBets = market.bets.length;
  const timeLeft = market.closesAt - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <Card onClick={handleCardClick}>
      <CardHeader>
        <StatusBadge $status={getStatusColor()}>
          {getStatusIcon()}
          {market.status === "open" ? "Open" : market.status === "resolved" ? (market.result === "yes" ? "Yes Won" : "No Won") : "Closed"}
        </StatusBadge>
        <TimeLeft>
          {market.status === "open" ? (
            <>
              <FaCalendarAlt />
              {daysLeft > 0 ? `${daysLeft} days left` : "Closing soon"}
            </>
          ) : (
            <>
              <FaCheckCircle />
              Resolved
            </>
          )}
        </TimeLeft>
      </CardHeader>
      <CardContent>
        <Link href={`/market/${market.id}`}>
          <div style={{ cursor: "pointer" }}>
            <Title>{market.title}</Title>
            <Description>{market.description}</Description>
          </div>
        </Link>
        <StatsRow>
          <Stat>
            <StatIcon>
              <FaCoins />
            </StatIcon>
            <StatContent>
              <StatValue>{totalPool.toFixed(2)} ETH</StatValue>
              <StatLabel>Total Pool</StatLabel>
            </StatContent>
          </Stat>
          <Stat>
            <StatIcon>
              <FaUsers />
            </StatIcon>
            <StatContent>
              <StatValue>{totalBets}</StatValue>
              <StatLabel>Bets</StatLabel>
            </StatContent>
          </Stat>
        </StatsRow>
        <InfoRow>
          <Info>
            <InfoLabel>Min/Max Bet</InfoLabel>
            <InfoValue>{market.minBet} / {market.maxBet} ETH</InfoValue>
          </Info>
          <Info>
            <InfoLabel>Initial Pool</InfoLabel>
            <InfoValue>{market.initialPool} ETH</InfoValue>
          </Info>
        </InfoRow>
      </CardContent>
      <CardFooter>
        <ButtonRow>
          <BuyYesButton onClick={e => { e.stopPropagation(); handleBuy("yes"); }}>
            Buy Yes
          </BuyYesButton>
          <BuyNoButton onClick={e => { e.stopPropagation(); handleBuy("no"); }}>
            Buy No
          </BuyNoButton>
        </ButtonRow>
      </CardFooter>
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
                min={MIN_BET}
                max={MAX_BET}
                step={0.001}
                value={amount}
                onChange={e => handleAmountChange(Number(e.target.value))}
                placeholder="Amount (ETH)"
              />
              <AmountButton onClick={() => handleAmountChange(MIN_BET)}>Min</AmountButton>
              <AmountButton onClick={() => handleAmountChange(MAX_BET)}>Max</AmountButton>
            </AmountRow>
            <SliderRow>
              <Slider
                type="range"
                min={MIN_BET}
                max={MAX_BET}
                step={0.001}
                value={amount}
                onChange={e => handleAmountChange(Number(e.target.value))}
              />
            </SliderRow>
            {error && <div style={{color: '#ff4d4f', marginBottom: 8}}>{error}</div>}
            <ConfirmButton $side={modal} disabled={!!error}>
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
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 600px) {
    border-radius: 16px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 600px) {
    padding: 16px 20px 12px 20px;
  }
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${({ $status, theme }) => {
    if ($status === "green") return `${theme.colors.accentGreen}20`;
    if ($status === "red") return `${theme.colors.accentRed}20`;
    return `${theme.colors.primary}20`;
  }};
  
  color: ${({ $status, theme }) => {
    if ($status === "green") return theme.colors.accentGreen;
    if ($status === "red") return theme.colors.accentRed;
    return theme.colors.primary;
  }};
  
  svg {
    font-size: 12px;
  }
`;

const TimeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  
  svg {
    font-size: 12px;
  }
`;

const CardContent = styled.div`
  padding: 20px 24px;
  flex: 1;
  @media (max-width: 600px) {
    padding: 16px 20px;
  }
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
  @media (max-width: 600px) {
    font-size: 13px;
    margin-bottom: 16px;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 600px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  @media (max-width: 600px) {
    padding: 10px;
    gap: 8px;
  }
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${({ theme }) => `${theme.colors.primary}20`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-size: 14px;
  flex-shrink: 0;
  @media (max-width: 600px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  @media (max-width: 600px) {
    font-size: 10px;
  }
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  @media (max-width: 600px) {
    font-size: 13px;
  }
`;

const CardFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 600px) {
    padding: 16px 20px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const BuyYesButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.accentGreen};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #17a96b;
    transform: translateY(-1px);
  }
  
  @media (max-width: 600px) {
    padding: 12px 0;
    font-size: 13px;
  }
`;

const BuyNoButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.accentRed};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #c0392b;
    transform: translateY(-1px);
  }
  
  @media (max-width: 600px) {
    padding: 12px 0;
    font-size: 13px;
  }
`;

const FullCoverModal = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  opacity: ${({ $open }) => $open ? 1 : 0};
  visibility: ${({ $open }) => $open ? 'visible' : 'hidden'};
  transition: all 0.3s;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  @media (max-width: 600px) {
    padding: 24px;
    border-radius: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  margin-right: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const AmountRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const AmountInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AmountButton = styled.button`
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentGreen};
  }
`;

const SliderRow = styled.div`
  margin-bottom: 24px;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.border};
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border: none;
  }
`;

const ConfirmButton = styled.button<{ $side: string }>`
  width: 100%;
  background: ${({ $side, theme }) => $side === "yes" ? theme.colors.accentGreen : theme.colors.accentRed};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
`;

const ToWin = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
  opacity: 0.9;
`; 