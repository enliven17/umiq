"use client";
import { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { addMarket } from "@/store/marketsSlice";
import { Market } from "@/types/market";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from 'wagmi';

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
      setError("Başlık ve açıklama zorunlu.");
      return;
    }
    if (!closesAt) {
      setError("Kapanış zamanı seçilmeli.");
      return;
    }
    if (minBet <= 0 || maxBet <= 0 || minBet >= maxBet) {
      setError("Min/max bahis limitleri geçersiz.");
      return;
    }
    if (initialPool < 0.1) {
      setError("Başlangıç havuzu en az 0.1 ETH olmalı.");
      return;
    }
    if (!isConnected || !address) {
      setError("Cüzdan bağlı değil.");
      return;
    }
    const closesAtTimestamp = new Date(closesAt).getTime();
    if (closesAtTimestamp < Date.now() + 60 * 60 * 1000) {
      setError("Kapanış zamanı en az 1 saat sonrası olmalı.");
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
    setSuccess("Market başarıyla oluşturuldu!");
    setTitle("");
    setDescription("");
    setClosesAt("");
    setMinBet(0.01);
    setMaxBet(1);
    setInitialPool(0.5);
  };

  return (
    <Container>
      <Title>Yeni Market Aç</Title>
      <Form onSubmit={handleSubmit}>
        <Label>Başlık</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required />
        <Label>Açıklama</Label>
        <TextArea value={description} onChange={e => setDescription(e.target.value)} required />
        <Label>Kapanış Zamanı</Label>
        <Input type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)} required />
        <Row>
          <Col>
            <Label>Min Bahis (ETH)</Label>
            <Input type="number" step="0.01" min={0.01} value={minBet} onChange={e => setMinBet(Number(e.target.value))} required />
          </Col>
          <Col>
            <Label>Max Bahis (ETH)</Label>
            <Input type="number" step="0.01" min={0.01} value={maxBet} onChange={e => setMaxBet(Number(e.target.value))} required />
          </Col>
        </Row>
        <Label>Başlangıç Havuzu (ETH)</Label>
        <Input type="number" step="0.01" min={0.1} value={initialPool} onChange={e => setInitialPool(Number(e.target.value))} required />
        {error && <Error>{error}</Error>}
        {success && <Success>{success}</Success>}
        <Submit type="submit">Market Aç</Submit>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  max-width: 500px;
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
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 600px) {
    gap: 8px;
  }
`;
const Label = styled.label`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  @media (max-width: 600px) {
    font-size: 12px;
  }
`;
const Input = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: 600px) {
    padding: 6px 8px;
    font-size: 14px;
  }
`;
const TextArea = styled.textarea`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 60px;
  @media (max-width: 600px) {
    padding: 6px 8px;
    font-size: 14px;
    min-height: 40px;
  }
`;
const Row = styled.div`
  display: flex;
  gap: 16px;
  @media (max-width: 600px) {
    gap: 8px;
    flex-direction: column;
  }
`;
const Col = styled.div`
  flex: 1;
`;
const Error = styled.div`
  color: ${({ theme }) => theme.colors.accentRed};
  font-size: 14px;
  @media (max-width: 600px) {
    font-size: 12px;
  }
`;
const Success = styled.div`
  color: ${({ theme }) => theme.colors.accentGreen};
  font-size: 14px;
  @media (max-width: 600px) {
    font-size: 12px;
  }
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
  @media (max-width: 600px) {
    padding: 8px 0;
    font-size: 14px;
  }
`; 