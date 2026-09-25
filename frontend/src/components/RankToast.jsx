import Ransom from './Ransom';

// Custom toast body for the big moments (level up, stat rank up, new
// calling card). Rendered through sonner's toast.custom.
export default function RankToast({ kicker, title, detail }) {
  return (
    <div className="relative w-[340px] max-w-[calc(100vw-2rem)] bg-ink border-l-8 border-primary shadow-[8px_8px_0_0_var(--color-primary)] p-4 pr-5 overflow-hidden">
      <div aria-hidden="true" className="absolute -right-6 -top-6 size-28 bg-primary clip-burst opacity-90" />
      <div className="relative">
        <span className="inline-block bg-paper text-ink font-mono text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 -skew-x-12">
          {kicker}
        </span>
        <div className="mt-2 -rotate-2">
          <Ransom text={title} size="text-xl" />
        </div>
        {detail && <p className="mt-2 font-sans text-sm text-on-surface-variant">{detail}</p>}
      </div>
    </div>
  );
}
