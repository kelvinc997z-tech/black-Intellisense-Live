import { createAppKit } from '@reown/appkit/react';
import { defaultConfig } from '@reown/appkit/react';

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
    modalInstance = createAppKit({
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
    if (modalInstance && modalInstance.open) {
      modalInstance.open();
    } else {
      window.dispatchEvent(new CustomEvent('appkit:open'));
    }
  } catch (e) {
    console.error('Error opening Web3Modal:', e);
  }
};
