import { TYPE_KEYS } from './media';

// Light RPG layer on top of /api/stats - everything is derived client
// side from the counts the backend already returns.

export const XP_BY_STATUS = { PLANNED: 10, IN_PROGRESS: 40, COMPLETED: 100, DROPPED: 15 };

// Cumulative XP needed to reach level n: 0, 150, 450, 900, 1500, ...
const xpForLevel = (n) => 75 * n * (n - 1);

const RANKS = [
  [1, 'Rookie'],
  [3, 'Explorer'],
  [5, 'Veteran'],
  [8, 'Elite'],
  [12, 'Mythic'],
  [16, 'Legend'],
];

export function progressFor(stats) {
  const count = (s) => stats?.byStatus?.[s] ?? 0;
  const xp = Object.entries(XP_BY_STATUS).reduce((sum, [s, pts]) => sum + count(s) * pts, 0);
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const rank = RANKS.filter(([min]) => level >= min).at(-1)[1];
  return { xp, level, rank, into: xp - floor, needed: ceil - floor, pct: (xp - floor) / (ceil - floor) };
}

export const ACHIEVEMENTS = [
  { id: 'first', name: 'Press Start', desc: 'Add your first title', sprite: 'vaulty', test: (s) => s.totalEntries >= 1 },
  { id: 'hopper', name: 'Genre Hopper', desc: 'Log all four media types', sprite: 'kit', test: (s) => TYPE_KEYS.every((t) => (s.byType[t] ?? 0) > 0) },
  { id: 'critic', name: 'The Critic', desc: 'Rate something', sprite: 'reel', test: (s) => s.averageRating != null },
  { id: 'clear5', name: 'Credits Roll', desc: 'Complete 5 titles', sprite: 'telly', test: (s) => (s.byStatus.COMPLETED ?? 0) >= 5 },
  { id: 'multi', name: 'Multitasker', desc: '5 things in progress at once', sprite: 'pip', test: (s) => (s.byStatus.IN_PROGRESS ?? 0) >= 5 },
  { id: 'ragequit', name: 'Rage Quit', desc: 'Drop something. It happens.', sprite: 'pip', test: (s) => (s.byStatus.DROPPED ?? 0) >= 1 },
  { id: 'collector', name: 'Collector', desc: 'Reach 25 titles', sprite: 'vaulty', test: (s) => s.totalEntries >= 25 },
  { id: 'clear25', name: 'Completionist', desc: 'Complete 25 titles', sprite: 'kit', test: (s) => (s.byStatus.COMPLETED ?? 0) >= 25 },
];

export function unlockedAchievements(stats) {
  if (!stats) return new Set();
  return new Set(ACHIEVEMENTS.filter((a) => a.test(stats)).map((a) => a.id));
}

// The mascot for whatever type the player logs most - their "main".
export function favoriteType(stats) {
  if (!stats || stats.totalEntries === 0) return null;
  return TYPE_KEYS.reduce((best, t) => ((stats.byType[t] ?? 0) > (stats.byType[best] ?? 0) ? t : best), TYPE_KEYS[0]);
}

export function timeGreeting(name) {
  const h = new Date().getHours();
  if (h < 5) return `Late-night session, ${name}?`;
  if (h < 12) return `Morning, ${name}!`;
  if (h < 18) return `Hey ${name}, welcome back!`;
  return `Evening, ${name}. Snacks ready?`;
}
