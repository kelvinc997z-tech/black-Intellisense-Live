import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Power, PowerOff, Server, Key, ShieldCheck } from 'lucide-react';

const ExchangesPage = () => {
  const [connections, setConnections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    exchange: 'binance',
    api_key: '',
    api_secret: '',
    is_demo: true
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get('/exchanges/');
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exchanges/', formData);
      toast.success('Exchange connected successfully!');
      setShowForm(false);
      setFormData({ exchange: 'binance', api_key: '', api_secret: '', is_demo: true });
      fetchConnections();
    } catch (error) {
      toast.error('Failed to connect exchange');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this connection?')) {
      try {
        await api.delete(`/exchanges/${id}`);
        toast.success('Connection removed');
        fetchConnections();
      } catch (error) {
        toast.error('Failed to remove connection');
      }
    }
  };

  const toggleConnection = async (id) => {
    try {
      await api.patch(`/exchanges/${id}/toggle`);
      toast.success('Connection status updated');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to update connection');
    }
  };

  const exchangeLogos = {
    binance: '🟡',
    okex: '🔵',
    huobi: '🔴'
  };

  return (
    <Layout>
      <div className="space-y-8 p-2 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <Server className="h-3 w-3" />
              Sense50 Bridge Engine
            </div>
            <h1 className="font-heading text-6xl font-black tracking-tighter text-white">
              API<span className="text-primary"> CONNECTIONS</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
              Institutional exchange API integrations for high-frequency liquidity aggregation.
            </p>
          </div>
          <button
            data-testid="add-exchange-btn"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus className="h-4 w-4" />
            Add Exchange
          </button>
        </div>

        {/* Add Exchange Form */}
        {showForm && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-8 backdrop-blur-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-6">
              <Key className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight">Establish New Bridge</h3>
            </div>
            <form data-testid="exchange-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Exchange Platform</label>
                <select
                  data-testid="exchange-select"
                  value={formData.exchange}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
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
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
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
                  value={formData.api_secret}
                  onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Enter API Secret"
                  required
                />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input
                  data-testid="demo-mode-checkbox"
                  type="checkbox"
                  id="demo"
                  checked={formData.is_demo}
                  onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-black"
                />
                <label htmlFor="demo" className="text-xs font-medium text-slate-400 cursor-pointer">
                  Demo Mode (Execute with simulated liquidity)
                </label>
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  data-testid="submit-exchange-btn"
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  Connect Exchange
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Connections Grid */}
        <div className="grid gap-4">
          {connections.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-12 text-center backdrop-blur-xl">
              <Server className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No exchange connections detected. Please establish a bridge.</p>
            </div>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.id}
                data-testid={`exchange-connection-${conn.exchange}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/80 p-6 backdrop-blur-2xl transition-all hover:border-primary/40"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 border border-white/10 text-2xl shadow-inner">
                      {exchangeLogos[conn.exchange]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-xl font-bold text-white capitalize">{conn.exchange}</h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            conn.is_active 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-500 border border-white/5'
                          }`}
                        >
                          <div className={`h-1 w-1 rounded-full ${conn.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          {conn.is_active ? 'Connected' : 'Offline'}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-slate-500">
                        Key: {conn.api_key.substring(0, 8)}...{conn.api_key.substring(conn.api_key.length - 4)}
                      </p>
                      {conn.is_demo && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          <ShieldCheck className="h-3 w-3" /> Demo Mode
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      data-testid={`toggle-connection-${conn.exchange}`}
                      onClick={() => toggleConnection(conn.id)}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                      title={conn.is_active ? 'Disconnect' : 'Connect'}
                    >
                      {conn.is_active ? <Power className="h-5 w-5 text-emerald-400" /> : <PowerOff className="h-5 w-5" />}
                    </button>
                    <button
                      data-testid={`delete-connection-${conn.exchange}`}
                      onClick={() => handleDelete(conn.id)}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExchangesPage;
