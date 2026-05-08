import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  Wallet, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  RefreshCcw,
  History
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const FiatGatewayPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' or 'withdraw'
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    isVerified: false
  });
  const [requests, setRequests] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Mock Admin Data (Should be moved to a config or fetched from API)
  const ADMIN_DATA = {
    bank: {
      name: 'Bank Central Asia (BCA)',
      accountNumber: '880012345678',
      accountHolder: 'SENSE 50 BRIDGE ENGINE',
    },
    usdt: {
      address: '0x742d35Cc6634C0532925a3cCb42083EcF88Ef603',
      network: 'Ethereum (ERC20)',
    }
  };

  useEffect(() => {
    fetchUserBankDetails();
    fetchFiatRequests();
  }, []);

  const fetchUserBankDetails = async () => {
    try {
      const res = await api.get('/fiat/bank-details');
      setBankDetails(res.data);
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const fetchFiatRequests = async () => {
    try {
      const res = await api.get('/fiat/requests');
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching fiat requests:', error);
    }
  };

  const saveBankDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/fiat/bank-details', bankDetails);
      toast.success('Bank details saved successfully.');
      setBankDetails(prev => ({ ...prev, isVerified: false })); // Reset verification if changed
    } catch (error) {
      toast.error('Failed to save bank details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyZkTLS = async () => {
    setVerifying(true);
    try {
      toast.info('Initiating zkTLS Verification via Reclaim Protocol...');
      
      // Simulate zkTLS flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real flow, we would get a proof_hash from Reclaim
      const mockProofHash = `zkTLS_${uuidv4().slice(0, 12)}`;
      
      toast.success('zkTLS Proof Verified!');
      
      // Submit the verified request to backend
      await api.post('/fiat/request', {
        type: activeTab,
        amount: parseFloat(amount),
        currency: 'IDR',
        proof_hash: mockProofHash
      });

      toast.success('Request submitted for Admin approval.');
      fetchFiatRequests(); // Refresh history

    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-200 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Fiat <span className="text-primary">Gateway</span>
            </h1>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">
              Internal Institutional Settlement System
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'deposit' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Deposit (Fiat $\rightarrow$ USDT)
            </button>
            <button 
              onClick={() => setActiveTab('withdraw')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'withdraw' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Withdraw (USDT $\rightarrow$ Fiat)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Bank Management */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-white">Bank Management</h2>
              </div>

              <form onSubmit={saveBankDetails} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Name</label>
                  <input 
                    type="text" 
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all"
                    placeholder="e.g. Bank Central Asia"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Number</label>
                  <input 
                    type="text" 
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all"
                    placeholder="Enter account number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Holder Name</label>
                  <input 
                    type="text" 
                    value={bankDetails.accountHolder}
                    onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all"
                    placeholder="Exact name on bank account"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Bank Details'}
                </button>
              </form>

              {bankDetails.isVerified && (
                <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Bank Account Verified via zkTLS</span>
                </div>
              )}
            </div>

            {/* Request History */}
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <History className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-white">My Requests</h2>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {requests.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No recent transactions</p>
                ) : (
                  requests.map((req) => (
                    <div key={req.id} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          req.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{req.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
                        <span className="text-xs font-mono text-white">{req.amount} {req.currency}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Gateway Operation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                {activeTab === 'deposit' ? <ArrowDownLeft className="h-32 w-32 text-primary" /> : <ArrowUpRight className="h-32 w-32 text-primary" />}
              </div>

              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {activeTab === 'deposit' ? 'Deposit Fiat' : 'Withdraw Fiat'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {activeTab === 'deposit' 
                      ? 'Transfer fiat to our institutional account and verify via zkTLS to receive USDT.' 
                      : 'Send USDT to our secure vault and verify via zkTLS to receive fiat in your bank.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Input Section */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount ({activeTab === 'deposit' ? 'IDR' : 'USD/IDR'})</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-4 text-2xl font-mono text-white focus:border-primary outline-none transition-all"
                          placeholder="0.00"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                          {activeTab === 'deposit' ? 'IDR' : 'USDT'}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        <ShieldCheck className="h-3 w-3" /> Settlement Details
                      </div>
                      
                      {activeTab === 'deposit' ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Bank</span>
                            <span className="text-sm text-white font-medium">{ADMIN_DATA.bank.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Account</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-mono">{ADMIN_DATA.bank.accountNumber}</span>
                              <button onClick={() => copyToClipboard(ADMIN_DATA.bank.accountNumber)} className="p-1 hover:text-primary transition-colors">
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Holder</span>
                            <span className="text-sm text-white font-medium">{ADMIN_DATA.bank.accountHolder}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">USDT Address</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-mono truncate max-w-[150px]">{ADMIN_DATA.usdt.address}</span>
                              <button onClick={() => copyToClipboard(ADMIN_DATA.usdt.address)} className="p-1 hover:text-primary transition-colors">
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Network</span>
                            <span className="text-sm text-white font-medium">{ADMIN_DATA.usdt.network}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex flex-col justify-center items-center text-center space-y-6 p-8 bg-primary/5 border border-primary/10 rounded-3xl">
                    <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
                      <RefreshCcw className={`h-8 w-8 ${verifying ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Verify Transaction</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        We use zkTLS to verify your transfer securely without compromising your privacy.
                      </p>
                    </div>
                    
                    <button 
                      onClick={handleVerifyZkTLS}
                      disabled={!amount || verifying}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                      {verifying ? 'Verifying Proof...' : 'Verify with zkTLS'}
                    </button>
                    
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                      <AlertCircle className="h-3 w-3" />
                      Verification takes 1-3 minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiatGatewayPage;
