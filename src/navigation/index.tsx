"use client";
import Link from "next/link";
import styled from "styled-components";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

export function MainNav() {
  const pathname = usePathname();
  return (
    <NavBar>
      <LogoBox>
        <span style={{ fontSize: 28 }}>🔮</span>
        <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>UMIq</span>
      </LogoBox>
      <NavLinks>
        <NavLink href="/" $active={pathname === "/"}>Markets</NavLink>
        <NavLink href="/create" $active={pathname === "/create"}>Create Market</NavLink>
        <NavLink href="/user-bets" $active={pathname === "/user-bets"}>My Bets</NavLink>
      </NavLinks>
      <WalletBox>
        <ConnectWalletButton />
      </WalletBox>
    </NavBar>
  );
}

const NavBar = styled.nav`
  background: ${({ theme }) => theme.colors.secondary};
  padding: 0 16px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
  width: 100vw;
  box-sizing: border-box;
  z-index: 100;

  @media (max-width: 800px) {
    flex-direction: column;
    height: auto;
    padding: 8px 4px;
    gap: 8px;
  }
`;

const NavLinks = styled.div`
  flex: 1;
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: center;
  @media (max-width: 800px) {
    gap: 16px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  @media (max-width: 800px) {
    justify-content: center;
    width: 100%;
    margin-bottom: 2px;
  }
`;

const WalletBox = styled.div`
  margin-left: 24px;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  @media (max-width: 800px) {
    margin-left: 0;
    width: 100%;
    justify-content: center;
    margin-bottom: 4px;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${({ $active }) => $active ? "bold" : "normal"};
  text-decoration: none;
  font-size: 18px;
  padding-bottom: 2px;
  border-bottom: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : "transparent"};
  transition: color 0.2s, border-bottom 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  @media (max-width: 800px) {
    font-size: 16px;
    padding-bottom: 0;
  }
`;