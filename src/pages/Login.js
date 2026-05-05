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
      const userData = await login(email, password);
      toast.success('Authentication successful. Welcome back.');
      
      // Smart Routing: Send to Sense50 if Admin, otherwise to Trading
      if (userData.role === 'admin') {
        navigate('/sense50');
      } else {
        navigate('/trading');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Invalid credentials. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleWeb3Login = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected! Please install the extension.');
      return;
    }

    setWeb3Loading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const nonceRes = await api.post('/auth/web3/nonce', { address });
      const nonce = nonceRes.data.nonce;

      const message = `Welcome to Black IntelliSense! Sign this message to login.\nNonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      await loginWithWeb3(address, signature, nonce);
      toast.success('Web3 Identity Verified!');
      navigate('/sense50');
    } catch (error) {
      console.error('Web3 Login Error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'MetaMask authentication failed';
      toast.error(errorMsg);
    } finally {
      setWeb3Loading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1757970204229-a02cb2ce0af6?crop=entropy&cs=srgb&fm=jpg&q=85)' }}
    >
      {/* Dynamic Background Overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="rounded-xl border border-border bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl transition-all duration-500 hover:border-primary/50 group">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <img src="/assets/logo.png" alt="Black IntelliSense" className="h-24 w-auto drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            </div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tighter text-foreground mb-2">
              Black <span className="text-primary">IntelliSense</span>
            </h1>
            <p className="text-sm text-muted-foreground font-light tracking-wide">
              The Intelligence Between Liquidity and Markets
            </p>
          </div>

          <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-slate-950/40 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="identity@blackintellisense.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-[10px] text-primary hover:underline">Forgot?</a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-slate-950/40 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || web3Loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-bold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/50"></div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secure Access</span>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>

          <button
            onClick={handleWeb3Login}
            disabled={loading || web3Loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3 font-semibold text-orange-400 transition-all hover:bg-orange-500/10 hover:border-orange-500/60 active:scale-[0.98] disabled:opacity-50"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="h-5 w-5" />
            <span>{web3Loading ? 'Verifying...' : 'Connect MetaMask'}</span>
          </button>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">
              Authorized Personnel Only
            </p>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <a
            href="https://blackintellisense.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-muted-foreground/40 transition-all hover:text-primary"
          >
            © {new Date().getFullYear()} Black IntelliSense Platform
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
