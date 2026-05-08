import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

export const MoonPayWidget = ({ address, currency = 'USDT' }) => {
  const handleOnramp = () => {
    // MoonPay Hosted Checkout URL
    const moonpayUrl = `https://buy.moonpay.com/?apiKey=YOUR_MOONPAY_API_KEY&currency=usd&cryptoCurrency=${currency}&walletAddress=${address}`;
    window.open(moonpayUrl, '_blank');
  };

  const handleOfframp = () => {
    const moonpayUrl = `https://sell.moonpay.com/?apiKey=YOUR_MOONPAY_API_KEY&currency=usd&cryptoCurrency=${currency}&walletAddress=${address}`;
    window.open(moonpayUrl, '_blank');
  };

  return { handleOnramp, handleOfframp };
};

export const fetchWalletBalances = async (address) => {
  try {
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    
    // Common Token Addresses (Mainnet)
    const TOKENS = {
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0CE3606eb48',
      ETH: null, // Native
    };

    const balances = {};
    
    // Fetch ETH
    const ethBalance = await provider.getBalance(address);
    balances['ETH'] = ethers.formatEther(ethBalance);

    // Fetch ERC20s
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
