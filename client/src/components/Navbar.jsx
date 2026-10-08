import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import {
  Globe,
  Sliders,
  PlayCircle,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  Zap,
  FolderOpen,
  Sparkles,
  Home,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar = ({
  onOpenAuth,
  onOpenAdmin,
  onOpenProfile,
  onOpenEnvironments,
  onOpenRunner,
  onOpenCollections,
  theme,
  onToggleTheme,
}) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const {
    environments,
    activeEnvironmentId,
    setActiveEnvironmentId,
    activeRequest,
    newRequestTemplate,
  } = useApi();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 select-none shrink-0 z-20">
      {/* Brand & Logo with link to Studio Workbench */}
      <div className="flex items-center gap-3">
        <Link to="/app" className="flex items-center gap-2 group hover:opacity-90 transition" title="APITester Studio Workbench">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <span className="font-bold text-slate-100 text-base tracking-tight flex items-center gap-1.5">
              APITester <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">PRO</span>
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs text-slate-200 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition"
          title="Go to Sign In / Account Page"
        >
          <Home className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline font-medium">Account / Login</span>
        </Link>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        <button
          onClick={newRequestTemplate}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700/50"
          title="Create a new clean request"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>New Request</span>
        </button>

        <button
          onClick={onOpenCollections}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700/50"
          title="Manage Collections & Import/Export"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Collections</span>
        </button>

        <button
          onClick={onOpenRunner}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 transition border border-emerald-700/60"
          title="Run test suite across collection"
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Collection Runner</span>
        </button>
      </div>

      {/* Right side controls: Environment selector, Admin, User */}
      <div className="flex items-center gap-3">
        {/* Environment Picker */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-md px-2 py-1 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
          <select
            value={activeEnvironmentId}
            onChange={(e) => setActiveEnvironmentId(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs max-w-[130px] truncate"
          >
            <option value="" className="bg-slate-900 text-slate-400">No Environment</option>
            {environments.map((env) => (
              <option key={env._id} value={env._id} className="bg-slate-900 text-slate-200">
                {env.name} {env.isGlobal ? '(Global)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={onOpenEnvironments}
            className="text-slate-400 hover:text-sky-400 p-0.5 ml-1 transition"
            title="Configure Environments & Variables"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Admin Dashboard Button */}
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/60 transition shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Admin Dashboard</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700 transition hover:scale-105 active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
        </button>

        {/* User Account / Auth */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProfile}
              className="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer hover:border-sky-500/50"
              title="Upload profile picture and edit details"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Profile & Avatar</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover border border-sky-400/50"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[100px] truncate">{user.name}</span>
                {user.role === 'admin' ? (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold font-mono">
                    Admin
                  </span>
                ) : (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700/60 text-slate-300 border border-slate-600 font-mono">
                    User
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-30 text-xs"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-slate-400">
                    <p className="font-semibold text-slate-200 truncate">{user.name}</p>
                    <p className="text-[11px] truncate text-slate-400 font-mono">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenProfile?.();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                  >
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>Upload Photo & Profile</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-3 py-2 text-purple-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      sessionStorage.removeItem('guestMode');
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition border-t border-slate-800/80"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition"
            >
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

