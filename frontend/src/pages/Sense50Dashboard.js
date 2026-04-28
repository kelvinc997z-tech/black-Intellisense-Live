import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Activity, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Sense50Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activitiesRes, historyRes, balanceRes] = await Promise.all([
        api.get('/trades/stats'),
        api.get('/trades/recent'),
        api.get('/prices/history'),
        api.get('/wallets/total-balance')
      ]);

      setStats({
        ...statsRes.data,
        total_balance: balanceRes.data.total_balance.USDT || 520000
      });
      setActivities(activitiesRes.data.activities);
      setPriceHistory(historyRes.data.history);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="text-center py-12">Loading...</div></Layout>;
  }

  const statCards = [
    {
      title: 'Total USDT Stock',
      value: formatCurrency(stats?.total_balance || 520000, 'USD'),
      change: '+1.2%',
      icon: DollarSign,
      color: 'text-primary',
      testId: 'total-usdt-stock'
    },
    {
      title: 'Daily Volume',
      value: formatCurrency(stats?.daily_volume || 148500, 'USD'),
      icon: Activity,
      color: 'text-chart-2',
      testId: 'daily-volume'
    },
    {
      title: 'Pending Settlements',
      value: stats?.pending_settlements || 5,
      icon: Clock,
      color: 'text-warning',
      testId: 'pending-settlements'
    },
  ];

  return (
    <Layout>
      <div data-testid="sense50-dashboard" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
              Sense 50 Bridge Engine
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Real-time price aggregation and execution control
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border bg-card/40 px-4 py-2 backdrop-blur-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="font-mono text-sm text-muted-foreground">Live</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              data-testid={stat.testId}
              className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 font-mono text-3xl font-bold text-foreground">{stat.value}</p>
                  {stat.change && (
                    <div className="mt-2 flex items-center gap-1 text-sm font-medium text-success">
                      <TrendingUp className="h-4 w-4" />
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className={`rounded-sm bg-secondary p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Price Chart */}
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold tracking-tight text-foreground">
              USDT Price Trend (24h)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={priceHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickFormatter={(value) => new Date(value).getHours() + ':00'}
                />
                <YAxis stroke="#94A3B8" fontSize={10} domain={[0.999, 1.003]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: '1px solid #1E293B',
                    borderRadius: '4px',
                    color: '#F8FAFC',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#06B6D4"
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* P&L Chart */}
          <div className="rounded-sm border border-border bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-heading text-xl font-semibold tracking-tight text-foreground">
              Profit & Loss
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={[
                  { time: '11:00', value: 80 },
                  { time: '1:00', value: 120 },
                  { time: '3:00', value: 100 },
                  { time: '5:00', value: 160 },
                  { time: '7:00', value: 140 },
                  { time: '9:00', value: 180 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: '1px solid #1E293B',
                    borderRadius: '4px',
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
          <div className="border-b border-border p-4">
            <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              Recent Activity
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-left">
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">TIME</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">CLIENT</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">TYPE</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">AMOUNT</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, idx) => (
                  <tr key={idx} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                    <td className="p-3 font-mono text-sm text-foreground">{activity.time}</td>
                    <td className="p-3 font-mono text-sm text-foreground">{activity.client}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-sm px-2 py-1 font-mono text-xs font-medium ${
                          activity.type === 'Buy'
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {activity.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sm text-foreground">
                      {formatNumber(activity.amount)} USDT
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-sm px-2 py-1 font-mono text-xs font-medium ${
                          activity.status === 'Completed'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sense50Dashboard;
