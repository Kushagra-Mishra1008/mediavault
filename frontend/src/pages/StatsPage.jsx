import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { Layers, Star, Trophy, Play, Clock } from 'lucide-react';
import { apiGet } from '../api/client';
import { STATUSES, STATUS_KEYS, TYPES, TYPE_KEYS } from '../lib/media';
import { PageHeader, CountUp, TypeBadge, StatusBadge, Poster } from '../components/ui';

const ease = [0.22, 1, 0.36, 1];

// Tiles cascade in one after another.
const grid = { animate: { transition: { staggerChildren: 0.06 } } };
const tile = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Independent requests, fetched in parallel.
    Promise.all([apiGet('/stats'), apiGet('/library?size=4&sort=addedAt,desc')])
      .then(([statsData, recentData]) => {
        if (cancelled) return;
        setStats(statsData);
        setRecent(recentData.content);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <PageHeader index="02" eyebrow="Player Profile" title="Stats" subtitle="How your collection breaks down." />
      {error ? (
        <p className="panel p-4 text-sm text-danger">{error}</p>
      ) : !stats ? (
        <StatsSkeleton />
      ) : (
        <StatsContent stats={stats} recent={recent} />
      )}
    </div>
  );
}

function StatsContent({ stats, recent }) {
  const total = stats.totalEntries;
  // byType/byStatus only contain keys that have entries - default to 0
  // so every row always renders, even when empty.
  const typeCount = (t) => stats.byType[t] ?? 0;
  const statusCount = (s) => stats.byStatus[s] ?? 0;
  const pct = (n) => (total > 0 ? (n / total) * 100 : 0);
  const completionRate = pct(statusCount('COMPLETED'));
  const maxType = Math.max(1, ...TYPE_KEYS.map(typeCount));

  return (
    <m.div variants={grid} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ---------- KPI tiles ---------- */}
      <KpiTile icon={Layers} label="Total Titles" accent="text-accent">
        <CountUp value={total} />
      </KpiTile>

      <KpiTile icon={Star} label="Avg Rating" accent="text-movie">
        {stats.averageRating ? (
          <>
            <CountUp value={stats.averageRating} decimals={1} />
            <span className="text-lg text-faint">/10</span>
          </>
        ) : (
          <span className="text-faint">–</span>
        )}
        {stats.averageRating != null && <RatingMeter value={stats.averageRating} />}
      </KpiTile>

      <KpiTile icon={Trophy} label="Completion" accent="text-success">
        <CountUp value={completionRate} />
        <span className="text-lg text-faint">%</span>
        <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <m.div
            className="h-full rounded-full bg-success origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: completionRate / 100 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
          />
        </div>
      </KpiTile>

      <KpiTile icon={Play} label="In Progress" accent="text-cyan">
        <CountUp value={statusCount('IN_PROGRESS')} />
      </KpiTile>

      {/* ---------- Type breakdown ---------- */}
      <m.section variants={tile} className="panel p-5 sm:p-6 col-span-2">
        <h2 className="hud-label text-muted mb-5">By Type</h2>
        <div className="space-y-4">
          {TYPE_KEYS.map((key, i) => {
            const meta = TYPES[key];
            const Icon = meta.icon;
            const count = typeCount(key);
            return (
              <div key={key} title={`${meta.label}: ${count} (${Math.round(pct(count))}%)`}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 font-medium">
                    <Icon size={15} className={meta.text} />
                    {meta.label}
                  </span>
                  <span className="text-muted tabular-nums">
                    <span className="text-fg font-semibold">{count}</span> · {Math.round(pct(count))}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  {/* scaleX (not width) so the bar animates on the compositor */}
                  <m.div
                    className={`h-full rounded-full origin-left ${meta.bg}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: count / maxType }}
                    transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.07 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </m.section>

      {/* ---------- Status breakdown ---------- */}
      <m.section variants={tile} className="panel p-5 sm:p-6 col-span-2">
        <h2 className="hud-label text-muted mb-5">By Status</h2>
        {/* Stacked bar: segments separated by a 2px gap */}
        <div className="flex h-3 gap-0.5 rounded-full overflow-hidden bg-white/[0.05]">
          {STATUS_KEYS.map((key, i) => {
            const count = statusCount(key);
            if (count === 0) return null;
            return (
              <m.div
                key={key}
                title={`${STATUSES[key].label}: ${count}`}
                className={`h-full origin-left ${STATUSES[key].dot}`}
                style={{ flexGrow: count }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.08 }}
              />
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {STATUS_KEYS.map((key) => {
            const meta = STATUSES[key];
            const Icon = meta.icon;
            return (
              <div key={key} className="flex items-center gap-3 rounded-lg bg-void/50 border border-white/[0.05] p-3">
                <div className={`size-9 grid place-items-center rounded-lg bg-white/[0.04] ${meta.text}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="font-display text-xl font-bold leading-none tabular-nums">{statusCount(key)}</p>
                  <p className="text-xs text-muted mt-1">{meta.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </m.section>

      {/* ---------- Recently added ---------- */}
      <m.section variants={tile} className="panel p-5 sm:p-6 col-span-2 lg:col-span-4">
        <h2 className="hud-label text-muted mb-5 flex items-center gap-2">
          <Clock size={13} /> Recently Added
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-faint">Nothing added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recent.map((entry) => (
              <div key={entry.id} className="flex gap-3 rounded-lg bg-void/50 border border-white/[0.05] p-2.5">
                <div className="w-14 aspect-[2/3] shrink-0 rounded-md overflow-hidden bg-raised">
                  <Poster src={entry.mediaItem.imageUrl} type={entry.mediaItem.type} iconSize={20} />
                </div>
                <div className="min-w-0 flex flex-col justify-center gap-1.5">
                  <p className="font-display font-semibold leading-tight line-clamp-2">{entry.mediaItem.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <TypeBadge type={entry.mediaItem.type} />
                  </div>
                  <StatusBadge status={entry.status} className="self-start px-0! bg-transparent!" />
                </div>
              </div>
            ))}
          </div>
        )}
      </m.section>
    </m.div>
  );
}

function KpiTile({ icon: Icon, label, accent, children }) {
  return (
    <m.div variants={tile} className="panel relative overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <span className="hud-label text-muted">{label}</span>
        <Icon size={16} className={accent} />
      </div>
      <div className="font-display text-4xl font-bold mt-3">{children}</div>
    </m.div>
  );
}

function RatingMeter({ value }) {
  return (
    <div className="flex gap-0.5 mt-3" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <m.span
          key={i}
          className={`h-1.5 flex-1 -skew-x-12 rounded-[1px] ${i < Math.round(value) ? 'bg-movie' : 'bg-white/[0.07]'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.04 }}
        />
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton h-32 rounded-xl" />
      ))}
      <div className="skeleton h-64 rounded-xl col-span-2" />
      <div className="skeleton h-64 rounded-xl col-span-2" />
    </div>
  );
}
