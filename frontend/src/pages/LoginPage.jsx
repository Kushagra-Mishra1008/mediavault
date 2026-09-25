import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TYPES, TYPE_KEYS } from '../lib/media';
import { Logo, Wordmark, Spinner } from '../components/ui';

const ease = [0.22, 1, 0.36, 1];

const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const MODES = [
  { key: 'login', label: 'Sign In' },
  { key: 'register', label: 'Create Account' },
];

// onAuthenticated - fired after a successful login/register so App can
// play the screen-wipe transition into the app.
export default function LoginPage({ onAuthenticated }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  // Bumped on every failed attempt so the error shake replays each time.
  const [errorCount, setErrorCount] = useState(0);
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
      // No navigation here - App re-renders into the logged-in view as
      // soon as the auth context has a user.
      onAuthenticated();
    } catch (err) {
      // err.message is exactly what GlobalExceptionHandler sent back.
      setError(err.message);
      setErrorCount((c) => c + 1);
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.1fr_1fr]">
      {/* ---------- Hero (desktop) ---------- */}
      <m.section
        variants={stagger}
        initial="initial"
        animate="animate"
        className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-white/[0.06]"
      >
        {/* Oversized slanted accent blade - static decoration */}
        <div aria-hidden="true" className="absolute -right-24 top-0 h-full w-40 -skew-x-12 bg-gradient-to-b from-accent/25 via-accent/5 to-transparent" />
        <div aria-hidden="true" className="absolute -right-2 top-0 h-full w-1.5 -skew-x-12 bg-accent/60" />

        <m.div variants={rise} className="flex items-center gap-3">
          <Logo size={36} />
          <Wordmark className="text-xl" />
        </m.div>

        <div className="relative max-w-xl">
          <m.p variants={rise} className="hud-label text-accent flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Personal media tracker
          </m.p>
          <m.h1 variants={rise} className="font-display font-bold text-5xl xl:text-6xl leading-[1.05] mt-5">
            Every world you&apos;ve explored.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-soft">One vault.</span>
          </m.h1>
          <m.p variants={rise} className="text-muted text-lg mt-5 max-w-md">
            Track the movies, series, anime and games you&apos;ve finished, the ones you&apos;re in the middle of, and what to play next.
          </m.p>

          <m.div variants={rise} className="grid grid-cols-4 gap-3 mt-10 max-w-md">
            {TYPE_KEYS.map((key) => {
              const meta = TYPES[key];
              const Icon = meta.icon;
              return (
                <div key={key} className="panel flex flex-col items-center gap-2 py-4">
                  <Icon size={22} className={meta.text} />
                  <span className="hud-label text-[10px] text-muted">{meta.label}</span>
                </div>
              );
            })}
          </m.div>
        </div>

        <m.p variants={rise} className="text-xs text-faint">
          Press <kbd className="text-muted">1</kbd> <kbd className="text-muted">2</kbd> <kbd className="text-muted">3</kbd> to switch screens once you&apos;re in.
        </m.p>
      </m.section>

      {/* ---------- Form ---------- */}
      <section className="flex items-center justify-center p-5 sm:p-10">
        <m.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <Logo size={34} />
            <Wordmark className="text-xl" />
          </div>

          <div className="panel relative overflow-hidden p-7 sm:p-9 shadow-2xl shadow-black/40">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent-soft to-transparent" />

            <h2 className="font-display text-2xl font-bold tracking-wide">
              {mode === 'login' ? 'Welcome back' : 'Start your vault'}
            </h2>
            <p className="text-sm text-muted mt-1">
              {mode === 'login' ? 'Sign in to continue where you left off.' : 'Takes ten seconds. Then start logging.'}
            </p>

            {/* Mode switch with sliding highlight */}
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-void/60 border border-white/[0.06] p-1 mt-7" role="tablist">
              {MODES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={mode === item.key}
                  onClick={() => switchMode(item.key)}
                  className={`relative h-9 rounded-md text-sm font-medium transition-colors ${
                    mode === item.key ? 'text-fg' : 'text-muted hover:text-fg'
                  }`}
                >
                  {mode === item.key && (
                    <m.span
                      layoutId="auth-mode"
                      className="absolute inset-0 rounded-md bg-raised border border-white/10"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <IconField icon={User} label="Username">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="player_one"
                  className="field pl-10"
                />
              </IconField>

              {/* Email slides open only for registration */}
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
                        className="field pl-10"
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
                  className="field pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8 grid place-items-center rounded-md text-faint hover:text-fg transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </IconField>

              <AnimatePresence>
                {error && (
                  <m.p
                    key={errorCount}
                    role="alert"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: [0, -8, 7, -5, 3, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </m.p>
                )}
              </AnimatePresence>

              <button type="submit" disabled={submitting} className="btn-primary w-full h-12 text-[13px] mt-6!">
                {submitting ? (
                  <>
                    <Spinner size={15} /> Connecting
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Enter the Vault' : 'Create Account'}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>
        </m.div>
      </section>
    </div>
  );
}

function IconField({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="hud-label text-muted block mb-2">{label}</span>
      <span className="relative block">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
        {children}
      </span>
    </label>
  );
}
