import React from 'react';
import { ReOxyLogo } from '../components/logos/ReOxyLogo';
import { MicorLogo } from '../components/logos/MicorLogo';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      <img
        src="/landing-hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f3efe8]/45 via-[#f3efe8]/12 to-transparent" />

      <main className="relative z-10 flex min-h-screen flex-col justify-end px-7 pb-16 pt-12 sm:justify-center sm:px-16 lg:px-20">
        <div className="flex max-w-[28rem] flex-col items-start">
          <div className="flex items-center gap-6">
            <ReOxyLogo size="lg" variant="dark" />
            <span className="h-11 w-px bg-slate-400/35" aria-hidden />
            <MicorLogo size="lg" variant="dark" showTagline />
          </div>

          <div className="mt-9 h-px w-12 bg-slate-400/40" aria-hidden />

          <h1 className="font-editorial mt-7 text-[2.55rem] leading-[1.08] tracking-[-0.03em] text-slate-900 sm:text-[3.15rem]">
            Issued, sealed,
            <br />
            <em className="font-normal text-slate-800">and verifiable.</em>
          </h1>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="/portal"
              className="inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-7 text-[14px] font-semibold tracking-[-0.01em] text-white hover:bg-slate-800"
            >
              Get a quote
            </a>
            <a
              href="/desk"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300/90 bg-white/55 px-6 text-[14px] font-semibold tracking-[-0.01em] text-slate-800 backdrop-blur-sm hover:border-slate-400 hover:bg-white"
            >
              Desk
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
