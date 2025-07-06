"use client";
import Link from "next/link";
import styled from "styled-components";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

export function MainNav() {
  const pathname = usePathname();
  return (
    <NavBar>
      <NavLinks>
        <NavLink href="/" $active={pathname === "/"}>Markets</NavLink>
        <NavLink href="/create" $active={pathname === "/create"}>Market Aç</NavLink>
        <NavLink href="/user-bets" $active={pathname === "/user-bets"}>Bahislerim</NavLink>
      </NavLinks>
      <ConnectWalletButton />
    </NavBar>
  );
}

const NavBar = styled.nav`
  display: flex;
  gap: 24px;
  background: ${({ theme }) => theme.colors.secondary};
  padding: 16px 32px;
  align-items: center;
  justify-content: space-between;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 24px;
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
`; 