import React from 'react';
import { createWeb3Modal } from '@web3modal/ethers/react';
import { defaultConfig } from '@web3modal/ethers/react';

export const projectId = '2584923e5deca98b6b6cafe381ee9096';

export const metadata = {
  name: 'Black IntelliSense',
  description: 'Institutional Grade Infrastructure',
  url: 'https://blackintellisense.com',
  icons: ['https://blackintellisense.com/assets/logo.png'],
};

export const Web3ModalProvider = ({ children }) => {
  if (typeof window !== 'undefined' && !window.__WEB3MODAL_INIT__) {
    try {
      createWeb3Modal({
        ethersConfig: defaultConfig(),
        metadata,
        projectId,
        enableAnalytics: false,
      });
      window.__WEB3MODAL_INIT__ = true;
    } catch (error) {
      console.error('Web3Modal Init Error:', error);
    }
  }
  return <>{children}</>;
};

export const openWeb3Modal = () => {
  try {
    window.dispatchEvent(new CustomEvent('web3modal:open'));
  } catch (e) {
    console.error('Error opening Web3Modal:', e);
  }
};
