import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { ShieldCheck, Lock, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const VerificationPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [reclaimUrl, setReclaimUrl] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get('/verify/status');
      setStatus(res.data);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!proof) {
      setMessage({ type: 'error', text: 'Please enter a ZK Proof' });
      return;
    }

    setIsVerifying(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/verify/verify-zk-proof', {
        proof: proof,
        provider: 'zkpass',
        verification_type: 'balance_proof',
        data: { min_balance: 10000 }
      });
      
      setMessage({ type: 'success', text: 'Verification successful! Your trade limit has been increased.' });
      await checkStatus();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Verification failed. Please check your proof.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReclaimRequest = async () => {
    setIsRequesting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/verify/reclaim/request');
      setReclaimUrl(res.data.request_url);
      setMessage({ type: 'success', text: 'QR Code generated. Please scan with Reclaim App.' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to initiate Reclaim request.' 
      });
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-mono text-sm text-muted-foreground animate-pulse uppercase tracking-widest">Loading Security Status...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 p-2 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <ShieldCheck className="h-3 w-3" />
              Identity & Trust Layer
            </div>
            <h1 className="font-heading text-6xl font-black tracking-tighter text-white">
              VERIFY<span className="text-primary">ZK</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
              Prove your assets and identity using Zero-Knowledge TLS proofs. 
              Increase your trading limits without compromising privacy.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Status Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-6 backdrop-blur-2xl">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Current Status</h3>
              <div className="flex items-center gap-3 mb-6">
                {status?.is_verified ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-400" />
                )}
                <div>
                  <p className={`font-bold ${status?.is_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {status?.is_verified ? 'Verified User' : 'Unverified'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">Account Trust Level</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs text-slate-400">Trade Limit</span>
                  <span className="font-mono text-sm font-bold text-white">
                    ${status?.is_verified ? '100,000' : '5,000'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs text-slate-400">Verification</span>
                  <span className="text-xs font-bold text-slate-300">{status?.is_verified ? 'zkTLS' : 'None'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">How it works</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                zkTLS allows you to prove data from any website (like Binance or a Bank) 
                without sharing your password. We only verify that the data is authentic.
              </p>
            </div>
          </div>

          {/* Verification Form */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-8 backdrop-blur-xl">
            <div className="mb-8">
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight mb-2">Submit ZK Proof</h3>
              <p className="text-sm text-slate-500">Enter your proof generated from ZK Pass or Reclaim Protocol.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Proof String</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input 
                    type="text" 
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                    placeholder="zkpass_proof_..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-b from-slate-900/40 to-black/60 px-2 text-slate-500 font-bold">Or usezK TLS</span>
                </div>
              </div>

              <button 
                onClick={handleReclaimRequest}
                disabled={isRequesting}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRequesting ? 'Generating...' : 'Verify with Reclaim Protocol'}
              </button>

              {reclaimUrl && (
                <div className="p-6 rounded-2xl bg-white border border-white/20 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(reclaimUrl)}`} 
                    alt="Reclaim QR Code" 
                    className="w-40 h-40"
                  />
                  <div className="text-center">
                    <p className="text-black font-bold text-sm">Scan with Reclaim App</p>
                    <p className="text-slate-500 text-[10px] uppercase">Secure zkTLS Proof Generation</p>
                  </div>
                  <button 
                    onClick={() => setReclaimUrl(null)} 
                    className="text-xs text-slate-400 hover:text-black underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {message.text && (
                <div className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {message.text}
                </div>
              )}

              <button 
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                {isVerifying ? 'Verifying Proof...' : 'Increase Trade Limit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationPage;
