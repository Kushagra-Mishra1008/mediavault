import { TYPE_KEYS } from './media';

// The RPG layer. Everything is derived client-side from /api/stats, so
// the backend doesn't need to know any of this exists.

export const XP_BY_STATUS = {
  PLANNED: 10,
  WISHLIST: 5,
  IN_PROGRESS: 40,
  ON_HOLD: 20,
  COMPLETED: 100,
  DROPPED: 15,
};

// Cumulative XP to reach level n: 0, 150, 450, 900, 1500...
const xpForLevel = (n) => 75 * n * (n - 1);

const TITLES = [
  [1, 'Rookie'],
  [3, 'Street Rat'],
  [5, 'Night Runner'],
  [8, 'Phantom'],
  [12, 'Legend'],
  [16, 'Myth'],
];

export function progressFor(stats) {
  const count = (s) => stats?.byStatus?.[s] ?? 0;
  const xp = Object.entries(XP_BY_STATUS).reduce((sum, [s, pts]) => sum + count(s) * pts, 0);
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const title = TITLES.filter(([min]) => level >= min).at(-1)[1];
  return { xp, level, title, into: xp - floor, needed: ceil - floor, pct: (xp - floor) / (ceil - floor) };
}

// Five personal stats, one per media type, each ranked 1-5 by how much
// of that type you've logged. The names are the fun part.
export const PERSONA_STATS = [
  { type: 'MOVIE', stat: 'Taste', ranks: ['Casual', 'Cinephile', 'Critic', 'Auteur', 'Visionary'] },
  { type: 'SERIES', stat: 'Patience', ranks: ['Restless', 'Steady', 'Devoted', 'Unshakable', 'Eternal'] },
  { type: 'ANIME', stat: 'Passion', ranks: ['Curious', 'Hooked', 'Burning', 'Fanatic', 'Transcendent'] },
  { type: 'GAME', stat: 'Skill', ranks: ['Button Masher', 'Player', 'Veteran', 'Speedrunner', 'Final Boss'] },
  { type: 'MANGA', stat: 'Knowledge', ranks: ['Skimmer', 'Reader', 'Scholar', 'Sage', 'Encyclopedic'] },
];
const STAT_THRESHOLDS = [1, 3, 6, 10, 15]; // titles needed for ranks 1..5

export function personaStats(stats) {
  return PERSONA_STATS.map((s) => {
    const count = stats?.byType?.[s.type] ?? 0;
    const rank = STAT_THRESHOLDS.filter((t) => count >= t).length; // 0..5
    return { ...s, count, rank, rankName: rank === 0 ? 'Untested' : s.ranks[rank - 1] };
  });
}

// Achievements are "calling cards" you collect.
export const CALLING_CARDS = [
  { id: 'first', name: 'Opening Move', desc: 'Log your first title', test: (s) => s.totalEntries >= 1 },
  { id: 'all5', name: 'Five Faces', desc: 'Log all five media types', test: (s) => TYPE_KEYS.every((t) => (s.byType[t] ?? 0) > 0) },
  { id: 'critic', name: 'The Verdict', desc: 'Rate something', test: (s) => s.averageRating != null },
  { id: 'clear5', name: 'Mission Clear', desc: 'Complete 5 titles', test: (s) => (s.byStatus.COMPLETED ?? 0) >= 5 },
  { id: 'wish', name: 'Heart Set On It', desc: 'Wishlist something', test: (s) => (s.byStatus.WISHLIST ?? 0) >= 1 },
  { id: 'quit', name: 'Tactical Retreat', desc: 'Drop something. No shame.', test: (s) => (s.byStatus.DROPPED ?? 0) >= 1 },
  { id: 'collector', name: 'Full Vault', desc: 'Reach 25 titles', test: (s) => s.totalEntries >= 25 },
  { id: 'clear25', name: 'Grand Heist', desc: 'Complete 25 titles', test: (s) => (s.byStatus.COMPLETED ?? 0) >= 25 },
];

export function collectedCards(stats) {
  if (!stats) return new Set();
  return new Set(CALLING_CARDS.filter((c) => c.test(stats)).map((c) => c.id));
}

export function timeGreeting(name) {
  const h = new Date().getHours();
  if (h < 5) return `Still up, ${name}? The night is ours.`;
  if (h < 12) return `Morning, ${name}. Let's get to work.`;
  if (h < 18) return `${name}! Back for more, huh?`;
  return `Evening, ${name}. Perfect time for a heist.`;
}
