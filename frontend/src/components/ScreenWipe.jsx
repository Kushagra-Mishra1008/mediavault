import { m } from 'motion/react';
import { Logo } from './ui';

// Whole `transform` strings (not motion's x/scale shorthands) let motion
// hand these to the browser's compositor via WAAPI, so the sweep stays
// smooth even while React is busy mounting the next screen underneath.
const at = (x) => `translateX(${x}) skewX(-12deg)`;

// Full-screen double sweep played on login/logout: a red blade leads,
// a dark panel follows and covers the screen while the old view exits,
// then both clear (dark first, red last) to reveal the new view. Only
// `transform` animates, so it stays on the compositor and runs smoothly
// even while React swaps the tree underneath it. onDone unmounts it so
// the big promoted layers don't linger in GPU memory.
export default function ScreenWipe({ onDone }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <m.div
        className="absolute inset-y-0 -left-[25%] w-[150%] bg-accent will-change-transform"
        initial={{ transform: at('-110%') }}
        animate={{ transform: [at('-110%'), at('0%'), at('0%'), at('110%')] }}
        transition={{ duration: 1, times: [0, 0.3, 0.6, 1], ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={onDone}
      />
      <m.div
        className="absolute inset-y-0 -left-[25%] w-[150%] bg-void will-change-transform"
        initial={{ transform: at('-110%') }}
        animate={{ transform: [at('-110%'), at('-110%'), at('0%'), at('0%'), at('110%')] }}
        transition={{ duration: 1, times: [0, 0.08, 0.38, 0.5, 0.88], ease: [0.76, 0, 0.24, 1] }}
      />
      <m.div
        className="absolute inset-0 grid place-items-center text-fg"
        initial={{ opacity: 0, transform: 'scale(0.8)' }}
        animate={{ opacity: [0, 0, 1, 1, 0], transform: ['scale(0.8)', 'scale(0.8)', 'scale(1)', 'scale(1)', 'scale(1.1)'] }}
        transition={{ duration: 1, times: [0, 0.3, 0.4, 0.5, 0.58] }}
      >
        <Logo size={64} />
      </m.div>
    </div>
  );
}
