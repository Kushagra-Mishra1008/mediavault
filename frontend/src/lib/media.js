import { Film, Tv, Sparkles, Gamepad2, BookOpen, Bookmark, Play, Trophy, Ban, Heart, Pause } from 'lucide-react';
import { apiGet, apiPost } from '../api/client';

// One source of truth for each media type's look. Class names are
// spelled out in full so Tailwind's scanner can find them.
export const TYPES = {
  MOVIE: { label: 'Movie', icon: Film, text: 'text-movie', bg: 'bg-movie', border: 'border-movie', hex: '#FFBF00' },
  SERIES: { label: 'Series', icon: Tv, text: 'text-series', bg: 'bg-series', border: 'border-series', hex: '#00E5FF' },
  ANIME: { label: 'Anime', icon: Sparkles, text: 'text-anime', bg: 'bg-anime', border: 'border-anime', hex: '#FF2BD6' },
  GAME: { label: 'Game', icon: Gamepad2, text: 'text-game', bg: 'bg-game', border: 'border-game', hex: '#A45CFF' },
  MANGA: { label: 'Manga', icon: BookOpen, text: 'text-manga', bg: 'bg-manga', border: 'border-manga', hex: '#FF6B35' },
};
export const TYPE_KEYS = Object.keys(TYPES);

// LLM output (recommendations) may not match enum casing - normalize
// and fall back to a neutral look rather than crashing.
export function typeMeta(type) {
  return TYPES[type?.toUpperCase()] ?? { label: type ?? 'Unknown', icon: Bookmark, text: 'text-on-background', bg: 'bg-on-background', border: 'border-on-background', hex: '#FEDAD8' };
}

export const STATUSES = {
  PLANNED: { label: 'Planned', icon: Bookmark },
  IN_PROGRESS: { label: 'In Progress', icon: Play },
  COMPLETED: { label: 'Completed', icon: Trophy },
  ON_HOLD: { label: 'On Hold', icon: Pause },
  WISHLIST: { label: 'Wishlist', icon: Heart },
  DROPPED: { label: 'Dropped', icon: Ban },
};
export const STATUS_KEYS = Object.keys(STATUSES);

// Search-first: reuse an existing catalog entry if the title already
// exists (case-insensitive) instead of filling the catalog with
// duplicates. Shared by the Add modal and recommendations.
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
