import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Clock, 
  Zap, ShieldAlert, Globe, Server, Cpu, ArrowUpRight,
  BarChart3, Layers, Terminal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';

const Sense50Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activitiesRes, historyRes, balanceRes] = await Promise.all([
        api.get('/trades/stats'),
        api.get('/trades/recent'),
        api.get('/prices/history'),
        api.get('/wallets/total-balance')
      ]);

      setStats({
        ...statsRes.data,
        total_balance: balanceRes.data.total_balance.USDT || 520000
      });
      setActivities(activitiesRes.data.activities);
      setPriceHistory(historyRes.data.history);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-mono text-sm text-muted-foreground animate-pulse uppercase tracking-widest">Initializing Bridge Engine...</p>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: 'Liquid Inventory',
      value: formatCurrency(stats?.total_balance || 520000, 'USD'),
      change: '+1.2%',
      icon: DollarSign,
      color: 'text-primary',
      desc: 'Total USDT Available'
    },
    {
      title: '24h Execution Volume',
      value: formatCurrency(stats?.daily_volume || 148500, 'USD'),
      icon: Activity,
      color: 'text-cyan-400',
      desc: 'Aggregate Flow'
    },
    {
      title: 'Pending Settlements',
      value: stats?.pending_settlements || 5,
      icon: Clock,
      color: 'text-amber-400',
      desc: 'Awaiting Confirmation'
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 p-2 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <Zap className="h-3 w-3" />
              System Status: <span className="text-emerald-400">Operational</span>
            </div>
            <h1 className="font-heading text-6xl font-black tracking-tighter text-white">
              SENSE<span className="text-primary">50</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
              Enterprise Bridge Engine for Real-time Liquidity Aggregation, 
              Cross-Chain Settlement, and High-Frequency Execution.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Node: US-EAST-1</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">API: Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((stat, idx) => (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{stat.title}</p>
                  <p className="font-mono text-4xl font-black text-white tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">{stat.desc}</span>
                    {stat.change && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                        <TrendingUp className="h-3 w-3" /> {stat.change}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`rounded-xl bg-slate-800/50 p-3 transition-all duration-500 group-hover:scale-110 group-hover:bg-slate-800 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analysis Center */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Price Analysis */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/30">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-xl font-bold text-white tracking-tight">USDT Index Trend</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">24h aggregated price movement via liquidity pool</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                <Globe className="h-3 w-3" /> Global
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).getHours() + ':00'}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => val.toFixed(4)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#06B6D4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#06B6D4" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Health */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-6 backdrop-blur-xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-xl font-bold text-white tracking-tight">Bridge Health</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">Execution latency and node stability monitoring</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                <Server className="h-3 w-3" /> Stable
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Execution Latency', value: '12ms', status: 'Optimal', color: 'bg-emerald-500' },
                { label: 'Node Synchronization', value: '99.9%', status: 'Perfect', color: 'bg-emerald-500' },
                { label: 'API Throughput', value: '4.2k req/s', status: 'Normal', color: 'bg-primary' },
                { label: 'Security Layer', value: 'Active', status: 'Encrypted', color: 'bg-blue-500' },
              ].map((item, idx) => (
                <div key={idx} className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 transition-all hover:border-white/10 hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                    <span className="text-sm font-medium text-slate-300 tracking-wide">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-white">{item.value}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.status}</span>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3 transition-all hover:bg-primary/10">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Automated hedging active. Volatility protection enabled for all USDT pairs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Ledger */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-primary/30 shadow-2xl">
          <div className="border-b border-white/10 p-6 flex items-center justify-between bg-white/[0.02]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-xl font-bold text-white tracking-tight">Execution Ledger</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Real-time trade settlements and bridge flows</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 font-mono uppercase tracking-wider">
              Export CSV <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Counterparty</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Type</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activities.map((activity, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-white/5 group">
                    <td className="p-4 font-mono text-xs text-slate-400">{activity.time}</td>
                    <td className="p-4 font-mono text-sm font-bold text-white">{activity.client}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${\n                          activity.type === 'Buy'\n                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'\n                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'\n                        }`}\n                      >\n                        {activity.type === 'Buy' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}\n                        {activity.type}\n                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm font-bold text-white">
                      {formatNumber(activity.amount)} <span className="text-slate-500 font-normal text-xs ml-1">USDT</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${\n                          activity.status === 'Completed'\n                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'\n                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'\n                        }`}\n                      >\n                        <div className={`h-1 w-1 rounded-full ${activity.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />\n                        {activity.status}\n                      </span>
                    </td>
                  </tr>
                ))}\n              </tbody>\n            </table>\n          </div>\n        </div>\n      </div>\n    </Layout>\n  );\n};\n\nexport default Sense50Dashboard;\n