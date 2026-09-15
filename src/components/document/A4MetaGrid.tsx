import React from 'react';

export interface MetaField {
  label: string;
  value: React.ReactNode;
  isMono?: boolean;
  highlight?: boolean;
}

interface A4MetaGridProps {
  fields: MetaField[];
  className?: string;
  theme?: 'reoxy' | 'micor' | 'minimal';
}

export const A4MetaGrid: React.FC<A4MetaGridProps> = ({
  fields = [],
  className = '',
  theme = 'minimal'
}) => {
  const isReoxy = theme === 'reoxy';

  return (
    <div
      className={
        isReoxy
          ? `avoid-break shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${className}`
          : `avoid-break grid grid-cols-2 sm:grid-cols-4 border border-[#e2e8f0] bg-[#fafafa] divide-x divide-y sm:divide-y-0 divide-[#e2e8f0] mb-3.5 ${className}`
      }
    >
      {fields.map((field, idx) => (
        <div key={idx} className={isReoxy ? 'p-2.5 rounded-2xl border border-[#bae6fd] bg-[#f0f9ff]' : 'p-2.5'}>
          <span className={`block font-mono uppercase tracking-wider mb-1 ${isReoxy ? 'text-[9px] text-[#0284c7]' : 'text-[8px] text-[#64748b]'}`}>
            {field.label}
          </span>
          <div
            className={`${isReoxy ? 'text-[13px] leading-snug' : 'text-xs'} font-semibold ${field.isMono ? 'font-mono' : 'font-sans'} ${
              field.highlight ? 'text-[#0f172a] font-bold' : 'text-[#334155]'
            }`}
          >
            {field.value}
          </div>
        </div>
      ))}
    </div>
  );
};
