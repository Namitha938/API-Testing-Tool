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
import { ProfileModal } from './components/ProfileModal';

function StudioWorkbench() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  const { aiAssistantOpen, setAiAssistantOpen } = useApi();

  const handleRunCollection = (col) => {
    setRunnerCollection(col);
    setRunnerModalOpen(true);
  };

  return (
    <div className={`flex flex-col min-h-screen h-auto w-full font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-[#0b0f17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navigation */}
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
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex relative min-h-0 items-stretch">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCollections={() => setCollectionsModalOpen(true)}
          onOpenEnvironments={() => setEnvironmentModalOpen(true)}
          onRunCollection={handleRunCollection}
          onOpenMockServer={() => setMockServerModalOpen(true)}
          onOpenApiDocs={() => setApiDocsModalOpen(true)}
        />

        {/* Center / Right Workbench */}
        <main className="flex-1 flex flex-col bg-slate-900/40 min-w-0 min-h-0 overflow-visible">
          {/* Top Half: Request Builder */}
          <div className="min-h-[380px] flex flex-col border-b border-slate-800 overflow-visible shrink-0">
            <RequestPane onOpenSaveModal={() => setSaveModalOpen(true)} />
            <RequestTabs />
          </div>

          {/* Bottom Half: Response Inspector */}
          <div className="min-h-[400px] flex flex-col overflow-visible shrink-0">
            <ResponsePane />
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
        onClose={() => setRunnerModalOpen(false)}
        targetCollection={runnerCollection}
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
  const guestAllowed = typeof window !== 'undefined' && sessionStorage.getItem('guestMode') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
        Loading API Testing Studio...
      </div>
    );
  }

  // If not logged in and didn't click guest mode, ALWAYS show the first page (LoginPage)
  if (!user && !guestAllowed) {
    return <Navigate to="/" replace />;
  }

  return <StudioWorkbench />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ApiProvider>
          <Routes>
            {/* FIRST PAGE: Login Page */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />

            {/* Redirect any legacy admin links */}
            <Route path="/admin" element={<Navigate to="/app" replace />} />
            <Route path="/admin-dashboard" element={<Navigate to="/app" replace />} />
            <Route path="/admin-console" element={<Navigate to="/app" replace />} />

            {/* SECOND PAGE: Studio Workbench */}
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
