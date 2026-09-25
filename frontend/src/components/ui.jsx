import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, animate, m, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { STATUSES, STATUS_KEYS, TYPES, TYPE_KEYS, typeMeta } from '../lib/media';
import Ransom from './Ransom';
import Rook, { Bubble } from './Rook';

// Page heading: ransom-note title slammed onto a red slash, with a
// subtitle strip. Children render as actions on the right.
export function PageHeader({ index, title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-10">
      <div className="relative">
        <m.div
          aria-hidden="true"
          className="absolute -left-6 top-2 h-[70%] w-[110%] bg-primary -skew-x-12 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="relative flex items-end gap-3">
          <span className="font-display italic font-black text-5xl sm:text-6xl leading-none text-ink [-webkit-text-stroke:2px_var(--color-paper)]">{index}</span>
          <m.h1
            initial={{ opacity: 0, x: -20, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26, delay: 0.08 }}
          >
            <Ransom text={title} size="text-2xl sm:text-4xl" className="flex-nowrap" />
          </m.h1>
        </div>
        {subtitle && (
          <m.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            className="relative mt-4 inline-block bg-ink border-l-4 border-primary px-3 py-1 hud-label text-on-surface-variant"
          >
            {subtitle}
          </m.p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

export function TypeBadge({ type, className = '' }) {
  const meta = typeMeta(type);
  const Icon = meta.icon;
  return (
    <span className={`clip-badge inline-flex items-center gap-1.5 ${meta.bg} text-ink pl-3 pr-4 py-1 font-mono text-[10px] font-extrabold uppercase tracking-wider ${className}`}>
      <Icon size={12} strokeWidth={2.75} />
      {meta.label}
    </span>
  );
}

// Rubber-stamp style status tag.
export function StatusStamp({ status, className = '' }) {
  const meta = STATUSES[status];
  if (!meta) return null;
  const done = status === 'COMPLETED';
  return (
    <span
      className={`inline-block -rotate-6 px-3 py-0.5 font-display italic font-black text-xs uppercase tracking-wide ${
        done ? 'bg-paper text-primary' : status === 'DROPPED' ? 'bg-ink text-on-background/70 ring-2 ring-on-background/40' : 'bg-primary text-paper'
      } ${className}`}
    >
      {meta.label}
    </span>
  );
}

export function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-2.5">
      <span className="hud-label text-primary">{children}</span>
      {hint && <span className="font-mono text-[10px] uppercase text-on-background/40">{hint}</span>}
    </div>
  );
}

// Button group whose red slash highlight slides to the chosen option.
// `id` scopes the shared layout animation to this group.
export function SlashPicker({ id, options, value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value ?? 'all'}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`relative h-10 px-4 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors duration-150 ${
              active ? 'text-paper' : 'text-on-background/55 hover:text-paper'
            }`}
          >
            {active && (
              <m.span
                layoutId={`${id}-slash`}
                className="absolute inset-0 bg-primary -skew-x-12 shadow-[3px_3px_0_0_var(--color-paper)]"
                transition={{ type: 'spring', stiffness: 550, damping: 36 }}
              />
            )}
            {!active && <span className="absolute inset-0 -skew-x-12 border border-on-background/15" />}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon size={13} strokeWidth={2.5} />}
              {opt.label}
              {opt.count != null && <span className={active ? 'text-paper/70' : 'text-on-background/30'}>{opt.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function StatusPicker({ id, value, onChange }) {
  return (
    <SlashPicker
      id={id}
      value={value}
      onChange={onChange}
      options={STATUS_KEYS.map((k) => ({ value: k, label: STATUSES[k].label, icon: STATUSES[k].icon }))}
    />
  );
}

export function TypePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {TYPE_KEYS.map((key) => {
        const meta = TYPES[key];
        const Icon = meta.icon;
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={`group relative h-20 -skew-x-6 border-2 transition-[border-color,background-color,translate,box-shadow] duration-150 ease-(--ease-snap) ${
              active
                ? `${meta.border} ${meta.bg} text-ink -translate-y-1 shadow-[4px_4px_0_0_var(--color-paper)]`
                : 'border-on-background/15 text-on-background/60 hover:border-on-background/40 hover:text-paper'
            }`}
          >
            <span className="skew-x-6 flex flex-col items-center justify-center gap-1.5">
              <Icon size={20} strokeWidth={2.25} />
              <span className="font-mono text-[10px] font-extrabold uppercase">{meta.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Ten slashes; hover previews, click the current value again to clear.
export function RatingInput({ value, onChange }) {
  const [hover, setHover] = useState(null);
  const shown = hover ?? value ?? 0;
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-1 gap-1" onMouseLeave={() => setHover(null)} role="radiogroup" aria-label="Rating">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} out of 10`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(value === n ? null : n)}
            className="group flex-1 h-10 py-1"
          >
            <span
              className={`block h-full -skew-x-[20deg] origin-bottom transition-[background-color,scale] duration-150 ease-(--ease-punch) ${
                n <= shown ? 'bg-primary scale-y-110' : 'bg-on-background/10 group-hover:bg-on-background/25'
              }`}
            />
          </button>
        ))}
      </div>
      <span className="w-16 text-right font-display italic font-black text-3xl leading-none text-paper tabular-nums">
        {shown || '–'}
        <span className="text-sm text-on-background/40">/10</span>
      </span>
    </div>
  );
}

export function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState('');
  function commit(e) {
    e.preventDefault();
    const clean = draft.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean)) onChange([...tags, clean]);
    setDraft('');
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false}>
        {tags.map((tag) => (
          <m.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 600, damping: 28 }}
            className="flex items-center gap-2 bg-surface-high border-l-4 border-paper pl-3 pr-1 py-1"
          >
            <span className="font-mono text-xs text-paper">#{tag}</span>
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
              className="size-5 grid place-items-center text-on-background/40 hover:text-primary"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </m.span>
        ))}
      </AnimatePresence>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ',') && commit(e)}
        onBlur={(e) => draft && commit(e)}
        placeholder="+ tag, then Enter"
        className="h-8 w-40 bg-transparent border border-dashed border-on-background/25 px-3 font-mono text-xs text-paper placeholder:text-on-background/30 focus:outline-none focus:border-primary"
      />
    </div>
  );
}

