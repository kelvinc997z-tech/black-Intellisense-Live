import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { RefreshCw, Settings, TrendingUp, TrendingDown, BarChart3, Cpu, Key } from 'lucide-react';
import { toast } from 'sonner';

const APITradePage = () => {
  const [orderBook, setOrderBook] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [loading, setLoading] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configForm, setConfigForm] = useState({
    exchange: 'binance',
    api_key: '',
    api_secret: '',
    is_live: false
  });

  useEffect(() => {
    fetchConfigs();
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, [selectedExchange, selectedSymbol]);

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/api-trade/config');
      setConfigs(response.data.configs);
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const fetchOrderBook = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api-trade/order-book/${selectedExchange}/${selectedSymbol}`);
      setOrderBook(response.data);
    } catch (error) {
      console.error('Error fetching order book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api-trade/config', configForm);
      toast.success('API configuration saved successfully!');
      setShowConfigForm(false);
      setConfigForm({ exchange: 'binance', api_key: '', api_secret: '', is_live: false });
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  return (
    <Layout>
      <div className="space-y-8 p-2 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <Cpu className="h-3 w-3" />
              Sense50 Bridge Engine
            </div>
            <h1 className="font-heading text-6xl font-black tracking-tighter text-white">
              API<span className="text-primary"> TRADE</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
              Direct exchange execution and real-time order book synchronization via low-latency API bridges.
            </p>
          </div>
          <button
            data-testid="config-api-btn"
            onClick={() => setShowConfigForm(!showConfigForm)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Settings className="h-4 w-4" />
            Configure API
          </button>
        </div>

        {/* API Configuration Form */}
        {showConfigForm && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-8 backdrop-blur-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-6">
              <Key className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight">API Bridge Configuration</h3>
            </div>
            <form data-testid="api-config-form" onSubmit={handleConfigSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Exchange Platform</label>
                <select
                  value={configForm.exchange}
                  onChange={(e) => setConfigForm({ ...configForm, exchange: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                >
                  <option value="binance">Binance</option>
                  <option value="okex">OKEx</option>
                  <option value="huobi">Huobi</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">API Key</label>
                <input
                  data-testid="api-key-input"
                  type="text"
                  value={configForm.api_key}
                  onChange={(e) => setConfigForm({ ...configForm, api_key: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Enter API Key"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">API Secret</label>
                <input
                  data-testid="api-secret-input"
                  type="password"
                  value={configForm.api_secret}
                  onChange={(e) => setConfigForm({ ...configForm, api_secret: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Enter API Secret"
                  required
                />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="is_live"
                  checked={configForm.is_live}
                  onChange={(e) => setConfigForm({ ...configForm, is_live: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-black"
                />
                <label htmlFor="is_live" className="text-xs font-medium text-slate-400 cursor-pointer">
                  Enable Live Trading Execution
                </label>
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfigForm(false)}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Selector Bar */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 mr-auto">
             <BarChart3 className="h-4 w-4 text-primary" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Selector</span>
          </div>
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/60 px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
          >
            <option value="binance">Binance</option>
            <option value="okex">OKEx</option>
            <option value="huobi">Huobi</option>
          </select>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/60 px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
          >
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="BNB/USDT">BNB/USDT</option>
            <option value="SOL/USDT">SOL/USDT</option>
          </select>
          <button
            onClick={fetchOrderBook}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Status Indicator */}
        {orderBook && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 w-fit">
            <div className={`h-2 w-2 rounded-full ${orderBook.is_live ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              System Message: {orderBook.message}
            </span>
          </div>
        )}

        {/* Order Book Display */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bids */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden transition-all hover:border-primary/30 shadow-2xl">
            <div className="border-b border-white/10 p-6 flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="font-heading text-xl font-bold text-white tracking-tight">Bids (Buy)</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Liquidity In</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-left">
                    <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Price</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orderBook?.order_book?.bids?.map((bid, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-emerald-500/5 group">
                      <td className="p-4 font-mono text-sm font-bold text-emerald-400">${bid.price.toLocaleString()}</td>
                      <td className="p-4 font-mono text-sm text-white">{bid.amount}</td>
                      <td className="p-4 font-mono text-sm text-slate-500">${bid.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asks */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden transition-all hover:border-primary/30 shadow-2xl">
            <div className="border-b border-white/10 p-6 flex items-center justify-between bg-rose-500/5">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-rose-400" />
                <h3 className="font-heading text-xl font-bold text-white tracking-tight">Asks (Sell)</h3>
              </div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Liquidity Out</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-left">
                    <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Price</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orderBook?.order_book?.asks?.map((ask, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-rose-500/5 group">
                      <td className="p-4 font-mono text-sm font-bold text-rose-400">${ask.price.toLocaleString()}</td>
                      <td className="p-4 font-mono text-sm text-white">{ask.amount}</td>
                      <td className="p-4 font-mono text-sm text-slate-500">${ask.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default APITradePage;
