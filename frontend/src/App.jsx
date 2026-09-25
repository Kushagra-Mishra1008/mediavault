import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domMax, m } from 'motion/react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import StatsPage from './pages/StatsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import Shell from './components/Shell';
import AddEntryModal from './components/AddEntryModal';
import Background from './components/Background';
import ScreenWipe from './components/ScreenWipe';

const VIEWS = ['library', 'stats', 'recommendations'];

// Shared page transition: a short rise + fade in, a quicker fade out.
// Opacity/transform only, so it's GPU-composited and can't cause layout jank.
const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
};

function isTyping(target) {
  return target.closest('input, textarea, select, [contenteditable="true"]');
}

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [activeView, setActiveView] = useState('library');
  const [showAddModal, setShowAddModal] = useState(false);
  // Bumped after every successful add - LibraryPage refetches when it
  // changes (without remounting, so there's no skeleton flash).
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);
  // Each login/logout bumps this to play one ScreenWipe.
  const [wipeKey, setWipeKey] = useState(0);

  const navigate = useCallback((view) => {
    setActiveView(view);
    window.scrollTo({ top: 0 });
  }, []);

  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  function handleLogout() {
    setWipeKey((k) => k + 1);
    logout();
    setActiveView('library');
  }

  // Keyboard shortcuts: 1/2/3 switch views, N opens "new entry".
  useEffect(() => {
    if (!isAuthenticated) return;
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || document.querySelector('[role="dialog"]')) return;
      const index = ['1', '2', '3'].indexOf(e.key);
      if (index !== -1) {
        navigate(VIEWS[index]);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowAddModal(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthenticated, navigate]);

  return (
    <>
      {/* mode="wait": the login screen finishes exiting (under the wipe)
          before the app shell mounts and plays its own entrance. */}
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <m.div key="login" exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4 } }}>
            <LoginPage onAuthenticated={() => setWipeKey((k) => k + 1)} />
          </m.div>
        ) : (
          <m.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
            <VaultProvider>
              <Shell
                activeView={activeView}
                onNavigate={navigate}
                onAddNew={() => setShowAddModal(true)}
                onLogout={handleLogout}
              >
                <AnimatePresence mode="wait">
                  <m.div key={activeView} {...pageMotion}>
                    {activeView === 'library' && (
                      <LibraryPage refreshKey={libraryRefreshKey} onAddNew={() => setShowAddModal(true)} />
                    )}
                    {activeView === 'stats' && <StatsPage />}
                    {activeView === 'recommendations' && <RecommendationsPage />}
                  </m.div>
                </AnimatePresence>
              </Shell>

              <AddEntryModal
                open={showAddModal}
                onClose={closeAddModal}
                onSuccess={() => {
                  setShowAddModal(false);
                  setLibraryRefreshKey((k) => k + 1);
                }}
              />
            </VaultProvider>
          </m.div>
        )}
      </AnimatePresence>

      {wipeKey > 0 && <ScreenWipe key={wipeKey} onDone={() => setWipeKey(0)} />}
    </>
  );
}

export default function App() {
  return (
    // LazyMotion + `m` components keep the animation runtime lean;
    // reducedMotion="user" honors the OS "reduce motion" setting.
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <Background />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          offset={24}
          mobileOffset={{ bottom: 88 }}
          toastOptions={{
            className: 'bg-raised! border-white/10! text-fg! font-sans! rounded-xl!',
          }}
        />
      </MotionConfig>
    </LazyMotion>
  );
}
