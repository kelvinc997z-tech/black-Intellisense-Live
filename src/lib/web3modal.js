import { createWeb3Modal } from '@web3modal/ethers/react';
import { defaultConfig } from '@web3modal/ethers/react';

export const projectId = '2584923e5deca98b6b6cafe381ee9096';

export const metadata = {
  name: 'Black IntelliSense',
  description: 'Institutional Grade Infrastructure',
  url: 'https://blackintellisense.com',
  icons: ['https://blackintellisense.com/assets/logo.png'],
};

let modalInstance = null;

export const initWeb3Modal = () => {
  try {
    if (projectId === 'YOUR_WALLETCONNECT_PROJECT_ID') {
      console.warn('Web3Modal: ProjectId not set. Modal will not function, but app will not crash.');
      return null;
    }
    
    modalInstance = createWeb3Modal({
      ethersConfig: defaultConfig(),
      metadata,
      projectId,
      enableAnalytics: false,
    });
    return modalInstance;
  } catch (error) {
    console.error('Web3Modal Critical Init Error:', error);
    return null;
  }
};

export const openWeb3Modal = () => {
  try {
    // We can use the global window object or a stored instance if the hook is crashing
    // Many Web3Modal versions attach to window or have a standalone open method
    if (window.web3modal && window.web3modal.open) {
      window.web3modal.open();
    } else {
      // Fallback: try to find the modal instance in the DOM or via the library's internals
      // Since the hook is crashing, we use a safer alternative
      console.log('Attempting to open Web3Modal via fallback...');
      // If the library is loaded, it usually handles the 'open' via a global state
      // we'll try to trigger it via a custom event or the known internal method
      window.dispatchEvent(new CustomEvent('web3modal:open'));
    }
  } catch (e) {
    console.error('Error opening Web3Modal:', e);
  }
};
