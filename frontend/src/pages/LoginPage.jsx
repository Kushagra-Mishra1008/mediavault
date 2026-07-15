import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    // Forms POST and reload the page by default - preventDefault stops
    // that so React stays in control of what happens next.
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      // No navigation call here on purpose - once App.jsx checks
      // isAuthenticated (next file), a successful login/register will
      // just cause the whole app to re-render into the logged-in view.
    } catch (err) {
      // err.message here is exactly what GlobalExceptionHandler sent -
      // "Invalid username or password", "Email already registered", etc.
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="relative w-full max-w-md bg-white border border-ink/10 p-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl tracking-wide text-ink">MEDIAVAULT</h1>
            <p className="font-mono text-xs text-ink/50 mt-1">
              ACCESSION NO. MV-2024-{mode === 'login' ? 'LOGIN' : 'REGISTER'}
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider bg-ink text-paper px-2 py-1 whitespace-nowrap">
            Secure Archive
          </span>
        </div>

        <p className="font-mono text-xs text-ink/50 mb-6">
          BORROWER STATUS: <span className="text-stamp font-semibold">UNAUTHORIZED</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-1">
              Archive Member ID
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. curator_01"
              className="w-full border-b border-ink/30 bg-transparent py-2 font-sans text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. curator@example.com"
                className="w-full border-b border-ink/30 bg-transparent py-2 font-sans text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink/60 mb-1">
              Secure Clearance Key
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-b border-ink/30 bg-transparent py-2 font-sans text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink"
            />
          </div>

          {error && (
            <p className="text-sm text-stamp font-medium">{error}</p>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-2 text-sm text-ink/60">
              <input type="checkbox" className="accent-ink" />
              Stay signed in for 30 days
            </label>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink text-paper font-mono text-xs uppercase tracking-wider py-3 hover:bg-ink/90 disabled:opacity-50 transition"
          >
            {submitting
              ? 'Processing...'
              : mode === 'login' ? 'Authorize Entry →' : 'Create Archive Account →'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
          className="block mx-auto mt-6 text-sm text-ink/50 hover:text-ink underline underline-offset-2"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
        </button>

        {mode === 'login' && (
          <p className="text-center mt-2 text-xs text-ink/30 cursor-not-allowed" title="Not implemented yet">
            Lost your vault key?
          </p>
        )}

        {/* Decorative ink stamp - purely visual, matches the mockup's
            rotated date-stamp flourish */}
        <div className="absolute -bottom-4 -right-4 border-2 border-stamp text-stamp font-mono text-[10px] px-3 py-1 rotate-[-8deg] opacity-70 select-none">
          DATE: --/--/--
        </div>
      </div>
    </div>
  );
}