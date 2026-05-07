import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Wallet, Plus, ExternalLink, CreditCard, Database, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const WalletsPage = () => {
  const [wallets, setWallets] = useState([]);
  const [totalBalance, setTotalBalance] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [formData, setFormData] = useState({
    wallet_type: 'web3',
    address: '',
    label: ''
  });

  useEffect(() => {
    fetchWallets();
    fetchBalance();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await api.get('/wallets/');
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await api.get('/wallets/total-balance');
      setTotalBalance(response.data.total_balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const connectWeb3Wallet = async () => {
    setConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        
        await api.post('/wallets/', {
          wallet_type: 'web3',
          address: address,
          label: 'MetaMask Wallet'
        });
        
        toast.success('Wallet connected successfully!');
        setShowAddForm(false);
        fetchWallets();
      } else {
        toast.error('Please install MetaMask to connect your wallet');
        window.open('https://metamask.io/download/', '_blank');
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wallets/', formData);
      toast.success('Wallet added successfully!');
      setShowAddForm(false);
      setFormData({ wallet_type: 'web3', address: '', label: '' });
      fetchWallets();
    } catch (error) {
      toast.error('Failed to add wallet');
    }
  };

  return (
    <Layout>
      <div className="space-y-8 p-2 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <Database className="h-3 w-3" />
              Vault Management
            </div>
            <h1 className="font-heading text-6xl font-black tracking-tighter text-white">
              WALLETS<span className="text-primary">.EXE</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
              Secure integration of Web3 vaults and internal settlement accounts for liquidity routing.
            </p>
          </div>
          <button
            data-testid="add-wallet-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus className="h-4 w-4" />
            Add Wallet
          </button>
        </div>

        {/* Total Balance Card */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-slate-900/60 to-black/80 p-8 backdrop-blur-2xl relative overflow-hidden transition-all hover:border-primary/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight">Aggregated Balance</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {Object.entries(totalBalance).map(([currency, amount]) => (
                <div key={currency} className="rounded-2xl bg-black/40 border border-white/10 p-6 transition-all hover:border-primary/30 group">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{currency} Vault</p>
                  <p className="font-mono text-4xl font-black text-white tracking-tight group-hover:text-primary transition-colors">
                    {formatCurrency(amount, 'USD')}
                  </p>
                </div>
              ))}
              {Object.keys(totalBalance).length === 0 && (
                <div className="col-span-3 text-center py-8 text-slate-500 font-medium">
                  No balances detected in connected vaults
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connect Wallet Section */}
        {showAddForm && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-8 backdrop-blur-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-8">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight">Establish Vault Connection</h3>
            </div>
            
            <div className="grid gap-8">
              {/* Web3 Wallet Connection */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Automatic Bridge</p>
                <button
                  data-testid="connect-web3-wallet-btn"
                  onClick={connectWeb3Wallet}
                  disabled={connecting}
                  className="flex w-full items-center justify-between rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 transition-all hover:border-primary hover:bg-primary/10 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Wallet className="h-7 w-7" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Connect Web3 Vault</p>
                      <p className="text-xs text-slate-400">Instant sync via MetaMask or WalletConnect</p>
                    </div>
                  </div>
                  <ExternalLink className="h-6 w-6 text-primary group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-b from-slate-900/40 to-black/60 px-4 text-slate-500 font-bold tracking-widest">Manual Integration</span>
                </div>
              </div>

              {/* Manual Wallet Entry */}
              <form data-testid="manual-wallet-form" onSubmit={handleManualAdd} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Vault Type</label>
                    <select
                      value={formData.wallet_type}
                      onChange={(e) => setFormData({ ...formData, wallet_type: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    >
                      <option value="web3">Web3 Wallet</option>
                      <option value="internal">Internal Wallet</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Public Address</label>
                    <input
                      data-testid="wallet-address-input"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="0x..."
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Vault Label (Optional)</label>
                  <input
                    data-testid="wallet-label-input"
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Institutional Liquidity Pool A"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="submit-wallet-btn"
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    Confirm Integration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Wallet List */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden transition-all hover:border-primary/30 shadow-2xl">
          <div className="border-b border-white/10 p-6 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-xl font-bold text-white tracking-tight">Synchronized Vaults</h3>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {wallets.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mx-auto">
                  <Wallet className="h-8 w-8 text-slate-700" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">No vaults connected</p>
                  <p className="mt-1 text-xs text-slate-500">Initialize a connection to begin managing assets</p>
                </div>
              </div>
            ) : (
              wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  data-testid={`wallet-${wallet.wallet_type}`}
                  className="flex items-center justify-between p-6 transition-all hover:bg-white/[0.03] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner group-hover:scale-110 transition-transform">
                      <Wallet className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white capitalize tracking-tight">
                        {wallet.label || `${wallet.wallet_type} Vault`}
                      </h4>
                      <p className="font-mono text-xs text-slate-500">
                        {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}
                      </p>
                      {wallet.balance && (
                        <div className="mt-2 flex gap-3">
                          {Object.entries(wallet.balance).map(([currency, amount]) => (
                            <span key={currency} className="font-mono text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {currency}: <span className="text-primary">${amount.toFixed(2)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WalletsPage;
