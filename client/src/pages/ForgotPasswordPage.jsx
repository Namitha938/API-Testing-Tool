import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetCode, resetPassword } = useAuth();

  // Theme state synced with app
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  // Flow steps: 1 = Email, 2 = OTP Code, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Form Fields
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetTicket, setResetTicket] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devCodeHelper, setDevCodeHelper] = useState('');

  // Resend Cooldown Timer (in seconds)
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(cleanEmail);
      setSuccessMsg(res.message || 'Verification code sent. Check your inbox and spam folder.');
      if (res.devCode) {
        setDevCodeHelper(res.devCode);
      }
      setCooldown(res.cooldown || 60);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      setSuccessMsg('A new verification code has been dispatched to your email.');
      if (res.devCode) {
        setDevCodeHelper(res.devCode);
      }
      setCooldown(res.cooldown || 60);
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setError('Please enter the 6-digit numeric verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyResetCode(email.trim().toLowerCase(), cleanCode);
      setResetTicket(res.resetTicket || '');
      setSuccessMsg('Verification successful! You can now create your new password.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter both fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email.trim().toLowerCase(), code.trim(), newPassword, resetTicket);
      setSuccessMsg(res.message || 'Password has been reset successfully!');
      setStep(4);
      // Auto-redirect to sign in after 3.5 seconds
      setTimeout(() => {
        navigate('/login', { state: { prefilledEmail: email } });
      }, 3500);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please request a new code.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, text: 'Weak', color: 'bg-rose-500 text-rose-500' };
    if (score <= 4) return { score: 2, text: 'Good', color: 'bg-amber-500 text-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500 text-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

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
      {/* LEFT - BRANDING / VISUAL HERO (Desktop 50%) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 lg:flex flex-col justify-between p-12 select-none">
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/25 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight block">APITester Studio</span>
              <span className="text-[10px] text-sky-300 font-mono tracking-widest uppercase font-semibold">
                Enterprise API Platform
              </span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-300 flex items-center gap-1.5 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Password Recovery</span>
          </div>
        </div>

        {/* Center Card */}
        <div className="relative z-10 max-w-md mx-auto my-auto p-6 rounded-2xl bg-slate-900/85 border border-slate-700/60 shadow-2xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Secure OTP Account Recovery</h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            APITester uses short-lived, cryptographically hashed One-Time Passwords (OTPs) delivered directly to your inbox.
            Your credentials are never stored in plaintext and passwords are encrypted with bcrypt.
          </p>

          <div className="space-y-3 border-t border-slate-800 pt-4 text-xs font-medium">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>10-Minute Expiring One-Time Verification Code</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>Brute-force protection & single-use invalidation</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>Instant sync with your API collections and test suites</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-[11px] text-slate-400 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} APITester Studio Inc.</span>
          <span className="font-mono">Security Protocol v2.4</span>
        </div>
      </div>

      {/* RIGHT - FORGOT PASSWORD FORM (Mobile full, Desktop 50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Top Header: Logo on mobile & Theme Switcher */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/login" className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition shadow-xs cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 1
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-500/30'
                    : step > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </span>
              <span className={`text-xs font-semibold ${step === 1 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500'}`}>
                Email
              </span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${step > 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 2
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-500/30'
                    : step > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {step > 2 ? '✓' : '2'}
              </span>
              <span className={`text-xs font-semibold ${step === 2 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500'}`}>
                Verify OTP
              </span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${step > 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 3
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-500/30'
                    : step === 4
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {step === 4 ? '✓' : '3'}
              </span>
              <span className={`text-xs font-semibold ${step >= 3 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500'}`}>
                Reset
              </span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Create New Password'}
              {step === 4 && 'Password Reset Complete!'}
            </h1>
            <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {step === 1 && 'Enter your registered email address and we will send you a 6-digit verification code.'}
              {step === 2 && `Enter the 6-digit verification code sent to ${email}. The code expires in 10 minutes.`}
              {step === 3 && 'Enter and confirm your new secure password for APITester Studio.'}
              {step === 4 && 'Your password has been securely updated. Redirecting to sign in...'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Development / Demo Mode Code Auto-Fill Helper */}
          {devCodeHelper && step === 2 && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Simulated Dev OTP: <strong className="font-mono">{devCodeHelper}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setCode(devCodeHelper)}
                className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: REQUEST OTP                                      */}
          {/* ======================================================== */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className={`${inputBase} pl-10 pr-3.5`}
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Make sure this matches the email address registered on your account.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {loading ? (
                  <span>Sending verification code...</span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: VERIFY 6-DIGIT OTP                               */}
          {/* ======================================================== */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold">6-Digit Verification Code</label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Change email
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={`${inputBase} pl-10 pr-3.5 font-mono text-center tracking-[0.4em] text-lg font-bold`}
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires in 10 minutes</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || loading}
                    className="text-sky-600 dark:text-sky-400 font-semibold hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>{cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.trim().length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {loading ? (
                  <span>Verifying code...</span>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 3: RESET PASSWORD                                   */}
          {/* ======================================================== */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className={`${inputBase} pl-10 pr-11`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 flex-1 mr-3">
                      <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 1 ? strength.color.split(' ')[0] : 'bg-slate-700'}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 2 ? strength.color.split(' ')[0] : 'bg-slate-700'}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 3 ? strength.color.split(' ')[0] : 'bg-slate-700'}`} />
                    </div>
                    <span className={`font-semibold ${strength.color.split(' ')[1]}`}>
                      {strength.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className={`${inputBase} pl-10 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-500 mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {loading ? (
                  <span>Saving new password...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 4: SUCCESS & REDIRECT                               */}
          {/* ======================================================== */}
          {step === 4 && (
            <div className="space-y-5 text-center p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">All Set!</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your password has been securely updated. You can now log into APITester with your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login', { state: { prefilledEmail: email } })}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Link Back to Login */}
          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Remember your password? <span className="text-sky-600 dark:text-sky-400 hover:underline">Sign In</span>
            </Link>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}

