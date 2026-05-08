import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, polygon, arbitrum } from '@reown/appkit/networks';

export const projectId = '2584923e5deca98b6b6cafe381ee9096';

export const metadata = {
  name: 'Black IntelliSense',
  description: 'Institutional Grade Infrastructure',
  url: 'https://blackintellisense.com',
  icons: ['https://blackintellisense.com/assets/logo.png'],
};

export const Web3ModalProvider = ({ children }) => {
  if (typeof window !== 'undefined' && !window.__APPKIT_INIT__) {
    try {
      createAppKit({
        adapters: [new EthersAdapter()],
        networks: [mainnet, polygon, arbitrum],
        metadata,
        projectId,
        enableAnalytics: false,
      });
      window.__APPKIT_INIT__ = true;
    } catch (error) {
      console.error('AppKit Init Error:', error);
    }
  }
  return <>{children}</>;
};

export const openWeb3Modal = () => {
  try {
    // AppKit uses a custom event or can be triggered via their hook, 
    // but for a simple utility function:
    window.dispatchEvent(new CustomEvent('appkit:open'));
  } catch (e) {
    console.error('Error opening AppKit Modal:', e);
  }
};
