import { useEffect, useMemo, useRef, useState } from 'react';
import { m } from 'motion/react';
import { Search, Star, Plus, X } from 'lucide-react';
import { apiGet } from '../api/client';
import { STATUSES, STATUS_KEYS, TYPES, TYPE_KEYS, typeMeta } from '../lib/media';
import { PageHeader, StatusBadge, TypeBadge, EmptyState, Poster } from '../components/ui';
import EditEntryModal from '../components/EditEntryModal';

const STATUS_TABS = [{ value: null, label: 'All' }, ...STATUS_KEYS.map((k) => ({ value: k, label: STATUSES[k].short }))];


// refreshKey - bumped by App after the Add modal saves; triggers a refetch.
export default function LibraryPage({ refreshKey, onAddNew }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    apiGet('/library?size=100&sort=addedAt,desc')
      .then((response) => {
        if (!cancelled) {
          setEntries(response.content);
          setError(null);
        }
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [refreshKey]);

  // "/" jumps to search, like most game launchers and dev tools.
  useEffect(() => {
    function onKey(e) {
      if (e.key === '/' && !e.target.closest('input, textarea') && !document.querySelector('[role="dialog"]')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { all: entries.length };
    for (const e of entries) counts[e.status] = (counts[e.status] ?? 0) + 1;
    return counts;
  }, [entries]);

  const query = search.trim().toLowerCase();
  const filteredEntries = entries.filter(
    (entry) =>
      (statusFilter === null || entry.status === statusFilter) &&
      (typeFilter === null || entry.mediaItem.type === typeFilter) &&
      entry.mediaItem.title.toLowerCase().includes(query)
  );

  const hasFilters = statusFilter !== null || typeFilter !== null || query !== '';

  function clearFilters() {
    setStatusFilter(null);
    setTypeFilter(null);
    setSearch('');
  }

  return (
    <div>
      <PageHeader
        index="01"
        eyebrow="Collection"
        title="Library"
        subtitle={loading ? 'Loading your vault…' : `${entries.length} ${entries.length === 1 ? 'title' : 'titles'} in your vault`}
      />

      {/* ---------- Toolbar ---------- */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <label className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
            placeholder="Search your library…"
            aria-label="Search your library"
            className="field pl-10 pr-10 bg-panel"
          />
          <kbd className="hidden sm:grid absolute right-3 top-1/2 -translate-y-1/2 place-items-center size-5 rounded border border-white/10 text-[10px] text-faint pointer-events-none">
            /
          </kbd>
        </label>

        <div className="flex gap-1 rounded-lg bg-panel border border-white/[0.06] p-1 overflow-x-auto" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            const count = tab.value === null ? statusCounts.all : statusCounts[tab.value] ?? 0;
            return (
              <button
                key={tab.label}
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab.value)}
                className={`relative shrink-0 h-9 px-3.5 rounded-md text-sm font-medium transition-colors ${
                  active ? 'text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {active && (
                  <m.span
                    layoutId="library-status"
                    className="absolute inset-0 rounded-md bg-raised border border-white/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {tab.label}
                  <span className={`text-[11px] tabular-nums ${active ? 'text-accent' : 'text-faint'}`}>{count}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {TYPE_KEYS.map((key) => {
          const meta = TYPES[key];
          const Icon = meta.icon;
          const active = typeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(active ? null : key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium transition-colors ${
                active ? `${meta.border} ${meta.text} bg-white/[0.04]` : 'border-white/[0.08] text-muted hover:text-fg hover:border-white/20'
              }`}
            >
              <Icon size={13} />
              {meta.label}
            </button>
          );
        })}
        {hasFilters && (
          <button onClick={clearFilters} className="inline-flex items-center gap-1 h-8 px-2 text-xs text-faint hover:text-fg transition-colors">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* ---------- Grid ---------- */}
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <p className="panel p-4 text-sm text-danger">{error}</p>
      ) : entries.length === 0 ? (
        <EmptyState sprite="vaulty" title="Your vault is empty">
          <p>Vaulty is hungry. Add your first movie, show, anime or game.</p>
          <button onClick={onAddNew} className="btn-primary mt-6">
            <Plus size={15} strokeWidth={2.5} /> Add First Entry
          </button>
        </EmptyState>
      ) : filteredEntries.length === 0 ? (
        <EmptyState sprite="telly" title="No signal">
          <p>Telly couldn't find anything matching that. Try another search or clear the filters.</p>
          <button onClick={clearFilters} className="btn-outline mt-6">Clear filters</button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredEntries.map((entry, i) => (
            <MediaCard key={entry.id} entry={entry} index={i} onOpen={() => setEditingEntry(entry)} />
          ))}
        </div>
      )}

      <EditEntryModal
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSaved={(updated) => {
          setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
          setEditingEntry(null);
        }}
        onDeleted={(id) => {
          setEntries((prev) => prev.filter((e) => e.id !== id));
          setEditingEntry(null);
        }}
      />
    </div>
  );
}

function MediaCard({ entry, index, onOpen }) {
  const { mediaItem } = entry;
  const meta = typeMeta(mediaItem.type);

  return (
    // Entrance is a plain CSS animation (see .card-in) rather than a motion
    // component per card - with 100 cards that's the difference between a
    // smooth page switch and a dropped frame. Delay is capped so the
    // bottom rows of a big library don't wait seconds to appear.
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(index, 14) * 35}ms` }}
      className="card-in group relative text-left rounded-xl overflow-hidden bg-panel border border-white/[0.06] transition-[border-color,translate] duration-300 ease-(--ease-snap) hover:-translate-y-1 hover:border-white/20 focus-visible:-translate-y-1"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-raised">
        <Poster
          src={mediaItem.imageUrl}
          type={mediaItem.type}
          spriteSize={80}
          className="group-hover:scale-105"
        />

        {/* Readability gradient under the title */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        {/* Type-colored bar that sweeps in along the bottom on hover */}
        <div className={`absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 ${meta.bg} transition-transform duration-300 ease-(--ease-snap) group-hover:scale-x-100`} />

        <TypeBadge type={mediaItem.type} className="absolute top-2.5 left-2.5" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="font-display font-semibold text-base leading-tight line-clamp-2">{mediaItem.title}</h3>
          <div className="flex items-center justify-between gap-2 mt-2">
            <StatusBadge status={entry.status} className="px-1.5!" />
            {entry.rating != null && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums">
                <Star size={12} className="fill-movie text-movie" />
                {entry.rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="skeleton aspect-[2/3] rounded-xl" />
      ))}
    </div>
  );
}
