import React from 'react';
import { createWeb3Modal } from '@web3modal/ethers/react';
import { defaultConfig } from '@web3modal/ethers/react';

export const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // User needs to replace this

export const metadata = {
  name: 'Black IntelliSense',
  description: 'Institutional Grade Infrastructure',
  url: 'https://blackintellisense.com',
  icons: ['https://blackintellisense.com/assets/logo.png'],
};

export const web3ModalConfig = {
  ethersConfig: defaultConfig(),
  metadata,
  projectId,
  enableAnalytics: false,
};

export const Web3ModalProvider = ({ children }) => {
  try {
    // Initialize Web3Modal only once
    if (!window.__WEB3_MODAL_INITIALIZED__) {
      createWeb3Modal({
        ethersConfig: defaultConfig(),
        metadata,
        projectId,
        enableAnalytics: false,
      });
      window.__WEB3_MODAL_INITIALIZED__ = true;
    }
  } catch (error) {
    console.error('Web3Modal Initialization Error:', error);
  }

  return <>{children}</>;
};
