import { m } from 'motion/react';
import { Library, Zap, Crosshair, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { progressFor } from '../lib/progress';
import Companion from './Companion';

const NAV_ITEMS = [
  { key: 'library', label: 'Collection', short: 'Vault', icon: Library, hotkey: '1' },
  { key: 'stats', label: 'Stats', short: 'Stats', icon: Zap, hotkey: '2' },
  { key: 'recommendations', label: 'Targets', short: 'Targets', icon: Crosshair, hotkey: '3' },
];

const ease = [0.16, 1, 0.3, 1];

// Desktop: a slanted black sidebar (the slant lives on a background
// layer, so the text itself is never skewed/blurred). Mobile: slim top
// bar + bottom tab bar. Navigation state is lifted to App.jsx.
export default function Shell({ activeView, onNavigate, onAddNew, onLogout, overlay, children }) {
  const { user } = useAuth();
  const { stats } = useVault();
  const progress = stats ? progressFor(stats) : null;

  return (
    <div className="min-h-dvh">
      {/* ---------- Desktop sidebar ---------- */}
      <m.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease, delay: 0.15 }}
        className="hidden md:flex fixed inset-y-0 left-0 z-30 w-72 flex-col"
      >
        <div aria-hidden="true" className="absolute inset-0 -right-6 bg-surface origin-top-left -skew-x-3 border-r-4 border-primary shadow-[8px_0_0_0_var(--color-primary)]" />
        <div aria-hidden="true" className="absolute inset-0 text-primary/[0.07] halftone" />

        <div className="relative flex h-full flex-col py-7">
          <div className="px-7">
            <p className="font-display italic font-black text-[2.1rem] leading-none tracking-tighter uppercase">
              <span className="text-primary">Media</span>
              <span className="bg-paper text-ink px-1.5 ml-0.5">Vault</span>
            </p>
            <p className="hud-label text-on-surface-variant/60 mt-3 truncate">Agent // {user.username}</p>
          </div>

          <nav className="mt-10 space-y-1.5 pr-4" aria-label="Main">
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const active = activeView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex w-full items-center gap-4 h-14 pl-7 pr-4 text-left transition-[translate,color] duration-200 ease-(--ease-snap) ${
                    active ? 'text-paper' : 'text-on-background/55 hover:text-paper hover:translate-x-2'
                  }`}
                >
                  {active && (
                    <m.span
                      layoutId="nav-slab"
                      className="absolute inset-y-0 -left-2 right-0 bg-primary -skew-x-12 shadow-[5px_5px_0_0_var(--color-paper)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    />
                  )}
                  <span className={`relative font-mono text-[11px] font-bold ${active ? 'text-paper/70' : 'text-primary'}`}>0{i + 1}</span>
                  <Icon size={20} strokeWidth={2.5} className="relative" />
                  <span className="relative font-display italic font-black text-2xl uppercase tracking-tight">{item.label}</span>
                  <kbd className="relative ml-auto font-mono text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">{item.hotkey}</kbd>
                </button>
              );
            })}
          </nav>

          <div className="px-7 mt-8">
            <button onClick={onAddNew} className="btn-paper w-full">
              <Plus size={18} strokeWidth={3} /> Log a Title
              <kbd className="ml-auto font-mono not-italic text-[10px] opacity-50">N</kbd>
            </button>
          </div>

          <div className="mt-auto px-6 [@media(max-height:760px)]:hidden">
            <Companion key={activeView} view={activeView} />
          </div>

          <div className="px-6 mt-5">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0 grid place-items-center size-14 bg-primary clip-burst">
                <span className="font-display italic font-black text-lg leading-none text-paper">{progress ? progress.level : '–'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="hud-label text-on-background/50">Level · {progress?.title ?? '...'}</p>
                <div
                  className="mt-1.5 h-2.5 bg-ink -skew-x-12 overflow-hidden"
                  title={progress ? `${progress.into} / ${progress.needed} XP` : undefined}
                >
                  <m.div
                    className="h-full bg-primary origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress?.pct ?? 0 }}
                    transition={{ duration: 0.9, ease }}
                  />
                </div>
              </div>
              <button
                onClick={onLogout}
                aria-label="Log out"
                title="Log out"
                className="size-10 grid place-items-center text-on-background/50 hover:text-paper hover:bg-primary transition-colors"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </m.aside>

      {/* ---------- Mobile top bar ---------- */}
      <m.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease, delay: 0.1 }}
        className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-surface border-b-4 border-primary"
      >
        <p className="font-display italic font-black text-xl tracking-tighter uppercase">
          <span className="text-primary">Media</span>
          <span className="bg-paper text-ink px-1 ml-0.5">Vault</span>
        </p>
        <div className="flex items-center gap-2">
          {progress && (
            <span className="bg-primary text-paper font-display italic font-black text-sm px-2 -skew-x-12">LV {progress.level}</span>
          )}
          <button onClick={onLogout} aria-label="Log out" className="size-10 grid place-items-center text-on-background/60 hover:text-primary">
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </m.header>

      {/* ---------- Content ---------- */}
      <main className="relative md:pl-72 overflow-x-clip">
        {overlay}
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-28 md:pb-16">{children}</div>
      </main>

      {/* ---------- Mobile bottom tabs ---------- */}
      <m.nav
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease, delay: 0.15 }}
        aria-label="Main"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t-4 border-primary pb-[env(safe-area-inset-bottom)]"
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
                className={`relative flex flex-col items-center justify-center gap-0.5 font-mono text-[10px] font-bold uppercase ${active ? 'text-paper' : 'text-on-background/50'}`}
              >
                {active && (
                  <m.span
                    layoutId="tab-slab"
                    className="absolute inset-x-2 inset-y-2 bg-primary -skew-x-12"
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                  />
                )}
                <Icon size={19} strokeWidth={2.5} className="relative" />
                <span className="relative">{item.short}</span>
              </button>
            );
          })}
          <button onClick={onAddNew} aria-label="Log a title" className="flex items-center justify-center">
            <span className="size-12 grid place-items-center bg-paper text-ink -skew-x-12 shadow-[3px_3px_0_0_var(--color-primary)] active:translate-y-0.5">
              <Plus size={22} strokeWidth={3} className="skew-x-12" />
            </span>
          </button>
        </div>
      </m.nav>
    </div>
  );
}
