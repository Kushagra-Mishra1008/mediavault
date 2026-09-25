import { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Trash2, Check } from 'lucide-react';
import { apiPatch, apiDelete } from '../api/client';
import { Modal, FieldLabel, StatusPicker, RatingInput, Spinner, TypeBadge } from './ui';

// entry - the LibraryEntryResponse being edited, or null when closed.
// onSaved(updated) / onDeleted(id) let the parent patch its list in
// place instead of refetching everything.
export default function EditEntryModal({ entry, onClose, onSaved, onDeleted }) {
  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title={entry?.mediaItem.title}
      subtitle={
        entry && (
          <div className="flex items-center gap-2">
            <TypeBadge type={entry.mediaItem.type} />
            <span className="text-xs text-muted">{entry.mediaItem.releaseYear || 'Year unknown'}</span>
          </div>
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
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Two-step delete instead of window.confirm - first click arms it.
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const updated = await apiPatch(`/library/${entry.id}`, { status, rating, notes });
      toast.success('Entry updated');
      onSaved(updated);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setSubmitting(true);
    try {
      await apiDelete(`/library/${entry.id}`);
      toast(`Removed ${entry.mediaItem.title}`);
      onDeleted(entry.id);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
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
          placeholder="Thoughts, progress, favorite moments..."
          className="field h-auto py-2.5 resize-none"
        />
      </div>

      <AnimatePresence>
        {error && (
          <m.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2"
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={handleDelete}
          onBlur={() => setConfirmingDelete(false)}
          disabled={submitting}
          className={`btn h-11 px-3 rounded-lg ${
            confirmingDelete ? 'bg-danger text-white' : 'text-danger hover:bg-danger/10'
          }`}
        >
          <Trash2 size={14} />
          {confirmingDelete ? 'Confirm' : 'Delete'}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-ghost hidden sm:inline-flex">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary min-w-32">
            {submitting ? <Spinner size={14} /> : <Check size={15} strokeWidth={2.5} />}
            {submitting ? 'Saving' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}
