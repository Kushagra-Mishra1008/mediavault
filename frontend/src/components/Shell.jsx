import { m } from 'motion/react';
import { Library, ChartColumn, Sparkles, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo, Wordmark } from './ui';

const NAV_ITEMS = [
  { key: 'library', label: 'Library', icon: Library, hotkey: '1' },
  { key: 'stats', label: 'Stats', icon: ChartColumn, hotkey: '2' },
  { key: 'recommendations', label: 'AI Picks', icon: Sparkles, hotkey: '3' },
];

const ease = [0.22, 1, 0.36, 1];

// Desktop: fixed left rail. Mobile: slim top bar + bottom tab bar.
// Navigation/add/logout state is lifted to App.jsx.
export default function Shell({ activeView, onNavigate, onAddNew, onLogout, children }) {
  const { user } = useAuth();
  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh">
      {/* ---------- Desktop rail ---------- */}
      <m.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-white/[0.06] bg-panel/95"
      >
        <div className="flex items-center gap-2.5 px-6 h-20">
          <Logo size={30} />
          <Wordmark className="text-lg" />
        </div>

        <div className="px-4">
          <button onClick={onAddNew} className="btn-primary w-full">
            <Plus size={16} strokeWidth={2.5} />
            New Entry
            <kbd className="ml-auto font-sans text-[10px] font-medium tracking-normal opacity-70">N</kbd>
          </button>
        </div>

        <nav className="mt-8 px-3 space-y-1" aria-label="Main">
          <p className="hud-label text-faint px-3 mb-3">Menu</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`group relative w-full flex items-center gap-3 h-11 px-3 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'text-fg' : 'text-muted hover:text-fg hover:bg-white/[0.03]'
                }`}
              >
                {active && (
                  <m.span
                    layoutId="rail-active"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/15 to-transparent border-l-2 border-accent"
                    transition={{ type: 'spring', stiffness: 450, damping: 38 }}
                  />
                )}
                <Icon size={18} className={`relative ${active ? 'text-accent' : ''}`} />
                <span className="relative">{item.label}</span>
                <kbd className="relative ml-auto text-[10px] text-faint opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.hotkey}
                </kbd>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-3">
          <div className="flex items-center gap-3 rounded-xl bg-void/60 border border-white/[0.06] p-2.5">
            <div className="clip-cut-sm size-9 shrink-0 grid place-items-center bg-gradient-to-br from-accent to-game font-display font-bold">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-[11px] text-success flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-success" /> Online
              </p>
            </div>
            <button
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
              className="size-9 grid place-items-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </m.aside>

      {/* ---------- Mobile top bar ---------- */}
      <m.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease, delay: 0.1 }}
        className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-white/[0.06] bg-panel/95"
      >
        <div className="flex items-center gap-2">
          <Logo size={26} />
          <Wordmark className="text-base" />
        </div>
        <button
          onClick={onLogout}
          aria-label="Log out"
          className="size-9 grid place-items-center rounded-lg text-muted hover:text-danger transition-colors"
        >
          <LogOut size={17} />
        </button>
      </m.header>

      {/* ---------- Content ---------- */}
      <main className="md:pl-64">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6 sm:pt-10 pb-28 md:pb-12">{children}</div>
      </main>

      {/* ---------- Mobile bottom tabs ---------- */}
      <m.nav
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease, delay: 0.15 }}
        aria-label="Main"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/[0.06] bg-panel/95 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-4 h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  active ? 'text-fg' : 'text-muted'
                }`}
              >
                {active && (
                  <m.span
                    layoutId="tab-active"
                    className="absolute top-0 h-0.5 w-10 bg-accent rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 38 }}
                  />
                )}
                <Icon size={20} className={active ? 'text-accent' : ''} />
                {item.label}
              </button>
            );
          })}
          <button onClick={onAddNew} className="flex items-center justify-center" aria-label="New entry">
            <span className="clip-cut size-11 grid place-items-center bg-accent text-white active:scale-95 transition-transform">
              <Plus size={20} strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </m.nav>
    </div>
  );
}
