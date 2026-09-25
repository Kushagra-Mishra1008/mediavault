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
import ScreenWipe from './components/ScreenWipe';
import PageSlash from './components/PageSlash';

const VIEWS = ['library', 'stats', 'recommendations'];

// Page swap timed to the PageSlash sweep: the old page ducks out fast,
// the new one kicks in from the right as the slash clears.
const pageMotion = {
  initial: { opacity: 0, x: 40, skewX: -4 },
  animate: { opacity: 1, x: 0, skewX: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.16, ease: 'easeIn' } },
};

function isTyping(target) {
  return target.closest('input, textarea, select, [contenteditable="true"]');
}

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [activeView, setActiveView] = useState('library');
  const [showAddModal, setShowAddModal] = useState(false);
  // Bumped after each successful add; LibraryPage refetches when it changes.
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);
  // Login/logout transition: { title, subtitle } while playing.
  const [wipe, setWipe] = useState(null);
  // Counts screen changes; each bump plays one PageSlash.
  const [slashKey, setSlashKey] = useState(0);

  const navigate = useCallback((view) => {
    if (view === activeView) return;
    setSlashKey((k) => k + 1);
    setActiveView(view);
    window.scrollTo({ top: 0 });
  }, [activeView]);

  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  function handleLogout() {
    setWipe({ title: 'See you soon', subtitle: user.username });
    logout();
    setActiveView('library');
  }

  // Keyboard: 1/2/3 switch screens, N logs a new title.
  useEffect(() => {
    if (!isAuthenticated) return;
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || document.querySelector('[role="dialog"]')) return;
      const index = ['1', '2', '3'].indexOf(e.key);
      if (index !== -1) navigate(VIEWS[index]);
      else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowAddModal(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthenticated, navigate]);

  return (
    <>
      {/* mode="wait": the login screen exits under the wipe before the
          app mounts and plays its own entrance. */}
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <m.div key="login" exit={{ opacity: 0, transition: { duration: 0.45 } }}>
            <LoginPage onAuthenticated={(name) => setWipe({ title: 'Welcome back', subtitle: name })} />
          </m.div>
        ) : (
          <m.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.45 } }}>
            <VaultProvider>
              <Shell
                activeView={activeView}
                onNavigate={navigate}
                onAddNew={() => setShowAddModal(true)}
                onLogout={handleLogout}
                overlay={slashKey > 0 && <PageSlash key={slashKey} onDone={() => setSlashKey(0)} />}
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

      {wipe && <ScreenWipe title={wipe.title} subtitle={wipe.subtitle} onDone={() => setWipe(null)} />}
    </>
  );
}

export default function App() {
  return (
    // LazyMotion + `m` keeps the animation runtime lean; reducedMotion
    // "user" honors the OS reduce-motion setting.
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster
          position="bottom-right"
          offset={24}
          mobileOffset={{ bottom: 88 }}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'flex items-center gap-3 w-[340px] max-w-[calc(100vw-2rem)] bg-ink border-l-8 border-primary shadow-[6px_6px_0_0_var(--color-primary)] px-4 py-3 font-sans text-paper',
              title: 'font-display italic font-black uppercase text-base leading-tight',
              description: 'font-mono text-[11px] uppercase text-on-surface-variant mt-0.5',
              icon: 'text-primary',
            },
          }}
        />
      </MotionConfig>
    </LazyMotion>
  );
}
