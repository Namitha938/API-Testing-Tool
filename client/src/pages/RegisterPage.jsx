import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/GoogleIcon';
import AuthBackground from '../components/AuthBackground';
import AuthLeftPanel from '../components/AuthLeftPanel';
import {
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Building,
  Phone,
} from 'lucide-react';

export default function RegisterPage() {
  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Profile Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  // If already logged in, redirect to workbench
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  // Validation: required fields must be non-empty and valid email/password
  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().includes('@') &&
    password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError('');
    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await register(fullName, email.trim(), password, {
        company: company.trim(),
        phone: phone.trim(),
      });
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Google sign-up was cancelled.');
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

      {/* Theme Toggle Top Right: 24px padding (top-6 right-6), white circular bg, 1px border */}
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

        {/* Centered-Right: Polished Form Card */}
        <div className="w-full max-w-lg my-auto">
          <div
            className="rounded-2xl border p-6 sm:p-8 lg:p-10 shadow-[0_10px_30px_rgba(11,27,51,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.40)] max-[480px]:shadow-none max-[480px]:border-0 max-[480px]:p-4 transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Header: Logo, Complete Your Profile */}
            <div className="mb-6">
              <div className="lg:hidden flex items-center gap-2 mb-3">
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
                Complete your profile
              </h1>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--text-body)' }}
              >
                Tell us about yourself to set up your API testing workspace.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Stacked Form Fields (First name, Last name, Phone, Company, Email, Password) */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0E2A47] dark:text-slate-300 mb-1">
                    First name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B63C5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0E2A47] dark:text-slate-300 mb-1">
                    Last name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B63C5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E2A47] dark:text-slate-300 mb-1">
                  Work email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B63C5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0E2A47] dark:text-slate-300 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B63C5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0E2A47] dark:text-slate-300 mb-1">
                    Company name
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B63C5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E2A47] dark:text-slate-300 mb-1">
                  Password (minimum 6 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B63C5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Small centered legal text with blue Terms and Privacy links */}
              <p className="text-[11px] text-slate-500 text-center pt-2 leading-relaxed">
                By clicking Finish, you agree to our{' '}
                <a href="#" className="text-[#0B63C5] font-semibold hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#0B63C5] font-semibold hover:underline">Privacy Policy</a>.
              </p>

              {/* Full-width "Finish" button (Grey & disabled until required fields valid, then turns blue) */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-2.5 rounded-md font-semibold text-xs transition duration-150 shadow-2xs ${
                  isFormValid && !loading
                    ? 'bg-[#0B63C5] hover:bg-[#0952A5] text-white cursor-pointer'
                    : 'bg-[#E1E5EA] dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating Profile...' : 'Finish'}
              </button>
            </form>

            {/* Back to sign in */}
            <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#0B63C5] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}