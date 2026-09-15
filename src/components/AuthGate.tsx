import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthWall } from './AuthWall';
import { fetchDeskSession, logoutDesk } from '../api/client';

const AuthContext = createContext<{ user: string; logout: () => Promise<void> }>({
  user: '',
  logout: async () => {},
});

export function useDeskAuth() {
  return useContext(AuthContext);
}

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [state, setState] = useState<'checking' | 'locked' | 'open'>('checking');
  const [user, setUser] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const session = await fetchDeskSession();
        if (cancelled) return;
        setUser(session.user);
        setState('open');
      } catch {
        if (!cancelled) setState('locked');
      }
    };
    void run();

    const onDenied = () => setState('locked');
    window.addEventListener('reoxy:unauthorized', onDenied);
    return () => {
      cancelled = true;
      window.removeEventListener('reoxy:unauthorized', onDenied);
    };
  }, []);

  const logout = async () => {
    await logoutDesk().catch(() => {});
    setUser('');
    setState('locked');
  };

  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-[#eef1f5] text-slate-500 flex items-center justify-center text-[14px]">
        Checking authorization…
      </div>
    );
  }

  if (state === 'locked') {
    return (
      <AuthWall
        onAuthenticated={(nextUser) => {
          setUser(nextUser);
          setState('open');
        }}
      />
    );
  }

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};
