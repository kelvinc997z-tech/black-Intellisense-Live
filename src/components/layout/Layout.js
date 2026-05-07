import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Activity, 
  Wallet, 
  Settings, 
  TrendingUp, 
  MessageSquare, 
  Receipt, 
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'SENSE 50',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/sense50' },
        { name: 'API Connections', icon: Activity, path: '/sense50/exchanges' },
        { name: 'API Trade', icon: TrendingUp, path: '/sense50/api-trade' },
        { name: 'P2P Trading', icon: MessageSquare, path: '/sense50/p2p' },
        { name: 'Wallets', icon: Wallet, path: '/sense50/wallets' },
        { name: 'Markup Config', icon: Settings, path: '/sense50/markup' },
        { name: 'Price Feeds', icon: TrendingUp, path: '/sense50/prices' },
      ],
    },
    {
      title: 'INTELLITRADE',
      items: [
        { name: 'Trading', icon: TrendingUp, path: '/intellitrade' },
        { name: 'Order Management', icon: Receipt, path: '/intellitrade/orders' },
        { name: 'Chat', icon: MessageSquare, path: '/intellitrade/chat' },
        { name: 'Verify zkTLS', icon: ShieldCheck, path: '/verify' },
      ],
    },
    {
      title: 'MARKCRM',
      items: [
        { name: 'Settlements', icon: Receipt, path: '/markcrm' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } glass-panel`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="Black IntelliSense" className="h-10 w-auto" />
            </div>
            <button data-testid="sidebar-close-btn" onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8">
            {menuItems.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="px-4 mb-3 font-mono text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        data-testid={`nav-${item.name.toLowerCase().replace(/ /g, '-')}`}
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                        )}
                        <item.icon className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'group-hover:text-white'}`} />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-white/10 p-4">
            <div className="mb-4 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md transition-all hover:border-primary/30">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Session ID</p>
              <p className="font-mono text-xs font-semibold text-white truncate">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">{user?.role || 'Admin'}</p>
              </div>
            </div>
            <button
              data-testid="logout-btn"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-400 transition-all hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-black/40 px-6 backdrop-blur-md">
          <button data-testid="sidebar-open-btn" onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-8rem)] p-4 md:p-6">{children}</main>
        
        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 px-6 py-4">
          <div className="flex items-center justify-end">
            <a
              href="https://blackintellisense.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-primary uppercase tracking-widest"
            >
              <span>Institutional Grade Infrastructure</span>
              <span className="text-primary">Black IntelliSense</span>
            </a>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
