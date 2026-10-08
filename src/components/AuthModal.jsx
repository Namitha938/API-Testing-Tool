import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, X, Shield, User, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPass) => {
    setError('');
    setLoading(true);
    try {
      await login(quickEmail, quickPass);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {isRegister ? <UserPlus className="w-5 h-5 text-sky-400" /> : <LogIn className="w-5 h-5 text-sky-400" />}
            <h3 className="text-sm font-bold text-slate-100">
              {isRegister ? 'Create an Account' : 'Sign In to APITester'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Login Presets for testing */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick 1-Click Evaluation Login
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('demo@apitester.io', 'user123')}
                className="py-1.5 px-3 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-700/60 text-sky-300 rounded font-medium flex items-center justify-center gap-1.5 transition text-[11px]"
              >
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Demo User (demo@apitester.io)</span>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
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
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded font-semibold transition mt-2"
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
              className="text-slate-400 hover:text-sky-400 text-[11px] transition"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

