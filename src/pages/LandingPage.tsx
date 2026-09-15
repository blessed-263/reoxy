import React from 'react';
import { ReOxyLogo } from '../components/logos/ReOxyLogo';
import { MicorLogo } from '../components/logos/MicorLogo';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-800 flex items-center justify-center px-6">
      <main className="flex w-full max-w-md flex-col items-center text-center">
        <div className="flex items-center justify-center gap-8">
          <ReOxyLogo size="lg" variant="dark" />
          <span className="h-10 w-px bg-slate-200" />
          <MicorLogo size="lg" variant="dark" />
        </div>

        <a
          href="/desk"
          className="mt-12 inline-flex h-12 w-full max-w-[220px] items-center justify-center rounded-full bg-slate-900 text-[15px] font-semibold text-white hover:bg-slate-800"
        >
          Войти
        </a>

        <p className="mt-10 text-[13px] text-slate-500">
          Scan the QR on the document to verify it.
        </p>
      </main>
    </div>
  );
};
