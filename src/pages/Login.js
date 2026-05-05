import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import api from '../lib/api';
import { ShieldCheck, Lock, Mail, LayoutDashboard, TrendingUp, ChevronRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithWeb3 } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [web3Loading, setWeb3Loading] = useState(false);
  const [portalMode, setPortalMode] = useState('client'); // 'client' or 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);
      
      if (portalMode === 'admin' && userData.role !== 'admin') {
        toast.error('Access Denied: Admin privileges required for Sense50.');
        setLoading(false);
        return;
      }
      
      if (portalMode === 'client' && userData.role === 'admin') {
        toast.info('Admin detected. Redirecting to Client Terminal...');
      }

      toast.success('Authentication successful.');
      
      if (portalMode === 'admin') {
        navigate('/sense50');
      } else {
        navigate('/trading');
      }
    } catch (error) {
      console.error('Login Error Full:', error);
      let errorMsg = 'Invalid credentials. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (typeof data === 'string') {
          errorMsg = `Server Error (${status}): Response is not JSON`;
        } else if (data && data.detail) {
          errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } else {
          errorMsg = `Server Error (${status}): ${JSON.stringify(data)}`;
        }
      } else if (error.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        errorMsg = error.message || 'An unexpected error occurred.';
      }
      
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

      const userData = await loginWithWeb3(address, signature, nonce);
      
      if (portalMode === 'admin' && userData.role !== 'admin') {
        toast.error('Access Denied: Admin privileges required for Sense50.');
        setWeb3Loading(false);
        return;
      }

      toast.success('Web3 Identity Verified!');
      if (portalMode === 'admin') {
        navigate('/sense50');
      } else {
        navigate('/trading');
      }
    } catch (error) {
      console.error('Web3 Login Error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'MetaMask authentication failed';
      toast.error(errorMsg);
    } finally {
      setWeb3Loading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-slate-200 font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl p-8 shadow-2xl transition-all duration-500 hover:border-primary/30 group">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <div className="relative">
                <img src="/assets/logo.png" alt="Black IntelliSense" className="h-20 w-auto drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
                <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              </div>
            </div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tighter text-white mb-2">
              Black <span className="text-primary">IntelliSense</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
              Secure Terminal Access
            </p>
          </div>

          {/* Portal Selection */}
          <div className="mb-8 p-1 rounded-2xl bg-black/40 border border-white/5 flex gap-1">
            <button
              onClick={() => setPortalMode('client')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                portalMode === 'client' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              IntelliTrade
            </button>
            <button
              onClick={() => setPortalMode('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                portalMode === 'admin' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Sense 50
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white placeholder:text-slate-700 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:border-white/20"
                  placeholder="identity@blackintellisense.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-3 w-3" /> Password
                </label>
                <a href="#" className="text-[10px] text-primary hover:underline font-medium">Forgot?</a>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white placeholder:text-slate-700 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:border-white/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || web3Loading}
              className="w-full relative group overflow-hidden rounded-xl bg-primary px-4 py-3 font-bold tracking-wide text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Enter {portalMode === 'admin' ? 'Admin' : 'Client'} Terminal</span>
                    <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Secure Access</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <button
            onClick={handleWeb3Login}
            disabled={loading || web3Loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3 font-semibold text-orange-400 transition-all hover:bg-orange-500/10 hover:border-orange-500/60 active:scale-[0.98] disabled:opacity-50 group"
          >
            <div className="relative">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="h-5 w-5 transition-transform group-hover:scale-110" />
              <div className="absolute -inset-1 bg-orange-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </div>
            <span>{web3Loading ? 'Verifying...' : 'Connect MetaMask'}</span>
          </button>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
              Authorized Personnel Only
            </p>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <a
            href="https://blackintellisense.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-600 transition-all hover:text-primary"
          >
            © {new Date().getFullYear()} Black IntelliSense Platform
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
