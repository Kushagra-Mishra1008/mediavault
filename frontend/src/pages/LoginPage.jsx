import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Ransom from '../components/Ransom';
import Rook, { Bubble } from '../components/Rook';
import { Spinner } from '../components/ui';

// Red pixel sparks that trail the cursor. The loop only runs while
// sparks are alive (it sleeps when the mouse is still), is capped, and is
// skipped entirely on touch devices and for reduced-motion users.
function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let frame = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        ctx.fillStyle = `rgba(227, 0, 43, ${p.life})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      particles = particles.filter((p) => p.life > 0);
      frame = particles.length ? requestAnimationFrame(tick) : null;
    }

    function onMove(e) {
      if (particles.length > 80) return;
      for (let i = 0; i < 2; i++) {
        particles.push({ x: e.clientX, y: e.clientY, size: Math.random() * 4 + 1, vx: Math.random() * 3 - 1.5, vy: Math.random() * 3 - 1.5, life: 1 });
      }
      if (!frame) frame = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 pointer-events-none z-50 opacity-60" />;
}

const MODES = [
  { key: 'login', label: 'Login' },
  { key: 'register', label: 'Register' },
];

const ROOK_LINES = {
  login: "Welcome back. I kept the vault warm for you.",
  register: "New face? Let's get you set up.",
  error: "Hmm, that key didn't fit. Try again?",
};

const ease = [0.16, 1, 0.3, 1];

// onAuthenticated(username) - lets App play the screen wipe.
export default function LoginPage({ onAuthenticated }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  // Bumped per failure so the shake + Rook's reaction replay each time.
  const [failures, setFailures] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      onAuthenticated(username);
    } catch (err) {
      setError(err.message);
      setFailures((f) => f + 1);
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
  }

  const rookLine = error ? ROOK_LINES.error : ROOK_LINES[mode];

  return (
    <div className="min-h-dvh bg-background relative overflow-hidden flex items-center justify-center py-12">
      <CursorTrail />

      {/* ---------- Backdrop ---------- */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -inset-40 text-primary/[0.12] halftone drift" />
        <m.div
          className="absolute top-1/2 left-1/2 w-[160%] h-[380px] -ml-[80%] -mt-[190px] bg-primary -rotate-[15deg] origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease }}
        />
        <m.div
          className="absolute top-1/2 left-1/2 w-[160%] h-6 -ml-[80%] mt-[170px] bg-paper -rotate-[15deg] origin-right"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
        />
      </div>

      <main className="relative z-10 w-full max-w-6xl px-5 sm:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* ---------- Hero ---------- */}
        <div className="flex-1 text-center lg:text-left">
          <m.div
            initial={{ opacity: 0, y: -10, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
            className="inline-block bg-ink text-paper px-5 py-2 mb-6 border-2 border-paper"
          >
            <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">Your media. Your rules.</span>
          </m.div>

          <m.h1
            initial={{ opacity: 0, scale: 1.3, rotate: 4 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.4 }}
            className="flex flex-col items-center lg:items-start gap-2"
          >
            <Ransom text="Media" size="text-6xl sm:text-8xl" />
            <span className="font-display italic font-black text-6xl sm:text-8xl leading-none uppercase tracking-tighter bg-paper text-primary px-4 -skew-x-6 shadow-[10px_10px_0_0_var(--color-ink)]">
              Vault
            </span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.6 }}
            className="mt-8 text-lg text-paper max-w-md mx-auto lg:mx-0 bg-ink/80 border-l-8 border-paper px-5 py-3 text-left"
          >
            Every movie, series, anime, game and manga you&apos;ve conquered, in one place. Level up as you go.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.75 }}
            className="hidden lg:flex items-end gap-4 mt-10"
          >
            <Rook size={110} hop={failures} mood={error ? 'shock' : 'smug'} />
            <div className="mb-16">
              <Bubble tail="left">{rookLine}</Bubble>
            </div>
          </m.div>
        </div>

        {/* ---------- Form card ---------- */}
        <m.div
          initial={{ opacity: 0, x: 80, rotate: 6 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.35 }}
          className="w-full max-w-md relative"
        >
          <div aria-hidden="true" className="absolute inset-0 bg-ink translate-x-4 translate-y-4 -skew-x-3" />
          {/* Shake on each failed attempt. Alternating keyframes (instead of
              remounting) keeps the inputs and focus intact. */}
          <m.div
            animate={{ x: failures === 0 ? 0 : failures % 2 ? [0, -12, 10, -6, 4, 0] : [0, 12, -10, 6, -4, 0] }}
            transition={{ duration: 0.4 }}
            className="relative bg-surface border-4 border-paper -skew-x-3"
          >
            <div className="skew-x-3 p-7 sm:p-10">
              {/* Mode switch with a sliding red slash */}
              <div className="flex gap-2 mb-8" role="tablist">
                {MODES.map((item) => {
                  const active = mode === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => switchMode(item.key)}
                      className={`relative px-4 py-1.5 font-display italic font-black text-2xl uppercase tracking-tight transition-colors ${
                        active ? 'text-paper' : 'text-on-background/35 hover:text-paper'
                      }`}
                    >
                      {active && (
                        <m.span
                          layoutId="auth-mode"
                          className="absolute inset-0 bg-primary -skew-x-12"
                          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                        />
                      )}
                      <span className="relative">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <IconField icon={User} label="Codename">
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="field pl-11"
                  />
                </IconField>

                <AnimatePresence initial={false}>
                  {mode === 'register' && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="overflow-hidden"
                    >
                      <IconField icon={Mail} label="Email">
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="field pl-11"
                        />
                      </IconField>
                    </m.div>
                  )}
                </AnimatePresence>

                <IconField icon={Lock} label="Password">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="field pl-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-9 grid place-items-center text-on-background/40 hover:text-paper"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </IconField>

                <AnimatePresence>
                  {error && (
                    <m.p
                      role="alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-primary text-paper font-mono text-xs font-bold uppercase px-3 py-2 -skew-x-6"
                    >
                      {error}
                    </m.p>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={submitting} className="btn-primary w-full h-16 text-xl sm:text-2xl justify-between px-6 sm:px-8 mt-2 whitespace-nowrap">
                  <span>{submitting ? 'Breaking in…' : mode === 'login' ? 'Enter the Vault' : 'Join the Crew'}</span>
                  {submitting ? <Spinner size={20} /> : <ArrowRight size={26} strokeWidth={3} />}
                </button>
              </form>
            </div>
          </m.div>

          {/* Rook peeks in on mobile, where the hero version is hidden */}
          <div className="lg:hidden flex items-end gap-3 mt-10 justify-center">
            <Rook size={64} hop={failures} mood={error ? 'shock' : 'smug'} />
            <div className="mb-10"><Bubble tail="left">{rookLine}</Bubble></div>
          </div>
        </m.div>
      </main>
    </div>
  );
}

function IconField({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="hud-label text-primary block mb-2">{label}</span>
      <span className="relative block">
        <Icon size={18} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-background/40 pointer-events-none" />
        {children}
      </span>
    </label>
  );
}
