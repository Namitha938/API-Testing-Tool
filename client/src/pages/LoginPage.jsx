import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

// PASTE YOUR IMAGE URL HERE (leave empty to show the built-in illustration)
const LOGIN_IMAGE = "https://img.magnific.com/free-vector/gradient-api-illustration_23-2149368725.jpg?semt=ais_hybrid&w=740&q=80";

function Illustration() {
  return (
    <svg viewBox="0 0 480 360" className="h-full w-full" role="img" aria-label="Secure login illustration">
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
      <rect x="348" y="136" width="48" height="38" rx="8" fill="#ffffff" />
      <path d="M358 136v-10a14 14 0 0128 0v10" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
      <circle cx="372" cy="154" r="5" fill="#7c3aed" />
    </svg>
  );
}

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const inputBase =
    "w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10";

  return (
    <div className="flex min-h-screen w-full bg-white">

      {/* LEFT - IMAGE (50%) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 lg:flex">
        {LOGIN_IMAGE ? (
          <>
            {/* full half-page image */}
            <img
              src={LOGIN_IMAGE}
              alt="Login illustration"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-10 pt-24">
              <h2 className="text-2xl font-bold text-white">Everything in one secure place</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-200">
                Sign in to pick up right where you left off.
              </p>
            </div>
          </>
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center p-12">
            {/* soft blobs */}
            <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-violet-300/30 blur-[90px]"></div>
            <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-violet-400/20 blur-[90px]"></div>

            <div className="relative flex h-[60%] w-[85%] items-center justify-center">
              <Illustration />
            </div>

            <div className="relative mt-8 max-w-md text-center">
              <h2 className="text-2xl font-bold text-slate-900">Everything in one secure place</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Sign in to pick up right where you left off.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT - LOGIN FORM (50%) */}
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">

        {/* Logo / Title */}
        <div className="mb-10">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/30">
            <Lock size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">API Testing Tool</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back! Please login to your account.</p>
        </div>

        {/* Form */}
        <form className="space-y-6">

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`${inputBase} pl-11 pr-4`}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <a href="#" className="text-xs font-medium text-violet-600 hover:text-violet-700">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputBase} pl-11 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-slate-400 transition hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
            <label htmlFor="remember" className="text-sm text-slate-600">Remember me</label>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/40 active:scale-[0.98]"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account? <a href="/register" className="font-semibold text-violet-600 hover:text-violet-700">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}