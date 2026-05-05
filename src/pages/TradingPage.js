import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, TrendingUp, MessageSquare, LogOut, Eye, ArrowUpRight, ArrowDownLeft, Wallet, Activity } from 'lucide-react';
import { toast } from 'sonner';

const TradingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bestPrice, setBestPrice] = useState(null);
  const [assets, setAssets] = useState([]);
  const [orderForm, setOrderForm] = useState({
    symbol: 'USDT',
    side: 'buy',
    amount: '',
    price: ''
  });

  useEffect(() => {
    fetchPrice();
    fetchAssets();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrice = async () => {
    try {
      const response = await api.get('/prices/best');
      setBestPrice(response.data);
      setOrderForm(prev => ({ ...prev, price: response.data.best_price }));
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets/visible');
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/orders/', {
        symbol: orderForm.symbol,
        side: orderForm.side,
        amount: parseFloat(orderForm.amount),
        price: parseFloat(orderForm.price)
      });
      toast.success('Order placed successfully!');
      setOrderForm({ ...orderForm, amount: '' });
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-200 font-sans selection:bg-primary/30">
      {/* Ultra-Sleek Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img src="/assets/logo.png" alt="IntelliTrade" className="h-9 w-auto transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute -inset-1 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="hidden md:block">
              <h1 className="font-heading text-lg font-bold tracking-tight text-white">IntelliTrade</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary/60 font-semibold">Institutional Grade OTC</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-medium text-slate-400">{user?.email}</span>
            </div>
            
            <nav className="flex items-center gap-1">
              <button
                onClick={() => navigate('/orders')}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                title="My Orders"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/assets')}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                title="Assets"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                title="Chat"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">Market <span className="text-primary">Terminal</span></h2>
            <p className="text-slate-400 max-w-md">Execute high-volume OTC trades with deep liquidity and institutional precision.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-slate-400">Network: <span className="text-white">Mainnet</span></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-slate-400">Status: <span className="text-success">Stable</span></span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT: Market Analysis & Live Price */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-8 shadow-2xl transition-all hover:border-primary/30">
              <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 blur-[100px] rounded-full transition-all group-hover:bg-primary/20" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Global Liquidity Price</h3>
                    <p className="text-xs text-slate-500">Real-time institutional feed</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                    <span className="text-[10px] font-bold uppercase text-success">Live</span>
                  </div>
                </div>
                
                {bestPrice ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tighter text-white font-mono">
                          {bestPrice.best_price}
                        </span>
                        <span className="text-xl font-medium text-slate-500">USDT/USD</span>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">
                          <ArrowUpRight className="h-3 w-3" />
                          <span>Optimized</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Last Update: {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Spread</p>
                        <p className="text-xl font-bold text-white font-mono">{bestPrice.spread}%</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">24h Vol</p>
                        <p className="text-xl font-bold text-white font-mono">{(bestPrice.volume_24h / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Asset Portfolio */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-white">Available Assets</h3>
                </div>
                <button 
                  onClick={() => navigate('/assets')}
                  className="text-xs text-primary hover:underline"
                >
                  Manage Visibility
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                      <th className="px-6 py-3 font-medium">Asset</th>
                      <th className="px-6 py-3 font-medium text-right">Balance</th>
                      <th className="px-6 py-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                              {asset.symbol[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{asset.symbol}</p>
                              <p className="text-[10px] text-slate-500">{asset.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-white font-medium">
                          {asset.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase">
                            <div className="h-1 w-1 rounded-full bg-success" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                    {assets.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm">
                          No assets connected to your account
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Execution Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-2xl shadow-2xl">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-1">Execution Panel</h3>
                <p className="text-sm text-slate-400">Instant settlement, zero slippage.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Side Switcher */}
                <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-black/40 border border-white/5">
                  <button
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, side: 'buy' })}
                    className={`relative py-3 rounded-xl font-bold transition-all duration-300 ${
                      orderForm.side === 'buy' 
                      ? 'bg-success text-white shadow-lg shadow-success/20' 
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      Buy
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, side: 'sell' })}
                    className={`relative py-3 rounded-xl font-bold transition-all duration-300 ${
                      orderForm.side === 'sell' 
                      ? 'bg-destructive text-white shadow-lg shadow-destructive/20' 
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDownLeft className="h-4 w-4" />
                      Sell
                    </div>
                  </button>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Amount (USDT)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={orderForm.amount}
                      onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-mono text-lg text-white placeholder:text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 uppercase">USDT</div>
                  </div>
                </div>

                {/* Price Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Execution Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-mono text-lg text-white placeholder:text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 uppercase">USD</div>
                  </div>
                </div>

                {/* Calculation Summary */}
                {orderForm.amount && orderForm.price && (
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-400">Estimated Total</span>
                      <span className="text-xs font-mono text-primary">Fee: 0.00%</span>
                    </div>
                    <p className="text-3xl font-black text-white font-mono tracking-tight">
                      {formatCurrency(parseFloat(orderForm.amount) * parseFloat(orderForm.price), 'USD')}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full relative group overflow-hidden rounded-2xl py-4 font-bold text-white transition-all active:scale-[0.98] ${
                    orderForm.side === 'buy' 
                    ? 'bg-success hover:bg-success/90 shadow-lg shadow-success/20' 
                    : 'bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20'
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Execute {orderForm.side === 'buy' ? 'Purchase' : 'Sale'}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TradingPage;
