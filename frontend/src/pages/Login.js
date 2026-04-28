import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/sense50');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1757970204229-a02cb2ce0af6?crop=entropy&cs=srgb&fm=jpg&q=85)' }}
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="rounded-sm border border-border bg-card/40 backdrop-blur-md p-8 shadow-xl glow-effect">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img src="/assets/logo.png" alt="Black IntelliSense" className="h-20 w-auto" />
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Black IntelliSense
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The Intelligence Between Liquidity and Markets
            </p>
          </div>

          {/* Login Form */}
          <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                data-testid="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-sm border border-input bg-slate-950/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-primary px-4 py-3 font-medium tracking-wide text-primary-foreground shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Authorized Personnel Only</p>
            <p className="mt-1">Contact admin for account registration</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-6 right-6">
          <a
            href="https://blackintellisense.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground/60 transition-colors hover:text-primary"
          >
            <span className="font-medium">Made by Black IntelliSense</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
