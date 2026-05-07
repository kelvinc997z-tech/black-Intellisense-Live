import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { toast } from 'sonner';
import { Save, Settings, Percent, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

const MarkupConfigPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/markup/');
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.patch('/markup/', config);
      toast.success('Markup configuration saved successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8 p-2 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
              <Settings className="h-3 w-3" />
              System Parameters
            </div>
            <h1 className="font-heading text-6xl font-black tracking-tighter text-white">
              MARKUP<span className="text-primary"> CONFIG</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
              Define institutional pricing rules, execution thresholds, and tiered markup models.
            </p>
          </div>
          <button
            data-testid="save-markup-btn"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Markup Models Section */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-8 backdrop-blur-xl transition-all hover:border-primary/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-8">
              <Percent className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight">Markup Models</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <div className="h-4 w-4 rounded border border-primary/50 bg-primary/20 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  Fixed Markup
                </label>
                <div className="flex items-center gap-3 ml-7">
                  <input
                    data-testid="fixed-markup-input"
                    type="number"
                    step="0.1"
                    value={config.fixed_markup}
                    onChange={(e) => setConfig({ ...config, fixed_markup: parseFloat(e.target.value) })}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <span className="font-mono text-sm font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <div className="h-4 w-4 rounded border border-primary/50 bg-primary/20 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  Percentage Markup
                </label>
                <div className="flex items-center gap-3 ml-7">
                  <input
                    data-testid="percentage-markup-input"
                    type="number"
                    step="0.1"
                    value={config.percentage_markup}
                    onChange={(e) => setConfig({ ...config, percentage_markup: parseFloat(e.target.value) })}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <span className="font-mono text-sm font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <div className="h-4 w-4 rounded border border-primary/50 bg-primary/20 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  Tiered Markup
                </label>
                <div className="space-y-3 ml-7">
                  <div className="flex items-center gap-3">
                    <span className="w-32 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Retail Clients:</span>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        data-testid="retail-markup-input"
                        type="number"
                        step="0.1"
                        value={config.tiered_markup?.retail || 1.5}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            tiered_markup: { ...config.tiered_markup, retail: parseFloat(e.target.value) },
                          })
                        }
                        className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                      />
                      <span className="font-mono text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-32 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">VIP Clients:</span>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        data-testid="vip-markup-input"
                        type="number"
                        step="0.1"
                        value={config.tiered_markup?.vip || 0.8}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            tiered_markup: { ...config.tiered_markup, vip: parseFloat(e.target.value) },
                          })
                        }
                        className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                      />
                      <span className="font-mono text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Parameters Section */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/60 p-8 backdrop-blur-xl transition-all hover:border-primary/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-8">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-2xl font-bold text-white tracking-tight">Execution Parameters</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Minimum Trade Size</label>
                <div className="flex items-center gap-3">
                  <input
                    data-testid="min-trade-size-input"
                    type="number"
                    value={config.min_trade_size}
                    onChange={(e) => setConfig({ ...config, min_trade_size: parseFloat(e.target.value) })}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <span className="font-mono text-xs font-bold text-slate-500">USDT</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Maximum Trade Size</label>
                <div className="flex items-center gap-3">
                  <input
                    data-testid="max-trade-size-input"
                    type="number"
                    value={config.max_trade_size}
                    onChange={(e) => setConfig({ ...config, max_trade_size: parseFloat(e.target.value) })}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <span className="font-mono text-xs font-bold text-slate-500">USDT</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Maximum Slippage Tolerance</label>
                <div className="flex items-center gap-3">
                  <input
                    data-testid="max-slippage-input"
                    type="number"
                    step="0.1"
                    value={config.max_slippage}
                    onChange={(e) => setConfig({ ...config, max_slippage: parseFloat(e.target.value) })}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <span className="font-mono text-xs font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Auto Liquidity Threshold</label>
                <div className="flex items-center gap-3">
                  <input
                    data-testid="auto-threshold-input"
                    type="number"
                    value={config.auto_threshold}
                    onChange={(e) => setConfig({ ...config, auto_threshold: parseFloat(e.target.value) })}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <span className="font-mono text-xs font-bold text-slate-500">USDT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MarkupConfigPage;
