import React, { useState } from 'react';
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

function MainApp() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
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
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenEnvironments={() => setEnvironmentModalOpen(true)}
        onOpenRunner={() => {
          setRunnerCollection(null);
          setRunnerModalOpen(true);
        }}
        onOpenCollections={() => setCollectionsModalOpen(true)}
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
    <AuthProvider>
      <ApiProvider>
        <MainApp />
      </ApiProvider>
    </AuthProvider>
  );
}
