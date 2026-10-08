import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';
import {
  LogIn,
  UserPlus,
  X,
  Shield,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, verifyLogin2FA, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 2FA Challenge state
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorDemoCode, setTwoFactorDemoCode] = useState('');
  const [twoFactorEmail, setTwoFactorEmail] = useState('');

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: 'Weak', percent: 25, color: 'bg-rose-500', text: 'text-rose-400' };
    if (score <= 3) return { label: 'Moderate', percent: 65, color: 'bg-amber-500', text: 'text-amber-400' };
    return { label: 'Strong', percent: 100, color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await register(name, email, password);
        onClose();
      } else {
        const res = await login(email, password);
        if (res && res.requires2FA) {
          setTwoFactorRequired(true);
          setTwoFactorEmail(res.email);
          setTwoFactorDemoCode(res.demoCode || '');
          return;
        }
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyLogin2FA(twoFactorEmail, twoFactorCode);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid 2FA verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onClose();
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
      const res = await login(quickEmail, quickPass);
      if (res && res.requires2FA) {
        setTwoFactorRequired(true);
        setTwoFactorEmail(res.email);
        setTwoFactorDemoCode(res.demoCode || '');
        return;
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {twoFactorRequired ? (
              <Shield className="w-5 h-5 text-purple-400" />
            ) : isRegister ? (
              <UserPlus className="w-5 h-5 text-sky-400" />
            ) : (
              <LogIn className="w-5 h-5 text-sky-400" />
            )}
            <h3 className="text-sm font-bold text-slate-100">
              {twoFactorRequired
                ? 'Two-Factor Authentication'
                : isRegister
                ? 'Create an Account'
                : 'Sign In to APITester'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {twoFactorRequired ? (
            /* 2FA Challenge View */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-100">Enter Security Code</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter the 6-digit verification code associated with{' '}
                  <strong className="text-purple-300 font-mono">{twoFactorEmail}</strong>.
                </p>

                {twoFactorDemoCode && (
                  <button
                    type="button"
                    onClick={() => setTwoFactorCode(twoFactorDemoCode)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-[10px] hover:bg-purple-500/30 transition cursor-pointer"
                  >
                    <span>Auto-fill code: <strong>{twoFactorDemoCode}</strong></span>
                  </button>
                )}
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-center">
                    6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length < 6}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-semibold transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorRequired(false);
                    setError('');
                  }}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 transition py-1 block cursor-pointer"
                >
                  &larr; Back to Email & Password
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-xs active:scale-95"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="relative text-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-2 bg-slate-900 text-[10px] text-slate-500 uppercase tracking-wider">
                  or continue below
                </span>
              </div>

              {/* Quick Login Presets for testing */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Quick 1-Click Login</span>
                  <span className="text-sky-400 flex items-center gap-1 font-mono normal-case">
                    <Sparkles className="w-3 h-3" /> Demo
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@apitester.io', 'admin123')}
                    className="py-1.5 px-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/60 text-purple-300 rounded-lg font-medium flex items-center justify-center gap-1.5 transition text-[11px] cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('demo@apitester.io', 'user123')}
                    className="py-1.5 px-2 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-700/60 text-sky-300 rounded-lg font-medium flex items-center justify-center gap-1.5 transition text-[11px] cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>Demo User</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {isRegister && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator for Registration */}
                  {isRegister && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Strength</span>
                        <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-semibold transition mt-2 shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="text-slate-400 hover:text-sky-400 text-[11px] transition cursor-pointer"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
