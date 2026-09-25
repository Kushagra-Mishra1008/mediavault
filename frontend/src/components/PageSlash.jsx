// Quick slash across the content area on every screen change: a red
// band and a black band with a white edge sweep through while the old
// page exits and the new one lands. CSS keyframes (.slash-*), so it's
// compositor-only and starts in the same frame as the navigation.
export default function PageSlash({ onDone }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 right-0 left-0 md:left-72 z-20 overflow-hidden">
      <div className="slash-red absolute inset-y-0 -left-1/4 w-[70%] bg-primary" />
      <div className="slash-black absolute inset-y-0 -left-1/4 w-[60%] bg-ink border-l-8 border-paper" onAnimationEnd={onDone} />
    </div>
  );
}
