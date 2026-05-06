import React, { useState, useEffect } from 'react';
import * as snarkjs from 'snarkjs';
import { zkApi } from '../api/client';
import { ShieldCheck, Lock, Loader2, CheckCircle2, AlertCircle, UserCheck, Wallet } from 'lucide-react';

const ZKVerify = () => {
  const [activeTab, setActiveTab] = useState('solvency'); // 'solvency' | 'identity'
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | proving | submitting | success | error
  const [message, setMessage] = useState('');

  // Solvency State
  const [balance, setBalance] = useState('');
  const [threshold, setThreshold] = useState(null);

  // Identity State
  const [userId, setUserId] = useState('');
  const [secret, setSecret] = useState('');

  useEffect(() => {
    if (activeTab === 'solvency') {
      const fetchThreshold = async () => {
        try {
          const res = await zkApi.getThreshold();
          setThreshold(res.data.threshold);
        } catch (e) {
          console.error("Failed to fetch threshold", e);
        }
      };
      fetchThreshold();
    }
  }, [activeTab]);

  const handleVerifySolvency = async () => {
    if (!balance || !threshold) return;
    setLoading(true);
    setStatus('proving');
    setMessage('Generating Solvency Proof locally...');

    try {
      const inputs = { balance, threshold };
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        '/zk/solvency.wasm',
        '/zk/solvency_final.zkey'
      );

      setStatus('submitting');
      setMessage('Submitting proof to Blockchain Verifier...');

      const res = await zkApi.submitProof({ proof, public_signals: publicSignals });
      setStatus('success');
      setMessage(res.data.message);
    } catch (e) {
      setStatus('error');
      setMessage('Solvency verification failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async () => {
    if (!userId || !secret) return;
    setLoading(true);
    setStatus('proving');
    setMessage('Generating Identity Proof locally...');

    try {
      const inputs = { userId, secret };
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        '/zk/identity.wasm',
        '/zk/identity_final.zkey'
      );

      setStatus('submitting');
      setMessage('Submitting identity proof to Blockchain...');

      // We call a different endpoint for identity
      // Note: We need to update zkApi to include this if not already there
      // For now, I'll use the direct axios call via the same pattern
      const res = await zkApi.submitIdentityProof({ proof, public_signals: publicSignals });

      setStatus('success');
      setMessage(res.data.message);
    } catch (e) {
      setStatus('error');
      setMessage('Identity verification failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-darkest">
      <div className="glass-card w-full max-w-md p-8 neon-border">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-accent/10 rounded-full mb-4">
            <ShieldCheck className="w-12 h-12 text-accent neon-text" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ZK Verification Portal</h1>
          <p className="text-gray-400 text-sm">
            Prove your eligibility privately using Zero-Knowledge Proofs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-black/50 rounded-lg border border-white/10 mb-8">
          <button
            onClick={() => { setActiveTab('solvency'); setStatus('idle'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-medium ${
              activeTab === 'solvency' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Solvency
          </button>
          <button
            onClick={() => { setActiveTab('identity'); setStatus('idle'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-medium ${
              activeTab === 'identity' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Identity
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'solvency' ? (
            <>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-400">Required Threshold:</span>
                  <span className="text-accent font-mono font-bold">${threshold || '...'}</span>
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-accent shadow-[0_0_8px_#22d3ee]" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2 ml-1">
                  Private Balance (USDT)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="Enter your balance..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleVerifySolvency}
                disabled={loading || !balance}
                className={`w-full py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  loading 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-accent text-black hover:bg-cyan-400 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying Solvency...
                  </>
                ) : (
                  'Prove Solvency'
                )}
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2 ml-1">
                  User ID (Secret)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your UID..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2 ml-1">
                  Identity Secret
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter your secret key..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleVerifyIdentity}
                disabled={loading || !userId || !secret}
                className={`w-full py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  loading 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-accent text-black hover:bg-cyan-400 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying Identity...
                  </>
                ) : (
                  'Prove Identity'
                )}
              </button>
            </>
          )}

          {status !== 'idle' && (
            <div className={`p-4 rounded-lg flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 ${
              status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
              status === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
              'bg-accent/10 text-accent border border-accent/20'
            }`}>
              {status === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : 
               status === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : 
               <Loader2 className="w-5 h-5 shrink-0 animate-spin" />}
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZKVerify;
