import { useEffect, useMemo, useRef, useState } from 'react';
import { m } from 'motion/react';
import { Search, X } from 'lucide-react';
import { apiGet } from '../api/client';
import { STATUSES, STATUS_KEYS, TYPES, TYPE_KEYS, typeMeta } from '../lib/media';
import { PageHeader, SlashPicker, StatusStamp, TypeBadge, EmptyState, Poster } from '../components/ui';
import EditEntryModal from '../components/EditEntryModal';

// refreshKey - bumped by App after the Add modal saves; triggers a refetch
// without remounting (so no skeleton flash).
export default function LibraryPage({ refreshKey, onAddNew }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    apiGet('/library?size=100&sort=addedAt,desc')
      .then((response) => {
        if (cancelled) return;
        setEntries(response.content);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [refreshKey]);

  // "/" jumps to search.
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
    const counts = {};
    for (const e of entries) counts[e.status] = (counts[e.status] ?? 0) + 1;
    return counts;
  }, [entries]);

  // Most-used tags first, capped so the row stays one glance wide.
  const topTags = useMemo(() => {
    const counts = new Map();
    for (const e of entries) for (const t of e.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t);
  }, [entries]);

  const query = search.trim().toLowerCase();
  const filtered = entries.filter(
    (e) =>
      (statusFilter === null || e.status === statusFilter) &&
      (typeFilter === null || e.mediaItem.type === typeFilter) &&
      (tagFilter === null || e.tags?.includes(tagFilter)) &&
      e.mediaItem.title.toLowerCase().includes(query)
  );
  const hasFilters = statusFilter !== null || typeFilter !== null || tagFilter !== null || query !== '';

  function clearFilters() {
    setStatusFilter(null);
    setTypeFilter(null);
    setTagFilter(null);
    setSearch('');
  }

  const statusOptions = [
    { value: null, label: 'All', count: entries.length },
    ...STATUS_KEYS.map((k) => ({ value: k, label: STATUSES[k].label, count: statusCounts[k] ?? 0 })),
  ];

  return (
    <div>
      <PageHeader
        index="01"
        title="Collection"
        subtitle={loading ? 'Scanning the vault…' : `${entries.length} ${entries.length === 1 ? 'title' : 'titles'} secured`}
      />

      {/* ---------- Toolbar ---------- */}
      <div className="space-y-4 mb-10">
        <label className="relative block max-w-2xl">
          <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
            placeholder="Search the vault…"
            aria-label="Search the vault"
            className="field pl-12 pr-12 bg-surface"
          />
          <kbd className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-on-background/30 border border-on-background/20 px-1.5 pointer-events-none">/</kbd>
        </label>

        <SlashPicker id="lib-status" options={statusOptions} value={statusFilter} onChange={setStatusFilter} />

        <div className="flex flex-wrap items-center gap-2">
          {TYPE_KEYS.map((key) => {
            const meta = TYPES[key];
            const Icon = meta.icon;
            const active = typeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setTypeFilter(active ? null : key)}
                aria-pressed={active}
                className={`clip-badge inline-flex items-center gap-1.5 h-8 pl-3 pr-4 font-mono text-[10px] font-extrabold uppercase transition-[background-color,color,translate] duration-150 ${
                  active ? `${meta.bg} text-ink -translate-y-0.5` : `bg-surface ${meta.text} hover:bg-surface-high`
                }`}
              >
                <Icon size={12} strokeWidth={2.75} />
                {meta.label}
              </button>
            );
          })}
          {topTags.map((tag) => {
            const active = tagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => setTagFilter(active ? null : tag)}
                aria-pressed={active}
                className={`h-8 px-2.5 font-mono text-[11px] border transition-colors ${
                  active ? 'bg-paper text-ink border-paper' : 'border-on-background/15 text-on-background/50 hover:text-paper hover:border-on-background/40'
                }`}
              >
                #{tag}
              </button>
            );
          })}
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 h-8 px-2 font-mono text-[11px] uppercase text-primary hover:text-paper">
              <X size={13} strokeWidth={3} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ---------- Grid ---------- */}
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <p className="bg-primary text-paper font-mono text-sm uppercase p-4">{error}</p>
      ) : entries.length === 0 ? (
        <EmptyState line="The vault's empty. That's a crime." title="Nothing here yet">
          <p>Log your first movie, series, anime, game or manga.</p>
          <button onClick={onAddNew} className="btn-primary mt-6">Log a Title</button>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState line="Nope. Nothing matches that." title="No hits">
          <p>Try a different search or clear the filters.</p>
          <button onClick={clearFilters} className="btn-paper mt-6">Clear filters</button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8 sm:gap-x-7 sm:gap-y-10">
          {filtered.map((entry, i) => (
            <LibraryCard key={entry.id} entry={entry} index={i} onOpen={() => setEditingEntry(entry)} />
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

// The poster only gets its shared-layout id once the card is hovered or
// focused. That's what lets it morph into the edit dialog on click,
// without paying layout-measuring costs on every card in the grid.
function LibraryCard({ entry, index, onOpen }) {
  const [armed, setArmed] = useState(false);
  const { mediaItem } = entry;
  const meta = typeMeta(mediaItem.type);

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => setArmed(true)}
      onFocus={() => setArmed(true)}
      style={{ animationDelay: `${Math.min(index, 14) * 40}ms`, '--type': meta.hex }}
      className="slam-in group relative text-left transition-[translate] duration-200 ease-(--ease-snap) hover:-translate-y-2 focus-visible:-translate-y-2"
    >
      {/* Hard offset "shadow" in the type's color. A separate layer,
          because clip-path on the poster would cut off a box-shadow. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 aspect-[2/3] translate-x-2.5 translate-y-2.5 bg-(--type) clip-diagonal opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      />
      <m.div
        layoutId={armed ? `poster-${entry.id}` : undefined}
        className="relative aspect-[2/3] overflow-hidden bg-surface border-4 border-surface clip-diagonal transition-[border-color] duration-200 group-hover:border-paper group-hover:[animation:glitch-once_0.25s_steps(4)]"
      >
        <Poster src={mediaItem.imageUrl} title={mediaItem.title} type={mediaItem.type} className="group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <TypeBadge type={mediaItem.type} className="absolute top-3 left-0" />
        {entry.rating != null && (
          <span className="absolute top-2.5 right-2.5 grid place-items-center size-10 bg-ink clip-burst font-display italic font-black text-paper text-sm">
            {entry.rating}
          </span>
        )}
        <StatusStamp status={entry.status} className="absolute bottom-3 right-2 shadow-[3px_3px_0_0_var(--color-ink)]" />
      </m.div>

      <div className="pt-3 pr-1">
        <h3 className={`font-display italic font-black uppercase text-base sm:text-lg leading-tight line-clamp-2 ${meta.text}`}>
          {mediaItem.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-on-background/45">
          <span>{mediaItem.releaseYear ?? '----'}</span>
          {mediaItem.genre && <span className="truncate">· {mediaItem.genre}</span>}
        </div>
        {entry.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="font-mono text-[10px] text-on-background/40 border border-on-background/10 px-1.5">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8 sm:gap-x-7 sm:gap-y-10">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[2/3] clip-diagonal" />
          <div className="skeleton h-4 w-3/4 mt-3" />
        </div>
      ))}
    </div>
  );
}
