import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import EditEntryModal from '../components/EditEntryModal';

const STATUS_TABS = [
  { value: null, label: 'All' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DROPPED', label: 'Dropped' },
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

const TYPE_COLORS = {
  MOVIE: 'bg-movie',
  SERIES: 'bg-series',
  ANIME: 'bg-anime',
  GAME: 'bg-game',
  MANGA: 'bg-manga',
};

const TYPE_TEXT_COLORS = {
  MOVIE: 'text-movie',
  SERIES: 'text-series',
  ANIME: 'text-anime',
  GAME: 'text-game',
  MANGA: 'text-manga',
};

// Cycled through on card hover for the random-shadow-color glitch
// effect - mirrors Stitch's `colors` array exactly (primary red plus
// the three neon accents), just written as real hex since inline style
// can't reach into Tailwind's theme() at runtime.
const GLITCH_SHADOW_COLORS = ['#E3002B', '#00FFFF', '#FF00FF', '#FFBF00'];

function pickGlitchColor() {
  return GLITCH_SHADOW_COLORS[Math.floor(Math.random() * GLITCH_SHADOW_COLORS.length)];
}

export default function LibraryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);

  async function fetchLibrary() {
    try {
      const response = await apiGet('/library?size=100');
      setEntries(response.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLibrary();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const matchesStatus = statusFilter === null || entry.status === statusFilter;
    const matchesSearch = entry.mediaItem.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <p className="font-mono text-sm text-on-background/50 uppercase">Scanning archive...</p>;
  }

  if (error) {
    return <p className="font-mono text-sm text-primary uppercase">{error}</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH_DATABASE..."
            className="w-full bg-surface border-none border-b-2 border-primary text-on-background font-mono text-sm px-4 py-2 placeholder:text-on-background/20 focus:outline-none focus:bg-primary/10 transition-all"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-all ${
                statusFilter === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-surface text-on-background/50 border border-on-background/10 hover:border-primary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <p className="font-mono text-sm text-on-background/30 uppercase text-center py-16">
          {entries.length === 0
            ? 'Archive empty. Initialize your first entry.'
            : 'No entries match current filters.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredEntries.map((entry) => (
            <LibraryCard
              key={entry.id}
              entry={entry}
              onClick={() => setEditingEntry(entry)}
            />
          ))}
        </div>
      )}

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => {
            setEditingEntry(null);
            fetchLibrary();
          }}
        />
      )}
    </div>
  );
}

// Split out from the grid map so useState (the glitch shadow color) is
// scoped per-card, not shared across the whole grid - each card needs
// its own independent hover state, same reason each needed its own
// group/hover in the original Tailwind-only version.
function LibraryCard({ entry, onClick }) {
  const [shadowColor, setShadowColor] = useState(null);

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setShadowColor(pickGlitchColor())}
      onMouseLeave={() => setShadowColor(null)}
      style={{ boxShadow: shadowColor ? `10px 10px 0px 0px ${shadowColor}` : 'none' }}
      className="group relative bg-surface border-2 border-on-background/10 hover:border-primary transition-all duration-300 clip-diagonal hover:-translate-y-2 hover-glitch cursor-pointer"
    >
      <div className="relative h-80 overflow-hidden">
        {entry.mediaItem.imageUrl ? (
          <img
            src={entry.mediaItem.imageUrl}
            alt={entry.mediaItem.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full ${TYPE_COLORS[entry.mediaItem.type]} opacity-20 flex items-center justify-center`}>
            <span className="font-display text-2xl italic font-black text-on-background/40 uppercase">
              {entry.mediaItem.type}
            </span>
          </div>
        )}

        <div className={`absolute top-4 left-0 ${TYPE_COLORS[entry.mediaItem.type]} text-black px-6 py-1 clip-badge font-mono text-[11px] font-black z-20 uppercase`}>
          {entry.mediaItem.type}
        </div>

        <div className="absolute bottom-6 -right-2 bg-primary text-white px-6 py-1 -rotate-6 font-display text-sm font-black italic shadow-lg z-20 uppercase">
          {entry.status.replace('_', ' ')}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80" />
      </div>

      <div className="p-6">
        <h3 className={`font-display text-lg font-black uppercase mb-1 truncate ${TYPE_TEXT_COLORS[entry.mediaItem.type]}`}>
          {entry.mediaItem.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-on-background/50">
            {entry.mediaItem.releaseYear ?? '----'}
          </p>
          {entry.rating && (
            <span className="font-mono text-xs text-primary">RATING: {entry.rating}/10</span>
          )}
        </div>
        {entry.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <span key={tag} className="font-mono text-[9px] text-on-background/40 border border-on-background/10 px-1.5 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}