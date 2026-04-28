import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { formatDateTime, formatCurrency } from '../lib/utils';
import { CheckCircle, XCircle, Clock, Download, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MarkCRMPage = () => {
  const [settlements, setSettlements] = useState([]);
  const [enrichedSettlements, setEnrichedSettlements] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const settlementsRes = await api.get('/settlements/');
      setSettlements(settlementsRes.data);
      
      // Enrich settlements with order and payment data
      const enriched = await Promise.all(
        settlementsRes.data.map(async (settlement) => {
          let orderData = null;
          let paymentData = null;
          
          // Get order data if order_id exists
          if (settlement.order_id) {
            try {
              const orderRes = await api.get(`/orders/${settlement.order_id}`);
              orderData = orderRes.data;
            } catch (err) {
              console.log('Order not found');
            }
          }
          
          // Get payment proof if payment_proof_id exists
          if (settlement.payment_proof_id) {
            try {
              const paymentsRes = await api.get('/payments/');
              paymentData = paymentsRes.data.find(p => p.id === settlement.payment_proof_id);
            } catch (err) {
              console.log('Payment not found');
            }
          }
          
          return {
            ...settlement,
            order: orderData,
            payment: paymentData
          };
        })
      );
      
      setEnrichedSettlements(enriched);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleApprove = async (settlementId) => {
    try {
      await api.patch(`/settlements/${settlementId}`, {
        status: 'approved'
      });
      toast.success('Settlement approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve settlement');
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/reports/settlements/${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtensions = { csv: 'csv', excel: 'xlsx', pdf: 'pdf' };
      link.setAttribute('download', `settlements_${new Date().toISOString().split('T')[0]}.${fileExtensions[format]}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-warning" />,
    approved: <CheckCircle className="h-4 w-4 text-success" />,
    completed: <CheckCircle className="h-4 w-4 text-success" />,
    rejected: <XCircle className="h-4 w-4 text-destructive" />
  };

  return (
    <Layout>
      <div data-testid="markcrm-page" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">MarkCRM Settlement System</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Automated settlement and reconciliation
            </p>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="export-csv-btn"
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 rounded-sm border border-input px-4 py-2 hover:bg-accent"
            >
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </button>
            <button
              data-testid="export-excel-btn"
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 rounded-sm border border-input px-4 py-2 hover:bg-accent"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <button
              data-testid="export-pdf-btn"
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 rounded-sm border border-input px-4 py-2 hover:bg-accent"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Settlements Table */}
        <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
          <div className="border-b border-border p-4">
            <h3 className="font-heading text-xl font-semibold">All Settlements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-left">
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">ORDER ID</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">AMOUNT</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">PAYMENT STATUS</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">REFERENCE CODE</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">STATUS</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">DATE</th>
                  <th className="p-3 font-mono text-xs font-medium text-muted-foreground">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {enrichedSettlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">
                      {settlement.order_id ? settlement.order_id.substring(0, 12) + '...' : 'N/A'}
                    </td>
                    <td className="p-3 font-mono text-sm font-semibold">
                      {formatCurrency(settlement.amount || 0, 'USD')}
                    </td>
                    <td className="p-3">
                      {settlement.payment ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="font-mono text-xs text-success">Payment Uploaded</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <span className="font-mono text-xs text-warning">No Payment</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono text-sm">
                      {settlement.payment?.reference_code || '-'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-xs font-medium ${
                          settlement.status === 'pending'
                            ? 'bg-warning/10 text-warning'
                            : settlement.status === 'approved' || settlement.status === 'completed'
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {statusIcons[settlement.status]}
                        {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {formatDateTime(settlement.created_at)}
                    </td>
                    <td className="p-3">
                      {settlement.status === 'pending' && settlement.payment && (
                        <button
                          data-testid={`approve-settlement-${settlement.id}`}
                          onClick={() => handleApprove(settlement.id)}
                          className="rounded-sm bg-success px-3 py-1 font-mono text-xs font-medium text-white hover:bg-success/90"
                        >
                          Approve
                        </button>
                      )}
                      {settlement.status === 'pending' && !settlement.payment && (
                        <span className="font-mono text-xs text-muted-foreground">Awaiting Payment</span>
                      )}
                    </td>
                  </tr>
                ))}
                {enrichedSettlements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No settlements available. Accept orders to create settlements.
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

export default MarkCRMPage;
