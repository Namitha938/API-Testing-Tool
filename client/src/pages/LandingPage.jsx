import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  ArrowRight,
  Code2,
  FolderOpen,
  Sliders,
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Cpu,
  Sparkles,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  ExternalLink,
  Laptop
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
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

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Lightning-Fast REST Client',
      desc: 'Send GET, POST, PUT, DELETE, PATCH, and HEAD requests with real-time response timings, headers, and formatted JSON preview.',
    },
    {
      icon: <FolderOpen className="w-6 h-6 text-sky-500" />,
      title: 'Collections & Organization',
      desc: 'Group requests into organized folders and collections. Export and import collections with one click.',
    },
    {
      icon: <PlayCircle className="w-6 h-6 text-emerald-500" />,
      title: 'Automated Collection Runner',
      desc: 'Execute entire test suites sequentially with automated assertions, pass/fail reporting, and total duration metrics.',
    },
    {
      icon: <Sliders className="w-6 h-6 text-purple-500" />,
      title: 'Dynamic Environments & Variables',
      desc: 'Define Global and environment-scoped variables (e.g., {{baseUrl}}, {{token}}) with automatic template substitution.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-500" />,
      title: 'Role-Based Admin Dashboard',
      desc: 'System administration console for user management, role privileges (Admin vs User), and activity telemetry.',
    },
    {
      icon: <Terminal className="w-6 h-6 text-indigo-500" />,
      title: 'Built-in Mock Endpoints & Proxy',
      desc: 'Built-in CORS proxy engine and mock test APIs (/api/mock/users) so you can start testing immediately without external servers.',
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
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#features"
              className={isDark ? 'text-slate-300 hover:text-sky-400' : 'text-slate-600 hover:text-sky-600'}
            >
              Features
            </a>
            <a
              href="#demo"
              className={isDark ? 'text-slate-300 hover:text-sky-400' : 'text-slate-600 hover:text-sky-600'}
            >
              Interactive Preview
            </a>
            <a
              href="#architecture"
              className={isDark ? 'text-slate-300 hover:text-sky-400' : 'text-slate-600 hover:text-sky-600'}
            >
              Architecture
            </a>
          </nav>

          {/* Controls: Theme Toggle & Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all ${
                isDark
                  ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className={`text-xs hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Welcome, <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{user.name}</strong>
                </span>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Glow backdrop */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] blur-[140px] rounded-full pointer-events-none ${
            isDark
              ? 'bg-gradient-to-tr from-sky-500/20 via-indigo-500/15 to-purple-600/10'
              : 'bg-gradient-to-tr from-sky-300/30 via-indigo-200/20 to-purple-200/20'
          }`}
        />

        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6 shadow-xs border ${
            isDark
              ? 'bg-slate-900 border-slate-700/60 text-sky-400'
              : 'bg-white border-slate-200 text-sky-700 shadow-xs'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Full-Stack Modern API Development & Automation Platform</span>
        </div>

        <h1
          className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          Test, Inspect & Automate APIs{' '}
          <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
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

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/app"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-sky-600/25 transition transform hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Open API Studio</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          {!user && (
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border font-semibold text-sm transition ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
              }`}
            >
              <LogIn className="w-4 h-4 text-sky-600" />
              <span>Sign In with Demo Account</span>
            </Link>
          )}
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
          className={`rounded-2xl border shadow-2xl overflow-hidden transition-colors duration-300 ${
            isDark
              ? 'border-slate-800 bg-slate-900/90'
              : 'border-slate-200 bg-white shadow-xl'
          }`}
        >
          {/* Mock Window Title Bar */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className={`text-xs ml-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                APITester Studio - Request Workbench
              </span>
            </div>
            <Link
              to="/app"
              className="text-xs text-sky-600 hover:text-sky-500 font-semibold flex items-center gap-1"
            >
              <span>Click to Enter Fullscreen</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Interactive Mock UI */}
          <div className={`p-4 sm:p-6 font-mono text-xs space-y-4 ${isDark ? 'bg-slate-900/60' : 'bg-slate-50/70'}`}>
            <div
              className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
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
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition text-xs shrink-0"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Send</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Request Parameters Card */}
              <div
                className={`border rounded-xl p-4 ${
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
                className={`border rounded-xl p-4 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="font-semibold mb-2 flex items-center justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>RESPONSE INSPECTOR</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
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
                className={`border p-6 rounded-2xl transition duration-200 group ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div
                  className={`p-3 rounded-xl border inline-block mb-4 group-hover:scale-105 transition transform ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {item.icon}
                </div>
                <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
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
                      <span>Admin Account</span>
                    </div>
                    <div className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      admin@apitester.io
                    </div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Password: admin123
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
    </div>
  );
}
