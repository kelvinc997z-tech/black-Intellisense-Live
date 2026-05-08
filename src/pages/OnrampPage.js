import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  ArrowUpRight, ArrowDownLeft, CreditCard, Banknote, 
  ShieldCheck, ChevronRight, Info, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { MoonPayWidget } from '../lib/moonpay';

const OnrampPage = () => {
  const { user } = useAuth();
  const { handleOnramp, handleOfframp } = MoonPayWidget({ address: user?.address });
  const [mode, setMode] = useState('onramp'); // 'onramp' or 'offramp'
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDT');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'bank'
  const [loading, setLoading] = useState(false);

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'onramp') {
        handleOnramp();
        toast.success('Redirecting to MoonPay Deposit...');
      } else {
        handleOfframp();
        toast.success('Redirecting to MoonPay Withdrawal...');
      }
    } catch (error) {
      toast.error('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 max-w-[1200px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-black tracking-tighter text-white">
              Fiat <span className="text-primary">Gateway</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Securely move funds between your bank account and the blockchain.
            </p>
          </div>
          <div className="flex p-1 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
            <button 
              onClick={() => setMode('onramp')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'onramp' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Deposit (Onramp)
            </button>
            <button 
              onClick={() => setMode('offramp')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'offramp' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Withdraw (Offramp)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Transaction Card */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-8 backdrop-blur-2xl shadow-2xl">
            <form onSubmit={handleTransaction} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-3xl font-mono font-bold text-white placeholder:text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">{currency}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                        paymentMethod === 'card' 
                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' 
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-primary/50 hover:text-primary'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs font-bold">Card</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethod('bank')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                        paymentMethod === 'bank' 
                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' 
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-primary/50 hover:text-primary'
                      }`}
                    >
                      <Banknote className="h-4 w-4" />
                      <span className="text-xs font-bold">Bank</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Exchange Rate</span>
                  <span className="font-mono text-white">1 USDT = 1.00 USD</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Network Fee</span>
                  <span className="font-mono text-white">$0.00 (Included)</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Total to {mode === 'onramp' ? 'Receive' : 'Withdraw'}</span>
                  <span className="text-2xl font-black text-white font-mono">{amount || '0.00'} {currency}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98] ${
                  mode === 'onramp' 
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' 
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20'
                } disabled:opacity-50`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {mode === 'onramp' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                    <span>{mode === 'onramp' ? 'Deposit Now' : 'Withdraw Now'}</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-heading text-lg font-bold text-white">Secure Gateway</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our on/offramp services are powered by Tier-1 regulated providers. Your funds are handled with institutional-grade security and compliance.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3 text-amber-400">
                <Info className="h-5 w-5" />
                <h3 className="font-heading text-lg font-bold text-white">Note</h3>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
                  <p className="text-[11px] text-slate-400">Verification (KYC) may be required by the provider for large transactions.</p>
                </div>
                <div className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
                  <p className="text-[11px] text-slate-400">Offramp processing time varies by bank (typically 1-3 business days).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OnrampPage;
