import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">Markup Configuration</h1>
            <p className="mt-2 text-base text-muted-foreground">Configure pricing rules and execution parameters</p>
          </div>
          <button
            data-testid="save-markup-btn"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Markup Settings */}
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold">Markup Models</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked readOnly className="h-4 w-4" />
                  Fixed Markup
                </label>
                <div className="flex items-center gap-2">
                  <input
                    data-testid="fixed-markup-input"
                    type="number"
                    step="0.1"
                    value={config.fixed_markup}
                    onChange={(e) => setConfig({ ...config, fixed_markup: parseFloat(e.target.value) })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="font-mono text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked readOnly className="h-4 w-4" />
                  Percentage Markup
                </label>
                <div className="flex items-center gap-2">
                  <input
                    data-testid="percentage-markup-input"
                    type="number"
                    step="0.1"
                    value={config.percentage_markup}
                    onChange={(e) => setConfig({ ...config, percentage_markup: parseFloat(e.target.value) })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="font-mono text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked readOnly className="h-4 w-4" />
                  Tiered Markup
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-24 font-mono text-sm">Retail Clients:</span>
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
                      className="flex-1 rounded-sm border border-input bg-slate-950/50 px-3 py-1.5 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="font-mono text-sm text-muted-foreground">%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 font-mono text-sm">VIP Clients:</span>
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
                      className="flex-1 rounded-sm border border-input bg-slate-950/50 px-3 py-1.5 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="font-mono text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Parameters */}
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold">Execution Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Min Trade Size</label>
                <div className="flex items-center gap-2">
                  <input
                    data-testid="min-trade-size-input"
                    type="number"
                    value={config.min_trade_size}
                    onChange={(e) => setConfig({ ...config, min_trade_size: parseFloat(e.target.value) })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="font-mono text-sm text-muted-foreground">USDT</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Max Trade Size</label>
                <div className="flex items-center gap-2">
                  <input
                    data-testid="max-trade-size-input"
                    type="number"
                    value={config.max_trade_size}
                    onChange={(e) => setConfig({ ...config, max_trade_size: parseFloat(e.target.value) })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="font-mono text-sm text-muted-foreground">USDT</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Max Slippage</label>
                <div className="flex items-center gap-2">
                  <input
                    data-testid="max-slippage-input"
                    type="number"
                    step="0.1"
                    value={config.max_slippage}
                    onChange={(e) => setConfig({ ...config, max_slippage: parseFloat(e.target.value) })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="font-mono text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Auto Buy/Sell Threshold</label>
                <div className="flex items-center gap-2">
                  <input
                    data-testid="auto-threshold-input"
                    type="number"
                    value={config.auto_threshold}
                    onChange={(e) => setConfig({ ...config, auto_threshold: parseFloat(e.target.value) })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="font-mono text-sm text-muted-foreground">USDT</span>
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
