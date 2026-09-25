import { Film, Tv, Sparkles, Gamepad2, Bookmark, Play, Trophy, Ban } from 'lucide-react';
import { apiGet, apiPost } from '../api/client';

// One source of truth for how each media type looks. Class names are
// written out in full (not built from strings) so Tailwind's scanner
// can see them and generate the CSS.
export const TYPES = {
  MOVIE: { label: 'Movie', icon: Film, text: 'text-movie', bg: 'bg-movie', border: 'border-movie' },
  SERIES: { label: 'Series', icon: Tv, text: 'text-series', bg: 'bg-series', border: 'border-series' },
  ANIME: { label: 'Anime', icon: Sparkles, text: 'text-anime', bg: 'bg-anime', border: 'border-anime' },
  GAME: { label: 'Game', icon: Gamepad2, text: 'text-game', bg: 'bg-game', border: 'border-game' },
};
export const TYPE_KEYS = Object.keys(TYPES);

// LLM output (recommendations) isn't guaranteed to match enum casing -
// normalize and fall back to a neutral look instead of crashing.
export function typeMeta(type) {
  return TYPES[type?.toUpperCase()] ?? { label: type ?? 'Unknown', icon: Bookmark, text: 'text-muted', bg: 'bg-faint', border: 'border-faint' };
}

export const STATUSES = {
  PLANNED: { label: 'Planned', short: 'Planned', icon: Bookmark, text: 'text-muted', dot: 'bg-muted' },
  IN_PROGRESS: { label: 'In Progress', short: 'Active', icon: Play, text: 'text-cyan', dot: 'bg-cyan' },
  COMPLETED: { label: 'Completed', short: 'Done', icon: Trophy, text: 'text-success', dot: 'bg-success' },
  DROPPED: { label: 'Dropped', short: 'Dropped', icon: Ban, text: 'text-danger', dot: 'bg-danger' },
};
export const STATUS_KEYS = Object.keys(STATUSES);

// Search-first: reuse an existing catalog entry if the title already
// exists (case-insensitive) rather than filling the catalog with
// duplicate rows. Shared by the Add modal and AI recommendations.
export async function findOrCreateMediaItem({ title, type, description = null }) {
  const searchResult = await apiGet(`/media?search=${encodeURIComponent(title)}`);
  const existing = searchResult.content.find(
    (item) => item.title.toLowerCase() === title.toLowerCase()
  );
  if (existing) {
    return existing.id;
  }
  const created = await apiPost('/media', {
    title,
    type,
    genre: null,
    releaseYear: null,
    description,
  });
  return created.id;
}
