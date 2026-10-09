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
  Menu,
  PanelLeft,
  Server,
  BookOpen,
  Terminal,
} from 'lucide-react';

export const Navbar = ({
  onOpenAuth,
  onOpenAdmin,
  onOpenProfile,
  onOpenEnvironments,
  onOpenRunner,
  onOpenCollections,
  onOpenMockServer,
  onOpenApiDocs,
  onOpenCurlImport,
  theme,
  onToggleTheme,
  onToggleSidebar,
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
    <header className="h-14 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between px-3 sm:px-4 select-none shrink-0 z-20 shadow-xs transition-colors duration-200">
      {/* Brand & Logo with link to Studio Workbench */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile / Desktop Sidebar Toggle Button */}
       
        <Link to="/app" className="flex items-center gap-2 group hover:opacity-95 transition" title="APITester Studio Workbench">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm shadow-sky-500/20 ring-1 ring-black/5 dark:ring-white/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 drop-shadow" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-sky-300 text-sm sm:text-base tracking-tight">
              APITester
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-300/60 dark:border-sky-500/30 font-mono font-bold tracking-wide">
              STUDIO
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-700/60 transition shadow-xs cursor-pointer"
          title="Go to Landing & Account Page"
        >
          <Home className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="hidden sm:inline font-medium">Home / Account</span>
        </Link>

        <div className="hidden md:block h-4 w-px bg-slate-300 dark:bg-slate-800 mx-0.5" />

        <button
          onClick={newRequestTemplate}
          className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition border border-slate-300/80 dark:border-slate-700/70 hover:border-sky-500/50 shadow-xs cursor-pointer active:scale-95"
          title="Create a new clean request"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>New</span>
        </button>

        <button
          onClick={onOpenCollections}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition border border-slate-300/80 dark:border-slate-700/70 hover:border-indigo-500/50 shadow-xs cursor-pointer active:scale-95"
          title="Manage Collections & Import/Export"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden md:inline">Collections</span>
        </button>

        <button
          onClick={onOpenRunner}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/90 text-emerald-800 dark:text-emerald-300 transition border border-emerald-300/80 dark:border-emerald-600/50 shadow-xs cursor-pointer active:scale-95"
          title="Run test suite across collection"
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Runner</span>
        </button>

        <button
          onClick={onOpenMockServer}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 transition border border-indigo-300/80 dark:border-indigo-700/60 shadow-xs cursor-pointer active:scale-95"
          title="Open Mock Server Sandbox"
        >
          <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Mock Server</span>
        </button>

        <button
          onClick={onOpenApiDocs}
          className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition border border-slate-300/80 dark:border-slate-700/70 hover:border-sky-500/50 shadow-xs cursor-pointer active:scale-95"
          title="Generate and export API documentation"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Docs</span>
        </button>

        <button
          onClick={onOpenCurlImport}
          className="hidden xl:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/70 text-amber-800 dark:text-amber-300 transition border border-amber-300/80 dark:border-amber-700/50 shadow-xs cursor-pointer active:scale-95"
          title="Import raw cURL command"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>cURL</span>
        </button>
      </div>

      {/* Right side controls: Environment selector, Admin, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Environment Picker */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700 rounded-lg px-2 py-1 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-1.5 shrink-0" />
          <select
            value={activeEnvironmentId}
            onChange={(e) => setActiveEnvironmentId(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs max-w-[110px] sm:max-w-[130px] truncate"
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">No Environment</option>
            {environments.map((env) => (
              <option key={env._id} value={env._id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                {env.name} {env.isGlobal ? '(Global)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={onOpenEnvironments}
            className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-0.5 ml-1 transition cursor-pointer"
            title="Configure Environments & Variables"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        
        
          
          
          


        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
          title={theme === 'dark' ? 'Switch to Corporate Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
        </button>

        {/* User Account / Auth */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProfile}
              className="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700/60 transition cursor-pointer hover:border-sky-500/50"
              title="Upload profile picture and edit details"
            >
              <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Profile</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700/60 transition cursor-pointer"
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
                <span className="max-w-[90px] sm:max-w-[110px] truncate">{user.name}</span>
                {user.role === 'admin' ? (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 font-semibold font-mono">
                    Admin
                  </span>
                ) : (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-mono">
                    User
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-30 text-xs"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <p className="font-semibold text-slate-900 dark:text-slate-200 truncate">{user.name}</p>
                    <p className="text-[11px] truncate text-slate-500 dark:text-slate-400 font-mono">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenProfile?.();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                  >
                    <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Upload Photo & Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left px-3 py-2 text-purple-700 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Admin Dashboard Console</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      sessionStorage.removeItem('guestMode');
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition border-t border-slate-200 dark:border-slate-800/80"
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
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700/60 transition"
            >
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

