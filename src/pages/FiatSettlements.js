import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import { 
  CheckCircle, XCircle, Search, 
  ExternalLink, User
} from 'lucide-react';
import { toast } from 'sonner';

const FiatSettlements = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/fiat/requests');
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, notes = '') => {
    setUpdating(id);
    try {
      await api.patch(`/fiat/requests/${id}`, { status, admin_notes: notes });
      toast.success(`Request ${status === 'approved' ? 'approved' : 'declined'} successfully.`);
      fetchRequests();
    } catch (e) {
      toast.error('Failed to update request status.');
    } finally {
      setUpdating(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const matchesSearch = (req.user_id || '').toLowerCase().includes(search.toLowerCase()) || 
                         (req.currency || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center bg-black text-white">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a0b] text-slate-200 p-6 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Fiat <span className="text-primary">Settlements</span>
              </h1>
              <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">
                Admin Approval & Disbursement Control
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search user/currency..." 
                  className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-primary outline-none transition-all w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      filter === f ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User / ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proof</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-sm">
                        No settlement requests found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-full text-slate-400">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{req.user_id}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{req.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                            req.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {req.type === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-mono font-bold text-white">{req.amount}</div>
                          <div className="text-[10px] text-slate-500">{req.currency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                            req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                            req.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {req.proof_hash ? (
                            <button className="flex items-center gap-1 text-primary text-[10px] font-bold hover:underline">
                              <ExternalLink className="h-3 w-3" />
                              View Proof
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600">No Proof</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {req.status === 'pending' && (
                              <React.Fragment>
                                <button 
                                  onClick={() => handleUpdateStatus(req.id, 'rejected', 'Invalid proof or incorrect amount')}
                                  disabled={updating === req.id}
                                  className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                                  title="Decline Request"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(req.id, 'approved', 'Verified via zkTLS and balance check')}
                                  disabled={updating === req.id}
                                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                  title="Approve Request"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              </React.Fragment>
                            )}
                            {updating === req.id && (
                              <div className="h-8 w-8 flex items-center justify-center">
                                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FiatSettlements;
