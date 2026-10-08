import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/GoogleIcon';
import { ProfileModal } from '../components/ProfileModal';
import {
  Zap,
  ArrowRight,
  Code2,
  FolderOpen,
  Sliders,
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Cpu,
  Sparkles,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  ExternalLink,
  Laptop,
  Home,
  User,
  LogOut,
  BarChart3,
  Key,
  KeyRound,
  X
} from 'lucide-react';

export default function LandingPage() {
  const { user, loginWithGoogle, isAdmin, logout, forgotPassword, resetPassword } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Forgot Password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: code + new pass
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

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setGoogleError(err.message || 'Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await forgotPassword(forgotEmail);
      setForgotSuccess(res.message || 'Reset code generated!');
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
      }, 2500);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const isDark = theme === 'dark';

  const features = [
    {
      icon: <GoogleIcon className="w-6 h-6" />,
      title: 'Google OAuth & Authentication',
      desc: 'Seamless 1-click Google Sign-In with Firebase and JWT. Includes pre-configured admin authorization for authorized team accounts.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      title: 'Admin Dashboard & Latency Monitoring',
      desc: 'System administration console for user management, role privileges (Admin vs User), audit trails, and interactive response-time latency graphs.',
    },
    {
      icon: <User className="w-6 h-6 text-emerald-500" />,
      title: 'Profile Section & Photo Upload',
      desc: 'Full user profile management with custom photo upload, password change, forgot password recovery flow, and personal execution telemetry.',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Lightning-Fast REST Client',
      desc: 'Send GET, POST, PUT, DELETE, PATCH, and HEAD requests with real-time response timings, headers, and formatted Pretty/Raw/Preview body inspection.',
    },
    {
      icon: <FolderOpen className="w-6 h-6 text-sky-500" />,
      title: 'Nested Collections & Import/Export',
      desc: 'Organize requests with multi-level nested folders. Full import support for Postman v2.1, OpenAPI/Swagger 3.0, and raw cURL commands.',
    },
    {
      icon: <PlayCircle className="w-6 h-6 text-indigo-500" />,
      title: 'Automated Collection Runner',
      desc: 'Execute entire test suites sequentially with automated assertions, pass/fail reporting, and total duration metrics.',
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-sky-200'
          : 'bg-slate-50 text-slate-900 selection:bg-sky-500/20 selection:text-sky-900'
      }`}
    >
      {/* Header / Navbar */}
      <header
        className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
          isDark
            ? 'border-slate-800/80 bg-slate-950/80'
            : 'border-slate-200/90 bg-white/80 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <span className="font-bold text-lg tracking-tight flex items-center gap-2">
              APITester{' '}
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono">
                PRO
              </span>
            </span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a
              href="#"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isDark
                  ? 'bg-slate-900 border-slate-700/80 text-white hover:bg-slate-800 hover:border-slate-600'
                  : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800 shadow-sm'
              }`}
            >
              <Home className="w-4 h-4 text-white shrink-0" />
              <span className="text-white font-semibold">Home</span>
            </a>
            <a
              href="#features"
              className={`transition-colors hover:scale-105 transform duration-200 ${isDark ? 'text-slate-300 hover:text-sky-400' : 'text-slate-600 hover:text-sky-600'}`}
            >
              Features
            </a>
            <a
              href="#demo"
              className={`transition-colors hover:scale-105 transform duration-200 ${isDark ? 'text-slate-300 hover:text-sky-400' : 'text-slate-600 hover:text-sky-600'}`}
            >
              Interactive Preview
            </a>
            <a
              href="#architecture"
              className={`transition-colors hover:scale-105 transform duration-200 ${isDark ? 'text-slate-300 hover:text-sky-400' : 'text-slate-600 hover:text-sky-600'}`}
            >
              Architecture
            </a>
          </nav>

          {/* Controls: Theme Toggle & Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all duration-200 hover:scale-110 active:scale-95 ${
                isDark
                  ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Admin Dashboard Navigation Link */}
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition hover:scale-105 duration-200 ${
                isAdmin
                  ? 'bg-purple-600/15 border-purple-500/40 text-purple-400 hover:bg-purple-600/25'
                  : isDark
                  ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title="Admin Dashboard & Performance Monitoring"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Dashboard {isAdmin && '★'}</span>
            </Link>

            {/* Beside right of Admin Dashboard: Sign In */}
            <Link
              to="/login"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-200 hover:scale-105 ${
                isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Sign In
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition hover:scale-105 active:scale-95 duration-200"
                >
                  <span>Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition hover:scale-105 active:scale-95 duration-200 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Animated Background Glowing Blobs */}
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[340px] blur-[130px] rounded-full pointer-events-none animate-blob ${
            isDark
              ? 'bg-gradient-to-tr from-sky-500/25 via-indigo-500/20 to-purple-600/15'
              : 'bg-gradient-to-tr from-sky-300/35 via-indigo-200/25 to-purple-200/25'
          }`}
        />
        <div
          className={`absolute top-1/3 left-1/4 w-[400px] h-[280px] blur-[120px] rounded-full pointer-events-none animate-blob animation-delay-2000 ${
            isDark
              ? 'bg-gradient-to-tr from-cyan-500/15 via-sky-500/15 to-transparent'
              : 'bg-gradient-to-tr from-cyan-300/25 via-sky-200/20 to-transparent'
          }`}
        />
        <div
          className={`absolute top-1/4 right-1/4 w-[420px] h-[300px] blur-[120px] rounded-full pointer-events-none animate-blob animation-delay-4000 ${
            isDark
              ? 'bg-gradient-to-tr from-purple-500/15 via-rose-500/10 to-transparent'
              : 'bg-gradient-to-tr from-purple-300/25 via-rose-200/15 to-transparent'
          }`}
        />

        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 shadow-xs border transition-transform duration-300 hover:scale-105 ${
            isDark
              ? 'bg-slate-900 border-slate-700/60 text-sky-400 shadow-sky-500/5'
              : 'bg-white border-slate-200 text-sky-700 shadow-xs'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
          <span>Full-Stack Modern API Development & Automation Platform</span>
        </div>

        <h1
          className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          Test, Inspect & Automate APIs{' '}
          <span className="animate-gradient-x bg-gradient-to-r from-sky-400 via-indigo-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
            Without Friction
          </span>
        </h1>

        <p
          className={`mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          The ultimate developer tool for debugging endpoints, managing environment variables, running automated test suites, and simulating mock backends in one unified workspace.
        </p>

        {/* Hero CTA - Only Open API Studio and Continue with Google */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/app"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-sky-600/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white animate-pulse" />
            <span>Open API Studio</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border font-semibold text-sm transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer shadow-lg ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 hover:border-sky-500/50'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-sky-500/50'
            }`}
            title="Continue with Google Authentication"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs">
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero Config Required</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>CORS Proxy Built-in</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>MongoDB Persistence</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Role-Based Access Control</span>
          </div>
        </div>
      </section>

      {/* Interactive Studio Preview Mockup */}
      <section id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 w-full">
        <div
          className={`rounded-2xl border shadow-2xl overflow-hidden transition-all duration-500 animate-float ${
            isDark
              ? 'border-slate-800 bg-slate-900/90 shadow-black/60 hover:shadow-sky-500/10 hover:border-slate-700'
              : 'border-slate-200 bg-white shadow-xl hover:shadow-2xl hover:border-slate-300'
          }`}
        >
          {/* Mock Window Title Bar */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 transition-transform duration-200 hover:scale-125" />
              <div className="w-3 h-3 rounded-full bg-amber-500 transition-transform duration-200 hover:scale-125" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 transition-transform duration-200 hover:scale-125" />
              <span className={`text-xs ml-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                APITester Studio - Request Workbench
              </span>
            </div>
            <Link
              to="/app"
              className="text-xs text-sky-600 hover:text-sky-500 font-semibold flex items-center gap-1 transition duration-200 hover:translate-x-1"
            >
              <span>Click to Enter Fullscreen</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Interactive Mock UI */}
          <div className={`p-4 sm:p-6 font-mono text-xs space-y-4 ${isDark ? 'bg-slate-900/60' : 'bg-slate-50/70'}`}>
            <div
              className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl border transition-all duration-300 ${
                isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                GET
              </span>
              <div
                className={`flex-1 px-3 py-1.5 rounded-lg border truncate ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                http://localhost:5000/api/mock/users
              </div>
              <Link
                to="/app"
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 text-xs shrink-0 shadow-md shadow-sky-600/30"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Send</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Request Parameters Card */}
              <div
                className={`border rounded-xl p-4 transition-all duration-200 hover:border-slate-700 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="font-semibold mb-2 flex items-center justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>HEADERS & AUTH</span>
                  <span className="text-[10px] text-sky-600 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                    Bearer Token Active
                  </span>
                </div>
                <div className={`space-y-1.5 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className={`flex justify-between border-b pb-1 ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Content-Type</span>
                    <span>application/json</span>
                  </div>
                  <div className={`flex justify-between border-b pb-1 ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Authorization</span>
                    <span className="text-sky-600 dark:text-sky-400">Bearer eyJhbGciOi...</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Environment</span>
                    <span className="text-indigo-600 dark:text-indigo-400">&#123;&#123;baseUrl&#125;&#125; (Development)</span>
                  </div>
                </div>
              </div>

              {/* Response Inspector Card */}
              <div
                className={`border rounded-xl p-4 transition-all duration-200 hover:border-slate-700 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="font-semibold mb-2 flex items-center justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>RESPONSE INSPECTOR</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      200 OK
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>18 ms</span>
                  </div>
                </div>
                <pre
                  className={`text-[11px] leading-relaxed overflow-x-auto ${
                    isDark ? 'text-sky-300/90' : 'text-sky-800'
                  }`}
                >
{`{
  "status": "online",
  "users": [
    { "id": 1, "name": "System Admin", "role": "admin" },
    { "id": 2, "name": "Developer", "role": "user" }
  ],
  "latency": "18ms"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section
        id="features"
        className={`py-20 border-t transition-colors duration-300 ${
          isDark ? 'border-slate-800/80 bg-slate-900/30' : 'border-slate-200 bg-slate-100/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Engineered for Developers
            </h2>
            <p className={`mt-4 text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Everything you need to build, test, and maintain APIs in modern microservice and web architectures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className={`border p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 group ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 hover:border-sky-500/40 hover:bg-slate-900 hover:shadow-xl hover:shadow-sky-500/5'
                    : 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-xl'
                }`}
              >
                <div
                  className={`p-3 rounded-xl border inline-block mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${
                    isDark ? 'bg-slate-950 border-slate-800 group-hover:border-sky-500/30' : 'bg-slate-50 border-slate-200 group-hover:border-sky-300'
                  }`}
                >
                  {item.icon}
                </div>
                <h3 className={`text-base font-semibold mb-2 transition-colors duration-200 group-hover:text-sky-400 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & Stack Section */}
      <section id="architecture" className={`py-20 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border ${
                  isDark
                    ? 'bg-indigo-950/60 border-indigo-700/50 text-indigo-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>Robust Technology Stack</span>
              </div>
              <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                React 19 + Node Express + MongoDB
              </h2>
              <p className={`mt-4 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Architected with a decoupled frontend/backend topology. The client uses fast reactive state management and Tailwind CSS, while the Node backend dispatches proxy requests with server-side caching and persistence in MongoDB.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Full Request History & Audit Logs
                    </strong>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Stores historical request executions with responses, headers, and status codes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Automated Test Case Runner
                    </strong>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Assert HTTP 200/201 status, response time under 500ms, and JSON body keys.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Link
                  to="/app"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-sky-600/20"
                >
                  <span>Launch Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/register"
                  className={`px-5 py-2.5 rounded-xl border font-semibold text-xs transition ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
                  }`}
                >
                  Create Account
                </Link>
              </div>
            </div>

            <div
              className={`border rounded-2xl p-6 shadow-xl ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
              }`}
            >
              <div
                className={`text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <Code2 className="w-4 h-4 text-sky-500" />
                <span>Ready Default Credentials</span>
              </div>
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authorized Admin</span>
                    </div>
                    <div className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      singunamitha@gmail.com
                    </div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Password: Admin@2026! (or Google Auth)
                    </div>
                  </div>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-medium transition"
                  >
                    Login
                  </Link>
                </div>

                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      <span>Demo Developer</span>
                    </div>
                    <div className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      demo@apitester.io
                    </div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Password: user123
                    </div>
                  </div>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-300 text-xs font-medium transition"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`mt-auto border-t py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
          isDark ? 'border-slate-800/80 bg-slate-950' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className={`flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            <Zap className="w-4 h-4 text-sky-500" />
            <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>APITester PRO</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
              <Home className="w-3.5 h-3.5 text-white" />
              <span>Home</span>
            </a>
            <Link to="/app" className={isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}>
              Studio
            </Link>
            <Link to="/login" className={isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}>
              Login
            </Link>
            <Link to="/register" className={isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}>
              Register
            </Link>
          </div>
        </div>
      </footer>

      {/* Profile Section Modal */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

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
                    Enter your registered email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
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
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs tracking-widest font-mono font-bold text-center outline-none focus:border-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
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
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
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
