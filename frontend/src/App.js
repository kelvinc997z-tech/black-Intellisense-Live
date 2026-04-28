import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Sense50Dashboard from './pages/Sense50Dashboard';
import ExchangesPage from './pages/ExchangesPage';
import APITradePage from './pages/APITradePage';
import P2PTradingPage from './pages/P2PTradingPage';
import MarkupConfigPage from './pages/MarkupConfigPage';
import PriceFeedsPage from './pages/PriceFeedsPage';
import WalletsPage from './pages/WalletsPage';
import IntelliTradePage from './pages/IntelliTradePage';
import OrderManagementPage from './pages/OrderManagementPage';
import ChatPage from './pages/ChatPage';
import MarkCRMPage from './pages/MarkCRMPage';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
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
            path="/intellitrade"
            element={
              <PrivateRoute>
                <IntelliTradePage />
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
            path="/intellitrade/chat"
            element={
              <PrivateRoute>
                <ChatPage />
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
          <Route path="/" element={<Navigate to="/sense50" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </AuthProvider>
  );
}

export default App;
