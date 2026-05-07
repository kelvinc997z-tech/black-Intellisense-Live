import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Clock, 
  Zap, ShieldAlert, Globe, Server, Cpu, ArrowUpRight,
  BarChart3, Layers, Terminal, Cpu as CpuIcon, Database, ShieldCheck
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
  const [logs, setLogs] = useState([
    "System initialized...",
    "Connecting to liquidity nodes...",
    "US-EAST-1: ONLINE",
    "EU-WEST-1: ONLINE",
    "Handshaking with ZK-Layer..."
  ]);

  useEffect(() => {
    fetchData();
    const logInterval = setInterval(addRandomLog, 4000);
    return () => clearInterval(logInterval);
  }, []);

  const addRandomLog = () => {
    const events = [
      "Incoming liquidity flow: +12,400 USDT",
      "zkTLS Proof verified for user_8821",
      "Executing hedge for pair BTC/USDT",
      "Node latency: 14ms (OPTIMAL)",
      "Settling cross-chain batch #4412",
      "API request burst handled: 2.1k req/s",
      "Heartbeat signal received from NeonDB",
      "Rotating encryption keys..."
    ];
    setLogs(prev => [...prev.slice(-10), events[Math.floor(Math.random() * events.length)]]);
  };

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

  return (
    <Layout>
      <div className="p-4 max-w-[1800px] mx-auto space-y-6">
        {/* HUD Header */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center border border-white/10 bg-black/40 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl pointer-events-none" />
          <div className="lg:col-span-2 space-y-1">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <Zap className="h-3 w-3 animate-pulse" />
              System Status: <span className="text-emerald-400">Operational</span>
            </div>
            <h1 className="font-heading text-5xl font-black tracking-tighter text-white">
              SENSE<span className="text-primary">50</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs max-w-sm leading-relaxed">
              Institutional Bridge Engine • Real-time Liquidity Aggregation • High-Frequency Execution
            </p>
          </div>
          <div className="lg:col-span-2 flex flex-wrap gap-3 justify-end">
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg border border-white/10 bg-black/60 backdrop-blur-md">
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

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 grid-rows-auto gap-6">
          
          {/* Main Metrics - Large Cards */}
          <div className="col-span-12 lg:col-span-4 grid gap-6">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-6 backdrop-blur-2xl transition-all hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Liquid Inventory</p>
                  <p className="font-mono text-4xl font-black text-white tracking-tight">{formatCurrency(stats?.total_balance || 520000, 'USD')}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">Total USDT Available</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                      <TrendingUp className="h-3 w-3" /> +1.2%
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-3 text-primary"><DollarSign className="h-6 w-6" /></div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-6 backdrop-blur-2xl transition-all hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">24h Volume</p>
                  <p className="font-mono text-4xl font-black text-white tracking-tight">{formatCurrency(stats?.daily_volume || 148500, 'USD')}</p>
                  <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">Aggregate Flow</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-3 text-cyan-400"><Activity className="h-6 w-6" /></div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-6 backdrop-blur-2xl transition-all hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Pending Settlements</p>
                  <p className="font-mono text-4xl font-black text-white tracking-tight">{stats?.pending_settlements || 5}</p>
                  <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">Awaiting Confirmation</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-3 text-amber-400"><Clock className="h-6 w-6" /></div>
              </div>
            </div>
          </div>

          {/* Center Analysis - Large Chart */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-6 backdrop-blur-xl transition-all hover:border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
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
            <div className="h-[400px] w-full">
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

          {/* Right Column - System Health & Terminal */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Health Module */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-lg font-bold text-white tracking-tight">Bridge Health</h3>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  <Server className="h-3 w-3" /> Stable
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Latency', value: '12ms', color: 'bg-emerald-500' },
                  { label: 'Sync', value: '99.9%', color: 'bg-emerald-500' },
                  { label: 'API', value: '4.2k/s', color: 'bg-primary' },
                  { label: 'Security', value: 'Active', color: 'bg-blue-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                      <span className="text-slate-400">{item.label}</span>
                    </div>
                    <span className="font-mono font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Terminal Widget */}
            <div className="rounded-2xl border border-white/10 bg-black p-4 backdrop-blur-xl font-mono overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
              <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                <Terminal className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System_Logs.sh</span>
              </div>
              <div className="space-y-2 h-[200px] overflow-y-auto scrollbar-hide">
                {logs.map((log, idx) => (
                  <div key={idx} className="text-[10px] leading-relaxed">
                    <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString([], {hour12:false})}]</span>
                    <span className={log.includes('ONLINE') || log.includes('verified') ? 'text-emerald-400' : 'text-slate-400'}>{log}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <span className="text-primary text-xs">❯</span>
                  <div className="h-3 w-1 bg-primary animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Ledger - Full Width */}
          <div className="col-span-12 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-primary/30 shadow-2xl">
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
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            activity.type === 'Buy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {activity.type === 'Buy' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {activity.type}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm font-bold text-white">
                        {formatNumber(activity.amount)} <span className="text-slate-500 font-normal text-xs ml-1">USDT</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            activity.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <div className={`h-1 w-1 rounded-full ${activity.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                          {activity.status}
                        </span>
                      </td>
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

export default Sense50Dashboard;
