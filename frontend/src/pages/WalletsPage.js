import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Wallet, Plus, ExternalLink } from 'lucide-react';
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
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        
        // Add wallet
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">Wallets</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Manage your wallet connections
            </p>
          </div>
          <button
            data-testid="add-wallet-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Wallet
          </button>
        </div>

        {/* Total Balance Card */}
        <div className="rounded-sm border border-primary/50 bg-card/40 p-6 backdrop-blur-sm glow-effect">
          <h3 className="mb-4 font-heading text-xl font-semibold">Total Balance</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(totalBalance).map(([currency, amount]) => (
              <div key={currency} className="rounded-sm bg-secondary/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">{currency}</p>
                <p className="mt-2 font-mono text-3xl font-bold text-primary">
                  {formatCurrency(amount, 'USD')}
                </p>
              </div>
            ))}
            {Object.keys(totalBalance).length === 0 && (
              <div className="col-span-3 text-center text-muted-foreground">
                No balance available
              </div>
            )}
          </div>
        </div>

        {/* Connect Wallet Section */}
        {showAddForm && (
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold">Connect Your Wallet</h3>
            
            {/* Web3 Wallet Connection */}
            <div className="mb-6">
              <button
                data-testid="connect-web3-wallet-btn"
                onClick={connectWeb3Wallet}
                disabled={connecting}
                className="flex w-full items-center justify-between rounded-sm border-2 border-primary bg-primary/10 p-4 transition-colors hover:bg-primary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary">
                    <Wallet className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Connect Web3 Wallet</p>
                    <p className="text-sm text-muted-foreground">MetaMask, WalletConnect, etc.</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-primary" />
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Manual Wallet Entry */}
            <form data-testid="manual-wallet-form" onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Wallet Type</label>
                <select
                  value={formData.wallet_type}
                  onChange={(e) => setFormData({ ...formData, wallet_type: e.target.value })}
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="web3">Web3 Wallet</option>
                  <option value="internal">Internal Wallet</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Wallet Address</label>
                <input
                  data-testid="wallet-address-input"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="0x..."
                  required
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Label (Optional)</label>
                <input
                  data-testid="wallet-label-input"
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="My Trading Wallet"
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2">
                <button
                  data-testid="submit-wallet-btn"
                  type="submit"
                  className="rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Add Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-sm border border-input px-4 py-2 font-medium hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Wallet List */}
        <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
          <div className="border-b border-border p-4">
            <h3 className="font-heading text-xl font-semibold">Connected Wallets</h3>
          </div>
          <div className="divide-y divide-border">
            {wallets.length === 0 ? (
              <div className="p-12 text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No wallets connected yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click "Add Wallet" to connect your first wallet
                </p>
              </div>
            ) : (
              wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  data-testid={`wallet-${wallet.wallet_type}`}
                  className="flex items-center justify-between p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold capitalize">
                        {wallet.label || `${wallet.wallet_type} Wallet`}
                      </h4>
                      <p className="font-mono text-sm text-muted-foreground">
                        {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}
                      </p>
                      {wallet.balance && (
                        <div className="mt-2 flex gap-3">
                          {Object.entries(wallet.balance).map(([currency, amount]) => (
                            <span key={currency} className="font-mono text-xs text-muted-foreground">
                              {currency}: ${amount.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-sm bg-success/10 px-3 py-1 font-mono text-xs font-medium text-success">
                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
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
