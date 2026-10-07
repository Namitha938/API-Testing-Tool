import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SAMPLES = {
  GET: { url: 'https://api.example.com/users/42', status: '200 OK', time: '142 ms', size: '312 B',
    body: `{\n  "id": 42,\n  "name": "Asha Rao",\n  "role": "admin",\n  "active": true\n}` },
  POST: { url: 'https://api.example.com/users', status: '201 Created', time: '211 ms', size: '268 B',
    body: `{\n  "id": 43,\n  "name": "Ravi Kumar",\n  "created": "2026-10-07T09:30:00Z"\n}` },
  PUT: { url: 'https://api.example.com/users/42', status: '200 OK', time: '176 ms', size: '290 B',
    body: `{\n  "id": 42,\n  "name": "Asha Rao",\n  "role": "editor",\n  "updated": true\n}` },
  PATCH: { url: 'https://api.example.com/users/42', status: '200 OK', time: '98 ms', size: '154 B',
    body: `{\n  "id": 42,\n  "active": false\n}` },
  DELETE: { url: 'https://api.example.com/users/42', status: '404 Not Found', time: '64 ms', size: '58 B',
    body: `{\n  "error": "User not found"\n}` },
};

const ALL_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_TEXT = {
  dark: { GET: 'text-emerald-400', POST: 'text-amber-400', PUT: 'text-sky-400', PATCH: 'text-violet-300', DELETE: 'text-rose-400' },
  light: { GET: 'text-emerald-700', POST: 'text-amber-700', PUT: 'text-sky-700', PATCH: 'text-violet-700', DELETE: 'text-rose-700' },
};

// One accent colour (violet) on a neutral slate base, in two themes.
const THEMES = {
  dark: {
    page: 'bg-slate-950 text-slate-100',
    nav: 'bg-slate-950/80 border-slate-800',
    surface: 'bg-slate-900 border-slate-800',
    surfaceAlt: 'bg-slate-900/50 border-slate-800',
    muted: 'text-slate-400',
    faint: 'text-slate-500',
    border: 'border-slate-800',
    input: 'bg-slate-950 border-slate-800 text-slate-300',
    tab: 'text-slate-300 hover:bg-slate-800',
    iconBox: 'bg-violet-500/15 text-violet-300',
    hoverCard: 'hover:border-violet-500/60',
    ok: 'text-emerald-400',
    bad: 'text-rose-400',
    glow: 'bg-violet-600/20',
    link: 'text-slate-300 hover:text-white',
    toggle: 'border-slate-700 text-slate-300 hover:bg-slate-800',
    ctaBox: 'bg-slate-900 border-slate-800',
    ctaBtn: 'bg-violet-600 hover:bg-violet-500 text-white',
    pill: 'bg-slate-900 border-slate-700 text-slate-200',
  },
  light: {
    page: 'bg-white text-slate-900',
    nav: 'bg-white/80 border-slate-200',
    surface: 'bg-white border-slate-200',
    surfaceAlt: 'bg-slate-50 border-slate-200',
    muted: 'text-slate-600',
    faint: 'text-slate-500',
    border: 'border-slate-200',
    input: 'bg-slate-50 border-slate-200 text-slate-700',
    tab: 'text-slate-700 hover:bg-slate-100',
    iconBox: 'bg-violet-100 text-violet-700',
    hoverCard: 'hover:border-violet-400',
    ok: 'text-emerald-700',
    bad: 'text-rose-700',
    glow: 'bg-violet-300/40',
    link: 'text-slate-600 hover:text-slate-900',
    toggle: 'border-slate-300 text-slate-700 hover:bg-slate-100',
    ctaBox: 'bg-violet-50 border-violet-200',
    ctaBtn: 'bg-violet-600 hover:bg-violet-700 text-white',
    pill: 'bg-white border-slate-300 text-slate-700',
  },
};

