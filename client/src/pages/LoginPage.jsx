import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/GoogleIcon';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Shield,
  ShieldCheck,
  User,
  Sparkles,
  Home,
  Sun,
  Moon,
} from 'lucide-react';

const IMAGE_PRESETS = [
  {
    id: 'code-ide',
    label: 'Code Studio',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop',
    tagline: 'Build, Test & Monitor APIs Fast'
  },
  {
    id: 'developer-workspace',
    label: 'Dev Workbench',
    url: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=1400&auto=format&fit=crop',
    tagline: 'Collaborative Endpoints & Collections'
  },
  {
    id: 'cloud-mesh',
    label: 'Cloud Telemetry',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1400&auto=format&fit=crop',
    tagline: 'Real-time Latency & Performance Audits'
  }
];

export default function LoginPage() {
  const { login, verifyLogin2FA, loginWithGoogle, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => location.state?.prefilledEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const currentPreset = IMAGE_PRESETS[selectedImageIndex] || IMAGE_PRESETS[0];

  // 2FA Challenge state
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [twoFactorTicket, setTwoFactorTicket] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  // Set email if redirected with prefilledEmail
  useEffect(() => {
    if (location.state?.prefilledEmail) {
      setEmail(location.state.prefilledEmail);
    }
  }, [location.state?.prefilledEmail]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  const handleAuthSuccess = () => {
    navigate('/app');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res && res.requires2FA) {
        setTwoFactorRequired(true);
        setTwoFactorEmail(res.email);
        setTwoFactorTicket(res.twoFactorTicket || '');
        setTwoFactorCode('');
        setUseRecoveryCode(false);
        return;
      }
      handleAuthSuccess(res?.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await verifyLogin2FA({
        email: twoFactorEmail,
        code: twoFactorCode,
        twoFactorTicket,
      });
      handleAuthSuccess(res?.user);
    } catch (err) {
      setError(err.message || 'Invalid 2FA verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle();
      handleAuthSuccess(res?.user);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };



  const inputBase = `w-full rounded-xl border py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 ${
    isDark
      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
  }`;

  return (
    <div
  className={`min-h-screen w-full flex transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* LEFT - IMAGE (50%) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 lg:flex">
        <img
          key={currentPreset.url}
          src={currentPreset.url}
          alt={currentPreset.label}
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700"
        />
        {/* Subtle dark backdrop & grid */}
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" />

        {/* Top Floating Badge & Preset Switcher */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-sky-300 text-xs font-semibold border border-slate-700/60 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>APITester Studio</span>
          </div>

          {/* Quick Image Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg">
            {IMAGE_PRESETS.map((preset, idx) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                  selectedImageIndex === idx
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={`Switch image to ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center Floating API Console Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-md rounded-2xl bg-slate-900/90 border border-slate-700/70 p-5 shadow-2xl backdrop-blur-md z-10 transition-transform duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-1">api.workbench.live</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              200 OK • 18ms
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 font-mono text-xs bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-slate-200">
            <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px]">GET</span>
            <span className="truncate text-slate-300 font-mono text-[11px]">https://api.tester.io/v1/auth/session</span>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-950/70 font-mono text-[11px] text-sky-300/90 leading-relaxed border border-slate-800/80">
            <p className="text-slate-500">{'{'}</p>
            <p className="pl-4"><span className="text-purple-300">"status"</span>: <span className="text-emerald-300">"authenticated"</span>,</p>
            <p className="pl-4"><span className="text-purple-300">"cloudRegion"</span>: <span className="text-sky-300">"us-east-cluster"</span>,</p>
            <p className="pl-4"><span className="text-purple-300">"realtimeProxy"</span>: <span className="text-amber-300">true</span>,</p>
            <p className="pl-4"><span className="text-purple-300">"responseTimeMs"</span>: <span className="text-emerald-400 font-bold">18</span></p>
            <p className="text-slate-500">{'}'}</p>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Zero Config CORS
            </span>
            <span className="text-slate-500 font-mono">Payload: 1.4 KB</span>
          </div>
        </div>

        {/* Bottom Headline */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-10 pt-28 z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentPreset.tagline}
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-300">
            Organize nested collections, run test suites, proxy requests, and monitor latency metrics in real time.
          </p>
        </div>
      </div>

      {/* RIGHT - LOGIN FORM (50%) */}
      <div className="flex min-h-screen w-full flex-col px-6 py-4 sm:px-10 lg:w-1/2 lg:px-12 xl:px-16">
        {/* Top Navbar */}
        <div className="w-full flex items-center justify-between mb-3">
          

          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition ${
              isDark
                ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-100 shadow-xs'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Content */}
        <div className="max-w-md w-full mx-auto">
          {/* Logo / Header */}
          <div className="mb-6 flex items-center gap-3">
  {/* Logo */}
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
    <Lock size={20} />
  </div>

  {/* Text group - This wrapper is MOST IMPORTANT */}
  <div className="flex flex-col text-left">
    <h1 className="text-2xl font-bold leading-tight">Sign In to APITester</h1>
    <p className={`text-xs leading-snug ${isDark? 'text-slate-400' : 'text-slate-500'}`}>
      Access your collections, environment variables, and telemetry dashboard
    </p>
  </div>
</div>

          {/* Active Session Notice if logged in */}
          {user && (
            <div
              className={`p-3.5 rounded-xl border mb-3 space-y-2.5 ${
                isDark ? 'bg-purple-950/30 border-purple-500/40' : 'bg-purple-50 border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-100">
                    Signed in as {user.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-300 uppercase px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                  {user.role || 'user'}
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Active account: <strong className="text-purple-300 font-mono">{user.email}</strong>
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate('/app')}
                  className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-sky-600/20"
                >
                  <span>Open API Studio Workbench &rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem('guestMode');
                    logout();
                  }}
                  className="py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Continue with Google Button */}
          <div className="mb-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className={`w-full py-3 px-4 rounded-xl border font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 hover:border-sky-500/50'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-sky-500/50'
              }`}
            >
              <GoogleIcon className="w-5 h-5" />
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="relative mb-3 text-center">
            <div className={`absolute inset-0 flex items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            </div>
            <span className={`relative px-3 text-xs uppercase font-semibold tracking-wider ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              or sign in with email
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {twoFactorRequired ? (
            /* 2FA Challenge Verification Step */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-100">Two-Factor Authentication</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {useRecoveryCode ? (
                    <>
                      Enter one of your saved 8-character backup recovery codes for <strong className="text-purple-400 font-mono">{twoFactorEmail}</strong>.
                    </>
                  ) : (
                    <>
                      Open your authenticator app (<strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong>) and enter the live 6-digit security code for <strong className="text-purple-400 font-mono">{twoFactorEmail}</strong>.
                    </>
                  )}
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {useRecoveryCode ? 'Backup Recovery Code' : '6-Digit Security Code'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setUseRecoveryCode(!useRecoveryCode);
                        setTwoFactorCode('');
                        setError('');
                      }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                    >
                      {useRecoveryCode ? 'Use Authenticator App' : 'Use Recovery Code'}
                    </button>
                  </div>

                  {useRecoveryCode ? (
                    <input
                      type="text"
                      maxLength={10}
                      autoFocus
                      required
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCD-1234"
                      className="w-full text-center tracking-[0.25em] text-xl font-mono py-3 rounded-xl bg-slate-900 border border-purple-500/40 text-purple-200 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 uppercase"
                    />
                  ) : (
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl bg-slate-900 border border-purple-500/40 text-purple-200 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || (useRecoveryCode ? twoFactorCode.trim().length < 8 : twoFactorCode.length < 6)}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>{loading ? 'Verifying 2FA Code...' : 'Verify & Complete Sign In'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorRequired(false);
                    setTwoFactorCode('');
                    setError('');
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition py-1 block cursor-pointer"
                >
                  &larr; Back to Email & Password
                </button>
              </form>
            </div>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className={`mb-1.5 block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputBase} pl-10 pr-4`}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Password
                  </label>
                  {/* Forgot Password Link */}
                  <Link
                    to="/forgot-password"
                    state={{ prefilledEmail: email }}
                    className="text-xs font-semibold text-sky-500 hover:text-sky-400 cursor-pointer transition hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputBase} pl-10 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block animate-pulse">Authenticating...</span>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Info */}
          <p className="text-center text-xs mt-3 text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-sky-500 hover:text-sky-400">
              Create an account
            </Link>
          </p>

          
        </div>
      </div>
    </div>
  );
}