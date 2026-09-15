import React from 'react';
import { OfficialStamp } from './OfficialStamp';

interface A4SignaturesProps {
  primarySignerTitle: string;
  primarySignerName: string;
  secondarySignerTitle: string;
  secondarySignerName?: string;
  sealText?: string;
  className?: string;
  theme?: 'reoxy' | 'micor' | 'minimal';
  qrNode?: React.ReactNode;
  showStamp?: boolean;
  ringTop?: string;
  ringBottom?: string;
}

export const A4Signatures: React.FC<A4SignaturesProps> = ({
  primarySignerTitle,
  primarySignerName,
  secondarySignerTitle,
  secondarySignerName,
  sealText = 'VERIFIED',
  className = '',
  theme = 'minimal',
  qrNode,
  showStamp = true,
  ringTop,
  ringBottom
}) => {
  const isReoxy = theme === 'reoxy';
  const stampSize = isReoxy ? 108 : (qrNode ? 118 : 128);

  return (
    <div className={`a4-signatures avoid-break grid ${qrNode ? 'grid-cols-12 gap-3' : 'grid-cols-2 gap-8'} ${isReoxy ? 'pt-0 mt-0 overflow-visible' : 'pt-3.5 border-t border-[#e2e8f0] overflow-hidden'} ${isReoxy ? 'text-[12px]' : 'text-xs'} ${className}`}>
      <div className={`${qrNode ? 'col-span-6' : 'col-span-1'} ${isReoxy ? 'space-y-1.5 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3.5' : 'space-y-2.5 overflow-visible'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-mono uppercase tracking-wider font-medium ${isReoxy ? 'text-[10px] text-[#0284c7]' : 'text-[9px] text-[#64748b]'}`}>
            {primarySignerTitle}
          </span>
          {isReoxy && (
            <span className="font-mono text-[8px] tracking-[0.14em] uppercase text-[#64748b]">
              Официальная печать
            </span>
          )}
        </div>

        <div className={`${isReoxy ? 'h-[108px] rounded-xl border border-dashed border-[#cbd5e1] bg-white px-3.5' : 'h-[72px] border-b border-[#0f172a]'} flex items-end relative overflow-hidden`}>
          {showStamp && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-90">
              <OfficialStamp
                theme={theme}
                centerText={sealText}
                ringTop={ringTop}
                ringBottom={ringBottom}
                size={stampSize}
              />
            </div>
          )}
          <div className={`relative z-10 pb-2.5 ${isReoxy ? 'pr-[96px]' : ''}`}>
            <span className={`block font-sans font-semibold text-[#0f172a] leading-tight ${isReoxy ? 'text-base' : 'text-sm'}`}>
              {primarySignerName}
            </span>
            {isReoxy && (
              <span className="mt-1.5 block font-mono text-[10px] text-[#64748b]">
                Дата: ___ / ___ / 2026
              </span>
            )}
          </div>
        </div>

        <div className={`font-mono ${isReoxy ? 'text-[10px]' : 'text-[9px]'} text-[#64748b]`}>
          <span>Подпись уполномоченного лица</span>
          {!isReoxy && <span className="float-right">Дата: ___ / ___ / 2026</span>}
        </div>
      </div>

      {qrNode && (
        <div className={`col-span-2 flex flex-col items-center justify-center ${isReoxy ? 'rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] px-2 py-3 min-h-[132px]' : 'border-x border-[#e2e8f0] px-2'} text-center`}>
          {qrNode}
        </div>
      )}

      <div className={`${qrNode ? 'col-span-4' : 'col-span-1'} ${isReoxy ? 'space-y-1.5 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-2.5' : 'space-y-2.5'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-mono uppercase tracking-wider font-medium ${isReoxy ? 'text-[9px] text-[#0284c7]' : 'text-[9px] text-[#64748b]'}`}>
            {secondarySignerTitle}
          </span>
          {isReoxy && (
            <span className="font-mono text-[8px] tracking-[0.14em] uppercase text-[#64748b]">
              Клиент
            </span>
          )}
        </div>

        <div className={`${isReoxy ? 'h-[72px] rounded-xl border border-dashed border-[#cbd5e1] bg-white px-2.5' : 'h-[72px] border-b border-[#0f172a]'} flex items-end pb-2`}>
          <span className={`font-sans ${isReoxy ? 'text-[13px] text-[#334155]' : 'text-xs text-[#64748b]'}`}>
            {secondarySignerName || 'Подпись заказчика'}
          </span>
        </div>

        <div className={`flex items-center justify-between font-mono ${isReoxy ? 'text-[9px]' : 'text-[9px]'} text-[#64748b]`}>
          <span className="truncate pr-2">С условиями ознакомлен</span>
          <span className="shrink-0">Дата: ___ / ___ / 2026</span>
        </div>
      </div>
    </div>
  );
};
