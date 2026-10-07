import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  LogIn,
  Shield,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // If already logged in, redirect to app
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError('');
    setLoading(true);

    try {
      await login(quickEmail, quickPass);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Bar for Back & Theme Toggle */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link
          to="/"
          className={`flex items-center gap-1.5 text-xs font-medium transition ${
            isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-lg border transition ${
            isDark
              ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
              : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-100 shadow-xs'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Card */}
      <div
        className={`w-full max-w-md rounded-2xl border p-8 shadow-2xl transition-colors duration-300 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 shadow-black/50'
            : 'bg-white border-slate-200 shadow-xl'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-500/25">
            <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Sign in to access your API collections, history, and test environments
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div
          className={`p-3 rounded-xl border mb-6 space-y-2 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Quick 1-Click Evaluation Login</span>
            <span className="text-sky-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Instant</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@apitester.io', 'admin123')}
              className="py-2 px-2.5 rounded-lg border font-medium text-xs flex items-center justify-center gap-1.5 transition bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-600 dark:text-purple-300 disabled:opacity-50"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('demo@apitester.io', 'user123')}
              className="py-2 px-2.5 rounded-lg border font-medium text-xs flex items-center justify-center gap-1.5 transition bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-600 dark:text-sky-300 disabled:opacity-50"
            >
              <User className="w-3.5 h-3.5" />
              <span>Demo User</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className={`block font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={`w-full rounded-lg px-3.5 py-2.5 border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className={`block font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full rounded-lg pl-3.5 pr-10 py-2.5 border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition disabled:opacity-50 shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block animate-pulse">Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className={`mt-6 pt-6 border-t text-center text-xs ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-500 hover:text-sky-400 font-semibold ml-1">
              Create an account
            </Link>
          </p>

          <div className="mt-3">
            <Link
              to="/app"
              className={`text-[11px] underline ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Continue without signing in (Guest Mode) &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
