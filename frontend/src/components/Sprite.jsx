import { useEffect, useRef } from 'react';
import { SPRITES } from '../lib/sprites';

// Converts a sprite's character grid into SVG rects once per sprite and
// caches it. Same-colored horizontal runs merge into one rect, so each
// sprite is ~60 elements instead of ~200.
const cache = new Map();

function build(key) {
  if (cache.has(key)) return cache.get(key);
  const { rows, palette } = SPRITES[key];
  const top = 16 - rows.length; // bottom-align shorter sprites
  const at = (x, y) => rows[y]?.[x] ?? '.';
  const isEye = (x, y) => {
    const c = at(x, y);
    if (c === 'e') return true;
    return c === 'w' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(x + dx, y + dy) === 'e');
  };

  const rects = [];
  const lids = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === c) end++;
      if (c !== '.') rects.push({ x, y: y + top, w: end - x, fill: palette[c] });
      x = end;
    }
    for (let i = 0; i < row.length; i++) {
      if (isEye(i, y)) lids.push({ x: i, y: y + top });
    }
  });
  // Pre-rendered still frame as a data-URL image: one DOM node instead of
  // ~60, and the browser decodes it once and reuses it for every copy.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">` +
    `<ellipse cx="8" cy="15.9" rx="5.5" ry="0.8" fill="rgba(0,0,0,0.45)"/>` +
    rects.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="1" fill="${r.fill}"/>`).join('') +
    `</svg>`;
  const result = { rects, lids, url: `data:image/svg+xml,${encodeURIComponent(svg)}` };
  cache.set(key, result);
  return result;
}

// name   - key in SPRITES
// size   - rendered px (multiples of 16 stay perfectly crisp)
// bob    - idle bounce + blinking (live SVG). With bob off the sprite is a
//          single cached <img> - use that for grids of many sprites.
// delay  - offsets the bob/blink so a group doesn't move in lockstep
// hop    - change this number to make the sprite jump once
// src    - optional image URL to use instead of the built-in pixel art
export default function Sprite({ name, size = 64, bob = true, delay = 0, hop = 0, src, className = '', title }) {
  const ref = useRef(null);
  const sprite = SPRITES[name];

  useEffect(() => {
    if (!hop || !ref.current?.animate) return;
    ref.current.animate(
      [{ translate: '0 0' }, { translate: '0 -35%' }, { translate: '0 0' }, { translate: '0 -8%' }, { translate: '0 0' }],
      { duration: 520, easing: 'ease-out' }
    );
  }, [hop]);

  const label = title ?? sprite?.name;
  const wrapperStyle = { width: size, height: size, '--sprite-delay': `${-delay}s` };

  if (src) {
    return (
      <span className={`inline-block ${bob ? 'sprite-bob' : ''} ${className}`} style={wrapperStyle}>
        <img ref={ref} src={src} alt={label ?? ''} width={size} height={size} className="size-full object-contain [image-rendering:pixelated]" />
      </span>
    );
  }
  if (!sprite) return null;

  const { rects, lids, url } = build(name);
  if (!bob) {
    return (
      <span className={`inline-block ${className}`} style={wrapperStyle}>
        <img ref={ref} src={url} alt={label ?? ''} width={size} height={size} draggable="false" className="block size-full" />
      </span>
    );
  }
  return (
    <span className={`inline-block ${bob ? 'sprite-bob' : ''} ${className}`} style={wrapperStyle}>
      <svg
        ref={ref}
        viewBox="0 0 16 16"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        role="img"
        aria-label={label}
        className="block overflow-visible"
      >
        {/* soft ground shadow */}
        <ellipse cx="8" cy="15.9" rx="5.5" ry="0.8" fill="rgb(0 0 0 / 0.45)" />
        {rects.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height="1" fill={r.fill} />
        ))}
        <g className="sprite-lid">
          {lids.map((l, i) => (
            <rect key={i} x={l.x} y={l.y} width="1" height="1" fill={sprite.lid} />
          ))}
        </g>
      </svg>
    </span>
  );
}

// Pixel-font speech bubble. `tail` sets where the pointer sits.
export function SpeechBubble({ children, tail = 18, className = '' }) {
  return (
    <div className={`pixel-bubble px-3 py-2 text-[10px] leading-[1.5] ${className}`} style={{ '--tail-x': `${tail}px` }}>
      {children}
    </div>
  );
}
