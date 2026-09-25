import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { toast } from 'sonner';
import { Sparkles, Plus, Check, X, RefreshCw, Wand2 } from 'lucide-react';
import { apiGet, apiPost } from '../api/client';
import { findOrCreateMediaItem, typeMeta } from '../lib/media';
import { PageHeader, TypeBadge, Spinner } from '../components/ui';

const ease = [0.22, 1, 0.36, 1];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Per-card state keyed by title, so each card updates independently.
  const [addedTitles, setAddedTitles] = useState(() => new Set());
  const [addingTitles, setAddingTitles] = useState(() => new Set());
  const [dismissedTitles, setDismissedTitles] = useState(() => new Set());
  // Bumped per generation so the new batch re-plays its entrance.
  const [batch, setBatch] = useState(0);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      // The backend already returns a friendly message for an empty
      // library, so err.message is exactly what to show.
      const response = await apiGet('/recommendations');
      setRecommendations(response.recommendations);
      setAddedTitles(new Set());
      setDismissedTitles(new Set());
      setBatch((b) => b + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addToVault(rec) {
    setAddingTitles((prev) => new Set(prev).add(rec.title));
    try {
      const type = rec.type?.toUpperCase();
      const mediaItemId = await findOrCreateMediaItem({ title: rec.title, type, description: rec.reason });
      await apiPost('/library', { mediaItemId, status: 'PLANNED', rating: null, notes: '' });
      setAddedTitles((prev) => new Set(prev).add(rec.title));
      toast.success(`${rec.title} added to Planned`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddingTitles((prev) => {
        const next = new Set(prev);
        next.delete(rec.title);
        return next;
      });
    }
  }

  function dismiss(title) {
    setDismissedTitles((prev) => new Set(prev).add(title));
  }

  const visible = (recommendations ?? []).filter((rec) => !dismissedTitles.has(rec.title));

  return (
    <div>
      <PageHeader index="03" eyebrow="Quest Board" title="AI Picks" subtitle="Suggestions tuned to what's already in your vault.">
        {recommendations !== null && (
          <button onClick={handleGenerate} disabled={loading} className="btn-outline">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Thinking' : 'Reroll'}
          </button>
        )}
      </PageHeader>

      {error && (
        <m.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 mb-6"
        >
          {error}
        </m.p>
      )}

      {recommendations === null && !loading ? (
        <GeneratePrompt onGenerate={handleGenerate} />
      ) : loading ? (
        <ThinkingGrid />
      ) : visible.length === 0 ? (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel border-dashed text-center py-14 px-6">
          <p className="font-display text-lg font-semibold">All caught up</p>
          <p className="text-sm text-muted mt-1">You&apos;ve reviewed every pick. Reroll for a fresh batch.</p>
          <button onClick={handleGenerate} className="btn-primary mt-6">
            <RefreshCw size={14} /> Reroll
          </button>
        </m.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* popLayout lets remaining cards glide into a dismissed card's spot */}
          <AnimatePresence mode="popLayout">
            {visible.map((rec, i) => (
              <RecCard
                key={`${batch}-${rec.title}`}
                rec={rec}
                index={i}
                added={addedTitles.has(rec.title)}
                adding={addingTitles.has(rec.title)}
                onAdd={() => addToVault(rec)}
                onDismiss={() => dismiss(rec.title)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function RecCard({ rec, index, added, adding, onAdd, onDismiss }) {
  const meta = typeMeta(rec.type);
  const Icon = meta.icon;
  return (
    <m.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease, delay: Math.min(index, 8) * 0.06 } }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ layout: { type: 'spring', stiffness: 400, damping: 36 } }}
      className="panel group relative overflow-hidden p-5 flex flex-col"
    >
      {/* Oversized faded type icon as card art */}
      <Icon aria-hidden="true" size={120} strokeWidth={1} className={`absolute -right-6 -top-6 ${meta.text} opacity-[0.07] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`} />

      <div className="relative flex items-start justify-between gap-3">
        <TypeBadge type={rec.type} />
        <button
          onClick={onDismiss}
          aria-label={`Dismiss ${rec.title}`}
          title="Dismiss"
          className="-mt-1 -mr-1 size-8 grid place-items-center rounded-lg text-faint hover:text-fg hover:bg-white/[0.06] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <h3 className="relative font-display text-xl font-bold leading-tight mt-4">{rec.title}</h3>
      <p className="relative text-sm text-muted leading-relaxed mt-2 flex-1">{rec.reason}</p>

      <button
        onClick={onAdd}
        disabled={added || adding}
        className={`relative mt-5 w-full ${added ? 'btn h-11 rounded-lg bg-success/10 text-success disabled:opacity-100' : 'btn-primary'}`}
      >
        {added ? <Check size={15} strokeWidth={2.5} /> : adding ? <Spinner size={14} /> : <Plus size={15} strokeWidth={2.5} />}
        {added ? 'In Your Vault' : adding ? 'Adding' : 'Add to Vault'}
      </button>
    </m.article>
  );
}

function GeneratePrompt({ onGenerate }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="panel relative overflow-hidden px-6 py-16 sm:py-20 text-center"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(255_46_85/0.12),transparent_60%)]" />
      <div className="relative">
        <div className="mx-auto size-16 grid place-items-center clip-cut bg-accent/15 text-accent">
          <Wand2 size={28} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mt-6">What should you play next?</h2>
        <p className="text-muted mt-2 max-w-md mx-auto">
          The AI reads your library, your ratings and what you dropped, then picks titles you&apos;re likely to love.
        </p>
        <button onClick={onGenerate} className="btn-primary h-12 px-7 mt-8">
          <Sparkles size={16} /> Generate Picks
        </button>
      </div>
    </m.div>
  );
}

function ThinkingGrid() {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm text-muted mb-4">
        <Spinner size={14} /> Scanning your vault for patterns…
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-56 rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  );
}
