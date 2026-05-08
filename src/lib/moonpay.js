import { ethers } from 'ethers';
import { MoonPayConfig } from './moonpay_config';

export const MoonPayWidget = ({ address, currency = 'USDT' }) => {
  const handleOnramp = () => {
    const moonpayUrl = `https://buy.moonpay.com/?apiKey=${MoonPayConfig.apiKey}&currency=usd&cryptoCurrency=${currency}&walletAddress=${address}`;
    window.open(moonpayUrl, '_blank');
  };

  const handleOfframp = () => {
    const moonpayUrl = `https://sell.moonpay.com/?apiKey=${MoonPayConfig.apiKey}&currency=usd&cryptoCurrency=${currency}&walletAddress=${address}`;
    window.open(moonpayUrl, '_blank');
  };

  return { handleOnramp, handleOfframp };
};

export const fetchWalletBalances = async (address) => {
  try {
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    
    const TOKENS = {
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0CE3606eb48',
      ETH: null,
    };

    const balances = {};
    const ethBalance = await provider.getBalance(address);
    balances['ETH'] = ethers.formatEther(ethBalance);

    const erc20Abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];

    for (const [symbol, addr] of Object.entries(TOKENS)) {
      if (!addr) continue;
      const contract = new ethers.Contract(addr, erc20Abi, provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      balances[symbol] = ethers.formatUnits(balance, decimals);
    }

    return balances;
  } catch (e) {
    console.error('Balance fetch error:', e);
    return null;
  }
};
