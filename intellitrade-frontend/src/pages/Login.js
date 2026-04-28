import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import api from '../lib/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithWeb3 } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [web3Loading, setWeb3Loading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome to IntelliTrade!');
      navigate('/trading');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWeb3Login = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected! Please install MetaMask.');
      return;
    }

    setWeb3Loading(true);
    try {
      // 1. Get account
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // 2. Get nonce from backend
      const nonceRes = await api.post('/auth/web3/nonce', { address });
      const nonce = nonceRes.data.nonce;

      // 3. Sign message
      const signer = await provider.getSigner();
      const message = `Welcome to Black IntelliSense! Sign this message to login.\nNonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      // 4. Login to backend
      await loginWithWeb3(address, signature, nonce);
      toast.success('Web3 Login Successful!');
      navigate('/trading');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'MetaMask Login failed');
    } finally {
      setWeb3Loading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1639762681485-074b7f938ba0?crop=entropy&cs=srgb&fm=jpg&q=85)' }}
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="rounded-sm border border-border bg-card/40 backdrop-blur-md p-8 shadow-xl glow-effect">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img src="/assets/logo.png" alt="IntelliTrade" className="h-20 w-auto" />
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              IntelliTrade
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Professional OTC Trading Platform
            </p>
          </div>

          <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || web3Loading}
              className="w-full rounded-sm bg-primary px-4 py-3 font-medium tracking-wide text-primary-foreground shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In to Trade'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between">
            <div className="h-px w-full bg-border"></div>
            <span className="px-3 text-xs text-muted-foreground whitespace-nowrap">OR</span>
            <div className="h-px w-full bg-border"></div>
          </div>

          <button
            onClick={handleWeb3Login}
            disabled={loading || web3Loading}
            className="mt-4 w-full flex items-center justify-center space-x-3 rounded-sm border border-orange-500/50 bg-orange-500/10 px-4 py-3 font-medium text-orange-400 transition-colors hover:bg-orange-500/20 disabled:opacity-50"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="h-5 w-5" />
            <span>{web3Loading ? 'Connecting...' : 'Login with MetaMask'}</span>
          </button>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Secure OTC Trading Platform</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a
            href="https://blackintellisense.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground/60 hover:text-primary"
          >
            Made by Black IntelliSense
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
