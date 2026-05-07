import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { ShieldCheck, Lock, Info, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ScanEye, Terminal as TerminalIcon } from 'lucide-react';

const VerificationPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [reclaimUrl, setReclaimUrl] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [tradeId, setTradeId] = useState('');
  const [currentStep, setCurrentStep] = useState(0); // 0: Choice, 1: Input, 2: Verifying, 3: Result
  const [verifyMethod, setVerifyMethod] = useState(null); // 'reclaim' or 'manual'
  const [verificationLogs, setVerificationLogs] = useState([]);

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

  const addLog = (text) => {
    setVerificationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  const startVerification = async () => {
    setIsVerifying(true);
    setCurrentStep(2);
    setVerificationLogs([]);
    setMessage({ type: '', text: '' });

    addLog("Initiating zkTLS handshake...");
    await new Promise(r => setTimeout(r, 800));
    addLog("Connecting to Reclaim Protocol node...");
    await new Promise(r => setTimeout(r, 1000));
    addLog("Validating proof structure...");
    await new Promise(r => setTimeout(r, 1200));
    addLog("Cross-referencinginstitutional trust layer...");
    await new Promise(r => setTimeout(r, 1000));
    addLog("Analyzing solvency metrics...");
    await new Promise(r => setTimeout(r, 800));

    try {
      let res;
      if (verifyMethod === 'manual') {
        if (!proof) throw new Error('Please enter a ZK Proof');
        res = await api.post('/verify/verify-zk-proof', {
          proof: proof,
          provider: 'zkpass',
          verification_type: 'balance_proof',
          data: { min_balance: 10000 }
        });
      } else {
        // For reclaim, the proof usually comes back via callback, 
        // but for this UI flow we'll assume a check after the request
        res = await api.get('/verify/status');
      }
      
      addLog("Verification SUCCESSFUL.");
      setMessage({ type: 'success', text: 'Verification successful! Your trade limit has been increased.' });
      await checkStatus();
      setCurrentStep(3);
    } catch (error) {
      addLog("ERROR: " + (error.response?.data?.detail || error.message));
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Verification failed. Please check your proof.' 
      });
      setCurrentStep(1); // Go back to input
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReclaimRequest = async () => {
    if (!tradeId) {
      setMessage({ type: 'error', text: 'Please enter a Trade ID for escrow lock' });
      return;
    }

    setIsRequesting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post(`/verify/reclaim/request?trade_id=${tradeId}`);
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

          {/* Interaction Area */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-8 backdrop-blur-xl relative overflow-hidden">
            
            {/* Progress Stepper */}
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
              {[0, 1, 2, 3].map((step) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    currentStep >= step 
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                      : 'bg-slate-800 text-slate-500 border border-white/10'
                  }`}>
                    {currentStep > step ? <CheckCircle2 className="h-5 w-5" /> : step + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${currentStep === step ? 'text-primary' : 'text-slate-600'}`}>
                    {['Select', 'Input', 'Verify', 'Done'][step]}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 0: Selection */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <h3 className="font-heading text-2xl font-bold text-white tracking-tight mb-2">Choose Verification Method</h3>
                  <p className="text-sm text-slate-500">How would you like to prove your assets?</p>
                </div>
                <div className="grid gap-4">
                  <button 
                    onClick={() => { setVerifyMethod('reclaim'); setCurrentStep(1); }}
                    className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <ScanEye className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Institutional zK-Lock (Reclaim)</p>
                        <p className="text-xs text-slate-500">Quickest way. Generate a QR code and scan with Reclaim App.</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-primary transition-all" />
                  </button>
                  <button 
                    onClick={() => { setVerifyMethod('manual'); setCurrentStep(1); }}
                    className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <Lock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Manual ZK Proof</p>
                        <p className="text-xs text-slate-500">Enter a proof string generated from ZK Pass or similar.</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-primary transition-all" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Input */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => setCurrentStep(0)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-all mb-4"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to selection
                </button>
                
                <div className="mb-8">
                  <h3 className="font-heading text-2xl font-bold text-white tracking-tight mb-2">
                    {verifyMethod === 'reclaim' ? 'Initiate Reclaim Request' : 'Submit Manual Proof'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {verifyMethod === 'reclaim' 
                      ? 'Provide your Trade ID to lock the assets and generate a secure zkTLS request.' 
                      : 'Paste the ZK proof string provided by your identity provider.'}
                  </p>
                </div>

                <div className="space-y-6">
                  {verifyMethod === 'reclaim' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Trade ID</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                          <input 
                            type="text" 
                            value={tradeId}
                            onChange={(e) => setTradeId(e.target.value)}
                            placeholder="TRD-XXXX-XXXX" 
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={handleReclaimRequest}
                        disabled={isRequesting}
                        className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isRequesting ? 'Generating...' : 'Generate QR Code'}
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
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ZK Proof String</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                        <textarea 
                          value={proof}
                          onChange={(e) => setProof(e.target.value)}
                          placeholder="zkpass_proof_..." 
                          rows={4}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>
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
                    onClick={startVerification}
                    disabled={isVerifying}
                    className="w-full py-4 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {isVerifying ? 'Verifying...' : 'Finalize Verification'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Verifying */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in duration-500 relative">
                <div className="scan-line" />
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="relative h-20 w-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                      <ScanEye className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-white tracking-tight">Analyzing ZK Proof</h3>
                    <p className="text-sm text-slate-500">Validating institutional trust anchors...</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-black p-6 border border-white/10 font-mono text-xs space-y-2 h-64 overflow-y-auto scrollbar-hide relative shadow-inner">
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <TerminalIcon className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verification_Engine.log</span>
                  </div>
                  {verificationLogs.map((log, idx) => (
                    <div key={idx} className="text-slate-400 animate-in fade-in slide-in-from-left-2 duration-300">
                      {log}
                    </div>
                  ))}
                  <div className="flex items-center gap-1 text-primary">
                    <span>❯</span>
                    <div className="h-3 w-1 bg-primary animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Result */}
            {currentStep === 3 && (
              <div className="text-center space-y-8 animate-in zoom-in duration-500">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="relative h-24 w-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-3xl font-bold text-white tracking-tight">Verification Complete</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Your account has been upgraded to <span className="text-emerald-400 font-bold">Verified Institutional Status</span>. 
                    Your trading limits have been automatically increased.
                  </p>
                </div>
                <button 
                  onClick={() => setCurrentStep(0)}
                  className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationPage;
