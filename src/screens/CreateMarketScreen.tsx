"use client";
import { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { addMarket } from "@/store/marketsSlice";
import { Market } from "@/types/market";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from 'wagmi';
import { FaPlus, FaCalendarAlt, FaCoins, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function CreateMarketScreen() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [minBet, setMinBet] = useState(0.01);
  const [maxBet, setMaxBet] = useState(1);
  const [initialPool, setInitialPool] = useState(0.5);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { address, isConnected } = useAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (!closesAt) {
      setError("Closing time must be selected.");
      return;
    }
    if (minBet <= 0 || maxBet <= 0 || minBet >= maxBet) {
      setError("Min/max bet limits are invalid.");
      return;
    }
    if (initialPool < 0.1) {
      setError("Initial pool must be at least 0.1 ETH.");
      return;
    }
    if (!isConnected || !address) {
      setError("Wallet is not connected.");
      return;
    }
    const closesAtTimestamp = new Date(closesAt).getTime();
    if (closesAtTimestamp < Date.now() + 60 * 60 * 1000) {
      setError("Closing time must be at least 1 hour from now.");
      return;
    }
    const newMarket: Market = {
      id: uuidv4(),
      title,
      description,
      creatorId: address,
      createdAt: Date.now(),
      closesAt: closesAtTimestamp,
      initialPool,
      minBet,
      maxBet,
      status: "open",
      bets: []
    };
    dispatch(addMarket(newMarket));
    setSuccess("Market created successfully!");
    setTitle("");
    setDescription("");
    setClosesAt("");
    setMinBet(0.01);
    setMaxBet(1);
    setInitialPool(0.5);
  };

  return (
    <Container>
      <Header>
        <HeaderIcon>
          <FaPlus />
        </HeaderIcon>
        <HeaderContent>
          <Title>Create New Market</Title>
          <Subtitle>Start a new prediction market and let users bet on outcomes</Subtitle>
        </HeaderContent>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>
            <FaInfoCircle />
            Market Information
          </SectionTitle>
          
          <FormGroup>
            <Label>Market Title</Label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g., Will Bitcoin reach $100k by end of year?"
              required 
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Provide a clear description of what users are betting on..."
              required 
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaCalendarAlt />
            Market Settings
          </SectionTitle>
          
          <FormGroup>
            <Label>Closing Time</Label>
            <Input 
              type="datetime-local" 
              value={closesAt} 
              onChange={e => setClosesAt(e.target.value)} 
              required 
            />
            <HelpText>Market will close at this time and no more bets will be accepted</HelpText>
          </FormGroup>

          <BetLimitsRow>
            <FormGroup>
              <Label>Minimum Bet (ETH)</Label>
              <Input 
                type="number" 
                step="0.01" 
                min={0.01} 
                value={minBet} 
                onChange={e => setMinBet(Number(e.target.value))} 
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Maximum Bet (ETH)</Label>
              <Input 
                type="number" 
                step="0.01" 
                min={0.01} 
                value={maxBet} 
                onChange={e => setMaxBet(Number(e.target.value))} 
                required 
              />
            </FormGroup>
          </BetLimitsRow>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaCoins />
            Pool Configuration
          </SectionTitle>
          
          <FormGroup>
            <Label>Initial Pool (ETH)</Label>
            <Input 
              type="number" 
              step="0.01" 
              min={0.1} 
              value={initialPool} 
              onChange={e => setInitialPool(Number(e.target.value))} 
              required 
            />
            <HelpText>Starting amount in the betting pool</HelpText>
          </FormGroup>
        </FormSection>

        {error && (
          <ErrorContainer>
            <ErrorIcon>
              <FaExclamationTriangle />
            </ErrorIcon>
            <ErrorText>{error}</ErrorText>
          </ErrorContainer>
        )}
        
        {success && (
          <SuccessContainer>
            <SuccessIcon>
              <FaCheckCircle />
            </SuccessIcon>
            <SuccessText>{success}</SuccessText>
          </SuccessContainer>
        )}

        <SubmitButton type="submit" disabled={!isConnected}>
          <FaPlus />
          Create Market
        </SubmitButton>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  max-width: 800px;
  margin: 32px auto;
  padding: 0 24px;
  @media (max-width: 600px) {
    padding: 0 16px;
    margin: 16px auto;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding: 32px;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
    gap: 16px;
  }
`;

const HeaderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 16px;
  font-size: 24px;
  flex-shrink: 0;
  @media (max-width: 600px) {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 600px) {
    padding: 24px 20px;
  }
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 18px;
  }
  
  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 20px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 16px 20px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  @media (max-width: 600px) {
    padding: 14px 16px;
    font-size: 16px;
  }
`;

const TextArea = styled.textarea`
  padding: 16px 20px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  @media (max-width: 600px) {
    padding: 14px 16px;
    font-size: 16px;
    min-height: 100px;
  }
`;

const HelpText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  margin: 4px 0 0 0;
  line-height: 1.4;
`;

const BetLimitsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${({ theme }) => `${theme.colors.accentRed}10`};
  border: 1px solid ${({ theme }) => theme.colors.accentRed};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.accentRed};
`;

const ErrorIcon = styled.div`
  font-size: 18px;
  flex-shrink: 0;
`;

const ErrorText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const SuccessContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${({ theme }) => `${theme.colors.accentGreen}10`};
  border: 1px solid ${({ theme }) => theme.colors.accentGreen};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.accentGreen};
`;

const SuccessIcon = styled.div`
  font-size: 18px;
  flex-shrink: 0;
`;

const SuccessText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: ${({ theme, disabled }) => disabled ? theme.colors.textSecondary : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 16px;
  padding: 20px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    background: ${({ theme }) => theme.colors.accentGreen};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  svg {
    font-size: 16px;
  }
  
  @media (max-width: 600px) {
    padding: 16px 24px;
    font-size: 16px;
  }
`; 