import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';

const P2PTradingPage = () => {
  const [prices, setPrices] = useState([]);
  const [myPrices, setMyPrices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [formData, setFormData] = useState({
    symbol: 'USDT',
    buy_price: '',
    sell_price: '',
    min_amount: '',
    max_amount: '',
    payment_methods: ['Bank Transfer', 'Cash']
  });

  useEffect(() => {
    fetchPrices();
    fetchMyPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await api.get('/p2p/prices');
      setPrices(response.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchMyPrices = async () => {
    try {
      const response = await api.get('/p2p/my-prices');
      setMyPrices(response.data);
    } catch (error) {
      console.error('Error fetching my prices:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPrice) {
        await api.patch(`/p2p/prices/${editingPrice}`, formData);
        toast.success('Price updated successfully!');
      } else {
        await api.post('/p2p/prices', formData);
        toast.success('Price created successfully!');
      }
      setShowForm(false);
      setEditingPrice(null);
      setFormData({
        symbol: 'USDT',
        buy_price: '',
        sell_price: '',
        min_amount: '',
        max_amount: '',
        payment_methods: ['Bank Transfer', 'Cash']
      });
      fetchPrices();
      fetchMyPrices();
    } catch (error) {
      toast.error('Failed to save price');
    }
  };

  const handleEdit = (price) => {
    setEditingPrice(price.id);
    setFormData({
      symbol: price.symbol,
      buy_price: price.buy_price,
      sell_price: price.sell_price,
      min_amount: price.min_amount,
      max_amount: price.max_amount,
      payment_methods: price.payment_methods
    });
    setShowForm(true);
  };

  const handleDelete = async (priceId) => {
    if (window.confirm('Are you sure you want to deactivate this price?')) {
      try {
        await api.delete(`/p2p/prices/${priceId}`);
        toast.success('Price deactivated');
        fetchPrices();
        fetchMyPrices();
      } catch (error) {
        toast.error('Failed to deactivate price');
      }
    }
  };

  return (
    <Layout>
      <div data-testid="p2p-trading-page" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">P2P Trading Management</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Manage merchant prices and P2P trading feeds
            </p>
          </div>
          <button
            data-testid="add-price-btn"
            onClick={() => {
              setShowForm(!showForm);
              setEditingPrice(null);
              setFormData({
                symbol: 'USDT',
                buy_price: '',
                sell_price: '',
                min_amount: '',
                max_amount: '',
                payment_methods: ['Bank Transfer', 'Cash']
              });
            }}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Price
          </button>
        </div>

        {/* Price Form */}
        {showForm && (
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold">
              {editingPrice ? 'Edit Price' : 'Add New Price'}
            </h3>
            <form data-testid="price-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Symbol</label>
                  <select
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Buy Price</label>
                  <input
                    data-testid="buy-price-input"
                    type="number"
                    step="0.0001"
                    value={formData.buy_price}
                    onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                    placeholder="1.0015"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Sell Price</label>
                  <input
                    data-testid="sell-price-input"
                    type="number"
                    step="0.0001"
                    value={formData.sell_price}
                    onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                    placeholder="1.0025"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Min Amount</label>
                  <input
                    type="number"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                    placeholder="1000"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Max Amount</label>
                  <input
                    type="number"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                    className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                    placeholder="100000"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-sm bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {editingPrice ? 'Update Price' : 'Create Price'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPrice(null);
                  }}
                  className="rounded-sm border border-input px-4 py-2 font-medium hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Prices */}
        <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
          <div className="border-b border-border p-4">
            <h3 className="font-heading text-xl font-semibold">My Prices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-left">
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">SYMBOL</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">BUY PRICE</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">SELL PRICE</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">MIN - MAX</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {myPrices.map((price) => (
                  <tr key={price.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-3 font-mono text-sm font-semibold">{price.symbol}</td>
                    <td className="p-3 font-mono text-sm text-success">${price.buy_price}</td>
                    <td className="p-3 font-mono text-sm text-destructive">${price.sell_price}</td>
                    <td className="p-3 font-mono text-sm text-muted-foreground">
                      ${price.min_amount.toLocaleString()} - ${price.max_amount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(price)}
                          className="rounded-sm border border-input p-2 hover:bg-accent"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(price.id)}
                          className="rounded-sm border border-input p-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {myPrices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No prices created yet. Click "Add Price" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Merchant Prices */}
        <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
          <div className="border-b border-border p-4">
            <h3 className="font-heading text-xl font-semibold">All Merchant Prices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-left">
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">MERCHANT</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">SYMBOL</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">BUY</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">SELL</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">SPREAD</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">LIMITS</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => {
                  const spread = ((price.sell_price - price.buy_price) / price.buy_price * 100).toFixed(2);
                  return (
                    <tr key={price.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-mono text-sm font-semibold">{price.merchant_name}</td>
                      <td className="p-3 font-mono text-sm">{price.symbol}</td>
                      <td className="p-3 font-mono text-sm text-success">${price.buy_price}</td>
                      <td className="p-3 font-mono text-sm text-destructive">${price.sell_price}</td>
                      <td className="p-3 font-mono text-sm text-muted-foreground">{spread}%</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">
                        ${price.min_amount.toLocaleString()} - ${price.max_amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {prices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No merchant prices available
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

export default P2PTradingPage;
