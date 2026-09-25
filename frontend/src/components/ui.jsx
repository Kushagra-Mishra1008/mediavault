import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, animate, m, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { STATUSES, STATUS_KEYS, TYPES, TYPE_KEYS, typeMeta } from '../lib/media';

export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3 28.5 10.2v11.6L16 29 3.5 21.8V10.2z" fill="none" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M10 20.5v-9l6 5.2 6-5.2v9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`font-display font-bold tracking-[0.08em] ${className}`}>
      MEDIA<span className="text-accent">VAULT</span>
    </span>
  );
}

// Consistent page heading: small indexed eyebrow, big title, subtitle,
// and an optional actions slot on the right.
export function PageHeader({ index, eyebrow, title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div>
        <p className="hud-label text-accent flex items-center gap-2">
          <span className="text-faint">{index}</span>
          <span className="h-px w-6 bg-accent/60" />
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide mt-2">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1.5">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function TypeBadge({ type, className = '' }) {
  const meta = typeMeta(type);
  const Icon = meta.icon;
  return (
    <span className={`clip-cut-sm inline-flex items-center gap-1 ${meta.bg} text-void px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] ${className}`}>
      <Icon size={11} strokeWidth={2.5} />
      {meta.label}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const meta = STATUSES[status];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md bg-void/80 px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.12em] ${meta.text} ${className}`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <span className="hud-label text-muted">{children}</span>
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  );
}

// Pill group where the selected option gets a sliding highlight.
// layoutId is scoped by `id` so two groups on screen don't fight over it.
export function StatusPicker({ id, value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-lg bg-void/60 border border-white/[0.06] p-1">
      {STATUS_KEYS.map((key) => {
        const meta = STATUSES[key];
        const Icon = meta.icon;
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`relative h-9 rounded-md text-xs font-medium transition-colors ${active ? 'text-fg' : 'text-muted hover:text-fg'}`}
          >
            {active && (
              <m.span
                layoutId={`${id}-status`}
                className="absolute inset-0 rounded-md bg-raised border border-white/10"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-1.5">
              <Icon size={13} className={active ? meta.text : ''} />
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TypePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
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
            className={`flex flex-col items-center justify-center gap-1.5 h-[4.5rem] rounded-lg border text-xs font-medium transition-[border-color,background-color,color] duration-200 ${
              active
                ? `${meta.border} ${meta.text} bg-white/[0.04]`
                : 'border-white/[0.08] text-muted hover:border-white/20 hover:text-fg'
            }`}
          >
            <Icon size={20} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

// 10-segment "power meter" rating. Hovering previews, clicking the
// current value again clears it.
export function RatingInput({ value, onChange }) {
  const [hover, setHover] = useState(null);
  const shown = hover ?? value ?? 0;
  return (
    <div>
      <div className="flex items-center gap-3">
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
              className="group flex-1 h-8 -skew-x-12 py-1"
            >
              <span
                className={`block h-full rounded-[2px] transition-colors duration-150 ${
                  n <= shown ? (n > 7 ? 'bg-accent' : n > 4 ? 'bg-accent-soft' : 'bg-accent-soft/70') : 'bg-white/[0.07] group-hover:bg-white/15'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="font-display text-lg font-bold w-14 text-right tabular-nums">
          {shown ? shown : '–'}<span className="text-faint text-sm">/10</span>
        </span>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children }) {
  // Escape closes; body scroll locks while open.
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

  // Portal to <body>: page transitions use transforms, and a transformed
  // ancestor would otherwise trap position:fixed inside it.
  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-void/80" onClick={onClose} />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-panel border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            {/* Accent strip across the top edge */}
            <div className="h-1 w-full bg-gradient-to-r from-accent via-accent-soft to-transparent" />
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl font-bold tracking-wide">{title}</h2>
                  {subtitle && <div className="mt-1">{subtitle}</div>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 size-9 grid place-items-center rounded-lg text-muted hover:text-fg hover:bg-white/[0.06] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {children}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Animates a number from 0 by writing textContent directly - no React
// re-render per frame, so it costs nothing even with many on screen.
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
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { node.textContent = v.toFixed(decimals); },
    });
    return () => controls.stop();
  }, [value, decimals, duration, reduce]);
  return <span ref={ref} className="tabular-nums">{(0).toFixed(decimals)}</span>;
}

export function Spinner({ size = 16 }) {
  return (
    <span
      className="inline-block rounded-full border-2 border-current border-r-transparent animate-spin"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="panel border-dashed flex flex-col items-center text-center py-16 px-6">
      <div className="size-14 grid place-items-center rounded-xl bg-accent/10 text-accent mb-4">
        <Icon size={26} />
      </div>
      <p className="font-display text-lg font-semibold">{title}</p>
      <div className="text-sm text-muted mt-1 max-w-sm">{children}</div>
    </div>
  );
}

// Poster art with lazy loading, a fade-in once decoded (no line-by-line
// pop-in), and a type-icon fallback when there's no URL or it 404s.
export function Poster({ src, type, iconSize = 48, className = '' }) {
  const [failed, setFailed] = useState(false);
  const meta = typeMeta(type);
  const Icon = meta.icon;
  if (!src || failed) {
    return (
      <div className="size-full grid place-items-center bg-gradient-to-br from-raised to-void">
        <Icon size={iconSize} strokeWidth={1.25} className={`${meta.text} opacity-40`} />
      </div>
    );
  }
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
