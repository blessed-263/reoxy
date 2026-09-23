import React, { FormEvent, useEffect, useState } from 'react';
import { ReOxyLogo } from '../components/logos/ReOxyLogo';
import {
  fetchPortalQuotes,
  fetchPortalServices,
  fetchPortalSession,
  loginPortal,
  logoutPortal,
  signupPortal,
  submitPortalQuote,
  type PortalQuote,
  type PortalService,
} from '../api/client';

function money(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export const PortalPage: React.FC = () => {
  const [mode, setMode] = useState<'checking' | 'auth' | 'app'>('checking');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');
  const [user, setUser] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [services, setServices] = useState<PortalService[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [quotes, setQuotes] = useState<PortalQuote[]>([]);
  const [lastQuote, setLastQuote] = useState<PortalQuote | null>(null);

  const loadWorkspace = async () => {
    const [catalog, existing] = await Promise.all([fetchPortalServices(), fetchPortalQuotes()]);
    setServices(catalog);
    setQuotes(existing);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const session = await fetchPortalSession();
        if (cancelled) return;
        setUser(session.user);
        await loadWorkspace();
        if (!cancelled) setMode('app');
      } catch {
        if (!cancelled) setMode('auth');
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSignup = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await signupPortal({ fullName, email, phone, password });
      setUser(result.user);
      await loadWorkspace();
      setMode('app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setBusy(false);
    }
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const nextUser = await loginPortal(email, password);
      setUser(nextUser);
      await loadWorkspace();
      setMode('app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Access denied');
    } finally {
      setBusy(false);
    }
  };

  const toggleService = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const onSubmitQuote = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const quote = await submitPortalQuote(selected, notes);
      setLastQuote(quote);
      setQuotes((current) => [quote, ...current]);
      setSelected([]);
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send quote');
    } finally {
      setBusy(false);
    }
  };

  const estimated = services
    .filter((service) => selected.includes(service.id))
    .reduce((sum, service) => sum + service.priceUsd, 0);

  if (mode === 'checking') {
    return (
      <div className="min-h-screen bg-[#eef1f5] text-slate-500 flex items-center justify-center text-[14px]">
        Loading portal…
      </div>
    );
  }

  if (mode === 'auth') {
    return (
      <div className="min-h-screen bg-[#eef1f5] text-slate-800">
        <main className="min-h-screen flex items-center justify-center p-5">
          <form
            onSubmit={authTab === 'signup' ? onSignup : onLogin}
            className="w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm"
          >
            <div className="scale-90 origin-left">
              <ReOxyLogo size="sm" variant="dark" />
            </div>
            <p className="mt-6 text-[11px] font-semibold tracking-[0.22em] uppercase text-sky-700">Customer portal</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-slate-900">
              {authTab === 'signup' ? 'Create an account' : 'Sign in'}
            </h1>
            <div className="mt-6 space-y-4">
              {authTab === 'signup' && (
                <>
                  <div>
                    <label className="ui-label">Full name</label>
                    <input className="ui-field" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="ui-label">Phone</label>
                    <input className="ui-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <label className="ui-label">Email</label>
                <input
                  type="email"
                  className="ui-field"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="ui-label">Password</label>
                <input
                  type="password"
                  className="ui-field"
                  autoComplete={authTab === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              disabled={busy}
              className="mt-6 w-full rounded-full bg-slate-900 text-white h-12 text-[15px] font-semibold hover:bg-slate-800 disabled:opacity-40"
            >
              {busy ? 'Please wait…' : authTab === 'signup' ? 'Create account' : 'Sign in'}
            </button>
            <button
              type="button"
              className="mt-4 block w-full text-center text-[13px] font-medium text-slate-500 hover:text-slate-800"
              onClick={() => {
                setError('');
                setAuthTab(authTab === 'signup' ? 'login' : 'signup');
              }}
            >
              {authTab === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
            <a href="/" className="mt-3 block text-center text-[13px] font-medium text-slate-400 hover:text-slate-700">
              Back to site
            </a>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-800">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <ReOxyLogo size="sm" variant="dark" />
        <div className="flex items-center gap-4 text-[13px] text-slate-500">
          <span>{user}</span>
          <button
            type="button"
            className="font-medium text-slate-800"
            onClick={async () => {
              await logoutPortal().catch(() => {});
              setMode('auth');
              setUser('');
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-16">
        {lastQuote && (
          <div className="mb-6 rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-[14px] text-emerald-900">
            Quote <strong>{lastQuote.id}</strong> sent. Total {money(lastQuote.total)} USD. We will confirm next steps by
            email.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-[14px] text-rose-800">
            {error}
          </div>
        )}
        <form onSubmit={onSubmitQuote} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-[22px] font-semibold tracking-tight">Select services</h1>
          <p className="mt-1 text-[14px] text-slate-500">USD list prices. This is a quote, not an invoice.</p>
          <div className="mt-5 space-y-3">
            {services.map((service) => {
              const on = selected.includes(service.id);
              return (
                <label
                  key={service.id}
                  className={`flex cursor-pointer gap-4 rounded-2xl border px-4 py-3 ${
                    on ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                  }`}
                >
                  <input type="checkbox" checked={on} onChange={() => toggleService(service.id)} className="mt-1" />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">{service.title}</span>
                      <span className="text-[14px] text-slate-700">{money(service.priceUsd)}</span>
                    </span>
                    <span className="mt-1 block text-[13px] text-slate-500">{service.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <div className="mt-5">
            <label className="ui-label">Notes</label>
            <textarea className="ui-field min-h-[88px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[15px] font-semibold">Estimated {money(estimated)} USD</p>
            <button
              type="submit"
              disabled={busy || selected.length === 0}
              className="rounded-full bg-slate-900 px-5 h-11 text-[14px] font-semibold text-white disabled:opacity-40"
            >
              {busy ? 'Sending…' : 'Request quote'}
            </button>
          </div>
        </form>

        {quotes.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[16px] font-semibold">My quotes</h2>
            <ul className="mt-3 space-y-3">
              {quotes.map((quote) => (
                <li key={quote.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[14px]">
                  <div className="flex justify-between gap-3">
                    <strong>{quote.id}</strong>
                    <span>{money(quote.total)} USD</span>
                  </div>
                  <p className="mt-1 text-slate-500">{quote.items.map((item) => item.title).join(' · ')}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};
