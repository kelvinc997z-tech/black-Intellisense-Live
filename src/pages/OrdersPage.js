import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/');
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-success/10 text-success';
      case 'rejected':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/trading')}
              className="flex items-center gap-2 rounded-sm border border-input px-3 py-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Trading
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold">My Orders</h1>
              <p className="text-xs text-muted-foreground">Track your order status</p>
            </div>
          </div>
          <div className="rounded-sm bg-secondary/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Account</p>
            <p className="font-mono text-sm font-semibold">{user?.email}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="rounded-sm border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm">
              <strong>Order Status:</strong> Your orders are reviewed by our team.
              <span className="ml-2 text-warning">Pending</span> orders are under review,
              <span className="ml-2 text-success">Accepted</span> orders will proceed to settlement,
              <span className="ml-2 text-destructive">Rejected</span> orders require revision.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border p-4">
              <h3 className="font-heading text-xl font-semibold">Order History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left">
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">ORDER ID</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">TYPE</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">SYMBOL</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">AMOUNT</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">PRICE</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">TOTAL</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">STATUS</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs text-muted-foreground">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-sm px-2 py-1 font-mono text-xs font-medium ${
                            order.side === 'buy'
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {order.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-sm font-semibold">{order.symbol}</td>
                      <td className="p-3 font-mono text-sm">{order.amount.toLocaleString()}</td>
                      <td className="p-3 font-mono text-sm">{'$'}{order.price}</td>
                      <td className="p-3 font-mono text-sm font-semibold">
                        {formatCurrency(order.total, 'USD')}
                      </td>
                      <td className="p-3">
                        <div className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.toUpperCase()}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-muted-foreground">
                        No orders yet. Place your first order on the trading page.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
