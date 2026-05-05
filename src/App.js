import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import TradingPage from './pages/TradingPage';
import OrdersPage from './pages/OrdersPage';
import AssetsPage from './pages/AssetsPage';
import PaymentUploadPage from './pages/PaymentUploadPage';
import ChatPage from './pages/ChatPage';
import Sense50Dashboard from './pages/Sense50Dashboard';
import ExchangesPage from './pages/ExchangesPage';
import APITradePage from './pages/APITradePage';
import P2PTradingPage from './pages/P2PTradingPage';
import MarkupConfigPage from './pages/MarkupConfigPage';
import PriceFeedsPage from './pages/PriceFeedsPage';
import WalletsPage from './pages/WalletsPage';
import IntelliTradePage from './pages/IntelliTradePage';
import OrderManagementPage from './pages/OrderManagementPage';
import MarkCRMPage from './pages/MarkCRMPage';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin / Sense50 Routes */}
          <Route path="/admin" element={<Navigate to="/sense50" replace />} />
          <Route
            path="/sense50"
            element={
              <PrivateRoute>
                <Sense50Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/sense50/exchanges"
            element={
              <PrivateRoute>
                <ExchangesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sense50/api-trade"
            element={
              <PrivateRoute>
                <APITradePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sense50/p2p"
            element={
              <PrivateRoute>
                <P2PTradingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sense50/wallets"
            element={
              <PrivateRoute>
                <WalletsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sense50/markup"
            element={
              <PrivateRoute>
                <MarkupConfigPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sense50/prices"
            element={
              <PrivateRoute>
                <PriceFeedsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/markcrm"
            element={
              <PrivateRoute>
                <MarkCRMPage />
              </PrivateRoute>
            }
          />

          {/* Client / IntelliTrade Routes */}
          <Route
            path="/intellitrade"
            element={
              <PrivateRoute>
                <IntelliTradePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/trading"
            element={
              <PrivateRoute>
                <TradingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/intellitrade/orders"
            element={
              <PrivateRoute>
                <OrderManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <PrivateRoute>
                <AssetsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment-upload"
            element={
              <PrivateRoute>
                <PaymentUploadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/trading" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </AuthProvider>
  );
}

export default App;
