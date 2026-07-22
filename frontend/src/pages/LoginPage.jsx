import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function handleMove(e) {
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 4 + 1,
          speedX: Math.random() * 3 - 1.5,
          speedY: Math.random() * 3 - 1.5,
          life: 1,
        });
      }
    }
    window.addEventListener('mousemove', handleMove);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.05;
        ctx.fillStyle = `rgba(227, 0, 43, ${p.life})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      particles = particles.filter((p) => p.life > 0);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 opacity-50"
    />
  );
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <CursorTrail />

      <div className="absolute top-0 left-0 w-64 h-64 halftone-bg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 halftone-bg pointer-events-none" />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[400px] bg-primary -rotate-[15deg] opacity-90 shadow-[0_0_100px_rgba(227,0,43,0.3)]" />
      </div>

      <main className="relative z-10 w-full max-w-5xl px-8 flex flex-col md:flex-row items-center gap-12">

        <div className="flex-1 text-center md:text-left">
          <div className="inline-block bg-primary text-white px-6 py-2 -rotate-3 mb-4">
            <span className="font-mono text-xs tracking-widest uppercase">
              System Protocol: Active
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl italic font-black text-white tracking-tighter uppercase leading-none mb-6">
            MEDIA<br />
            <span className="text-primary bg-white px-4 inline-block">VAULT</span>
          </h1>
          <p className="font-sans text-lg text-on-surface-variant max-w-md mx-auto md:mx-0 opacity-80 border-l-4 border-primary pl-6">
            The definitive archive for digital defiance. Catalog your collection. Secure the data.
          </p>
        </div>

        <div className="w-full max-w-md relative group">
          <div className="absolute inset-0 bg-primary translate-x-4 translate-y-4 -skew-x-3 transition-transform group-hover:translate-x-6 group-hover:translate-y-6" />

          <div className="relative bg-surface p-8 md:p-12 -skew-x-3 border-2 border-white/10 shadow-2xl">
            <div className="skew-x-3">

              <div className="flex gap-4 mb-10 border-b-2 border-white/5 pb-4">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`font-display text-2xl font-black uppercase tracking-tight transition-all hover:translate-x-1 ${
                    mode === 'login' ? 'text-primary' : 'text-on-surface-variant/40 hover:text-white'
                  }`}
                >
                  LOGIN
                </button>
                <span className="text-white/20 font-black text-2xl">/</span>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`font-display text-2xl font-black uppercase tracking-tight transition-all hover:translate-x-1 ${
                    mode === 'register' ? 'text-primary' : 'text-on-surface-variant/40 hover:text-white'
                  }`}
                >
                  REGISTER
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative group/field">
                  <label className="block font-mono text-xs text-primary uppercase mb-2">
                    User Identity
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="OPERATIVE_ID"
                    className="w-full bg-transparent border-b-4 border-white/20 py-3 px-4 text-white font-sans focus:outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:text-white/10"
                  />
                </div>

                {mode === 'register' && (
                  <div className="relative group/field">
                    <label className="block font-mono text-xs text-primary uppercase mb-2">
                      Contact Frequency
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="EMAIL_ADDRESS"
                      className="w-full bg-transparent border-b-4 border-white/20 py-3 px-4 text-white font-sans focus:outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:text-white/10"
                    />
                  </div>
                )}

                <div className="relative group/field">
                  <label className="block font-mono text-xs text-primary uppercase mb-2">
                    Security Cipher
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b-4 border-white/20 py-3 px-4 text-white font-sans focus:outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:text-white/10"
                  />
                </div>

                {error && (
                  <p className="font-mono text-sm text-primary uppercase">{error}</p>
                )}

                <div className="pt-4 space-y-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-white py-5 px-8 font-display text-2xl font-black uppercase tracking-widest flex justify-between items-center jitter-on-hover transition-all disabled:opacity-50"
                  >
                    <span>
                      {submitting
                        ? 'Processing...'
                        : mode === 'login' ? 'Initialize Access' : 'Create Profile'}
                    </span>
                    <span>→</span>
                  </button>

                  {mode === 'login' && (
                    <div className="flex justify-between items-center font-mono text-xs uppercase opacity-60">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" className="rounded-none bg-transparent border-2 border-white/20 text-primary" />
                        PERSIST SESSION
                      </label>
                      <span className="opacity-40 cursor-not-allowed" title="Not implemented yet">
                        Lost Protocol?
                      </span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 flex justify-between items-end pointer-events-none">
        <div className="font-mono text-[10px] space-y-1 opacity-20 hidden md:block text-on-background">
          <div>ENCRYPTED SESSION LAYER</div>
          <div>MEDIAVAULT v1.0</div>
        </div>
        <div className="bg-primary text-white px-4 py-1 font-mono text-xs flex items-center gap-2 pointer-events-auto">
          <span>🛡</span>
          ENCRYPTED CONNECTION ESTABLISHED
        </div>
      </footer>
    </div>
  );
}