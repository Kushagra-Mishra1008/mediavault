import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { toast } from 'sonner';
import { Trash2, Check } from 'lucide-react';
import { apiPatch, apiDelete } from '../api/client';
import { Modal, FieldLabel, StatusPicker, RatingInput, TagInput, Spinner, TypeBadge, Poster } from './ui';

// entry - the LibraryEntryResponse being edited, or null when closed.
// onSaved(updated) / onDeleted(id) let the parent patch its list in place
// rather than refetching everything.
//
// The poster shares a layoutId with the card that opened it, so the
// card's art flies into the dialog (and back out on close).
export default function EditEntryModal({ entry, onClose, onSaved, onDeleted }) {
  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title={entry?.mediaItem.title}
      kicker={
        entry && (
          <div className="flex items-center gap-3">
            <TypeBadge type={entry.mediaItem.type} />
            <span className="font-mono text-xs text-on-background/50">{entry.mediaItem.releaseYear || '----'}</span>
          </div>
        )
      }
      poster={
        entry && (
          <m.div
            layoutId={`poster-${entry.id}`}
            className="hidden sm:block w-24 aspect-[2/3] shrink-0 overflow-hidden border-4 border-paper -rotate-3 shadow-[6px_6px_0_0_var(--color-primary)]"
          >
            <Poster src={entry.mediaItem.imageUrl} title={entry.mediaItem.title} type={entry.mediaItem.type} compact />
          </m.div>
        )
      }
    >
      {entry && <EditEntryForm key={entry.id} entry={entry} onClose={onClose} onSaved={onSaved} onDeleted={onDeleted} />}
    </Modal>
  );
}

function EditEntryForm({ entry, onClose, onSaved, onDeleted }) {
  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating ?? null);
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [tags, setTags] = useState(entry.tags ?? []);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Two-step delete instead of window.confirm - first click arms it.
  const [armed, setArmed] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const updated = await apiPatch(`/library/${entry.id}`, { status, rating, notes, tags });
      toast('Entry updated');
      onSaved(updated);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setSubmitting(true);
    try {
      await apiDelete(`/library/${entry.id}`);
      toast(`${entry.mediaItem.title} purged`);
      onDeleted(entry.id);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-7">
      <div>
        <FieldLabel>Status</FieldLabel>
        <StatusPicker id="edit" value={status} onChange={setStatus} />
      </div>

      <div>
        <FieldLabel hint="Click again to clear">Rating</FieldLabel>
        <RatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <FieldLabel hint="Optional">Notes</FieldLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Thoughts, progress, favorite moments…"
          className="field h-auto py-3 resize-none"
        />
      </div>

      <div>
        <FieldLabel hint="Optional">Tags</FieldLabel>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <AnimatePresence>
        {error && (
          <m.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-primary text-paper font-mono text-xs font-bold uppercase px-3 py-2 -skew-x-6"
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleDelete}
          onBlur={() => setArmed(false)}
          disabled={submitting}
          className={`btn h-12 px-4 font-mono text-xs font-bold -skew-x-6 ${
            armed ? 'bg-primary text-paper' : 'text-primary hover:bg-primary/15'
          }`}
        >
          <Trash2 size={15} strokeWidth={2.5} />
          {armed ? 'Really purge?' : 'Purge'}
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost hidden sm:inline-flex">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary min-w-36">
            {submitting ? <Spinner size={16} /> : <Check size={18} strokeWidth={3} />}
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}
