import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import {
  LayoutGrid,
  ChevronDown,
  Globe,
  Sliders,
  MessageSquare,
  User,
  LogOut,
  LogIn,
  PanelLeft,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';

export const Navbar = ({
  onOpenAuth,
  onOpenProfile,
  onOpenEnvironments,
  theme,
  onToggleTheme,
  onToggleSidebar,
  sidebarCollapsed,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    environments,
    activeEnvironmentId,
    setActiveEnvironmentId,
  } = useApi();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false);

  const activeEnv = environments.find((e) => e._id === activeEnvironmentId);

  return (
    <header className="h-16 bg-white dark:bg-[#0c1017] border-b border-[#E1E5EA] dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 select-none shrink-0 z-20 transition-colors">
      {/* Left: App-switcher grid icon + Swagger-style green icon + "APITester" wordmark */}
      <div className="flex items-center gap-3">
        {/* Sidebar Collapse/Expand Toggle Button (immediately left of logo) */}
        <button
          id="sidebar-toggle-btn"
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          aria-controls="studio-sidebar"
          title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B63C5] transition cursor-pointer"
        >
          <PanelLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Brand Logo & Wordmark (Swagger Catalog Aesthetic) */}
        <Link to="/app" className="flex items-center gap-2.5 group" title="PulseAPI Catalog & Studio">
          {/* Swagger-style rounded brand mark */}
          <div className="w-8 h-8 rounded-lg bg-[#6CC24A] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-sm tracking-tighter">{}</span>
            <div className="w-3.5 h-3.5 rounded-sm border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-xs" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0E2A47] dark:text-white text-lg tracking-tight">
              PulseAPI
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F1FB] dark:bg-sky-950 text-[#0B63C5] dark:text-sky-400 border border-[#B3D4F8] dark:border-sky-800">
              Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Environment dropdown, Orange Call-to-Action badge, Feedback, User avatar */}
      <div className="flex items-center gap-3">
        {/* Environment Selector (Swagger Enterprise Trial pill style) */}
        <div className="relative">
          <button
            onClick={() => setEnvDropdownOpen(!envDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-[#0E2A47] dark:text-slate-200 hover:border-slate-400 transition cursor-pointer shadow-2xs"
            title="Active Environment"
          >
            <Globe className="w-3.5 h-3.5 text-[#0B63C5]" />
            <span className="max-w-[130px] sm:max-w-[170px] truncate">
              {activeEnv ? `${activeEnv.name} ${activeEnv.isGlobal ? '(Global)' : ''}` : 'Local Dev Environment'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {envDropdownOpen && (
            <div
              className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-40 text-xs"
              onMouseLeave={() => setEnvDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Environments</span>
                <button
                  onClick={() => {
                    setEnvDropdownOpen(false);
                    onOpenEnvironments?.();
                  }}
                  className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" /> Manage
                </button>
              </div>

              <button
                onClick={() => {
                  setActiveEnvironmentId('');
                  setEnvDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer ${
                  !activeEnvironmentId ? 'bg-[#E8F1FB] dark:bg-sky-950/50 text-[#0B63C5] font-semibold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>No Environment</span>
              </button>

              {environments.map((env) => (
                <button
                  key={env._id}
                  onClick={() => {
                    setActiveEnvironmentId(env._id);
                    setEnvDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer ${
                    activeEnvironmentId === env._id ? 'bg-[#E8F1FB] dark:bg-sky-950/50 text-[#0B63C5] font-semibold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{env.name}</span>
                  {env.isGlobal && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">Global</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orange Call-to-Action Badge (Swagger Enterprise Trial style) */}
        <div className="hidden md:flex items-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF3EB] dark:bg-orange-950/40 text-[#FF6A00] dark:text-orange-400 border border-[#FFD8BF] dark:border-orange-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
            <span>Enterprise Trial</span>
          </span>
        </div>

        {/* Feedback Icon Button */}
        <button
          type="button"
          onClick={() => window.open('https://github.com/Namitha938/API-Testing-Tool/issues', '_blank')}
          className="p-2 rounded-md text-slate-500 hover:text-[#0B63C5] dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Send Feedback"
          aria-label="Send Feedback"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Dropdown with Avatar */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-[#0B63C5] transition cursor-pointer"
              aria-label="User Menu"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#0B63C5] text-white flex items-center justify-center font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </button>

            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-40 text-xs"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-[#0E2A47] dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenProfile?.();
                  }}
                  className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-[#F0F6FC] dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                >
                  <User className="w-3.5 h-3.5 text-[#0B63C5]" />
                  <span>Account & Profile</span>
                </button>


                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition border-t border-slate-100 dark:border-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-md bg-[#0B63C5] hover:bg-[#0952A5] text-white font-semibold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-md border border-[#E1E5EA] text-[#0E2A47] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition cursor-pointer"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
