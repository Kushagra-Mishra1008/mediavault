import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import Shell from './components/Shell';
import AddEntryModal from './components/AddEntryModal';
import StatsPage from './pages/StatsPage';
import RecommendationsPage from './pages/RecommendationsPage';

function AppContent() {
  const { loading, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('library');
  const [showAddModal, setShowAddModal] = useState(false);
  // Bumped after every successful add - passed as LibraryPage's `key`
  // below. React uses `key` to decide whether a component is "the same
  // instance" across re-renders; changing it forces a full unmount +
  // remount, which re-runs LibraryPage's useEffect and refetches fresh
  // data. Cheap trick for "refresh this on demand" without restructuring
  // where the fetch logic lives.
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="font-mono text-sm text-ink/50">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <Shell
        activeView={activeView}
        onNavigate={setActiveView}
        onAddNew={() => setShowAddModal(true)}
      >
        {activeView === 'library' && <LibraryPage key={libraryRefreshKey} />}
        {activeView === 'stats' && <StatsPage />}
        {activeView === 'recommendations' && <RecommendationsPage />}
      </Shell>

      {showAddModal && (
        <AddEntryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            setLibraryRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}