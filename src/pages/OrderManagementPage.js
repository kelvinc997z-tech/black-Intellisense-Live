import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const OrderManagementPage = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.get('/orders/pending/all'),
        api.get('/orders/')
      ]);
      setPendingOrders(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      setAllOrders(Array.isArray(allRes.data) ? allRes.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setPendingOrders([]);
      setAllOrders([]);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/accept`);
      toast.success('Order accepted successfully!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to accept order');
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    
    try {
      await api.patch(`/orders/${selectedOrder}/reject?reason=${encodeURIComponent(rejectionReason)}`);
      toast.success('Order rejected');
      setShowRejectionModal(false);
      setSelectedOrder(null);
      setRejectionReason('');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to reject order');
    }
  };

  const openRejectModal = (orderId) => {
    setSelectedOrder(orderId);
    setShowRejectionModal(true);
  };

  return (
    <Layout>
      <div data-testid="order-management-page" className="space-y-6">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Order Management</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Review and manage counterparty orders
          </p>
        </div>

        {/* Pending Orders */}
        <div className="rounded-sm border border-warning/50 bg-warning/5 backdrop-blur-sm">
          <div className="border-b border-border bg-warning/10 p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <h3 className="font-heading text-xl font-semibold text-warning">
                Pending Orders ({pendingOrders.length})
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-left">
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">COUNTERPARTY</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">TYPE</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">SYMBOL</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">AMOUNT</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">PRICE</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">TOTAL</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">DATE</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-3">
                      <div>
                        <p className="font-mono text-sm font-semibold">{order.user_email || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{order.user_name || 'Counterparty'}</p>
                      </div>
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
                    <td className="p-3 font-mono text-sm font-semibold text-primary">${order.price}</td>
                    <td className="p-3 font-mono text-sm font-bold">{formatCurrency(order.total, 'USD')}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          data-testid={`accept-order-${order.id}`}
                          onClick={() => handleAccept(order.id)}
                          className="flex items-center gap-1 rounded-sm bg-success px-3 py-1 font-mono text-xs font-medium text-white hover:bg-success/90"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Accept
                        </button>
                        <button
                          data-testid={`reject-order-${order.id}`}
                          onClick={() => openRejectModal(order.id)}
                          className="flex items-center gap-1 rounded-sm bg-destructive px-3 py-1 font-mono text-xs font-medium text-white hover:bg-destructive/90"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      No pending orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Orders */}
        <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
          <div className="border-b border-border p-4">
            <h3 className="font-heading text-xl font-semibold">All Orders</h3>
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
                {allOrders.map((order) => (
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
                    <td className="p-3 font-mono text-sm">${order.price}</td>
                    <td className="p-3 font-mono text-sm">{formatCurrency(order.total, 'USD')}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-sm px-2 py-1 font-mono text-xs font-medium ${
                          order.status === 'accepted'
                            ? 'bg-success/10 text-success'
                            : order.status === 'rejected'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {formatDateTime(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-sm border border-border bg-card p-6">
            <h3 className="mb-4 font-heading text-xl font-semibold">Reject Order</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Rejection Reason (Optional)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide reason for rejection..."
                rows={4}
                className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                className="flex-1 rounded-sm bg-destructive px-4 py-2 font-medium text-white hover:bg-destructive/90"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedOrder(null);
                  setRejectionReason('');
                }}
                className="flex-1 rounded-sm border border-input px-4 py-2 font-medium hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OrderManagementPage;
