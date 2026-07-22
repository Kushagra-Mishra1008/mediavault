import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';

const STATUS_LABELS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
  WISHLIST: 'Wishlist',
  ON_HOLD: 'On Hold',
};

const TYPE_COLORS = {
  MOVIE: 'bg-movie',
  SERIES: 'bg-series',
  ANIME: 'bg-anime',
  GAME: 'bg-game',
  MANGA: 'bg-manga',
};

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [recentEntry, setRecentEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsData, recentData] = await Promise.all([
          apiGet('/stats'),
          apiGet('/library?size=1&sort=addedAt,desc'),
        ]);
        setStats(statsData);
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
    return <p className="font-mono text-sm text-on-background/50 uppercase">Loading readout...</p>;
  }

  if (error) {
    return <p className="font-mono text-sm text-primary uppercase">{error}</p>;
  }

  const typeEntries = ['MOVIE', 'SERIES', 'ANIME', 'GAME', 'MANGA'].map((type) => ({
    type,
    count: stats.byType[type] ?? 0,
  }));

  const statusEntries = Object.keys(STATUS_LABELS).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: stats.byStatus[status] ?? 0,
  }));

  // byGenre is a LinkedHashMap on the backend, already ordered highest
  // count first (see the ORDER BY in countByGenreGrouped) - Object.entries
  // preserves that same order for a plain JS object, so no re-sorting
  // needed here, just capping the display at the top 5 so this doesn't
  // grow unbounded as genres accumulate.
  const genreEntries = Object.entries(stats.byGenre ?? {}).slice(0, 5);

  return (
    <div>
      <div className="mb-10">
        <h2 className="font-display text-4xl font-black italic text-white uppercase">
          Consumption_Metrics
        </h2>
        <p className="font-mono text-xs text-on-background/40 mt-1 uppercase">
          Full breakdown of archived assets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Records */}
        <div className="bg-surface border-l-8 border-primary p-6 relative overflow-hidden">
          <p className="font-mono text-xs text-primary mb-2 uppercase">// Total_Records</p>
          <h3 className="font-display text-6xl leading-none font-black text-white">
            {stats.totalEntries}
          </h3>
        </div>

        {/* Average Rating */}
        <div className="bg-surface border-l-8 border-primary p-6">
          <p className="font-mono text-xs text-primary mb-2 uppercase">// Avg_Rating</p>
          {stats.averageRating ? (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-6xl leading-none font-black text-white">
                {stats.averageRating.toFixed(1)}
              </span>
              <span className="font-mono text-on-background/40">/10</span>
            </div>
          ) : (
            <p className="font-mono text-sm text-on-background/30 uppercase mt-2">No ratings yet</p>
          )}
        </div>

        {/* Top Genre */}
        <div className="bg-primary p-6">
          <p className="font-mono text-xs text-white/70 mb-2 uppercase">// Top_Genre</p>
          <h3 className="font-display text-3xl font-black italic text-white uppercase truncate">
            {stats.topGenre ?? 'N/A'}
          </h3>
        </div>

        {/* Type Breakdown */}
        <div className="bg-surface p-6 md:col-span-2">
          <p className="font-mono text-xs text-primary mb-4 uppercase">// Type_Distribution</p>
          <div className="space-y-3">
            {typeEntries.map(({ type, count }) => {
              const pct = stats.totalEntries > 0 ? Math.round((count / stats.totalEntries) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between font-mono text-xs text-on-background/60 mb-1 uppercase">
                    <span>{type}</span>
                    <span>{count} · {pct}%</span>
                  </div>
                  <div className="h-2 bg-surface-high w-full overflow-hidden">
                    <div className={`h-full ${TYPE_COLORS[type]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-surface p-6">
          <p className="font-mono text-xs text-primary mb-4 uppercase">// Recent_Upload</p>
          {recentEntry ? (
            <div className="flex gap-4">
              <div className="w-16 h-24 bg-surface-high flex-shrink-0 overflow-hidden grayscale">
                {recentEntry.mediaItem.imageUrl && (
                  <img
                    src={recentEntry.mediaItem.imageUrl}
                    alt={recentEntry.mediaItem.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-display text-lg font-black text-white leading-tight uppercase">
                  {recentEntry.mediaItem.title}
                </p>
                <p className="font-mono text-xs text-on-background/40 mt-1 uppercase">
                  {recentEntry.mediaItem.type}
                </p>
              </div>
            </div>
          ) : (
            <p className="font-mono text-xs text-on-background/30 uppercase">Nothing archived yet.</p>
          )}
        </div>

        {/* Status Breakdown - all 6 real statuses now */}
        <div className="bg-surface p-6 md:col-span-3">
          <p className="font-mono text-xs text-primary mb-4 uppercase">// Status_Breakdown</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {statusEntries.map(({ status, label, count }) => (
              <div key={status}>
                <p className="font-display text-4xl font-black text-white">{count}</p>
                <p className="font-mono text-[10px] text-on-background/50 mt-1 uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Breakdown - new, backed by the real countByGenreGrouped
            query. Skipped entirely if the user has no genre-tagged
            entries (backend returns an empty byGenre, not an error). */}
        {genreEntries.length > 0 && (
          <div className="bg-surface p-6 md:col-span-3">
            <p className="font-mono text-xs text-primary mb-4 uppercase">// Popular_Genres</p>
            <div className="flex flex-wrap gap-3">
              {genreEntries.map(([genre, count]) => (
                <span
                  key={genre}
                  className="bg-surface-high border border-primary/30 text-white font-mono text-xs px-4 py-2 -skew-x-6 hover:bg-primary hover:border-primary transition-all"
                >
                  <span className="inline-block skew-x-6">{genre} [{count}]</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}