import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  User,
  Sparkles,
  Home,
  Sun,
  Moon,
  KeyRound,
  X,
  ArrowRight,
  Activity,
  Layers,
  Code
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
  const { login, loginWithGoogle, forgotPassword, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const currentPreset = IMAGE_PRESETS[selectedImageIndex] || IMAGE_PRESETS[0];

  // Forgot Password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter code & new pass
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // If already logged in, redirect
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPass) => {
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

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await forgotPassword(forgotEmail);
      setForgotSuccess(res.message || 'Reset code sent! Check your email or use the code shown.');
      if (res.resetCode) {
        setResetCode(res.resetCode);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await resetPassword(forgotEmail, resetCode, newPassword);
      setForgotSuccess(res.message || 'Password reset successfully! You can now log in.');
      setTimeout(() => {
        setForgotOpen(false);
        setForgotStep(1);
        setEmail(forgotEmail);
        setPassword('');
      }, 2000);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const inputBase = `w-full rounded-xl border py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 ${
    isDark
      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
  }`;

  return (
    <div
      className={`flex min-h-screen w-full transition-colors duration-300 ${
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
      <div className="flex w-full flex-col justify-between px-6 py-8 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Top Navbar */}
        <div className="w-full flex items-center justify-between mb-6">
          <Link
            to="/"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              isDark
                ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
            title="Return to Home"
          >
            <Home className="w-4 h-4 text-sky-500" />
            <span>Home</span>
          </Link>

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
        <div className="my-auto max-w-md w-full mx-auto">
          {/* Logo / Header */}
          <div className="mb-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sign In to APITester</h1>
            <p className={`mt-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Access your collections, environment variables, and telemetry dashboard
            </p>
          </div>

          {/* Continue with Google Button */}
          <div className="mb-5">
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

          <div className="relative mb-5 text-center">
            <div className={`absolute inset-0 flex items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            </div>
            <span className={`relative px-3 text-xs uppercase font-semibold tracking-wider ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              or sign in with email
            </span>
          </div>

          {/* Quick Demo Login Presets */}
          <div
            className={`p-3 rounded-xl border mb-5 space-y-2 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>1-Click Evaluation Presets</span>
              <span className="text-sky-500 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Instant</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('admin@apitester.io', 'admin123')}
                className="py-2 px-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 transition bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-600 dark:text-purple-300 disabled:opacity-50 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('demo@apitester.io', 'user123')}
                className="py-2 px-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 transition bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-600 dark:text-sky-300 disabled:opacity-50 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Demo User</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                {/* Forgot Password Button */}
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError('');
                    setForgotSuccess('');
                    setForgotStep(1);
                    setForgotOpen(true);
                  }}
                  className="text-xs font-semibold text-sky-500 hover:text-sky-400 cursor-pointer transition hover:underline"
                >
                  Forgot password?
                </button>
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

          {/* Footer Info */}
          <p className="text-center text-xs mt-6 text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-sky-500 hover:text-sky-400">
              Create an account
            </Link>
          </p>

          <div className="text-center mt-3">
            <Link
              to="/app"
              className={`text-[11px] underline ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Continue without signing in (Guest Mode) &rarr;
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="text-center text-[11px] text-slate-500 pt-4">
          &copy; {new Date().getFullYear()} APITester Pro. All rights reserved.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Reset Password</h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {forgotStep === 1 ? 'Step 1: Get verification code' : 'Step 2: Enter code & new password'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setForgotOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {forgotError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotSuccess && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Step 1: Enter email */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestResetCode} className="mt-4 space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Enter your account email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputBase} px-3.5 py-2.5 text-xs`}
                  />
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    We will generate a 6-digit verification code to reset your password.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {forgotLoading ? 'Sending...' : 'Get Verification Code'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Enter reset code & new password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="e.g. 849201"
                    className={`${inputBase} px-3.5 py-2.5 text-xs tracking-widest font-mono font-bold text-center`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className={`${inputBase} px-3.5 py-2.5 text-xs`}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-sky-500 hover:underline cursor-pointer"
                  >
                    &larr; Resend code
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 cursor-pointer"
                    >
                      {forgotLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}