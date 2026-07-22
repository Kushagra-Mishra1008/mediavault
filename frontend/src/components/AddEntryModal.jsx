import { useState } from 'react';
import { apiGet, apiPost } from '../api/client';

const TYPES = ['MOVIE', 'SERIES', 'ANIME', 'GAME', 'MANGA'];
const STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DROPPED', label: 'Dropped' },
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

export default function AddEntryModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('MOVIE');
  const [status, setStatus] = useState('PLANNED');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function addTag(e) {
    e.preventDefault();
    const clean = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  }

  function removeTag(tagToRemove) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  async function findOrCreateMediaItem() {
    const searchResult = await apiGet(`/media?search=${encodeURIComponent(title)}`);
    const existing = searchResult.content.find(
      (item) => item.title.toLowerCase() === title.toLowerCase()
    );
    if (existing) {
      return existing.id;
    }

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
        tags,
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-surface border-l-8 border-primary clip-diagonal shadow-[24px_24px_0px_0px_theme(colors.background)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="relative">
            <h2 className="font-display text-3xl font-black italic text-white -skew-x-6 uppercase">
              New_Entry
            </h2>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary" />
          </div>
          <button
            onClick={onClose}
            className="text-on-background/40 hover:text-primary text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-primary mb-2">
              Target_Identity
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ENTER_TITLE..."
              className="w-full bg-transparent border-b-4 border-white/20 py-3 px-4 text-white font-sans focus:outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:text-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-primary mb-3">
                Classification
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-2 transition-all ${
                      type === t
                        ? 'bg-primary text-white border-primary'
                        : 'border-on-background/20 text-on-background/50 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-primary mb-2">
                Consumption_Rate
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="- / 10"
                className="w-full bg-transparent border-b-2 border-on-background/20 text-white font-display text-xl py-2 placeholder:text-on-background/20 focus:outline-none focus:border-primary focus:bg-primary/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-primary mb-3">
              Progress_Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-2 transition-all ${
                    status === s.value
                      ? 'bg-primary text-white border-primary'
                      : 'border-on-background/20 text-on-background/50 hover:border-primary hover:text-primary'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-primary mb-2">
              Curator_Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Field notes, first impressions..."
              rows={3}
              className="w-full bg-surface-high border border-on-background/10 p-3 font-sans text-sm text-white placeholder:text-on-background/20 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-primary mb-3">
              Keywords
            </label>
            <div className="flex flex-wrap gap-3 items-center">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 bg-surface-high px-3 py-1 border-l-4 border-white"
                >
                  <span className="font-mono text-xs text-white">#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-on-background/40 hover:text-primary text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
                placeholder="ADD_TAG + Enter"
                className="bg-transparent border border-dashed border-on-background/20 px-3 py-1 font-mono text-xs uppercase text-white placeholder:text-on-background/30 focus:outline-none focus:border-primary transition-all w-32"
              />
            </div>
          </div>

          {error && <p className="font-mono text-sm text-primary uppercase">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="font-display italic font-bold uppercase text-white/60 hover:text-primary px-6 py-3 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white font-black font-display italic uppercase px-8 py-3 hover:shadow-[4px_4px_0px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving...' : 'Confirm_Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}