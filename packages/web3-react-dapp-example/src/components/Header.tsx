import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3ConnectionContext } from '../context/web3Connection.context';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #0f2847 0%, #1a365d 100%);
  border-bottom: 2px solid rgba(99, 179, 237, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 12px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3182ce 0%, #63b3ed 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
`;

const LogoText = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;

  span {
    color: #63b3ed;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  color: ${(props) => (props.$active ? '#FFFFFF' : '#A0AEC0')};
  font-weight: 600;
  font-size: 15px;
  background: ${(props) =>
    props.$active ? 'rgba(99, 179, 237, 0.2)' : 'transparent'};
  border: ${(props) =>
    props.$active
      ? '1px solid rgba(99, 179, 237, 0.4)'
      : '1px solid transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: rgba(99, 179, 237, 0.15);
    border-color: rgba(99, 179, 237, 0.3);
  }
`;

const WalletSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const WalletButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
  }
`;

const WalletAddress = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(99, 179, 237, 0.1);
  border: 1px solid rgba(99, 179, 237, 0.3);
  border-radius: 8px;
  color: #63b3ed;
  font-weight: 600;
  font-size: 14px;
  font-family: 'Courier New', monospace;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  background: #68d391;
  border-radius: 50%;
  box-shadow: 0 0 8px #68d391;
`;

export const Header: React.FC = () => {
  const { connector, useIsActive, useAccount } = useWeb3ConnectionContext();
  const isActive = useIsActive();
  const activeAccount = useAccount();
  const location = useLocation();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoIcon>🤖</LogoIcon>
          <LogoText>
            Chain<span>AI</span>
          </LogoText>
        </Logo>

        <Nav>
          <NavLink to="/" $active={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/prompt" $active={location.pathname === '/prompt'}>
            Generate
          </NavLink>
          <NavLink to="/upload" $active={location.pathname === '/upload'}>
            Upload Model
          </NavLink>
        </Nav>

        <WalletSection>
          {isActive && activeAccount ? (
            <WalletAddress>
              <StatusDot />
              {truncateAddress(activeAccount)}
            </WalletAddress>
          ) : (
            <WalletButton onClick={() => connector.activate()}>
              🦊 Connect Wallet
            </WalletButton>
          )}
        </WalletSection>
      </HeaderContent>
    </HeaderContainer>
  );
};
