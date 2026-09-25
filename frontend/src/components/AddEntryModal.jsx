import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { apiPost } from '../api/client';
import { findOrCreateMediaItem } from '../lib/media';
import { XP_BY_STATUS } from '../lib/progress';
import { Modal, FieldLabel, TypePicker, StatusPicker, RatingInput, TagInput, Spinner } from './ui';

// onClose - closes with no side effects. onSuccess - only after a real
// save, so the parent knows to refresh the grid.
export default function AddEntryModal({ open, onClose, onSuccess }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a Title"
      kicker={<span className="hud-label text-on-background/50">New entry // +XP on save</span>}
    >
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
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const mediaItemId = await findOrCreateMediaItem({ title: title.trim(), type });
      const entry = await apiPost('/library', { mediaItemId, status, rating, notes, tags });
      toast(`${entry.mediaItem.title} secured`, { description: `+${XP_BY_STATUS[status]} XP` });
      onSuccess(entry);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <FieldLabel>Title</FieldLabel>
        <input
          type="text"
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Elden Ring, Dune, Frieren, Berserk…"
          className="field text-lg"
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
          placeholder="First impressions, where you left off…"
          rows={3}
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

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-ghost">Discard</button>
        <button type="submit" disabled={submitting} className="btn-primary min-w-44">
          {submitting ? <Spinner size={16} /> : <Plus size={18} strokeWidth={3} />}
          {submitting ? 'Securing…' : 'Secure It'}
        </button>
      </div>
    </form>
  );
}
