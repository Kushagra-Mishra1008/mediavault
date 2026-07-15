import { useState } from 'react';
import { apiGet, apiPost } from '../api/client';

const TYPE_COLORS = {
  MOVIE: 'bg-movie',
  SERIES: 'bg-series',
  ANIME: 'bg-anime',
  GAME: 'bg-game',
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Tracks which recommendations have been added or dismissed, keyed by
  // title - lets each card update independently without touching the
  // others, and survives re-renders without needing to mutate the
  // original recommendations array.
  const [addedTitles, setAddedTitles] = useState(new Set());
  const [dismissedTitles, setDismissedTitles] = useState(new Set());

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      // No library-emptiness check on the frontend - the backend
      // already returns a specific, friendly message for that exact
      // case ("Add some items to your library first..."), so err.message
      // just IS the right thing to show, no need to duplicate that logic.
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

  // Same search-first pattern as AddEntryModal.findOrCreateMediaItem -
  // reuse an existing catalog entry if the title matches, otherwise
  // create fresh. Duplicated rather than extracted since it's the only
  // second call site right now.
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
      <div className="mb-6">
        <h2 className="font-display text-3xl text-ink tracking-wide">AI RECOMMENDATIONS</h2>
        <p className="font-mono text-xs text-ink/40 mt-1">
          Machine-generated suggestions based on your archival habits.
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-ink text-paper font-mono text-xs uppercase tracking-wider px-6 py-3 hover:bg-ink/90 disabled:opacity-50 transition mb-8"
      >
        {loading ? 'Consulting the archive...' : 'Generate Recommendations'}
      </button>

      {error && (
        <p className="font-mono text-sm text-stamp mb-6">{error}</p>
      )}

      {recommendations !== null && visibleRecommendations.length === 0 && !error && (
        <p className="font-mono text-sm text-ink/40">
          All suggestions reviewed. Generate again for a fresh batch.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleRecommendations.map((rec) => {
          const isAdded = addedTitles.has(rec.title);
          // LLM output isn't guaranteed to match enum casing exactly
          // even with the prompt constraining it - uppercase before
          // lookup, fall back to a neutral color if it's still unmatched
          // rather than crashing on an undefined className.
          const colorClass = TYPE_COLORS[rec.type?.toUpperCase()] || 'bg-ink/20';

          return (
            <div key={rec.title} className="bg-white border-2 border-ink/10 p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`${colorClass} text-white font-mono text-[10px] uppercase px-2 py-1`}>
                  {rec.type}
                </span>
              </div>
              <h3 className="font-display text-2xl text-ink leading-tight mb-2">
                {rec.title}
              </h3>
              <p className="font-sans text-sm text-ink/70 mb-4">
                {rec.reason}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => addToArchive(rec)}
                  disabled={isAdded}
                  className="flex-1 bg-ink text-paper font-mono text-xs uppercase tracking-wider py-2 hover:bg-ink/90 disabled:opacity-40 transition"
                >
                  {isAdded ? 'Added ✓' : 'Add to Archive'}
                </button>
                <button
                  onClick={() => dismiss(rec.title)}
                  className="font-mono text-xs uppercase tracking-wider border border-ink/20 text-ink/60 px-4 py-2 hover:border-ink/40 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}