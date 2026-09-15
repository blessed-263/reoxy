import React, { FormEvent, useState } from 'react';
import { ReOxyLogo } from './logos/ReOxyLogo';
import { MicorLogo } from './logos/MicorLogo';
import { loginDesk } from '../api/client';

interface AuthWallProps {
  onAuthenticated: (user: string) => void;
}

export const AuthWall: React.FC<AuthWallProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await loginDesk(username, password);
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Access denied');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b1220] text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(900px 420px at 12% -10%, rgba(14,165,233,0.28), transparent 55%), radial-gradient(700px 380px at 110% 10%, rgba(16,185,129,0.16), transparent 50%), linear-gradient(180deg, #0b1220 0%, #111827 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <main className="relative z-10 min-h-screen flex items-center justify-center p-5">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-[420px] rounded-[28px] border border-white/10 bg-white/[0.07] p-7 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,.45)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 pb-6 border-b border-white/10">
            <div className="scale-90 origin-left brightness-0 invert">
              <ReOxyLogo size="sm" variant="dark" />
            </div>
            <div className="scale-90 origin-right brightness-0 invert">
              <MicorLogo size="sm" variant="dark" />
            </div>
          </div>

          <p className="mt-6 text-[11px] font-semibold tracking-[0.22em] uppercase text-sky-300">
            Служебный доступ
          </p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-white">
            Desk authorization
          </h1>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">Operator</label>
              <input
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[15px] text-white outline-none focus:border-sky-400/70 focus:ring-4 focus:ring-sky-400/15"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">Passphrase</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[15px] text-white outline-none focus:border-sky-400/70 focus:ring-4 focus:ring-sky-400/15"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !username || !password}
            className="mt-6 w-full rounded-full bg-white text-slate-900 h-12 text-[15px] font-semibold hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            {busy ? 'Checking…' : 'Enter desk'}
          </button>
        </form>
      </main>
    </div>
  );
};
