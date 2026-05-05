import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { RefreshCw, Settings, TrendingUp, TrendingDown } from 'lucide-react';
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
      <div data-testid="api-trade-page" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">API Trade Module</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Real-time order book and direct exchange trading
            </p>
          </div>
          <button
            data-testid="config-api-btn"
            onClick={() => setShowConfigForm(!showConfigForm)}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Settings className="h-4 w-4" />
            Configure API
          </button>
        </div>

        {/* API Configuration Form */}
        {showConfigForm && (
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold">Exchange API Configuration</h3>
            <form data-testid="api-config-form" onSubmit={handleConfigSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Exchange</label>
                <select
                  value={configForm.exchange}
                  onChange={(e) => setConfigForm({ ...configForm, exchange: e.target.value })}
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                >
                  <option value="binance">Binance</option>
                  <option value="okex">OKEx</option>
                  <option value="huobi">Huobi</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">API Key</label>
                <input
                  data-testid="api-key-input"
                  type="text"
                  value={configForm.api_key}
                  onChange={(e) => setConfigForm({ ...configForm, api_key: e.target.value })}
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                  placeholder="Enter API Key"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">API Secret</label>
                <input
                  data-testid="api-secret-input"
                  type="password"
                  value={configForm.api_secret}
                  onChange={(e) => setConfigForm({ ...configForm, api_secret: e.target.value })}
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                  placeholder="Enter API Secret"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_live"
                  checked={configForm.is_live}
                  onChange={(e) => setConfigForm({ ...configForm, is_live: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is_live" className="text-sm">Enable Live Trading (test first!)</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Save Configuration
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigForm(false)}
                  className="rounded-sm border border-input px-4 py-2 font-medium hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Exchange & Symbol Selector */}
        <div className="flex gap-4">
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="rounded-sm border border-input bg-card/40 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
          >
            <option value="binance">Binance</option>
            <option value="okex">OKEx</option>
            <option value="huobi">Huobi</option>
          </select>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="rounded-sm border border-input bg-card/40 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
          >
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="BNB/USDT">BNB/USDT</option>
            <option value="SOL/USDT">SOL/USDT</option>
          </select>
          <button
            onClick={fetchOrderBook}
            disabled={loading}
            className="flex items-center gap-2 rounded-sm border border-input px-4 py-2 hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Status Badge */}
        {orderBook && (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${orderBook.is_live ? 'bg-success animate-pulse' : 'bg-warning'}`} />
            <span className="font-mono text-sm text-muted-foreground">
              {orderBook.message}
            </span>
          </div>
        )}

        {/* Order Book */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Bids (Buy Orders) */}
          <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border bg-success/10 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <h3 className="font-heading text-lg font-semibold text-success">Bids (Buy)</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left">
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">PRICE</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">AMOUNT</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {orderBook?.order_book?.bids?.map((bid, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-success/5">
                      <td className="p-3 font-mono text-sm font-semibold text-success">${bid.price.toLocaleString()}</td>
                      <td className="p-3 font-mono text-sm text-foreground">{bid.amount}</td>
                      <td className="p-3 font-mono text-sm text-muted-foreground">${bid.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border bg-destructive/10 p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <h3 className="font-heading text-lg font-semibold text-destructive">Asks (Sell)</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left">
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">PRICE</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">AMOUNT</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {orderBook?.order_book?.asks?.map((ask, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-destructive/5">
                      <td className="p-3 font-mono text-sm font-semibold text-destructive">${ask.price.toLocaleString()}</td>
                      <td className="p-3 font-mono text-sm text-foreground">{ask.amount}</td>
                      <td className="p-3 font-mono text-sm text-muted-foreground">${ask.total.toLocaleString()}</td>
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