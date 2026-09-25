import { useEffect, useRef } from 'react';
import { AnimatePresence, m } from 'motion/react';

// Rook - MediaVault's original masked-phantom navigator. Pure SVG, so it
// scales cleanly and costs nothing to load. It floats, blinks, and
// hops whenever `hop` changes (e.g. each time it says something new).
//
// mood: 'idle' | 'smug' | 'shock' changes the mouth.
export default function Rook({ size = 96, hop = 0, mood = 'smug', className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!hop || !ref.current?.animate) return;
    ref.current.animate(
      [
        { transform: 'translateY(0) rotate(0deg)' },
        { transform: 'translateY(-22%) rotate(-8deg)' },
        { transform: 'translateY(0) rotate(3deg)' },
        { transform: 'translateY(0) rotate(0deg)' },
      ],
      { duration: 480, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
    );
  }, [hop]);

  return (
    <span className={`inline-block float-idle ${className}`} style={{ width: size, height: size }}>
      <svg ref={ref} viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Rook, your guide" className="block overflow-visible">
        {/* red impact burst behind the head */}
        <polygon
          points="50,2 60,18 80,8 76,30 98,34 82,50 96,70 72,70 68,94 52,80 34,96 30,72 6,76 18,54 2,36 24,30 18,8 40,18"
          fill="#E3002B"
        />
        {/* top hat */}
        <rect x="31" y="10" width="38" height="20" fill="#000" stroke="#fff" strokeWidth="2.5" />
        <rect x="31" y="23" width="38" height="5" fill="#E3002B" />
        <rect x="22" y="28" width="56" height="6" fill="#000" stroke="#fff" strokeWidth="2.5" />
        {/* head */}
        <path d="M24 38 Q24 88 50 90 Q76 88 76 38 Z" fill="#000" stroke="#fff" strokeWidth="2.5" />
        {/* domino mask with swept wings */}
        <polygon points="16,46 34,40 50,46 66,40 84,46 74,60 56,58 50,62 44,58 26,60" fill="#fff" />
        {/* eyes (blink) */}
        <g className="blink">
          <polygon points="31,50 43,48 41,54 30,54" fill="#E3002B" />
          <polygon points="69,50 57,48 59,54 70,54" fill="#E3002B" />
        </g>
        {/* mouth */}
        {mood === 'shock' ? (
          <ellipse cx="50" cy="76" rx="5" ry="6" fill="#fff" />
        ) : mood === 'idle' ? (
          <path d="M42 76 L58 76" stroke="#fff" strokeWidth="3" strokeLinecap="square" />
        ) : (
          <path d="M38 72 Q52 84 64 70 L60 74 Q52 79 42 74 Z" fill="#fff" />
        )}
      </svg>
    </span>
  );
}

// Jagged comic speech box. Re-keys on `children` so every new line pops.
// tail: 'left' | 'bottom'
export function Bubble({ children, tail = 'bottom', className = '' }) {
  const text = typeof children === 'string' ? children : undefined;
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={text}
        initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: -2 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
        transition={{ type: 'spring', stiffness: 600, damping: 22 }}
        className={`relative inline-block ${tail === 'left' ? 'origin-left' : 'origin-bottom-left'} ${className}`}
      >
        <div className="relative bg-paper text-ink px-4 py-2.5 font-display italic font-extrabold text-sm leading-snug shadow-[5px_5px_0_0_var(--color-primary)] -skew-x-3">
          <span className="block skew-x-3">{children}</span>
        </div>
        <span
          aria-hidden="true"
          className={`absolute bg-paper ${
            tail === 'left'
              ? 'left-[-12px] top-1/2 -translate-y-1/2 w-4 h-4 [clip-path:polygon(100%_0,100%_100%,0_60%)]'
              : 'left-6 -bottom-3 w-5 h-4 [clip-path:polygon(0_0,100%_0,10%_100%)]'
          }`}
        />
      </m.div>
    </AnimatePresence>
  );
}
