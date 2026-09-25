import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { STATUSES, STATUS_KEYS, TYPES, TYPE_KEYS } from '../lib/media';
import { CALLING_CARDS, XP_BY_STATUS, collectedCards, personaStats, progressFor } from '../lib/progress';
import { PageHeader, CountUp, Poster, TypeBadge } from '../components/ui';
import Ransom from '../components/Ransom';

const ease = [0.16, 1, 0.3, 1];
const grid = { animate: { transition: { staggerChildren: 0.06 } } };
const panel = {
  initial: { opacity: 0, y: 24, rotate: -1 },
  animate: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.5, ease } },
};

export default function StatsPage() {
  // Stats are shared app-wide by VaultProvider (so the sidebar and this
  // page always agree); only the recent-uploads strip is fetched here.
  const { stats, error } = useVault();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let cancelled = false;
    apiGet('/library?size=4&sort=addedAt,desc')
      .then((data) => !cancelled && setRecent(data.content))
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <PageHeader index="02" title="Stats" subtitle="Know thyself" />
      {error ? (
        <p className="bg-primary text-paper font-mono text-sm uppercase p-4">{error}</p>
      ) : !stats ? (
        <StatsSkeleton />
      ) : (
        <m.div variants={grid} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <PlayerCard stats={stats} />
          <PersonaChart stats={stats} />
          <Kpis stats={stats} />
          <TypeBars stats={stats} />
          <StatusGrid stats={stats} />
          <CallingCards stats={stats} />
          <RecentStrip recent={recent} />
        </m.div>
      )}
    </div>
  );
}

function Panel({ label, className = '', children }) {
  return (
    <m.section variants={panel} className={`relative bg-surface border-l-8 border-primary p-5 sm:p-6 ${className}`}>
      {label && <h2 className="hud-label text-primary mb-5">// {label}</h2>}
      {children}
    </m.section>
  );
}

function PlayerCard({ stats }) {
  const { user } = useAuth();
  const p = progressFor(stats);
  return (
    <Panel className="lg:col-span-5 overflow-hidden">
      <div aria-hidden="true" className="absolute -right-10 -top-10 size-56 text-primary/15 halftone rounded-full" />
      <div className="relative flex items-center gap-5">
        <m.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.2 }}
          className="shrink-0 grid place-items-center size-28 bg-primary clip-burst"
        >
          <div className="text-center leading-none">
            <span className="block font-mono text-[10px] font-bold text-paper/80">LV</span>
            <span className="block font-display italic font-black text-5xl text-paper">{p.level}</span>
          </div>
        </m.div>
        <div className="min-w-0">
          <Ransom text={user.username} size="text-2xl" />
          <p className="mt-3 inline-block bg-paper text-ink font-display italic font-black uppercase px-3 -skew-x-12">{p.title}</p>
        </div>
      </div>

      <div className="relative mt-7">
        <div className="flex justify-between font-mono text-[11px] font-bold uppercase text-on-background/60 mb-2">
          <span>XP <span className="text-paper"><CountUp value={p.xp} /></span></span>
          <span>{p.needed - p.into} to LV {p.level + 1}</span>
        </div>
        <div className="relative h-5 bg-ink -skew-x-12 overflow-hidden">
          <m.div
            className="absolute inset-0 bg-primary origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: p.pct }}
            transition={{ duration: 1.1, ease, delay: 0.3 }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_18px,var(--color-surface)_18px_21px)]" />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase text-on-background/40">
          Complete +{XP_BY_STATUS.COMPLETED} · In progress +{XP_BY_STATUS.IN_PROGRESS} · On hold +{XP_BY_STATUS.ON_HOLD} · Planned +{XP_BY_STATUS.PLANNED}
        </p>
      </div>
    </Panel>
  );
}

