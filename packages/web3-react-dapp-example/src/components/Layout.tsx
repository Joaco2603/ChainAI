import React from 'react';
import styled from 'styled-components';
import { Header } from './Header';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #0a1929 0%, #0f2847 100%);
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
`;

const Footer = styled.footer`
  background: rgba(15, 40, 71, 0.8);
  border-top: 1px solid rgba(99, 179, 237, 0.2);
  padding: 32px 20px;
  margin-top: 60px;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
`;

const FooterSection = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 16px;
  }

  p,
  a {
    font-size: 14px;
    color: #a0aec0;
    line-height: 1.8;
    text-decoration: none;
    display: block;
    margin-bottom: 8px;
  }

  a:hover {
    color: #63b3ed;
  }
`;

const FooterBottom = styled.div`
  max-width: 1400px;
  margin: 24px auto 0;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #718096;
  font-size: 14px;
`;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Header />
      <Main>{children}</Main>
      <Footer>
        <FooterContent>
          <FooterSection>
            <h3>ChainAI</h3>
            <p>
              A decentralized AI model registry and execution platform built on
              Avalanche blockchain.
            </p>
          </FooterSection>

          <FooterSection>
            <h3>Quick Links</h3>
            <a href="/">Home</a>
            <a href="/prompt">Generate</a>
            <a href="/upload">Upload Model</a>
          </FooterSection>

          <FooterSection>
            <h3>Resources</h3>
            <a
              href="https://docs.avax.network/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Avalanche Docs
            </a>
            <a
              href="https://testnet.snowtrace.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fuji Explorer
            </a>
            <a
              href="https://core.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Core Wallet
            </a>
          </FooterSection>

          <FooterSection>
            <h3>Community</h3>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          </FooterSection>
        </FooterContent>

        <FooterBottom>© 2025 ChainAI. Built with ❤️ on Avalanche.</FooterBottom>
      </Footer>
    </LayoutContainer>
  );
};
