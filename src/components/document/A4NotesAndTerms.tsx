import React from 'react';

interface A4NotesAndTermsProps {
  title?: string;
  items?: string[];
  declaration?: string;
  className?: string;
  theme?: 'reoxy' | 'micor' | 'minimal';
}

export const A4NotesAndTerms: React.FC<A4NotesAndTermsProps> = ({
  title = 'ПРИМЕЧАНИЯ И УСЛОВИЯ ОБСЛУЖИВАНИЯ / TERMS & CONDITIONS',
  items = [],
  declaration,
  className = '',
  theme = 'minimal'
}) => {
  const safeItems = Array.isArray(items) ? items : [];
  const isReoxy = theme === 'reoxy';
  const markerColor = isReoxy ? 'marker:text-[#0284c7]' : 'marker:text-[#0f172a]';

  return (
    <div className={`avoid-break border-t border-[#e2e8f0] pt-3 mb-3.5 text-[10px] text-[#475569] space-y-1.5 ${className}`}>
      <div className="font-mono text-[9px] uppercase tracking-wider text-[#64748b] font-semibold">
        {title}
      </div>

      {declaration && (
        <p className="leading-relaxed bg-[#f8fafc] p-2 border border-[#e2e8f0] font-mono text-[10px] text-[#334155]">
          {declaration}
        </p>
      )}

      {safeItems.length > 0 && (
        <ul className={`list-disc pl-4 space-y-0.5 leading-relaxed ${markerColor}`}>
          {safeItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
