import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import EditEntryModal from '../components/EditEntryModal';

const STATUS_TABS = [
  { value: null, label: 'All' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'Progress' },
  { value: 'COMPLETED', label: 'Done' },
  { value: 'DROPPED', label: 'Dropped' },
];

const TYPE_COLORS = {
  MOVIE: 'bg-movie',
  SERIES: 'bg-series',
  ANIME: 'bg-anime',
  GAME: 'bg-game',
};

export default function LibraryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [search, setSearch] = useState('');
  // The entry currently being edited, or null when the modal's closed.
  // Storing the whole object (not just an id) means EditEntryModal gets
  // everything it needs to pre-fill its form directly as a prop - no
  // second fetch required just to open the modal.
  const [editingEntry, setEditingEntry] = useState(null);

  // Pulled out of useEffect and given a name so it's callable again
  // later - specifically from EditEntryModal's onSuccess, to refetch
  // after a save or delete without needing App.jsx's key-remount trick.
  // Both the initial mount AND every subsequent refresh now go through
  // this exact same code path.
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
    return <p className="font-mono text-sm text-ink/50">Loading archive...</p>;
  }

  if (error) {
    return <p className="font-mono text-sm text-stamp">{error}</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find media by title..."
            className="w-full border border-ink/20 bg-white px-4 py-2 text-sm placeholder:text-ink/30 focus:outline-none focus:border-ink"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition ${
                statusFilter === tab.value
                  ? 'bg-movie text-white'
                  : 'bg-white text-ink/60 border border-ink/20 hover:border-ink/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <p className="font-mono text-sm text-ink/40 text-center py-12">
          {entries.length === 0
            ? 'Your archive is empty. Add your first entry to get started.'
            : 'No entries match your current filters.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setEditingEntry(entry)}
              className="bg-white border-2 border-ink/10 hover:border-ink/30 transition group cursor-pointer"
            >
              <div className="relative aspect-[2/3] bg-ink/5">
                {entry.mediaItem.imageUrl ? (
                  <img
                    src={entry.mediaItem.imageUrl}
                    alt={entry.mediaItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${TYPE_COLORS[entry.mediaItem.type]} opacity-20 flex items-center justify-center`}>
                    <span className="font-display text-2xl text-ink/40">{entry.mediaItem.type}</span>
                  </div>
                )}
                <span className={`absolute top-0 right-0 ${TYPE_COLORS[entry.mediaItem.type]} text-white text-[10px] font-mono uppercase px-2 py-1`}>
                  {entry.mediaItem.type}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-display text-lg text-ink leading-tight truncate">
                  {entry.mediaItem.title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xs text-ink/50">
                    {entry.mediaItem.releaseYear}
                  </span>
                  {entry.rating && (
                    <span className="font-mono text-xs text-ink/70">★ {entry.rating}/10</span>
                  )}
                </div>
              </div>
            </div>
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