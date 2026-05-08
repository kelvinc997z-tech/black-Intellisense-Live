import { createWeb3Modal } from '@web3modal/ethers/react';
import { defaultConfig } from '@web3modal/ethers/react';

export const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // User needs to replace this

export const metadata = {
  name: 'Black IntelliSense',
  description: 'Institutional Grade Infrastructure',
  url: 'https://blackintellisense.com',
  icons: ['https://blackintellisense.com/assets/logo.png'],
};

export const initWeb3Modal = () => {
  try {
    createWeb3Modal({
      ethersConfig: defaultConfig(),
      metadata,
      projectId,
      enableAnalytics: false,
    });
    console.log('Web3Modal initialized successfully');
  } catch (error) {
    console.error('Web3Modal Initialization Error:', error);
  }
};
