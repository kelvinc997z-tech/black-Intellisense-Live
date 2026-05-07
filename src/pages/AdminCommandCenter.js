import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { 
  Activity, ShieldAlert, Cpu, Globe, 
  Users, DollarSign, Zap, Terminal,
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const AdminCommandCenter = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [exposure, setExposure] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalStats();
    const interval = setInterval(fetchGlobalStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchGlobalStats = async () => {
    try {
      // Mocking global aggregation API
      setSystemStats({
        total_volume: 1250000000,
        active_users: 1420,
        platform_pnl: 450000,
        latency_avg: "4ms",
        uptime: "99.99%"
      });
      setExposure([
        { symbol: 'BTC', amount: 1200000, risk: 'Medium', color: '#fbbf24' },
        { symbol: 'ETH', amount: 800000, risk: 'Low', color: '#10b981' },
        { symbol: 'USDT', amount: 50000000, risk: 'Low', color: '#3b82f6' },
        { symbol: 'SOL', amount: 450000, risk: 'High', color: '#ef4444' },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Initializing Command Center...</div></Layout>;

  return (
    <Layout>
      <div className="p-4 max-w-[1800px] mx-auto space-y-6">
        {/* Top HUD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Volume', value: `$${(systemStats?.total_volume / 1e6).toFixed(2)}M`, icon: DollarSign, color: 'text-primary' },
            { label: 'Active Sessions', value: systemStats?.active_users, icon: Users, color: 'text-emerald-400' },
            { label: 'Platform PnL', value: `+$${(systemStats?.platform_pnl / 1e3).toFixed(1)}k`, icon: TrendingUp, color: 'text-cyan-400' },
            { label: 'System Latency', value: systemStats?.latency_avg, icon: Zap, color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/5 blur-2xl group-hover:bg-primary/10 transition-all" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-3xl font-black text-white mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Global Exposure Monitor */}
          <div className="col-span-12 lg:col-span-8 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-xl font-bold text-white tracking-tight">Net Exposure Monitor</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Real-time Sync
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposure}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="symbol" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {exposure.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Control Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black p-6 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/50" />
              <div className="flex items-center gap-2 mb-6">
                <Terminal className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-xl font-bold text-white tracking-tight">Control Panel</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Auto-Matching Engine', status: 'ACTIVE', color: 'text-emerald-400' },
                  { label: 'Institutional Bridge', status: 'ONLINE', color: 'text-emerald-400' },
                  { label: 'Risk Guardrails', status: 'ACTIVE', color: 'text-emerald-400' },
                  { label: 'zkTLS Verifier', status: 'STABLE', color: 'text-emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs font-medium text-slate-400">{item.label}</span>
                    <span className={`text-[10px] font-bold uppercase ${item.color}`}>{item.status}</span>
                  </div>
                ))}
                <button className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all">
                  Emergency Halt System
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-lg font-bold text-white tracking-tight">Platform Health</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>CPU Load</span>
                    <span>24%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[24%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Memory Usage</span>
                    <span>42%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-[42%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Network Latency</span>
                    <span>4ms</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[15%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCommandCenter;
