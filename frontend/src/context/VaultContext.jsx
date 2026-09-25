import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { apiGet, LIBRARY_CHANGED } from '../api/client';
import { ACHIEVEMENTS, progressFor, unlockedAchievements } from '../lib/progress';
import Sprite from '../components/Sprite';

const VaultContext = createContext(null);

// Holds /api/stats for the whole signed-in app (sidebar XP bar, Stats
// page, companion). Refetches whenever the library changes, and pops a
// toast when that change levels you up or unlocks an achievement.
export function VaultProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const previous = useRef(null);

  useEffect(() => {
    let cancelled = false;
    function load() {
      apiGet('/stats')
        .then((next) => {
          if (cancelled) return;
          celebrate(previous.current, next);
          previous.current = next;
          setStats(next);
          setError(null);
        })
        .catch((err) => !cancelled && setError(err.message));
    }
    load();
    window.addEventListener(LIBRARY_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(LIBRARY_CHANGED, load);
    };
  }, []);

  return <VaultContext.Provider value={{ stats, error }}>{children}</VaultContext.Provider>;
}

function celebrate(before, after) {
  // Nothing to compare on the very first load - don't celebrate old news.
  if (!before) return;

  const was = progressFor(before);
  const now = progressFor(after);
  if (now.level > was.level) {
    toast(`Level up! You're now Lv ${now.level}`, {
      description: now.rank !== was.rank ? `New rank: ${now.rank}` : `${now.needed - now.into} XP to the next one`,
      icon: <Sprite name="vaulty" size={32} bob={false} />,
      duration: 5000,
    });
  }

  const had = unlockedAchievements(before);
  for (const a of ACHIEVEMENTS) {
    if (a.test(after) && !had.has(a.id)) {
      toast(`Achievement unlocked: ${a.name}`, {
        description: a.desc,
        icon: <Sprite name={a.sprite} size={32} bob={false} />,
        duration: 5000,
      });
    }
  }
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives beside its provider
export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used inside a VaultProvider');
  }
  return context;
}