const FEATURES = [
  { title: 'Send Requests', text: 'Support for GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS methods.',
    icon: 'M11 4a2 2 0 114 0v1a2 2 0 104 0v1a9 9 0 11-18 0 2 2 0 00-2-1V4a2 2 0 114 0' },
  { title: 'Manage Headers & Params', text: 'Add custom headers, query parameters, and request bodies with ease.',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { title: 'Authentication', text: 'Support for Basic Auth, Bearer tokens, and API keys.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'View Responses', text: 'See the status code, response time, size, and formatted body for every request you send.',
    icon: 'M4 6h16M4 12h16M4 18h10' },
  { title: 'Validate Status & Data', text: 'Check that your API returns the status and data you expect before you ship.',
    icon: 'M5 13l4 4L19 7' },
  { title: 'Runs in Your Browser', text: 'A web-based tool with nothing to install. Open it and start testing.',
    icon: 'M3 5h18v12H3zM8 21h8M12 17v4' },
];

const STEPS = [
  { title: 'Choose a method and enter the URL', text: 'Pick GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS and paste your endpoint.' },
  { title: 'Add headers, params, body, and auth', text: 'Fill in only what your request needs, including Basic Auth, Bearer tokens, or API keys.' },
  { title: 'Send and inspect the response', text: 'Review the status, timing, and data, then adjust the request and send it again.' },
];

const STACK = [
  { name: 'React', text: 'A fast, responsive interface for building and sending requests.' },
  { name: 'Express', text: 'A Node.js server that handles your requests reliably.' },
  { name: 'MongoDB', text: 'A database that stores your data.' },
];

export default function Landing() {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('landing-theme') === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  });
  const [method, setMethod] = useState('GET');

  useEffect(() => {
    try {
      localStorage.setItem('landing-theme', mode);
    } catch (e) {
      /* storage unavailable, theme just won't persist */
    }
  }, [mode]);

  const t = THEMES[mode];
  const mc = METHOD_TEXT[mode];
  const sample = SAMPLES[method];
  const ok = sample.status.startsWith('2');
  const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
  const focus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400';

  return (
    <div id="home" className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${t.page}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[480px] w-[860px] rounded-full blur-3xl ${t.glow}`}
      />

      <nav className={`sticky top-0 z-20 border-b backdrop-blur ${t.nav}`}>
        <div className={container}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span className="ml-3 text-xl font-bold tracking-tight">API Testing Tool</span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#home" className={`transition ${t.link}`}>Home</a>
              <a href="#features" className={`transition ${t.link}`}>Features</a>
              <a href="#how-it-works" className={`transition ${t.link}`}>How it works</a>
              <a href="#methods" className={`transition ${t.link}`}>Methods</a>
              
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                aria-label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                title={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border transition ${t.toggle} ${focus}`}
              >
                {mode === 'dark' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2M5.6 5.6l1.4 1.4m10 10l1.4 1.4M3 12h2m14 0h2M5.6 18.4L7 17m10-10l1.4-1.4M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />
                  </svg>
                )}
              </button>
              <Link
                to="/login"
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border transition ${t.toggle} ${focus}`}
              >
                Login
              </Link>



              <Link
                to="/register"
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border transition ${t.toggle} ${focus}`}
              >
                Sign Up
              </Link>






              <Link
                to="/requests"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${t.ctaBtn} ${focus}`}
              >
                Open App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero */}
        <section className={`${container} pt-16 pb-16 lg:pt-24 lg:pb-24`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
                Test Your APIs with Ease
              </h1>
              <p className={`text-lg sm:text-xl mb-8 max-w-xl mx-auto lg:mx-0 ${t.muted}`}>
                A powerful web-based tool for sending API requests, managing headers
                and parameters, viewing responses, and validating API status and data.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/requests"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-lg font-medium transition shadow-lg shadow-violet-900/20 ${t.ctaBtn} ${focus}`}
                >
                  Get Started
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M4 7l5 5" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className={`inline-flex items-center justify-center px-8 py-4 rounded-lg text-lg font-medium border transition ${t.toggle} ${focus}`}
                >
                  See how it works
                </a>
              </div>
              <p className={`mt-6 text-sm ${t.faint}`}>
                Pick a method on the right to preview a sample request and response.
              </p>
            </div>

            <div className={`rounded-xl border shadow-2xl shadow-violet-950/20 overflow-hidden ${t.surface}`}>
              <div className={`flex gap-1 overflow-x-auto border-b p-2 ${t.border} ${t.surfaceAlt}`}>
                {Object.keys(SAMPLES).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    aria-pressed={method === m}
                    className={`px-3 py-1.5 rounded-md text-sm font-mono font-semibold transition ${focus} ${
                      method === m ? 'bg-violet-600 text-white' : `${mc[m]} ${t.tab}`
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="p-4">
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${t.input}`}>
                  <span className={`font-mono text-sm font-bold ${mc[method]}`}>{method}</span>
                  <span className="font-mono text-sm truncate">{sample.url}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className={`font-semibold ${ok ? t.ok : t.bad}`}>{sample.status}</span>
                  <span className={t.muted}>{sample.time}</span>
                  <span className={t.muted}>{sample.size}</span>
                </div>
                <pre className="mt-3 rounded-lg bg-slate-900 border border-slate-800 p-4 text-sm leading-relaxed font-mono text-slate-100 overflow-x-auto">
{sample.body}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className={`${container} py-16 scroll-mt-20`}>
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Everything you need to test an API</h2>
            <p className={`text-lg ${t.muted}`}>
              Build a request, send it, and check the result without leaving one page.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className={`border rounded-xl p-6 transition ${t.surface} ${t.hoverCard}`}>
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${t.iconBox}`}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className={`text-sm leading-relaxed ${t.muted}`}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className={`border-y scroll-mt-20 ${t.border} ${t.surfaceAlt}`}>
          <div className={`${container} py-16`}>
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-3">From URL to response in three steps</h2>
              <p className={`text-lg ${t.muted}`}>No setup, no scripts. Just build the request and send it.</p>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className={`border rounded-xl p-6 ${t.surface}`}>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white font-semibold mb-4">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className={`text-sm leading-relaxed ${t.muted}`}>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Methods */}
        <section id="methods" className={`${container} py-16 scroll-mt-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">All the HTTP methods you use</h2>
              <p className={`text-lg ${t.muted}`}>
                Test reads, writes, updates, deletes, and metadata checks with the same simple form.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {ALL_METHODS.map((m) => (
                <span key={m} className={`px-4 py-2 rounded-lg border font-mono text-sm font-semibold ${t.pill}`}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>

       

        {/* Final CTA */}
        <section className={`${container} pb-20`}>
          <div className={`rounded-2xl border p-8 sm:p-12 text-center ${t.ctaBox}`}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Send your first request</h2>
            <p className={`mb-6 max-w-xl mx-auto ${t.muted}`}>
              Enter a URL, pick a method, and check the status and data that comes back.
            </p>
            <Link
              to="/requests"
              className={`inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition ${t.ctaBtn} ${focus}`}
            >
              Open App
            </Link>
          </div>
        </section>
      </main>

      <footer className={`relative border-t py-6 ${t.border}`}>
        <div className={`${container} text-center text-sm ${t.faint}`}>
          API Testing Tool - Built with React, Express, and MongoDB
        </div>
      </footer>
    </div>
  );
}