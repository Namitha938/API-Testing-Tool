import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider, useApi } from './context/ApiContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RequestPane } from './components/RequestPane';
import { RequestTabs } from './components/RequestTabs';
import { ResponsePane } from './components/ResponsePane';
import { CollectionsModal } from './components/CollectionsModal';
import { EnvironmentModal } from './components/EnvironmentModal';
import { CollectionRunnerModal } from './components/CollectionRunnerModal';
import { SaveRequestModal } from './components/SaveRequestModal';
import { AuthModal } from './components/AuthModal';
import { MockServerModal } from './components/MockServerModal';
import { ApiDocsModal } from './components/ApiDocsModal';
import { CurlImportModal } from './components/CurlImportModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
import { ProfileModal } from './components/ProfileModal';
import { Sparkles, X, Plus, FolderOpen, ArrowRight } from 'lucide-react';

function StudioWorkbench() {
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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [collectionsModalOpen, setCollectionsModalOpen] = useState(false);
  const [environmentModalOpen, setEnvironmentModalOpen] = useState(false);
  const [runnerModalOpen, setRunnerModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [mockServerModalOpen, setMockServerModalOpen] = useState(false);
  const [apiDocsModalOpen, setApiDocsModalOpen] = useState(false);
  const [curlModalOpen, setCurlModalOpen] = useState(false);
  const [runnerCollection, setRunnerCollection] = useState(null);
  const [runnerFolder, setRunnerFolder] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('sidebar_collapsed');
    if (stored !== null) return stored === 'true';
    return window.innerWidth < 1100 && window.innerWidth >= 1024;
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  const handleExpandSidebar = () => {
    setSidebarCollapsed(false);
    localStorage.setItem('sidebar_collapsed', 'false');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        handleToggleSidebar();
      } else if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      if (localStorage.getItem('sidebar_collapsed') === null) {
        if (window.innerWidth < 1100 && window.innerWidth >= 1024) {
          setSidebarCollapsed(true);
        } else if (window.innerWidth >= 1100) {
          setSidebarCollapsed(false);
        }
      }
      if (window.innerWidth >= 1024 && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileDrawerOpen]);

  const { aiAssistantOpen, setAiAssistantOpen, newRequestTemplate } = useApi();

  const handleRunCollection = (col, folder = null) => {
    setRunnerCollection(col);
    setRunnerFolder(folder);
    setRunnerModalOpen(true);
  };

  return (
    <div className={`flex flex-col min-h-screen h-auto w-full font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F7F8FA] text-slate-900'}`}>
      {/* Top Bar (Height: 64px, Pure White, 1px bottom border) */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenEnvironments={() => setEnvironmentModalOpen(true)}
        onOpenRunner={() => {
          setRunnerCollection(null);
          setRunnerModalOpen(true);
        }}
        onOpenCollections={() => setCollectionsModalOpen(true)}
        onOpenMockServer={() => setMockServerModalOpen(true)}
        onOpenApiDocs={() => setApiDocsModalOpen(true)}
        onOpenCurlImport={() => setCurlModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex relative min-h-0 items-stretch bg-[#F7F8FA] dark:bg-[#080C14]">
        {/* Left Sidebar (~300px, White, 1px right border) */}
        <Sidebar
          isOpen={mobileDrawerOpen}
          isCollapsed={sidebarCollapsed}
          onExpandSidebar={handleExpandSidebar}
          onClose={() => setMobileDrawerOpen(false)}
          onOpenCollections={() => setCollectionsModalOpen(true)}
          onOpenEnvironments={() => setEnvironmentModalOpen(true)}
          onRunCollection={handleRunCollection}
          onOpenMockServer={() => setMockServerModalOpen(true)}
          onOpenApiDocs={() => setApiDocsModalOpen(true)}
          onOpenCurlImport={() => setCurlModalOpen(true)}
        />

        {/* Content Area (~#F7F8FA page background with large white rounded card) */}
        <main className="flex-1 flex flex-col min-w-0 p-3 sm:p-4 lg:p-5 overflow-y-auto">
          {/* Large White Rounded Card (~12px radius, 1px border) */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#0D131F] border border-[#E1E5EA] dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
            {/* Soft Welcome/Info Banner (pale green-to-white gradient, dismissible) */}
            {!bannerDismissed && (
              <div className="bg-gradient-to-r from-[#F0F9ED] via-white to-white dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-slate-900/40 border-b border-[#E1E5EA] dark:border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#6CC24A]/20 flex items-center justify-center text-[#166534] shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-[#0E2A47] dark:text-slate-100 mr-2">
                      Welcome to PulseAPI Studio
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Design, test, and monitor APIs in organized folders with real-time response telemetry.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setApiDocsModalOpen(true)}
                    className="px-3 py-1 rounded-md bg-[#6CC24A] hover:bg-[#5BA83C] text-white font-semibold text-xs transition cursor-pointer shadow-2xs"
                  >
                    Learn more
                  </button>
                  <button
                    onClick={() => setBannerDismissed(true)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title="Dismiss Banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Card Header (Page title on left, Action buttons on right) */}
            <div className="px-5 py-3.5 border-b border-[#E1E5EA] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0D131F]">
              <div>
                <h1 className="font-bold text-sm sm:text-base text-[#0E2A47] dark:text-slate-100 tracking-tight">
                  API Workspace & Endpoints
                </h1>
                <p className="text-[11px] text-slate-500">
                  Organize distinct API services in folders and execute requests
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Outlined Secondary Button */}
                <button
                  onClick={() => setCollectionsModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6FC] text-[#0E2A47] dark:text-slate-200 font-semibold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Manage Workspace</span>
                </button>

                {/* Filled Blue Primary Button */}
                <button
                  onClick={newRequestTemplate}
                  className="px-4 py-1.5 rounded-md bg-[#0B63C5] hover:bg-[#0952A5] text-white font-semibold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add APIs</span>
                </button>
              </div>
            </div>

            {/* Request Builder & Tabs (Top Half) */}
            <div className="flex flex-col border-b border-[#E1E5EA] dark:border-slate-800 shrink-0">
              <RequestPane
                onOpenSaveModal={() => setSaveModalOpen(true)}
                onOpenCurlImport={() => setCurlModalOpen(true)}
              />
              <RequestTabs />
            </div>

            {/* Response Inspector (Bottom Half) */}
            <div className="flex-1 flex flex-col min-h-[380px]">
              <ResponsePane onOpenCurlImport={() => setCurlModalOpen(true)} />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <CollectionsModal isOpen={collectionsModalOpen} onClose={() => setCollectionsModalOpen(false)} />
      <EnvironmentModal isOpen={environmentModalOpen} onClose={() => setEnvironmentModalOpen(false)} />
      <CollectionRunnerModal
        isOpen={runnerModalOpen}
        onClose={() => {
          setRunnerModalOpen(false);
          setRunnerFolder(null);
        }}
        targetCollection={runnerCollection}
        targetFolder={runnerFolder}
      />
      <SaveRequestModal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
      <MockServerModal isOpen={mockServerModalOpen} onClose={() => setMockServerModalOpen(false)} />
      <ApiDocsModal isOpen={apiDocsModalOpen} onClose={() => setApiDocsModalOpen(false)} />
      <CurlImportModal isOpen={curlModalOpen} onClose={() => setCurlModalOpen(false)} />
      <AiAssistantDrawer isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </div>
  );
}

function StudioRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-slate-950 flex items-center justify-center text-xs text-slate-500">
        Loading PulseAPI Studio...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <StudioWorkbench />;
}

function AdminRoute() {
  const { user, adminUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-slate-950 flex items-center justify-center text-xs text-slate-500">
        Verifying administrator authorization...
      </div>
    );
  }

  const isAuthorizedAdmin = user?.role === 'admin' || adminUser?.role === 'admin';

  if (!isAuthorizedAdmin) {
    // Non-admin users are silently redirected to workbench so route existence is not revealed
    return <Navigate to="/app" replace />;
  }

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
          Loading Admin Console...
        </div>
      }
    >
      <AdminPage />
    </React.Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ApiProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/admin-dashboard" element={<AdminRoute />} />
            <Route path="/admin-console" element={<AdminRoute />} />
            <Route path="/app" element={<StudioRoute />} />
            <Route path="/workbench" element={<StudioRoute />} />
            <Route path="/requests" element={<Navigate to="/app" replace />} />
            <Route path="/studio" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ApiProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
