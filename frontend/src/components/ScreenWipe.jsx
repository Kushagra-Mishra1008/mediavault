import Ransom from './Ransom';

// Full-screen "all-out" transition for login/logout. A red slab and a
// black slab slam in from opposite sides, the message stamps down in
// ransom letters, then everything tears away to reveal the new screen.
//
// All layers are plain CSS keyframes (see .wipe-* in index.css): they
// start on the same frame, run on the compositor (transform/opacity
// only), and stay in sync even while React mounts the next screen.
export default function ScreenWipe({ title, subtitle, onDone }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <div className="wipe-red absolute -inset-y-1/2 -left-1/4 w-[150%] bg-primary" onAnimationEnd={onDone} />
      <div className="wipe-black absolute -inset-y-1/2 -left-1/4 w-[150%] bg-ink border-l-[14px] border-paper" />
      <div className="wipe-dots absolute inset-0 text-primary/40 halftone" />
      <div className="wipe-stamp absolute inset-0 grid place-items-center">
        <div className="-rotate-3 flex flex-col items-center gap-4 px-6 text-center">
          <Ransom text={title} size="text-4xl sm:text-6xl" className="justify-center" />
          {subtitle && (
            <span className="bg-paper text-ink font-display italic font-black uppercase text-lg sm:text-2xl px-4 py-1 -skew-x-12">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
