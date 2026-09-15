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
    <div className="min-h-screen bg-[#eef1f5] text-slate-800">
      <main className="min-h-screen flex items-center justify-center p-5">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 pb-6 border-b border-slate-200">
            <div className="scale-90 origin-left">
              <ReOxyLogo size="sm" variant="dark" />
            </div>
            <div className="scale-90 origin-right">
              <MicorLogo size="sm" variant="dark" />
            </div>
          </div>

          <p className="mt-6 text-[11px] font-semibold tracking-[0.22em] uppercase text-sky-700">
            Служебный доступ
          </p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-slate-900">
            Desk authorization
          </h1>

          <div className="mt-6 space-y-4">
            <div>
              <label className="ui-label">Operator</label>
              <input
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="ui-field"
              />
            </div>
            <div>
              <label className="ui-label">Passphrase</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ui-field"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !username || !password}
            className="mt-6 w-full rounded-full bg-slate-900 text-white h-12 text-[15px] font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            {busy ? 'Checking…' : 'Enter desk'}
          </button>
          <a href="/" className="mt-4 block text-center text-[13px] font-medium text-slate-500 hover:text-slate-800">
            На сайт
          </a>
        </form>
      </main>
    </div>
  );
};
