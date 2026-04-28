import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Power, PowerOff } from 'lucide-react';

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">API Connections</h1>
            <p className="mt-2 text-base text-muted-foreground">Manage exchange API integrations</p>
          </div>
          <button
            data-testid="add-exchange-btn"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Exchange
          </button>
        </div>

        {showForm && (
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold">Add New Exchange</h3>
            <form data-testid="exchange-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Exchange</label>
                <select
                  data-testid="exchange-select"
                  value={formData.exchange}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter API Key"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">API Secret</label>
                <input
                  data-testid="api-secret-input"
                  type="password"
                  value={formData.api_secret}
                  onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter API Secret"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  data-testid="demo-mode-checkbox"
                  type="checkbox"
                  id="demo"
                  checked={formData.is_demo}
                  onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="demo" className="text-sm">Demo Mode (Test with simulated data)</label>
              </div>
              <div className="flex gap-2">
                <button
                  data-testid="submit-exchange-btn"
                  type="submit"
                  className="rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Connect Exchange
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-sm border border-input px-4 py-2 font-medium hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {connections.length === 0 ? (
            <div className="rounded-sm border border-border bg-card/40 p-12 text-center backdrop-blur-sm">
              <p className="text-muted-foreground">No exchange connections yet. Add one to get started.</p>
            </div>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.id}
                data-testid={`exchange-connection-${conn.exchange}`}
                className="flex items-center justify-between rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-secondary text-2xl">
                    {exchangeLogos[conn.exchange]}
                  </div>
                  <div>
                    <h3 className="font-mono text-lg font-semibold capitalize">{conn.exchange}</h3>
                    <p className="font-mono text-sm text-muted-foreground">
                      {conn.api_key.substring(0, 8)}...{conn.api_key.substring(conn.api_key.length - 4)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-xs font-medium ${
                          conn.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${conn.is_active ? 'bg-success' : 'bg-muted-foreground'}`} />
                        {conn.is_active ? 'Connected' : 'Disconnected'}
                      </span>
                      {conn.is_demo && (
                        <span className="inline-flex rounded-sm bg-warning/10 px-2 py-0.5 font-mono text-xs font-medium text-warning">
                          Demo Mode
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    data-testid={`toggle-connection-${conn.exchange}`}
                    onClick={() => toggleConnection(conn.id)}
                    className="rounded-sm border border-input p-2 hover:bg-accent"
                    title={conn.is_active ? 'Disconnect' : 'Connect'}
                  >
                    {conn.is_active ? <Power className="h-4 w-4 text-success" /> : <PowerOff className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <button
                    data-testid={`delete-connection-${conn.exchange}`}
                    onClick={() => handleDelete(conn.id)}
                    className="rounded-sm border border-input p-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
