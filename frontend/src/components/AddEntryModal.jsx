import { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { apiPost } from '../api/client';
import { findOrCreateMediaItem } from '../lib/media';
import { Modal, FieldLabel, TypePicker, StatusPicker, RatingInput, Spinner } from './ui';

// onClose - closes with no side effects. onSuccess - called only after a
// real save completes, so the parent knows to refresh the grid.
export default function AddEntryModal({ open, onClose, onSuccess }) {
  return (
    <Modal open={open} onClose={onClose} title="New Entry" subtitle={<p className="text-sm text-muted">Add something to your vault.</p>}>
      {/* Form only mounts while open, so its state resets on every open */}
      <AddEntryForm onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}

function AddEntryForm({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('MOVIE');
  const [status, setStatus] = useState('PLANNED');
  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const mediaItemId = await findOrCreateMediaItem({ title: title.trim(), type });
      const entry = await apiPost('/library', { mediaItemId, status, rating, notes });
      toast.success(`${entry.mediaItem.title} added to your vault`);
      onSuccess(entry);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <FieldLabel>Title</FieldLabel>
        <input
          type="text"
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Elden Ring, Dune, Frieren..."
          className="field"
        />
      </div>

      <div>
        <FieldLabel>Type</FieldLabel>
        <TypePicker value={type} onChange={setType} />
      </div>

      <div>
        <FieldLabel>Status</FieldLabel>
        <StatusPicker id="add" value={status} onChange={setStatus} />
      </div>

      <div>
        <FieldLabel hint="Optional">Rating</FieldLabel>
        <RatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <FieldLabel hint="Optional">Notes</FieldLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="First impressions, where you left off..."
          rows={3}
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

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary min-w-36">
          {submitting ? <Spinner size={14} /> : <Plus size={15} strokeWidth={2.5} />}
          {submitting ? 'Saving' : 'Add Entry'}
        </button>
      </div>
    </form>
  );
}
