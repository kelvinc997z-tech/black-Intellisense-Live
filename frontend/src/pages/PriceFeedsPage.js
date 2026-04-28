import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const PriceFeedsPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [bestPrice, setBestPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const [feedsRes, bestRes] = await Promise.all([
        api.get('/prices/'),
        api.get('/prices/best')
      ]);
      setFeeds(feedsRes.data);
      setBestPrice(bestRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  const exchangeIcons = {
    binance: '🟡',
    okex: '🔵',
    huobi: '🔴'
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">Price Feeds & Aggregator</h1>
            <p className="mt-2 text-base text-muted-foreground">Real-time multi-exchange price aggregation</p>
          </div>
          <button
            data-testid="refresh-prices-btn"
            onClick={fetchPrices}
            className="flex items-center gap-2 rounded-sm border border-input px-4 py-2 hover:bg-accent"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Best Price Card */}
        {bestPrice && (
          <div className="rounded-sm border border-primary/50 bg-card/40 p-6 backdrop-blur-sm glow-effect">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Price (with markup)</p>
                <p data-testid="best-price" className="mt-2 font-mono text-5xl font-bold text-primary">
                  ${bestPrice.best_price}
                </p>
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  Base: ${bestPrice.base_price} + {bestPrice.markup_percentage}% markup
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Spread</p>
                <p className="mt-2 font-mono text-2xl font-bold text-foreground">{bestPrice.spread}%</p>
                <p className="mt-4 text-sm font-medium text-muted-foreground">24h Volume</p>
                <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                  {formatCurrency(bestPrice.volume_24h, 'USD')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Feeds */}
        <div className="grid gap-4">
          <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border p-4">
              <h3 className="font-heading text-xl font-semibold">Live Exchange Feeds</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left">
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">EXCHANGE</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">BID PRICE</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">ASK PRICE</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">SPREAD</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">VOLUME</th>
                  </tr>
                </thead>
                <tbody>
                  {feeds.map((feed) => (
                    <tr key={feed.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{exchangeIcons[feed.exchange]}</span>
                          <span className="font-mono text-sm font-semibold capitalize">{feed.exchange}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm font-semibold text-success">${feed.bid_price}</td>
                      <td className="p-3 font-mono text-sm font-semibold text-destructive">${feed.ask_price}</td>
                      <td className="p-3 font-mono text-sm text-foreground">{feed.spread}%</td>
                      <td className="p-3 font-mono text-sm text-foreground">
                        {formatCurrency(feed.volume_24h, 'USD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-heading text-xl font-semibold">USDT Price Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={Array.from({ length: 20 }, (_, i) => ({
                time: `${i}:00`,
                price: 1.0012 + (Math.random() - 0.5) * 0.002,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} />
              <YAxis stroke="#94A3B8" fontSize={10} domain={[0.999, 1.003]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: '4px',
                }}
              />
              <Line type="monotone" dataKey="price" stroke="#06B6D4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default PriceFeedsPage;
