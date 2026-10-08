import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider, useApi } from './context/ApiContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RequestPane } from './components/RequestPane';
import { RequestTabs } from './components/RequestTabs';
import { ResponsePane } from './components/ResponsePane';
import { AdminDashboard } from './components/AdminDashboard';
import { CollectionsModal } from './components/CollectionsModal';
import { EnvironmentModal } from './components/EnvironmentModal';
import { CollectionRunnerModal } from './components/CollectionRunnerModal';
import { SaveRequestModal } from './components/SaveRequestModal';
import { AuthModal } from './components/AuthModal';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
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
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [collectionsModalOpen, setCollectionsModalOpen] = useState(false);
  const [environmentModalOpen, setEnvironmentModalOpen] = useState(false);
  const [runnerModalOpen, setRunnerModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [runnerCollection, setRunnerCollection] = useState(null);

  const handleRunCollection = (col) => {
    setRunnerCollection(col);
    setRunnerModalOpen(true);
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenEnvironments={() => setEnvironmentModalOpen(true)}
        onOpenRunner={() => {
          setRunnerCollection(null);
          setRunnerModalOpen(true);
        }}
        onOpenCollections={() => setCollectionsModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          onOpenCollections={() => setCollectionsModalOpen(true)}
          onOpenEnvironments={() => setEnvironmentModalOpen(true)}
          onRunCollection={handleRunCollection}
        />

        {/* Center / Right Workbench */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/40">
          {/* Top Half: Request Builder */}
          <div className="h-1/2 flex flex-col border-b border-slate-800 overflow-hidden">
            <RequestPane onOpenSaveModal={() => setSaveModalOpen(true)} />
            <RequestTabs />
          </div>

          {/* Bottom Half: Response Inspector */}
          <div className="h-1/2 flex flex-col overflow-hidden">
            <ResponsePane />
          </div>
        </main>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <AdminDashboard isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <CollectionsModal isOpen={collectionsModalOpen} onClose={() => setCollectionsModalOpen(false)} />
      <EnvironmentModal isOpen={environmentModalOpen} onClose={() => setEnvironmentModalOpen(false)} />
      <CollectionRunnerModal
        isOpen={runnerModalOpen}
        onClose={() => setRunnerModalOpen(false)}
        targetCollection={runnerCollection}
      />
      <SaveRequestModal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
    </div>
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
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />

            {/* Admin Consoles */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin-dashboard" element={<AdminPage />} />
            <Route path="/admin-console" element={<AdminPage />} />

            {/* Studio Workbench */}
            <Route path="/app" element={<StudioWorkbench />} />
            <Route path="/workbench" element={<StudioWorkbench />} />
            <Route path="/requests" element={<Navigate to="/app" replace />} />
            <Route path="/studio" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </ApiProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
