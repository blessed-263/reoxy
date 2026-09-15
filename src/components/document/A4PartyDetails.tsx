import React from 'react';

export interface PartyInfo {
  sectionTitle: string;
  name: string;
  secondaryTitle?: string;
  idNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  extraField?: { label: string; value: string };
}

interface A4PartyDetailsProps {
  primaryParty: PartyInfo;
  secondaryParty: PartyInfo;
  className?: string;
  comfortable?: boolean;
}

export const A4PartyDetails: React.FC<A4PartyDetailsProps> = ({
  primaryParty,
  secondaryParty,
  className = '',
  comfortable = false
}) => {
  return (
    <div className={`avoid-break grid ${comfortable ? 'grid-cols-5 gap-2.5' : 'grid-cols-2 gap-4 border-b border-[#e2e8f0] pb-3.5 mb-3.5'} text-xs ${className}`}>
      {/* Primary Party (Customer / Passenger) — compact on ReOxy */}
      <div className={comfortable ? 'col-span-2 space-y-0.5 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-2' : 'space-y-1'}>
        <div className={`font-mono uppercase tracking-wider ${comfortable ? 'text-[8px] text-[#0284c7]' : 'text-[9px] text-[#64748b] pb-0.5 border-b border-[#f1f5f9]'}`}>
          {primaryParty.sectionTitle}
        </div>
        <div className={`font-bold text-[#0f172a] leading-snug ${comfortable ? 'text-[13px]' : 'text-sm'}`}>
          {primaryParty.name || '—'}
        </div>
        {primaryParty.secondaryTitle && (
          <div className={`${comfortable ? 'text-[11px] truncate' : 'text-[11px]'} text-[#475569]`}>
            {primaryParty.secondaryTitle}
          </div>
        )}
        {primaryParty.idNumber && (
          <div className={`font-mono text-[#64748b] ${comfortable ? 'text-[10px]' : 'text-[10px]'}`}>
            ID / REF: <span className="text-[#0f172a] font-medium">{primaryParty.idNumber}</span>
          </div>
        )}
        <div className={`font-mono text-[#475569] ${comfortable ? 'text-[10px] leading-snug space-y-0' : 'text-[10px] space-y-0.5 pt-0.5'}`}>
          {primaryParty.phone && <div>Тел: {primaryParty.phone}</div>}
          {primaryParty.email && <div className="truncate">Email: {primaryParty.email}</div>}
          {!comfortable && primaryParty.address && <div className="leading-tight text-[#64748b]">{primaryParty.address}</div>}
        </div>
      </div>

      {/* Secondary Party (Issuing Authority / Agency) */}
      <div className={comfortable ? 'col-span-3 space-y-1 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3' : 'space-y-1 pl-4 border-l border-[#e2e8f0]'}>
        <div className={`font-mono uppercase tracking-wider ${comfortable ? 'text-[9px] text-[#0284c7]' : 'text-[9px] text-[#64748b] pb-0.5 border-b border-[#f1f5f9]'}`}>
          {secondaryParty.sectionTitle}
        </div>
        <div className={`font-bold text-[#0f172a] leading-snug ${comfortable ? 'text-[15px]' : 'text-sm'}`}>
          {secondaryParty.name}
        </div>
        {secondaryParty.secondaryTitle && (
          <div className={`${comfortable ? 'text-[12px] truncate' : 'text-[11px]'} text-[#475569]`}>
            {secondaryParty.secondaryTitle}
          </div>
        )}
        {secondaryParty.idNumber && (
          <div className={`font-mono text-[#64748b] ${comfortable ? 'text-[12px]' : 'text-[10px]'}`}>
            REG: <span className="text-[#0f172a] font-medium">{secondaryParty.idNumber}</span>
          </div>
        )}
        <div className={`font-mono text-[#475569] ${comfortable ? 'text-[12px] leading-snug space-y-0.5' : 'text-[10px] space-y-0.5 pt-0.5'}`}>
          {secondaryParty.phone && <div>Тел: {secondaryParty.phone}</div>}
          {secondaryParty.email && <div className="truncate">Email: {secondaryParty.email}</div>}
          {!comfortable && secondaryParty.address && <div className="leading-tight text-[#64748b]">{secondaryParty.address}</div>}
        </div>
      </div>
    </div>
  );
};