// Dialog: black panel with a red spine and hard shadow that punches in
// from a tilt. Portaled to <body> so page transforms can't trap it.
// posterLayoutId lets a card's poster morph into the dialog header.
export function Modal({ open, onClose, title, kicker, poster, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
        >
          {/* Backdrop: dark wash + red speed slash. No blur (GPU-heavy). */}
          <div className="absolute inset-0 bg-ink/85" onClick={onClose} />
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute left-[-10%] right-[-10%] top-1/2 h-40 -translate-y-1/2 bg-primary/25 -rotate-12"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full sm:max-w-2xl max-h-[94dvh] overflow-y-auto bg-surface border-l-8 border-primary shadow-[14px_14px_0_0_var(--color-ink)]"
            initial={{ opacity: 0, y: 40, rotate: -3, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, rotate: 2, scale: 0.96, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <div className="flex items-start gap-5 p-6 sm:p-8 pb-2 sm:pb-2">
              {poster}
              <div className="min-w-0 flex-1">
                {kicker && <div className="mb-2">{kicker}</div>}
                <h2 className="font-display italic font-black text-3xl uppercase leading-none text-paper -skew-x-6 break-words">{title}</h2>
                <div className="mt-3 h-1 w-24 bg-primary" />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 size-10 grid place-items-center text-on-background/50 hover:text-paper hover:bg-primary hover:rotate-90 transition-[color,background-color,rotate] duration-200"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <div className="p-6 sm:p-8 pt-4 sm:pt-6">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Counts up by writing textContent directly - no re-render per frame.
export function CountUp({ value, decimals = 0, duration = 0.9 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = value.toFixed(decimals);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { node.textContent = v.toFixed(decimals); },
    });
    return () => controls.stop();
  }, [value, decimals, duration, reduce]);
  return <span ref={ref} className="tabular-nums">{(0).toFixed(decimals)}</span>;
}

export function Spinner({ size = 16 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block animate-spin border-[3px] border-current border-r-transparent"
      style={{ width: size, height: size }}
    />
  );
}

// Poster art. Lazy, fades in once decoded, and falls back to a "calling
// card" (red card, ransom title) when there's no image or it fails.
export function Poster({ src, title, type, className = '', compact = false }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <CallingCard title={title} type={type} compact={compact} />;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
      onError={() => setFailed(true)}
      className={`size-full object-cover opacity-0 transition-[opacity,scale] duration-500 ease-(--ease-snap) ${className}`}
    />
  );
}

export function CallingCard({ title, type, compact }) {
  const meta = typeMeta(type);
  const Icon = meta.icon;
  return (
    <div className="relative size-full overflow-hidden bg-primary flex items-center justify-center p-3">
      <div aria-hidden="true" className="absolute inset-0 text-ink/25 halftone" />
      <Icon aria-hidden="true" size={compact ? 40 : 140} strokeWidth={1.5} className="absolute -right-4 -bottom-4 text-ink/30 -rotate-12" />
      {/* One cut-out title strip (not per-letter ransom): a grid can hold
          dozens of these, and one element each keeps it cheap. */}
      {!compact && title && (
        <span className="relative -rotate-6 max-w-full bg-paper text-ink font-display italic font-black uppercase text-lg leading-tight text-center px-2.5 py-1 shadow-[4px_4px_0_0_var(--color-ink)] line-clamp-3">
          {title}
        </span>
      )}
    </div>
  );
}

export function EmptyState({ line, title, children }) {
  return (
    <div className="relative bg-surface border-2 border-dashed border-on-background/15 flex flex-col items-center text-center py-14 px-6 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 text-primary/[0.08] halftone" />
      <div className="relative flex flex-col items-center">
        <Bubble>{line}</Bubble>
        <Rook size={110} className="mt-4" mood="idle" />
        <p className="mt-4 font-display italic font-black text-2xl uppercase text-paper">{title}</p>
        <div className="mt-1 text-on-background/60 max-w-sm">{children}</div>
      </div>
    </div>
  );
}
