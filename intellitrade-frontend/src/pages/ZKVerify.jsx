import React, { useState, useEffect } from 'react';
import * as snarkjs from 'snarkjs';
import { zkApi } from '../api/client';
import { ShieldCheck, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const ZKVerify = () => {
  const [balance, setBalance] = useState('');
  const [threshold, setThreshold] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | proving | submitting | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const res = await zkApi.getThreshold();
        setThreshold(res.data.threshold);
      } catch (e) {
        console.error("Failed to fetch threshold", e);
      }
    };
    fetchThreshold();
  }, []);

  const handleVerify = async () => {
    if (!balance || !threshold) return;

    setLoading(true);
    setStatus('proving');
    setMessage('Generating Zero-Knowledge Proof locally...');

    try {
      // 1. Prepare inputs
      const inputs = {
        balance: balance,
        threshold: threshold
      };

      // 2. Generate Proof using snarkjs
      // Assets are in /public/zk/
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        '/zk/solvency.wasm',
        '/zk/solvency_final.zkey'
      );

      setStatus('submitting');
      setMessage('Submitting proof to Blockchain Verifier...');

      // 3. Submit to Backend
      const res = await zkApi.submitProof({
        proof,
        public_signals: publicSignals
      });

      setStatus('success');
      setMessage(res.data.message);
    } catch (e) {
      console.error(e);
      setStatus('error');
      setMessage('Verification failed: ' + (e.response?.data?.detail || e.message));
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
          <h1 className="text-2xl font-bold text-white mb-2">Solvency Verification</h1>
          <p className="text-gray-400 text-sm">
            Prove your funds without revealing your exact balance using Zero-Knowledge Proofs.
          </p>
        </div>

        <div className="space-y-6">
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
            onClick={handleVerify}
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
                Verifying...
              </>
            ) : (
              'Verify Solvency'
            )}
          </button>

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