// Pentagon of the five personal stats. The shape grows out from the
// center; every vertex is labeled with its stat, rank and rank name, so
// the chart never relies on shape alone.
function PersonaChart({ stats }) {
  const list = personaStats(stats);
  const C = 150;
  const R = 92;
  const point = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  };
  const ring = (r) => list.map((_, i) => point(i, r).join(',')).join(' ');
  const shape = list.map((s, i) => point(i, (Math.max(s.rank, 0.35) / 5) * R).join(',')).join(' ');

  return (
    <Panel label="Personal stats" className="lg:col-span-7">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px] shrink-0 overflow-visible" role="img" aria-label="Personal stats chart">
          {[1, 2, 3, 4, 5].map((r) => (
            <polygon key={r} points={ring((r / 5) * R)} fill={r === 5 ? '#0B0B0D' : 'none'} stroke="rgb(254 218 216 / 0.12)" strokeWidth="1" />
          ))}
          {list.map((_, i) => {
            const [x, y] = point(i, R);
            return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="rgb(254 218 216 / 0.12)" />;
          })}
          <m.polygon
            points={shape}
            fill="rgb(227 0 43 / 0.55)"
            stroke="#E3002B"
            strokeWidth="3"
            strokeLinejoin="miter"
            style={{ transformOrigin: `${C}px ${C}px` }}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.3 }}
          />
          {list.map((s, i) => {
            const [x, y] = point(i, R + 30);
            return (
              <g key={s.stat}>
                <text x={x} y={y - 4} textAnchor="middle" className="fill-paper font-display italic" fontWeight="900" fontSize="15">
                  {s.stat.toUpperCase()}
                </text>
                <text x={x} y={y + 11} textAnchor="middle" fill={TYPES[s.type].hex} className="font-mono" fontWeight="700" fontSize="10">
                  RANK {s.rank}
                </text>
              </g>
            );
          })}
        </svg>

        <ul className="w-full min-w-0 space-y-3">
          {list.map((s, i) => (
            <m.li
              key={s.stat}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.35, ease }}
              className="flex items-center gap-3"
            >
              <span className={`w-[6.5rem] shrink-0 font-display italic font-black uppercase text-sm ${TYPES[s.type].text}`}>{s.stat}</span>
              <span className="flex shrink-0 gap-1" aria-label={`Rank ${s.rank} of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`h-3 w-4 -skew-x-12 ${n <= s.rank ? 'bg-primary' : 'bg-ink'}`} />
                ))}
              </span>
              <span className="ml-auto min-w-0 truncate font-mono text-[11px] uppercase text-on-background/60 text-right">{s.rankName}</span>
            </m.li>
          ))}
          <li className="pt-1 font-mono text-[10px] uppercase text-on-background/35">Ranks grow with every title of that type you log.</li>
        </ul>
      </div>
    </Panel>
  );
}

function Kpis({ stats }) {
  const completed = stats.byStatus.COMPLETED ?? 0;
  const rate = stats.totalEntries ? (completed / stats.totalEntries) * 100 : 0;
  const tiles = [
    { label: 'Total titles', value: <CountUp value={stats.totalEntries} /> },
    {
      label: 'Avg rating',
      value: stats.averageRating ? (
        <>
          <CountUp value={stats.averageRating} decimals={1} />
          <span className="text-xl text-on-background/40">/10</span>
        </>
      ) : (
        '–'
      ),
    },
    { label: 'Completion', value: <><CountUp value={rate} /><span className="text-xl text-on-background/40">%</span></> },
  ];
  return (
    <>
      {tiles.map((t) => (
        <Panel key={t.label} label={t.label} className="lg:col-span-3">
          <p className="font-display italic font-black text-6xl leading-none text-paper">{t.value}</p>
        </Panel>
      ))}
      <m.section variants={panel} className="relative lg:col-span-3 bg-primary p-5 sm:p-6 overflow-hidden -skew-x-2">
        <div aria-hidden="true" className="absolute inset-0 text-ink/20 halftone" />
        <div className="relative skew-x-2">
          <h2 className="hud-label text-paper/80 mb-4">// Top genre</h2>
          <p className="font-display italic font-black text-3xl uppercase text-paper leading-tight break-words">{stats.topGenre ?? 'Unknown'}</p>
        </div>
      </m.section>
    </>
  );
}

function TypeBars({ stats }) {
  const max = Math.max(1, ...TYPE_KEYS.map((t) => stats.byType[t] ?? 0));
  return (
    <Panel label="Type distribution" className="lg:col-span-7">
      <div className="space-y-4">
        {TYPE_KEYS.map((key, i) => {
          const meta = TYPES[key];
          const count = stats.byType[key] ?? 0;
          const pct = stats.totalEntries ? Math.round((count / stats.totalEntries) * 100) : 0;
          return (
            <div key={key} title={`${meta.label}: ${count} (${pct}%)`}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className={`font-display italic font-black uppercase ${meta.text}`}>{meta.label}</span>
                <span className="font-mono text-xs text-on-background/60"><span className="text-paper font-bold">{count}</span> · {pct}%</span>
              </div>
              <div className="h-3 bg-ink -skew-x-12 overflow-hidden">
                <m.div
                  className={`h-full origin-left ${meta.bg}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: count / max }}
                  transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.07 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {Object.keys(stats.byGenre ?? {}).length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(stats.byGenre).slice(0, 6).map(([genre, count]) => (
            <span key={genre} className="bg-surface-high border border-primary/30 font-mono text-xs text-paper px-3 py-1.5 -skew-x-6">
              {genre} <span className="text-primary">[{count}]</span>
            </span>
          ))}
        </div>
      )}
    </Panel>
  );
}

