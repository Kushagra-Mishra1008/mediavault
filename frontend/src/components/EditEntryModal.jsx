import { useState } from 'react';
import { apiPatch, apiDelete } from '../api/client';

const STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DROPPED', label: 'Dropped' },
];

// entry - the full LibraryEntryResponse being edited, passed down from
// LibraryPage. onSuccess covers BOTH a successful save and a successful
// delete - either way, the parent just needs to know "refetch the grid,
// close the modal." No need to distinguish the two at the call site.
export default function EditEntryModal({ entry, onClose, onSuccess }) {
  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating ?? '');
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // LibraryEntryUpdateRequest treats null as "leave unchanged" (see
      // your PATCH semantics from Phase 1) - but here we're always
      // sending real current values for all three fields, so this is
      // functionally a full update even though the backend supports
      // partial. rating: '' -> null so clearing the rating field
      // actually clears it rather than sending an empty string.
      await apiPatch(`/library/${entry.id}`, {
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

  async function handleDelete() {
    if (!window.confirm(`Remove "${entry.mediaItem.title}" from your library?`)) {
      return;
    }
    setSubmitting(true);
    try {
      await apiDelete(`/library/${entry.id}`);
      onSuccess();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <h2 className="font-display text-2xl text-ink tracking-wide">EDIT ENTRY</h2>
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Read-only title/type - see the file header note on why these
            aren't editable here */}
        <div className="mb-6 pb-4 border-b border-ink/10">
          <p className="font-display text-xl text-ink">{entry.mediaItem.title}</p>
          <p className="font-mono text-xs text-ink/40 uppercase tracking-wider mt-0.5">
            {entry.mediaItem.type} · {entry.mediaItem.releaseYear || 'Year unknown'}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
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
              Archive Rating
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="- / 10"
              className="w-32 border-b border-ink/30 bg-transparent py-2 font-sans text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-1">
              Curator Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-ink/20 bg-transparent p-2 font-sans text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink resize-none"
            />
          </div>

          {error && <p className="text-sm text-stamp font-medium">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="font-mono text-xs uppercase tracking-wider text-stamp hover:opacity-70 disabled:opacity-50"
            >
              Delete Entry
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-xs uppercase tracking-wider text-ink/50 hover:text-ink px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-ink text-paper font-mono text-xs uppercase tracking-wider px-6 py-2 hover:bg-ink/90 disabled:opacity-50 transition"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}