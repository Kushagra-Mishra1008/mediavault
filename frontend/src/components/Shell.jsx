import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { key: 'library', label: 'Collection', icon: '\u25A4', enabled: true },
  { key: 'stats', label: 'Activity', icon: '\u26A1', enabled: true },
  { key: 'recommendations', label: 'Discover', icon: '\u2315', enabled: true },
  { key: 'vault', label: 'Vault', icon: '\u26D3', enabled: false },
  { key: 'profile', label: 'Profile', icon: '\u25CF', enabled: false },
];

const VIEW_TITLES = {
  library: 'COLLECTION',
  stats: 'DASHBOARD',
  recommendations: 'DISCOVER',
};

export default function Shell({ activeView, onNavigate, onAddNew, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar - skewed panel with a hard red drop shadow standing in
          for a border. -skew-x-2 tilts the whole rectangle slightly;
          origin-top-left keeps the top-left corner pinned so it skews
          away from the page edge rather than into it. */}
      <aside className="w-72 shrink-0 -skew-x-2 origin-top-left border-r-4 border-primary bg-surface shadow-[8px_0px_0px_0px_theme(colors.primary)] flex flex-col py-8 relative z-20">
        <div className="skew-x-2">
          <div className="px-8 mb-12">
            <h1 className="font-display text-4xl font-black italic tracking-tighter text-primary uppercase">
              MediaVault
            </h1>
            <p className="font-mono text-[11px] text-on-surface-variant/70 tracking-widest mt-2 uppercase">
              Status: Operational
            </p>
          </div>

          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.key;
              return (
                <button
                  key={item.key}
                  disabled={!item.enabled}
                  title={!item.enabled ? 'Coming soon' : undefined}
                  onClick={() => item.enabled && onNavigate(item.key)}
                  className={`w-full flex items-center gap-4 py-4 px-8 uppercase font-bold font-mono text-xs tracking-wider transition-all ${
                    isActive
                      ? 'bg-primary text-white -ml-4 skew-x-6 translate-x-4'
                      : item.enabled
                        ? 'text-on-background/70 hover:text-primary hover:bg-surface-high hover:translate-x-2'
                        : 'text-on-background/20 cursor-not-allowed'
                  }`}
                >
                  <span className={isActive ? '-skew-x-6' : ''}>{item.icon}</span>
                  <span className={isActive ? '-skew-x-6' : ''}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="skew-x-2 mt-auto px-8 space-y-3 pt-8">
          <button
            onClick={onAddNew}
            className="w-full bg-primary text-white font-black font-mono text-xs uppercase tracking-wider py-3 skew-x-6 hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="-skew-x-6 block">+ Initialize Upload</span>
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-2 py-2 text-xs font-mono uppercase text-on-background/40 hover:text-primary transition-colors"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - same skew treatment as the sidebar, but on the Y
            axis instead of X, matching the mockup's angled top bar. */}
        <header className="h-24 -skew-y-1 origin-left border-b-8 border-primary bg-surface shadow-[0_8px_0_0_theme(colors.background)] flex items-center justify-between px-10 relative z-10">
          <div className="skew-y-1 flex items-baseline gap-4">
            <span className="font-display text-4xl font-black italic text-white bg-primary px-4 py-1 -rotate-2 inline-block uppercase">
              {VIEW_TITLES[activeView] ?? 'MEDIAVAULT'}
            </span>
          </div>

          <div className="skew-y-1 flex items-center gap-4">
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
              {user.username}
            </span>
            <div className="w-9 h-9 border-2 border-primary bg-background flex items-center justify-center text-primary font-display font-black text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}