import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { 
  Receipt, Activity, ShieldAlert, Zap, 
  Search, Filter, Download, Calendar,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // In a real app, this would call an API like /admin/audit-logs
      // For now, we'll use mock data to ensure the UI is visible and branded
      setLogs([
        { id: 'LOG-001', user: 'admin@blackintellisense.com', action: 'API Key Created', target: 'Key_abc123', status: 'Success', timestamp: '2026-05-08 08:00', severity: 'info' },
        { id: 'LOG-002', user: 'admin@blackintellisense.com', action: 'Markup Updated', target: 'USDT/BTC', status: 'Success', timestamp: '2026-05-08 08:15', severity: 'info' },
        { id: 'LOG-003', user: 'op_manager', action: 'User Permission Changed', target: 'trader_01', status: 'Failure', timestamp: '2026-05-08 08:30', severity: 'error' },
        { id: 'LOG-004', user: 'system', action: 'Auto-Balance Rebalance', target: 'Vault_01', status: 'Success', timestamp: '2026-05-08 09:00', severity: 'success' },
        { id: 'LOG-005', user: 'admin@blackintellisense.com', action: 'IP Whitelist Updated', target: '192.168.1.1', status: 'Success', timestamp: '2026-05-08 09:45', severity: 'info' },
      ]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-mono text-sm text-muted-foreground animate-pulse uppercase tracking-widest">Retrieving Audit Trails...</p>
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
              Sense50 Bridge Engine • Institutional Liquidity Aggregation • High-Frequency Execution
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

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 bg-black/40 p-4 rounded-2xl backdrop-blur-md">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search logs by action, user or target..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all">
              <Filter className="h-3 w-3" /> Filter
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
              <Download className="h-3 w-3" /> Export CSV
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="border-b border-white/10 p-6 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-xl font-bold text-white tracking-tight">Administrative Audit Trail</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              <Calendar className="h-3 w-3" />
              Last Sync: {new Date().toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Log ID</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">User</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Action</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Target</th>
                  <th className="p-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-white/5 group">
                    <td className="p-4 font-mono text-xs text-slate-400">{log.id}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">{log.timestamp}</td>
                    <td className="p-4 font-mono text-sm font-bold text-white">{log.user}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {log.severity === 'error' && <XCircle className="h-3 w-3 text-rose-500" />}
                        {log.severity === 'success' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        {log.severity === 'info' && <AlertCircle className="h-3 w-3 text-blue-500" />}
                        <span className="text-sm text-slate-300 font-medium">{log.action}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-slate-400">{log.target}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          log.status === 'Success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <div className={`h-1 w-1 rounded-full ${log.status === 'Success' ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500 font-mono text-sm italic">
                      No audit records found matching your search criteria.
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

export default AuditLogsPage;
