import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AssetsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets/');
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const toggleVisibility = async (assetId, currentVisibility) => {
    try {
      await api.patch(`/assets/${assetId}/visibility`, {
        is_visible: !currentVisibility
      });
      toast.success(`Asset ${!currentVisibility ? 'shown' : 'hidden'} for trading`);
      fetchAssets();
    } catch (error) {
      toast.error('Failed to update asset visibility');
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
              <h1 className="font-heading text-xl font-bold">My Assets</h1>
              <p className="text-xs text-muted-foreground">Control asset visibility</p>
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
            <p className="text-sm text-foreground">
              <strong>Asset Visibility Control:</strong> Toggle visibility to show or hide assets from trading.
              Hidden assets won't be available for counterparties to trade.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border p-4">
              <h3 className="font-heading text-xl font-semibold">Asset Portfolio</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left">
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">ASSET</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">BALANCE</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">STATUS</th>
                    <th className="p-3 font-mono text-xs font-medium text-muted-foreground">VISIBILITY</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3">
                        <div>
                          <p className="font-mono text-sm font-semibold">{asset.symbol}</p>
                          <p className="text-xs text-muted-foreground">{asset.name}</p>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm font-semibold">
                        {asset.balance.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-xs font-medium ${
                            asset.is_visible
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <div className={`h-1.5 w-1.5 rounded-full ${asset.is_visible ? 'bg-success' : 'bg-muted-foreground'}`} />
                          {asset.is_visible ? 'Tradeable' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleVisibility(asset.id, asset.is_visible)}
                          className={`flex items-center gap-2 rounded-sm px-3 py-1.5 font-medium transition-colors ${
                            asset.is_visible
                              ? 'bg-warning/10 text-warning hover:bg-warning/20'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {asset.is_visible ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Show
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        No assets in portfolio
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

export default AssetsPage;
