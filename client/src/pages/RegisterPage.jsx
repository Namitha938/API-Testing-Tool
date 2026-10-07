import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/GoogleIcon';
import {
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Home,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

// PASTE YOUR IMAGE URL HERE (leave empty to show the built-in illustration)
const REGISTER_IMAGE = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop';

function Illustration() {
  return (
    <svg viewBox="0 0 480 360" className="h-full w-full" role="img" aria-label="Create account illustration">
      <rect x="40" y="40" width="400" height="280" rx="24" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />
      <rect x="40" y="40" width="400" height="48" rx="24" fill="#ede9fe" />
      <rect x="40" y="64" width="400" height="24" fill="#ede9fe" />
      <circle cx="72" cy="64" r="6" fill="#c4b5fd" />
      <circle cx="92" cy="64" r="6" fill="#c4b5fd" />
      <circle cx="112" cy="64" r="6" fill="#c4b5fd" />
      <rect x="72" y="116" width="150" height="14" rx="7" fill="#ddd6fe" />
      <rect x="72" y="144" width="230" height="10" rx="5" fill="#ede9fe" />
      <rect x="72" y="166" width="190" height="10" rx="5" fill="#ede9fe" />
      <rect x="72" y="204" width="110" height="40" rx="12" fill="#7c3aed" />
      <rect x="196" y="204" width="110" height="40" rx="12" fill="#ede9fe" />
      <rect x="72" y="266" width="320" height="10" rx="5" fill="#ede9fe" />
      <circle cx="372" cy="140" r="56" fill="#7c3aed" />
      <circle cx="372" cy="128" r="14" fill="#ffffff" />
      <path d="M346 166a26 22 0 0152 0z" fill="#ffffff" />
    </svg>
  );
}

export default function RegisterPage() {
  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const labelCls = `block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const inputCls = `w-full rounded-xl px-4 py-3 border text-sm outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 ${
    isDark
      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  }`;

  return (
    <div
      className={`flex min-h-screen w-full transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* LEFT - IMAGE (50%) */}
      <div
        className={`relative hidden w-1/2 overflow-hidden lg:flex ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900'
            : 'bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50'
        }`}
      >
        {REGISTER_IMAGE ? (
          <>
            {/* full half-page image */}
            <img
              src={REGISTER_IMAGE}
              alt="Create account illustration"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" />

            {/* Top Badge */}
            <div className="absolute top-6 left-6 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-sky-300 text-xs font-semibold border border-slate-700/60 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>APITester Pro</span>
              </div>
            </div>

            {/* Center Floating Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-md rounded-2xl bg-slate-900/90 border border-slate-700/70 p-5 shadow-2xl backdrop-blur-md z-10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-1">api.workbench.live</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  201 Created • 22ms
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 font-mono text-xs bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-slate-200">
                <span className="text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-[10px]">POST</span>
                <span className="truncate text-slate-300 font-mono text-[11px]">https://api.tester.io/v1/workspaces/init</span>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-slate-950/70 font-mono text-[11px] text-sky-300/90 leading-relaxed border border-slate-800/80">
                <p className="text-slate-500">{'{'}</p>
                <p className="pl-4"><span className="text-purple-300">"workspace"</span>: <span className="text-emerald-300">"Production"</span>,</p>
                <p className="pl-4"><span className="text-purple-300">"collections"</span>: <span className="text-amber-300">12</span>,</p>
                <p className="pl-4"><span className="text-purple-300">"encryptedSync"</span>: <span className="text-sky-300">true</span></p>
                <p className="text-slate-500">{'}'}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Ready in Seconds
                </span>
                <span className="text-slate-500 font-mono">Sync Enabled</span>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-10 pt-28 z-10">
              <h2 className="text-2xl font-bold text-white">Start Testing in Minutes</h2>
              <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-300">
                Create your free account and launch automated collection test suites today.
              </p>
            </div>
          </>
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center p-12">
            <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-violet-400/25 blur-[90px]"></div>
            <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-violet-500/20 blur-[90px]"></div>

            <div className="relative flex h-[60%] w-[85%] items-center justify-center">
              <Illustration />
            </div>

            <div className="relative mt-8 max-w-md text-center">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Start testing in minutes
              </h2>
              <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Create your free account and send your first request today.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT - REGISTER FORM (50%) */}
      <div className="flex w-full flex-col px-6 py-6 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Top Bar for Back & Theme Toggle */}
        <div className="w-full flex items-center justify-between">
          <Link
            to="/"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              isDark
                ? 'border-slate-800 bg-slate-900 text-white hover:bg-slate-800'
                : 'border-slate-800 bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title="Return to Home"
          >
            <Home className="w-4 h-4 text-white" />
            <span>Home</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition ${
              isDark
                ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-violet-600 hover:bg-slate-100'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8 w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-violet-500/30">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
            <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Start testing endpoints, building collections, and automating tests
            </p>
          </div>

          {/* Continue with Google */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className={`w-full py-3 px-4 rounded-xl border font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 hover:border-violet-500/50'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-violet-500/50'
              }`}
            >
              <GoogleIcon className="w-5 h-5" />
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="relative mb-5 text-center">
            <div className={`absolute inset-0 flex items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            </div>
            <span className={`relative px-3 text-xs uppercase font-semibold tracking-wider ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-white text-slate-400'}`}>
              or register with email
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className={`mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs flex items-center gap-2 ${
                isDark ? 'text-rose-400' : 'text-rose-600'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelCls}>Full Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Alex Johnson"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelCls}>Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="alex@company.com"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelCls}>Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/40"
            >
              {loading ? (
                <span className="inline-block animate-pulse">Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className={`mt-8 pt-6 border-t text-center text-sm ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Already have an account?{' '}
              <Link to="/login" className="text-violet-500 hover:text-violet-400 font-semibold ml-1">
                Sign in
              </Link>
            </p>

            <div className="mt-3">
              <Link
                to="/app"
                className={`text-xs underline ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Continue without signing in (Guest Mode) &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}