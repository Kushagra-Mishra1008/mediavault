import { useAuth } from '../context/AuthContext';

const SIDEBAR_ITEMS = [
  { key: 'all', label: 'All Media', enabled: true },
  { key: 'archive', label: 'Archive', enabled: false },
  { key: 'wishlist', label: 'Wishlist', enabled: false },
  { key: 'collections', label: 'Collections', enabled: false },
];

const TOP_NAV_ITEMS = [
  { key: 'library', label: 'Library' },
  { key: 'stats', label: 'Stats' },
  { key: 'recommendations', label: 'AI Recs' },
];

// New prop: onAddNew - App.jsx passes down a function that opens the
// modal. Shell doesn't manage that state itself, same "lifted state"
// pattern as activeView/onNavigate already established.
export default function Shell({ activeView, onNavigate, onAddNew, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-paper flex">

      <aside className="w-56 bg-white border-r border-ink/10 flex flex-col justify-between p-4">
        <div>
          <div className="mb-8">
            <h2 className="font-display text-xl text-ink tracking-wide">THE VAULT</h2>
            <p className="font-mono text-[10px] text-ink/40 uppercase tracking-wider">
              Private Archive
            </p>
          </div>

          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.key}
                disabled={!item.enabled}
                title={!item.enabled ? 'Coming soon' : undefined}
                className={`w-full text-left px-3 py-2 text-sm font-medium transition ${
                  item.enabled
                    ? 'bg-movie/10 text-ink border-l-2 border-movie'
                    : 'text-ink/30 cursor-not-allowed'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-2">
          <button
            onClick={onAddNew}
            className="w-full bg-ink text-paper font-mono text-xs uppercase tracking-wider py-2.5 hover:bg-ink/90 transition"
          >
            + Add New Entry
          </button>
          <button
            disabled
            title="Coming soon"
            className="w-full text-left px-3 py-2 text-sm text-ink/30 cursor-not-allowed"
          >
            Settings
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-ink/60 hover:text-ink"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-ink/10 bg-white px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="font-display text-2xl text-ink tracking-wide">MEDIAVAULT</h1>
            <nav className="flex gap-6">
              {TOP_NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`font-mono text-xs uppercase tracking-wider pb-1 transition ${
                    activeView === item.key
                      ? 'text-movie border-b-2 border-movie'
                      : 'text-ink/50 hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-ink/50">{user.username}</span>
            <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center text-ink/60 text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}