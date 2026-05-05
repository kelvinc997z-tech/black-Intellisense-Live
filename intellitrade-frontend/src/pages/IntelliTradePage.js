import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const IntelliTradePage = () => {
  const [bestPrice, setBestPrice] = useState(null);
  const [orderForm, setOrderForm] = useState({
    symbol: 'USDT',
    side: 'buy',
    amount: '',
    price: ''
  });

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrice = async () => {
    try {
      const response = await api.get('/prices/best');
      setBestPrice(response.data);
      setOrderForm(prev => ({ ...prev, price: response.data.best_price }));
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders/', {
        symbol: orderForm.symbol,
        side: orderForm.side,
        amount: parseFloat(orderForm.amount),
        price: parseFloat(orderForm.price)
      });
      toast.success('Order placed successfully!');
      setOrderForm({ ...orderForm, amount: '' });
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  return (
    <Layout>
      <div data-testid="intellitrade-page" className="space-y-6">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">IntelliTrade OTC Platform</h1>
          <p className="mt-2 text-base text-muted-foreground">Professional OTC trading with live pricing</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Live Pricing */}
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-xl font-semibold">Live OTC Price</h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="font-mono text-xs text-muted-foreground">Live</span>
              </div>
            </div>
            
            {bestPrice && (
              <div className="space-y-4">
                <div className="rounded-sm bg-primary/10 p-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground">Current Price</p>
                  <p data-testid="current-otc-price" className="mt-2 font-mono text-4xl font-bold text-primary">
                    ${bestPrice.best_price}
                  </p>
                  <p className="mt-2 font-mono text-sm text-muted-foreground">per USDT</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-sm bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Spread</p>
                    <p className="mt-1 font-mono text-lg font-semibold">{bestPrice.spread}%</p>
                  </div>
                  <div className="rounded-sm bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">24h Volume</p>
                    <p className="mt-1 font-mono text-lg font-semibold">
                      {(bestPrice.volume_24h / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Form */}
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold">Place Order</h3>
            <form data-testid="order-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="buy-btn"
                    onClick={() => setOrderForm({ ...orderForm, side: 'buy' })}
                    className={`rounded-sm py-2 font-medium ${
                      orderForm.side === 'buy'
                        ? 'bg-success text-white'
                        : 'border border-input hover:bg-accent'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    data-testid="sell-btn"
                    onClick={() => setOrderForm({ ...orderForm, side: 'sell' })}
                    className={`rounded-sm py-2 font-medium ${
                      orderForm.side === 'sell'
                        ? 'bg-destructive text-white'
                        : 'border border-input hover:bg-accent'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Amount (USDT)</label>
                <input
                  data-testid="amount-input"
                  type="number"
                  value={orderForm.amount}
                  onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Price (USD)</label>
                <input
                  data-testid="price-input"
                  type="number"
                  step="0.0001"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                  required
                  className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {orderForm.amount && orderForm.price && (
                <div className="rounded-sm bg-secondary p-3">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="mt-1 font-mono text-2xl font-bold">
                    {formatCurrency(parseFloat(orderForm.amount) * parseFloat(orderForm.price), 'USD')}
                  </p>
                </div>
              )}

              <button
                data-testid="place-order-btn"
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 font-medium text-primary-foreground shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-primary/90"
              >
                <ShoppingCart className="h-4 w-4" />
                Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IntelliTradePage;
