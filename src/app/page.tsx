"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MarketCard } from "@/components/MarketCard";
import styled from "styled-components";
import { MainNav } from "@/navigation";
import { useState } from "react";

export default function HomePage() {
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const markets = useSelector((state: RootState) => state.markets.markets);
  const filteredMarkets = markets.filter(m =>
    filter === "all" ? true : filter === "open" ? m.status === "open" : m.status !== "open"
  );

  return (
    <>
      <MainNav />
      <Container>
        <Title>Trending Markets</Title>
        <FilterBar>
          <FilterButton $active={filter === "open"} onClick={() => setFilter("open")}>Açık</FilterButton>
          <FilterButton $active={filter === "closed"} onClick={() => setFilter("closed")}>Kapalı/Çözüldü</FilterButton>
          <FilterButton $active={filter === "all"} onClick={() => setFilter("all")}>Tümü</FilterButton>
        </FilterBar>
        <MarketsGrid>
          {filteredMarkets.map(market => (
            <MarketCard key={market.id} market={market} />
          ))}
        </MarketsGrid>
      </Container>
    </>
  );
}

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
  @media (max-width: 600px) {
    padding: 16px 4px;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 24px;
  font-size: 2.2rem;
  @media (max-width: 600px) {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
`;

const MarketsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  @media (min-width: 700px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  @media (max-width: 600px) {
    gap: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) => $active ? "#fff" : theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  @media (max-width: 600px) {
    padding: 6px 10px;
    font-size: 14px;
  }
`;