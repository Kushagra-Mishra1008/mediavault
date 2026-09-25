import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { apiGet, LIBRARY_CHANGED } from '../api/client';
import { CALLING_CARDS, collectedCards, personaStats, progressFor } from '../lib/progress';
import RankToast from '../components/RankToast';

const VaultContext = createContext(null);

// Holds /api/stats for the signed-in app (sidebar level bar, Stats page,
// Rook's commentary). Refetches on every library write and fires a
// "rank up" toast when that write levels you up, ranks up a stat, or
// earns a calling card.
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
  // First load is old news - only celebrate changes made this session.
  if (!before) return;
  const show = (props) => toast.custom(() => <RankToast {...props} />, { duration: 5000 });

  const was = progressFor(before);
  const now = progressFor(after);
  if (now.level > was.level) {
    show({ kicker: `Level ${now.level}`, title: 'Rank Up', detail: now.title !== was.title ? `New title: ${now.title}` : `${now.needed - now.into} XP to the next level.` });
  }

  const oldStats = personaStats(before);
  personaStats(after).forEach((s, i) => {
    if (s.rank > oldStats[i].rank) {
      show({ kicker: `${s.stat} Rank ${s.rank}`, title: s.rankName, detail: `Your ${s.stat.toLowerCase()} grows stronger.` });
    }
  });

  const had = collectedCards(before);
  for (const card of CALLING_CARDS) {
    if (card.test(after) && !had.has(card.id)) {
      show({ kicker: 'Calling card acquired', title: card.name, detail: card.desc });
    }
  }
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives beside its provider
export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error('useVault must be used inside a VaultProvider');
  return context;
}
