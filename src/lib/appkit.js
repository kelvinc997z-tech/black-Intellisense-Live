import { createAppKit } from '@reown/appkit/react';
import { mainnet, polygon, arbitrum } from '@reown/appkit/networks';

export const projectId = '2584923e5deca98b6b6cafe381ee9096';

export const metadata = {
  name: 'Black IntelliSense',
  description: 'Institutional Grade Infrastructure',
  url: 'https://blackintellisense.com',
  icons: ['https://blackintellisense.com/assets/logo.png'],
};

export const appKit = createAppKit({
  projectId,
  networks: [mainnet, polygon, arbitrum],
  metadata,
  features: {
    email: true,
    socials: true,
    onramp: true, // Enable built-in onramp
    swaps: true,
  },
});
