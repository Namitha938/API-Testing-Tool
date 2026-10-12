import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/GoogleIcon';
import AuthBackground from '../components/AuthBackground';
import AuthLeftPanel from '../components/AuthLeftPanel';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';

export default function LoginPage() {
  const { login, verifyLogin2FA, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => location.state?.prefilledEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA Challenge state
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [twoFactorTicket, setTwoFactorTicket] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  useEffect(() => {
    if (location.state?.prefilledEmail) {
      setEmail(location.state.prefilledEmail);
    }
  }, [location.state?.prefilledEmail]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  const handleAuthSuccess = (rawUserData) => {
    const userObj = rawUserData?.user || rawUserData;
    if (userObj?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/app');
    }
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
      const cleanCode = twoFactorCode.trim().replace(/[-\s]/g, '');
      const userData = await verifyLogin2FA(
        twoFactorEmail,
        twoFactorTicket,
        cleanCode,
        useRecoveryCode
      );
      handleAuthSuccess(userData);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const userData = await loginWithGoogle();
      handleAuthSuccess(userData);
    } catch (err) {
      setError(err.message || 'Google sign-in was cancelled.');
    } finally {
      setGoogleLoading(false);
    }
  };


  return (
    <div
      className="min-h-screen flex flex-row relative overflow-x-hidden select-none transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Blue Theme Mesh Gradient & Faint Dot Grid Background */}
      <AuthBackground />

      {/* Theme Toggle Button Top Right: 24px padding (top-6 right-6), white circular bg, 1px border */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border flex items-center justify-center shadow-xs hover:scale-105 transition cursor-pointer"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-heading)',
          }}
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 sm:p-10 max-w-7xl mx-auto w-full z-10">
        {/* Left Side: Brand Logo, Isometric Glass Dashboard, Feature Highlights */}
        <AuthLeftPanel subtitle="ENTERPRISE API STUDIO" />

        {/* Centered-Right: Form Card (Below 1024px centered, below 480px no shadow, full-width padding) */}
        <div className="w-full max-w-md my-auto">
          <div
            className="rounded-2xl border p-6 sm:p-8 lg:p-10 shadow-[0_10px_30px_rgba(11,27,51,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.40)] max-[480px]:shadow-none max-[480px]:border-0 max-[480px]:p-4 transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Header: Logo (mobile) and Welcome Back */}
            <div className="mb-6">
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--accent-green)' }}
                >
                  <div className="w-3.5 h-3.5 rounded-xs border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-xs" />
                  </div>
                </div>
                <span
                  className="font-bold text-lg"
                  style={{ color: 'var(--text-heading)' }}
                >
                  PulseAPI
                </span>
              </div>

              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--text-heading)' }}
              >
                {twoFactorRequired ? 'Two-Factor Authentication' : 'Welcome back'}
              </h1>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--text-body)' }}
              >
                {twoFactorRequired
                  ? `Enter the security verification code for ${twoFactorEmail}`
                  : 'Sign in to access your API collections and developer workbench'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}


            {/* 2FA Form Challenge */}
            {twoFactorRequired ? (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-heading)' }}
                    >
                      {useRecoveryCode ? 'Backup Recovery Code' : '6-Digit Security Code'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setUseRecoveryCode(!useRecoveryCode);
                        setTwoFactorCode('');
                        setError('');
                      }}
                      className="text-[11px] hover:underline cursor-pointer"
                      style={{ color: 'var(--primary)' }}
                    >
                      {useRecoveryCode ? 'Use Authenticator App' : 'Use Recovery Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={useRecoveryCode ? 10 : 6}
                    autoFocus
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(useRecoveryCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ''))}
                    placeholder={useRecoveryCode ? 'ABCD-1234' : '000000'}
                    className="w-full text-center text-xl font-mono tracking-widest py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-heading)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (useRecoveryCode ? twoFactorCode.trim().length < 8 : twoFactorCode.length < 6)}
                  className="w-full py-2.5 rounded-lg text-white font-semibold text-xs transition cursor-pointer shadow-2xs hover:opacity-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {loading ? 'Verifying 2FA...' : 'Verify & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorRequired(false);
                    setTwoFactorCode('');
                    setError('');
                  }}
                  className="w-full text-center text-xs hover:underline cursor-pointer pt-1"
                  style={{ color: 'var(--text-body)' }}
                >
                  &larr; Back to Email & Password
                </button>
              </form>
            ) : (
              /* Standard Email + Password Login Form */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border text-xs placeholder-slate-400 focus:outline-none focus:ring-2 transition"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-heading)',
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-heading)' }}
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      state={{ prefilledEmail: email }}
                      className="text-xs font-semibold hover:underline cursor-pointer"
                      style={{ color: 'var(--primary)' }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-xs placeholder-slate-400 focus:outline-none focus:ring-2 transition"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-heading)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Full-width blue primary Continue button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-white font-semibold text-xs transition cursor-pointer shadow-2xs mt-2 hover:opacity-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {loading ? 'Authenticating...' : 'Continue'}
                </button>
              </form>
            )}

            {/* Don't have an account? Sign up */}
            <p
              className="text-center text-xs mt-4"
              style={{ color: 'var(--text-body)' }}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Sign up
              </Link>
            </p>

            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
              <span
                className="px-3 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-body)' }}
              >
                OR
              </span>
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
            </div>

            {/* Social Login Button */}
            <div>
              {/* Continue with Google button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-2.5 px-3 rounded-lg border text-xs font-semibold transition flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs hover:opacity-95"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-heading)',
                }}
              >
                <GoogleIcon className="w-4 h-4" />
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}