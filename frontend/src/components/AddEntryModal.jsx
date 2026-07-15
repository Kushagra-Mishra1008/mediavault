import { useState } from 'react';
import { apiGet, apiPost } from '../api/client';

const TYPES = ['MOVIE', 'SERIES', 'ANIME', 'GAME'];
const STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DROPPED', label: 'Dropped' },
];

// onClose - called for both "Discard" and the X button, just closes with
// no side effects. onSuccess - called ONLY after a real save completes,
// so the parent knows to actually refresh the grid (see App.jsx next).
export default function AddEntryModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('MOVIE');
  const [status, setStatus] = useState('PLANNED');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function findOrCreateMediaItem() {
    // Search-first: reuse an existing catalog entry if the title already
    // exists (case-insensitive), rather than letting the catalog fill up
    // with duplicate "Inception" rows every time someone adds it.
    const searchResult = await apiGet(`/media?search=${encodeURIComponent(title)}`);
    const existing = searchResult.content.find(
      (item) => item.title.toLowerCase() === title.toLowerCase()
    );
    if (existing) {
      return existing.id;
    }

    // No match - create a fresh catalog entry. genre/releaseYear/
    // description are all optional on the backend (see
    // MediaItemRequest), so null is fine here - the mockup's modal
    // doesn't collect them, and PosterService only needs title + type
    // to do its job.
    const created = await apiPost('/media', {
      title,
      type,
      genre: null,
      releaseYear: null,
      description: null,
    });
    return created.id;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const mediaItemId = await findOrCreateMediaItem();
      await apiPost('/library', {
        mediaItemId,
        status,
        rating: rating === '' ? null : Number(rating),
        notes,
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Fixed overlay covering the whole viewport - clicking the dark
    // backdrop closes the modal, same as clicking outside any standard
    // dialog. stopPropagation on the inner card prevents a click INSIDE
    // the form from bubbling up and triggering that same close.
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="font-display text-2xl text-ink tracking-wide">ADD NEW ENTRY</h2>
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-1">
              Item Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full border-b border-ink/30 bg-transparent py-2 font-sans text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-1">
                Media Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border-b border-ink/30 bg-transparent py-2 font-sans text-ink focus:outline-none focus:border-ink"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-1">
                Archive Rating
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="- / 10"
                className="w-full border-b border-ink/30 bg-transparent py-2 font-sans text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-2">
              Vault Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition ${
                    status === s.value
                      ? 'bg-ink text-paper border-ink'
                      : 'border-ink/20 text-ink/60 hover:border-ink/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-1">
              Curator Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Transcription of first impressions or metadata observations..."
              rows={3}
              className="w-full border border-ink/20 bg-transparent p-2 font-sans text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink resize-none"
            />
          </div>

          {error && <p className="text-sm text-stamp font-medium">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-wider text-ink/50 hover:text-ink px-4 py-2"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-ink text-paper font-mono text-xs uppercase tracking-wider px-6 py-2 hover:bg-ink/90 disabled:opacity-50 transition"
            >
              {submitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}