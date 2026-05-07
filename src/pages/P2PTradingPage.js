import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { Plus, Edit, Trash2, MessageSquare, DollarSign, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';

const P2PTradingPage = () => {
  const [prices, setPrices] = useState([]);
  const [myPrices, setMyPrices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [formData, setFormData] = useState({
    symbol: 'USDT',
    buy_price: '',
    sell_price: '',
    min_amount: '',
    max_amount: '',
    payment_methods: ['Bank Transfer', 'Cash']
  });

  useEffect(() => {
    fetchPrices();
    fetchMyPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await api.get('/p2p/prices');
      setPrices(response.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchMyPrices = async () => {
    try {
      const response = await api.get('/p2p/my-prices');
      setMyPrices(response.data);
    } catch (error) {
      console.error('Error fetching my prices:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPrice) {
        await api.patch(`/p2p/prices/${editingPrice}`, formData);
        toast.success('Price updated successfully!');
      } else {
        await api.post('/p2p/prices', formData);
        toast.success('Price created successfully!');
      }
      setShowForm(false);
      setEditingPrice(null);
      setFormData({
        symbol: 'USDT',
        buy_price: '',
        sell_price: '',
        min_amount: '',
        max_amount: '',
        payment_methods: ['Bank Transfer', 'Cash']
      });
      fetchPrices();
      fetchMyPrices();
    } catch (error) {
      toast.error('Failed to save price');
    }
  };

  const handleEdit = (price) => {
    setEditingPrice(price.id);
    setFormData({
      symbol: price.symbol,
      buy_price: price.buy_price,
      sell_price: price.sell_price,
      min_amount: price.min_amount,
      max_amount: price.max_amount,
      payment_methods: price.payment_methods
    });
    setShowForm(true);
  };

  const handleDelete = async (priceId) => {
    if (window.confirm('Are you sure you want to deactivate this price?')) {
      try {
        await api.delete(`/p2p/prices/${priceId}`);
        toast.success('Price deactivated');
        fetchPrices();
        fetchMyPrices();
      } catch (error) {
        toast.error('Failed to deactivate price');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-8 p-2 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <MessageSquare className="h-3 w-3" />
              Sense50 Bridge Engine
            </div>
            <h1 className="font-heading text-6xl font-black tracking-tighter text-white">
              P2P<span className="text-primary"> TRADING</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
              Direct peer-to-peer liquidity management and merchant price feed configuration.
            </p>
          </div>
          <button
            data-testid="add-price-btn"
            onClick={() => {
              setShowForm(!showForm);
              setEditingPrice(null);
              setFormData({
                symbol: 'USDT',
                buy_price: '',
                sell_price: '',
                min_amount: '',
                max_amount: '',
                payment_methods: ['Bank Transfer', 'Cash']
              });
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus className="h-4 w-4" />
            Add Price
          </button>
        </div>

        {/* Price Form */}
        {showForm && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-8 backdrop-blur-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight">
                {editingPrice ? 'Update Trading Quote' : 'Establish New Quote'}
              </h3>
            </div>
            <form data-testid="price-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Asset Symbol</label>
                  <select
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Buy Price</label>
                  <input
                    data-testid="buy-price-input"
                    type="number"
                    step="0.0001"
                    value={formData.buy_price}
                    onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="1.0015"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sell Price</label>
                  <input
                    data-testid="sell-price-input"
                    type="number"
                    step="0.0001"
                    value={formData.sell_price}
                    onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="1.0025"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Min Amount</label>
                  <input
                    type="number"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="1000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Max Amount</label>
                  <input
                    type="number"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="100000"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPrice(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  {editingPrice ? 'Update Quote' : 'Create Quote'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Prices Section */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden transition-all hover:border-primary/30 shadow-2xl">
          <div className="border-b border-white/10 p-6 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-xl font-bold text-white tracking-tight">My Active Quotes</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Symbol</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Buy Price</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sell Price</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Range (Min-Max)</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myPrices.map((price) => (
                  <tr key={price.id} className="transition-colors hover:bg-white/5 group">
                    <td className="p-4 font-mono text-sm font-bold text-white">{price.symbol}</td>
                    <td className="p-4 font-mono text-sm font-bold text-emerald-400">${price.buy_price}</td>
                    <td className="p-4 font-mono text-sm font-bold text-rose-400">${price.sell_price}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      ${price.min_amount.toLocaleString()} - ${price.max_amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(price)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(price.id)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {myPrices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                      No active quotes found. Establish a new quote to start trading.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Merchant Prices Section */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden transition-all hover:border-primary/30 shadow-2xl">
          <div className="border-b border-white/10 p-6 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-xl font-bold text-white tracking-tight">Global Merchant Feed</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Merchant</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Symbol</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Buy</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sell</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Spread</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Limits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {prices.map((price) => {
                  const spread = ((price.sell_price - price.buy_price) / price.buy_price * 100).toFixed(2);
                  return (
                    <tr key={price.id} className="transition-colors hover:bg-white/5 group">
                      <td className="p-4 font-mono text-sm font-bold text-white">{price.merchant_name}</td>
                      <td className="p-4 font-mono text-sm text-slate-300">{price.symbol}</td>
                      <td className="p-4 font-mono text-sm font-bold text-emerald-400">${price.buy_price}</td>
                      <td className="p-4 font-mono text-sm font-bold text-rose-400">${price.sell_price}</td>
                      <td className="p-4 font-mono text-sm font-bold text-primary">{spread}%</td>
                      <td className="p-4 font-mono text-xs text-slate-500">
                        ${price.min_amount.toLocaleString()} - ${price.max_amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {prices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                      No merchant prices currently available in the feed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default P2PTradingPage;
