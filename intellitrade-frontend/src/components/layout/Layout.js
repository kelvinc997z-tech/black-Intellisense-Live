import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
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
      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="Black IntelliSense" className="h-10 w-auto" />
            </div>
            <button data-testid="sidebar-close-btn" onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-6">
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="mb-2 px-3 font-mono text-xs font-bold tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.path}
                      data-testid={`nav-${item.name.toLowerCase().replace(/ /g, '-')}`}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4">
            <div className="mb-3 rounded-sm bg-secondary/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
              <p className="font-mono text-sm font-semibold text-foreground">{user?.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <button
              data-testid="logout-btn"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
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
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
          <button data-testid="sidebar-open-btn" onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="font-mono text-sm text-muted-foreground">
              {new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-8rem)] p-4 md:p-6">{children}</main>
        
        {/* Footer */}
        <footer className="border-t border-border bg-card/20 px-6 py-4">
          <div className="flex items-center justify-end">
            <a
              href="https://blackintellisense.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <span className="font-medium">Made by Black IntelliSense</span>
            </a>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
