import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { toast } from 'sonner';
import { Check, X, Crosshair, RefreshCw } from 'lucide-react';
import { apiGet, apiPost } from '../api/client';
import { findOrCreateMediaItem, typeMeta } from '../lib/media';
import { XP_BY_STATUS } from '../lib/progress';
import { PageHeader, TypeBadge, Spinner } from '../components/ui';
import Rook, { Bubble } from '../components/Rook';

// Cards rest at slightly different tilts, like a hand of cards tossed on
// a table; each gets a hard shadow in a rotating accent color.
const TILTS = [-2.5, 2, -1, 1.5, -3, 2.5];
const SHADOWS = ['#E3002B', '#00E5FF', '#FF2BD6', '#FFBF00'];
const ease = [0.16, 1, 0.3, 1];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(() => new Set());
  const [adding, setAdding] = useState(() => new Set());
  const [dismissed, setDismissed] = useState(() => new Set());
  // Bumped per generation so a new batch is dealt fresh.
  const [batch, setBatch] = useState(0);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      // The backend returns a friendly message for an empty library, so
      // err.message is exactly what to show.
      const response = await apiGet('/recommendations');
      setRecommendations(response.recommendations);
      setAdded(new Set());
      setDismissed(new Set());
      setBatch((b) => b + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function steal(rec) {
    setAdding((prev) => new Set(prev).add(rec.title));
    try {
      const mediaItemId = await findOrCreateMediaItem({ title: rec.title, type: rec.type?.toUpperCase(), description: rec.reason });
      await apiPost('/library', { mediaItemId, status: 'PLANNED', rating: null, notes: '', tags: [] });
      setAdded((prev) => new Set(prev).add(rec.title));
      toast(`${rec.title} stolen`, { description: `Added to Planned · +${XP_BY_STATUS.PLANNED} XP` });
    } catch (err) {
      toast(err.message);
    } finally {
      setAdding((prev) => {
        const next = new Set(prev);
        next.delete(rec.title);
        return next;
      });
    }
  }

  const visible = (recommendations ?? []).filter((r) => !dismissed.has(r.title));

  return (
    <div>
      <PageHeader index="03" title="Targets" subtitle="AI picks based on your vault">
        {recommendations !== null && (
          <button onClick={handleGenerate} disabled={loading} className="btn-paper">
            <RefreshCw size={16} strokeWidth={3} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Scouting…' : 'New Targets'}
          </button>
        )}
      </PageHeader>

      {error && (
        <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-4 mb-8">
          <Rook size={64} mood="shock" />
          <div className="mb-10"><Bubble tail="left">{error}</Bubble></div>
        </m.div>
      )}

      {recommendations === null && !loading ? (
        <Briefing onGenerate={handleGenerate} />
      ) : loading ? (
        <Scouting />
      ) : visible.length === 0 ? (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12 text-center">
          <Bubble>All targets handled. Want more?</Bubble>
          <Rook size={96} className="mt-4" />
          <button onClick={handleGenerate} className="btn-primary mt-8">
            <Crosshair size={18} strokeWidth={3} /> New Targets
          </button>
        </m.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-6">
          {/* popLayout lets the remaining cards slide into a dismissed card's slot */}
          <AnimatePresence mode="popLayout">
            {visible.map((rec, i) => (
              <TargetCard
                key={`${batch}-${rec.title}`}
                rec={rec}
                index={i}
                isAdded={added.has(rec.title)}
                isAdding={adding.has(rec.title)}
                onSteal={() => steal(rec)}
                onDismiss={() => setDismissed((prev) => new Set(prev).add(rec.title))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function TargetCard({ rec, index, isAdded, isAdding, onSteal, onDismiss }) {
  const meta = typeMeta(rec.type);
  const tilt = TILTS[index % TILTS.length];
  const shadow = SHADOWS[index % SHADOWS.length];
  const confidence = typeof rec.confidence === 'number' ? rec.confidence : null;

  return (
    <m.article
      layout
      // Dealt from a deck off to the left, flipping face-up as it lands.
      initial={{ opacity: 0, x: -160, y: 40, rotate: -25, rotateY: 90 }}
      animate={{ opacity: 1, x: 0, y: 0, rotate: tilt, rotateY: 0, transition: { type: 'spring', stiffness: 220, damping: 22, delay: Math.min(index, 8) * 0.09 } }}
      // Dismissed cards get flicked away.
      exit={{ opacity: 0, x: 260, rotate: 25, transition: { duration: 0.3, ease: 'easeIn' } }}
      whileHover={{ rotate: 0, y: -6, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
      transition={{ layout: { type: 'spring', stiffness: 380, damping: 34 } }}
      style={{ boxShadow: `12px 12px 0 0 ${shadow}`, transformPerspective: 800 }}
      className="relative bg-surface-high border-2 border-on-background/20"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <TypeBadge type={rec.type} className="-ml-6" />
          <button
            onClick={onDismiss}
            aria-label={`Dismiss ${rec.title}`}
            title="Dismiss"
            className="-mt-2 -mr-2 size-9 grid place-items-center text-on-background/40 hover:text-paper hover:bg-primary transition-colors"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <h3 className={`mt-5 font-display italic font-black text-2xl uppercase leading-tight ${meta.text}`}>{rec.title}</h3>
        <p className="mt-3 font-sans text-on-background/75 leading-relaxed">{rec.reason}</p>

        {confidence != null && (
          <div className="mt-5" title={`${confidence.toFixed(0)}% match`}>
            <div className="flex justify-between font-mono text-[10px] font-bold uppercase text-on-background/50 mb-1.5">
              <span>Match</span>
              <span className="text-paper">{confidence.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 bg-ink -skew-x-12 overflow-hidden">
              <m.div
                className="h-full bg-primary origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.min(confidence, 100) / 100 }}
                transition={{ duration: 0.8, ease, delay: 0.4 + index * 0.09 }}
              />
            </div>
          </div>
        )}

        <button
          onClick={onSteal}
          disabled={isAdded || isAdding}
          className={`mt-6 w-full ${isAdded ? 'btn h-12 bg-ink text-primary font-display italic font-black -skew-x-6 disabled:opacity-100' : 'btn-paper'}`}
        >
          {isAdded ? <Check size={18} strokeWidth={3} /> : isAdding ? <Spinner size={16} /> : <Crosshair size={18} strokeWidth={3} />}
          {isAdded ? 'Stolen' : isAdding ? 'Stealing…' : 'Steal It'}
        </button>
      </div>
    </m.article>
  );
}

function Briefing({ onGenerate }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="relative overflow-hidden bg-surface border-l-8 border-primary px-6 py-14 sm:py-16"
    >
      <div aria-hidden="true" className="absolute inset-0 text-primary/[0.08] halftone" />
      <div aria-hidden="true" className="absolute -right-20 top-0 h-full w-72 bg-primary/15 -skew-x-12" />
      <div className="relative flex flex-col sm:flex-row items-center gap-8 max-w-3xl mx-auto">
        <div className="flex flex-col items-center shrink-0">
          <Bubble>Leave it to me.</Bubble>
          <Rook size={120} className="mt-4" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="font-display italic font-black text-3xl sm:text-4xl uppercase text-paper leading-none">What&apos;s next?</h2>
          <p className="mt-3 text-on-background/70 max-w-md">
            The AI studies your vault (what you finished, rated, dropped) and marks new targets you&apos;ll probably love.
          </p>
          <button onClick={onGenerate} className="btn-primary h-14 px-8 text-xl mt-7">
            <Crosshair size={20} strokeWidth={3} /> Find Targets
          </button>
        </div>
      </div>
    </m.div>
  );
}

function Scouting() {
  return (
    <div>
      <div className="flex items-end gap-4 mb-8">
        <Rook size={72} hop={1} />
        <div className="mb-12"><Bubble tail="left">Scouting your vault…</Bubble></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {TILTS.slice(0, 3).map((t, i) => (
          <div key={i} className="skeleton h-72 border-2 border-on-background/10" style={{ rotate: `${t}deg` }} />
        ))}
      </div>
    </div>
  );
}
