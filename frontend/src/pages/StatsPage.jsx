import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';

const STATUS_LABELS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

const TYPE_COLORS = {
  MOVIE: 'bg-movie',
  SERIES: 'bg-series',
  ANIME: 'bg-anime',
  GAME: 'bg-game',
};

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [recentEntry, setRecentEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        // Two independent requests, fetched in parallel with
        // Promise.all rather than one after another - they don't depend
        // on each other's results, so there's no reason to make the
        // user wait for both round-trips sequentially.
        const [statsData, recentData] = await Promise.all([
          apiGet('/stats'),
          apiGet('/library?size=1&sort=addedAt,desc'),
        ]);
        setStats(statsData);
        // .content[0] may not exist if the library is completely empty -
        // handled with ?. below rather than assuming it's always there.
        setRecentEntry(recentData.content[0] ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <p className="font-mono text-sm text-ink/50">Loading statistics...</p>;
  }

  if (error) {
    return <p className="font-mono text-sm text-stamp">{error}</p>;
  }

  // byType/byStatus only contain keys that actually have entries (see
  // the GROUP BY comment in LibraryEntryRepository) - defaulting to 0
  // here means every type/status always renders a row, even at zero,
  // rather than the breakdown silently shrinking as categories empty out.
  const typeEntries = ['MOVIE', 'SERIES', 'ANIME', 'GAME'].map((type) => ({
    type,
    count: stats.byType[type] ?? 0,
  }));

  const statusEntries = Object.keys(STATUS_LABELS).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: stats.byStatus[status] ?? 0,
  }));

  // Mockup shows a 5-star scale next to the /10 number - averageRating
  // is on a 1-10 scale, so /2 converts to a 5-star equivalent for the
  // filled-star count.
  const filledStars = stats.averageRating ? Math.round(stats.averageRating / 2) : 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-3xl text-ink tracking-wide">LIBRARY STATISTICS</h2>
        <p className="font-mono text-xs text-ink/40 mt-1">
          Detailed breakdown of your curated collection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Catalog Total */}
        <div className="bg-white border-2 border-ink/10 p-5">
          <span className="inline-block bg-ink text-paper font-mono text-[10px] uppercase px-2 py-0.5 mb-3">
            Summary
          </span>
          <p className="font-display text-5xl text-ink">{stats.totalEntries}</p>
          <p className="font-mono text-xs text-ink/50 mt-2">
            Individual media items tracked in private storage.
          </p>
        </div>

        {/* Critical Score */}
        <div className="bg-white border-2 border-ink/10 p-5">
          <span className="inline-block bg-movie text-white font-mono text-[10px] uppercase px-2 py-0.5 mb-3">
            Quality
          </span>
          {stats.averageRating ? (
            <>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={i <= filledStars ? 'text-movie' : 'text-ink/15'}>
                    ★
                  </span>
                ))}
              </div>
              <p className="font-display text-3xl text-ink">
                {stats.averageRating.toFixed(1)}<span className="text-lg text-ink/40">/10</span>
              </p>
            </>
          ) : (
            <p className="font-mono text-sm text-ink/40 mt-2">No ratings yet</p>
          )}
          <p className="font-mono text-xs text-ink/50 mt-2">Weighted curator average.</p>
        </div>

        {/* Type Breakdown */}
        <div className="bg-white border-2 border-ink/10 p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-3">
            Type Breakdown
          </p>
          <div className="space-y-2">
            {typeEntries.map(({ type, count }) => {
              const pct = stats.totalEntries > 0 ? Math.round((count / stats.totalEntries) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between font-mono text-xs text-ink/60 mb-0.5">
                    <span>{type}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-ink/5 w-full">
                    <div className={`h-full ${TYPE_COLORS[type]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown - replaces the mockup's Verified
            Viewings/Queue Depth boxes with real, honestly-labeled data */}
        <div className="bg-white border-2 border-ink/10 p-5 md:col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-4">
            Status Breakdown
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statusEntries.map(({ status, label, count }) => (
              <div key={status}>
                <p className="font-display text-3xl text-ink">{count}</p>
                <p className="font-mono text-xs text-ink/50 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-white border-2 border-ink/10 p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-3">
            Recently Added
          </p>
          {recentEntry ? (
            <div className="flex gap-3">
              <div className="w-16 h-24 bg-ink/5 flex-shrink-0 overflow-hidden">
                {recentEntry.mediaItem.imageUrl && (
                  <img
                    src={recentEntry.mediaItem.imageUrl}
                    alt={recentEntry.mediaItem.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-display text-lg text-ink leading-tight">
                  {recentEntry.mediaItem.title}
                </p>
                <p className="font-mono text-xs text-ink/40 mt-1">
                  {recentEntry.mediaItem.type}
                </p>
              </div>
            </div>
          ) : (
            <p className="font-mono text-xs text-ink/40">Nothing added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}