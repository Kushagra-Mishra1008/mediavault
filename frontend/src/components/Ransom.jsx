// "Ransom note" lettering: every character is cut out of a different
// scrap - paper, ink, red, outlined - at a slightly different angle and
// size. Styles come from a hash of the text, so the same word always
// looks the same (no flicker between renders) but different words differ.

const SCRAPS = [
  'bg-paper text-ink font-display italic font-black',
  'bg-ink text-paper font-display font-black ring-2 ring-paper',
  'bg-primary text-paper font-display italic font-black',
  'bg-paper text-primary font-mono font-extrabold',
  'text-paper font-display font-black italic',
  'bg-ink text-primary font-sans font-bold ring-2 ring-primary',
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// size - Tailwind text size class for the letters
// accent - force the first letter onto a red scrap (the P5 title move)
export default function Ransom({ text, size = 'text-3xl', accent = true, className = '' }) {
  const seed = hash(text);
  return (
    <span aria-label={text} role="text" className={`inline-flex flex-wrap items-center gap-x-[0.08em] gap-y-1 ${className}`}>
      {Array.from(text).map((ch, i) => {
        if (ch === ' ') return <span key={i} aria-hidden="true" className={`inline-block w-[0.4em] ${size}`}>&nbsp;</span>;
        const r = hash(`${seed}:${i}`);
        const scrap = accent && i === 0 ? SCRAPS[2] : SCRAPS[r % SCRAPS.length];
        const rotate = ((r >> 3) % 13) - 6; // -6..6deg
        const lift = ((r >> 7) % 5) - 2; // -2..2px
        const scale = 0.88 + ((r >> 11) % 30) / 100; // 0.88..1.17
        return (
          <span
            key={i}
            aria-hidden="true"
            className={`inline-block leading-none px-[0.12em] py-[0.06em] uppercase ${size} ${scrap}`}
            style={{ transform: `translateY(${lift}px) rotate(${rotate}deg) scale(${scale})` }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}
