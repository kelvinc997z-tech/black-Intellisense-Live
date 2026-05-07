import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, RefreshCw, Globe, Activity, BarChart3,Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const PriceFeedsPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [bestPrice, setBestPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const [feedsRes, bestRes] = await Promise.all([
        api.get('/prices/'),
        api.get('/prices/best')
      ]);
      setFeeds(feedsRes.data);
      setBestPrice(bestRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  const exchangeIcons = {
    binance: '🟡',
    okex: '🔵',
    huobi: '🔴'
  };

  return (
    <Layout>
      <div className="space-y-8 p-2 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <Globe className="h-3 w-3" />
              Sense50 Bridge Engine
            </div>
            <h1 className="font-heading text-6xl font-black tracking-tighter text-white">
              PRICE<span className="text-primary"> FEEDS</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
              Real-time multi-exchange price synchronization and institutional spread calculation.
            </p>
          </div>
          <button
            data-testid="refresh-prices-btn"
            onClick={fetchPrices}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Feed
          </button>
        </div>

        {/* Best Price Card */}
        {bestPrice && (
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-slate-900/60 to-black/80 p-8 backdrop-blur-2xl relative overflow-hidden transition-all hover:border-primary/50 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
                  <Zap className="h-3 w-3 animate-pulse" />
                  Optimized Execution Price
                </div>
                <p data-testid="best-price" className="font-mono text-7xl font-black text-white tracking-tighter">
                  ${bestPrice.best_price}
                </p>
                <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                  Base: ${bestPrice.base_price} <span className="mx-2 text-slate-700">|</span> {bestPrice.markup_percentage}% Institutional Markup
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 border-l border-white/10 pl-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Spread</p>
                  <p className="font-mono text-2xl font-bold text-white">{bestPrice.spread}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">24h Volume</p>
                  <p className="font-mono text-2xl font-bold text-primary">
                    {formatCurrency(bestPrice.volume_24h, 'USD')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Feeds Table */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden transition-all hover:border-primary/30 shadow-2xl">
          <div className="border-b border-white/10 p-6 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-xl font-bold text-white tracking-tight">Live Exchange Feeds</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Exchange</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Bid Price</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Ask Price</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Spread</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {feeds.map((feed) => (
                  <tr key={feed.id} className="transition-colors hover:bg-white/5 group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{exchangeIcons[feed.exchange]}</span>
                        <span className="font-mono text-sm font-bold text-white capitalize">{feed.exchange}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm font-bold text-emerald-400">${feed.bid_price}</td>
                    <td className="p-4 font-mono text-sm font-bold text-rose-400">${feed.ask_price}</td>
                    <td className="p-4 font-mono text-sm font-bold text-slate-300">{feed.spread}%</td>
                    <td className="p-4 font-mono text-sm text-slate-500">
                      {formatCurrency(feed.volume_24h, 'USD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Chart */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-8 backdrop-blur-xl transition-all hover:border-primary/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-2xl font-bold text-white tracking-tight">USDT Market Volatility</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={Array.from({ length: 20 }, (_, i) => ({
                  time: `${i}:00`,
                  price: 1.0012 + (Math.random() - 0.5) * 0.002,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="#06B6D4" strokeWidth={3} dot={false} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PriceFeedsPage;