function StatusGrid({ stats }) {
  return (
    <Panel label="Status breakdown" className="lg:col-span-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STATUS_KEYS.map((key) => {
          const meta = STATUSES[key];
          const Icon = meta.icon;
          return (
            <div key={key} className="bg-ink p-3 border-b-4 border-primary/60">
              <Icon size={16} strokeWidth={2.5} className="text-primary" />
              <p className="mt-2 font-display italic font-black text-3xl leading-none text-paper tabular-nums">{stats.byStatus[key] ?? 0}</p>
              <p className="mt-1 font-mono text-[10px] uppercase text-on-background/50">{meta.label}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// Achievements as calling cards: collected ones flip face-up (red,
// ransom title), the rest stay face-down.
function CallingCards({ stats }) {
  const got = collectedCards(stats);
  return (
    <Panel label={`Calling cards · ${got.size}/${CALLING_CARDS.length}`} className="lg:col-span-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 [perspective:900px]">
        {CALLING_CARDS.map((card, i) => {
          const has = got.has(card.id);
          return (
            <m.div
              key={card.id}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease, delay: 0.3 + i * 0.07 }}
              className={`relative aspect-[3/4] p-3 flex flex-col justify-between overflow-hidden transition-[translate,rotate] duration-200 ease-(--ease-snap) hover:-translate-y-1.5 hover:-rotate-2 ${
                has ? 'bg-primary shadow-[5px_5px_0_0_var(--color-paper)]' : 'bg-ink border-2 border-dashed border-on-background/15'
              }`}
              title={card.desc}
            >
              <div aria-hidden="true" className={`absolute inset-0 halftone ${has ? 'text-ink/25' : 'text-on-background/[0.06]'}`} />
              {has ? (
                <>
                  <span className="relative font-mono text-[9px] font-bold uppercase text-paper/80">Card {String(i + 1).padStart(2, '0')}</span>
                  <div className="relative -rotate-6">
                    <Ransom text={card.name} size="text-sm" accent={false} />
                  </div>
                  <span className="relative font-sans text-[11px] leading-tight text-paper">{card.desc}</span>
                </>
              ) : (
                <>
                  <span className="relative font-mono text-[9px] font-bold uppercase text-on-background/30">Card {String(i + 1).padStart(2, '0')}</span>
                  <span className="relative self-center font-display italic font-black text-5xl text-on-background/15">?</span>
                  <span className="relative font-sans text-[11px] leading-tight text-on-background/40">{card.desc}</span>
                </>
              )}
            </m.div>
          );
        })}
      </div>
    </Panel>
  );
}

function RecentStrip({ recent }) {
  return (
    <Panel label="Recent uploads" className="lg:col-span-12">
      {recent.length === 0 ? (
        <p className="font-mono text-xs uppercase text-on-background/40">Nothing yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recent.map((entry) => (
            <div key={entry.id} className="flex gap-3 bg-ink p-2.5">
              <div className="w-14 aspect-[2/3] shrink-0 overflow-hidden">
                <Poster src={entry.mediaItem.imageUrl} title={entry.mediaItem.title} type={entry.mediaItem.type} compact />
              </div>
              <div className="min-w-0 flex flex-col justify-center gap-2">
                <p className="font-display italic font-black uppercase leading-tight line-clamp-2 text-paper">{entry.mediaItem.title}</p>
                <TypeBadge type={entry.mediaItem.type} className="self-start" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="skeleton h-64 lg:col-span-5" />
      <div className="skeleton h-64 lg:col-span-7" />
      {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-32 lg:col-span-3" />)}
    </div>
  );
}
