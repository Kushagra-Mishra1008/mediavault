import { useState } from 'react';
import { apiGet, apiPost } from '../api/client';

const TYPE_COLORS = {
  MOVIE: 'bg-movie',
  SERIES: 'bg-series',
  ANIME: 'bg-anime',
  GAME: 'bg-game',
  MANGA: 'bg-manga',
};

// Cycled by card index so adjacent cards don't all lean the same
// direction - matches the scattered, overlapping-playing-cards look
// from the mockup rather than a uniform grid.
const ROTATIONS = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-1', '-rotate-3'];
const SHADOW_COLORS = ['#E3002B', '#00FFFF', '#FF00FF'];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedTitles, setAddedTitles] = useState(new Set());
  const [dismissedTitles, setDismissedTitles] = useState(new Set());

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet('/recommendations');
      setRecommendations(response.recommendations);
      setAddedTitles(new Set());
      setDismissedTitles(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addToArchive(rec) {
    try {
      const searchResult = await apiGet(`/media?search=${encodeURIComponent(rec.title)}`);
      const existing = searchResult.content.find(
        (item) => item.title.toLowerCase() === rec.title.toLowerCase()
      );

      const mediaItemId = existing
        ? existing.id
        : (await apiPost('/media', {
            title: rec.title,
            type: rec.type,
            genre: null,
            releaseYear: null,
            description: rec.reason,
          })).id;

      await apiPost('/library', {
        mediaItemId,
        status: 'PLANNED',
        rating: null,
        notes: '',
        tags: [],
      });

      setAddedTitles((prev) => new Set(prev).add(rec.title));
    } catch (err) {
      setError(err.message);
    }
  }

  function dismiss(title) {
    setDismissedTitles((prev) => new Set(prev).add(title));
  }

  const visibleRecommendations = (recommendations ?? []).filter(
    (rec) => !dismissedTitles.has(rec.title)
  );

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-4xl font-black italic text-white uppercase">
          AI Hyper-Targets
        </h2>
        <div className="flex items-center gap-4 mt-2">
          <span className="bg-primary text-white px-3 py-1 font-mono text-xs font-black -skew-x-12 uppercase">
            {recommendations ? `${visibleRecommendations.length} Active` : 'Standby'}
          </span>
          <div className="h-px flex-grow bg-on-background/10" />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-primary text-white font-display italic font-black uppercase px-8 py-4 my-8 hover:shadow-[6px_6px_0px_0px_#fff] hover:-translate-x-1 hover:-translate-y-1 disabled:opacity-50 transition-all"
      >
        {loading ? 'Consulting_Archive...' : 'Generate_Recommendations'}
      </button>

      {error && (
        <p className="font-mono text-sm text-primary uppercase mb-6">{error}</p>
      )}

      {recommendations !== null && visibleRecommendations.length === 0 && !error && (
        <p className="font-mono text-sm text-on-background/40 uppercase">
          All targets reviewed. Generate again for a fresh batch.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-12">
        {visibleRecommendations.map((rec, index) => {
          const isAdded = addedTitles.has(rec.title);
          const colorClass = TYPE_COLORS[rec.type?.toUpperCase()] || 'bg-on-background/20';
          const rotation = ROTATIONS[index % ROTATIONS.length];
          const shadowColor = SHADOW_COLORS[index % SHADOW_COLORS.length];

          return (
            <div
              key={rec.title}
              className={`relative group ${rotation} hover:rotate-0 transition-all hover:z-10 fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className="relative bg-surface-high border-2 border-on-background/20 p-1 hover-jitter"
                style={{ boxShadow: `12px 12px 0px 0px ${shadowColor}` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`${colorClass} text-black font-mono text-[10px] font-black uppercase px-3 py-1 skew-x-6`}>
                      <span className="inline-block -skew-x-6">{rec.type}</span>
                    </span>
                    {typeof rec.confidence === 'number' && (
                      <span className="bg-primary text-white font-mono text-xs font-black px-3 py-1 -skew-x-6">
                        <span className="inline-block skew-x-6">{rec.confidence.toFixed(1)}%</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl font-black italic text-white uppercase leading-tight mb-3">
                    {rec.title}
                  </h3>

                  <p className="font-mono text-xs text-on-background/60 uppercase leading-relaxed mb-6">
                    Reason: {rec.reason}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => addToArchive(rec)}
                      disabled={isAdded}
                      className="flex-1 bg-white text-background font-black font-mono text-xs uppercase py-3 hover:bg-primary hover:text-white disabled:opacity-40 transition-colors flex justify-between items-center px-4"
                    >
                      {isAdded ? 'Synced ✓' : 'Initialize_Sync'}
                      {!isAdded && <span>»</span>}
                    </button>
                    <button
                      onClick={() => dismiss(rec.title)}
                      className="font-mono text-xs uppercase text-on-background/40 hover:text-primary px-3 border border-on-background/10 hover:border-primary transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}