import React from 'react';
import { createWeb3Modal } from '@web3modal/ethers/react';
import { defaultConfig } from '@web3modal/ethers/react';

export const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; 

export const metadata = {
  name: 'Black IntelliSense',
  description: 'Institutional Grade Infrastructure',
  url: 'https://blackintellisense.com',
  icons: ['https://blackintellisense.com/assets/logo.png'],
};

export const Web3ModalProvider = ({ children }) => {
  // Global initialization to ensure it only happens once across re-renders
  if (typeof window !== 'undefined' && !window.__WEB3MODAL_INITIALIZED__) {
    try {
      createWeb3Modal({
        ethersConfig: defaultConfig(),
        metadata,
        projectId,
        enableAnalytics: false,
      });
      window.__WEB3MODAL_INITIALIZED__ = true;
      console.log('Web3Modal initialized successfully');
    } catch (error) {
      console.error('Web3Modal Initialization Error:', error);
    }
  }

  return <>{children}</>;
};
