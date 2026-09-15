import React from 'react';

interface A4HeaderProps {
  logoNode?: React.ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
  brandRegistration?: string;
  documentCategory: string;
  documentTitle: string;
  documentSubtext?: string;
  theme?: 'reoxy' | 'micor' | 'minimal';
}

export const A4Header: React.FC<A4HeaderProps> = ({
  logoNode,
  brandTitle,
  brandSubtitle,
  brandRegistration,
  documentCategory,
  documentTitle,
  documentSubtext,
  theme = 'minimal'
}) => {
  const isReoxy = theme === 'reoxy';

  return (
    <header className={`avoid-break ${isReoxy ? 'pb-0.5' : 'pb-3.5 mb-3.5 border-b border-[#0f172a]'}`}>
      <div className={`flex items-center justify-between ${isReoxy ? 'gap-5' : 'gap-6'}`}>
        {/* Brand Lockup */}
        <div className={`space-y-1 max-w-[52%] ${isReoxy ? 'pt-0.5' : ''}`}>
          {logoNode ? (
            <div>{logoNode}</div>
          ) : (
            <div className="flex items-baseline gap-2">
              <h1 className="font-sans text-xl font-bold tracking-tight text-[#0f172a]">
                {brandTitle}
              </h1>
              {brandRegistration && (
                <span className="font-mono text-[9px] text-[#64748b] tracking-wider uppercase border border-[#cbd5e1] px-1.5 py-0.5">
                  {brandRegistration}
                </span>
              )}
            </div>
          )}

          {brandSubtitle && (
            <p className="text-[10px] text-[#64748b] leading-relaxed font-sans">
              {brandSubtitle}
            </p>
          )}
        </div>

        {/* Document Title & Category */}
        <div className={isReoxy ? 'text-right rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] px-4 py-2.5 max-w-[46%]' : 'text-right space-y-0.5'}>
          <div className={`font-mono uppercase font-medium ${isReoxy ? 'text-[10px] tracking-[0.12em] text-[#0284c7] mb-0.5' : 'text-[9px] tracking-widest text-[#64748b]'}`}>
            {documentCategory}
          </div>
          <h2 className={`font-sans font-bold text-[#0f172a] leading-snug ${isReoxy ? 'text-xl' : 'text-base'}`}>
            {documentTitle}
          </h2>
          {documentSubtext && (
            <p className={`font-mono ${isReoxy ? 'text-[12px] text-[#475569] mt-0.5' : 'text-[10px] text-[#64748b]'}`}>
              {documentSubtext}
            </p>
          )}
        </div>
      </div>
    </header>
  );
};
