import React from 'react';

export interface FinancialLine {
  label: string;
  amount: string;
  isEmphasized?: boolean;
  isNegative?: boolean;
  colorClass?: string;
}

interface A4FinancialSummaryProps {
  lines?: FinancialLine[];
  totalLabel: string;
  totalAmount: string;
  paymentNotice?: string;
  bankingDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    referenceCode?: string;
  };
  className?: string;
  theme?: 'reoxy' | 'micor' | 'minimal';
}

export const A4FinancialSummary: React.FC<A4FinancialSummaryProps> = ({
  lines = [],
  totalLabel,
  totalAmount,
  paymentNotice,
  bankingDetails,
  className = '',
  theme = 'minimal'
}) => {
  const safeLines = Array.isArray(lines) ? lines : [];
  const isReoxy = theme === 'reoxy';

  return (
    <div className={`avoid-break grid grid-cols-1 sm:grid-cols-12 gap-4 ${isReoxy ? 'bg-[#f0f9ff] px-4 py-3 rounded-2xl border border-[#bae6fd]' : 'border-t border-[#0f172a] pt-3 mb-3.5'} ${className}`}>
      {/* Left Column: Settlement & Remittance Details */}
      <div className={`sm:col-span-7 space-y-1.5 ${isReoxy ? 'text-[12px]' : 'text-xs'}`}>
        {bankingDetails && (
          <div className={`${isReoxy ? 'bg-white rounded-xl p-3' : 'bg-[#f8fafc] p-2.5'} border border-[#e2e8f0] space-y-1 font-mono ${isReoxy ? 'text-[12px] leading-snug' : 'text-[11px]'}`}>
            <div className={`${isReoxy ? 'text-[9px]' : 'text-[9px]'} uppercase tracking-wider text-[#64748b] font-semibold`}>
              РЕКВИЗИТЫ ПЛАТЕЖА / REMITTANCE INSTRUCTIONS
            </div>
            {bankingDetails.bankName && (
              <div className="text-[#334155]">Банк: <span className="font-semibold text-[#0f172a]">{bankingDetails.bankName}</span></div>
            )}
            {bankingDetails.accountName && (
              <div className="text-[#334155]">Получатель: <span className="text-[#0f172a]">{bankingDetails.accountName}</span></div>
            )}
            {bankingDetails.accountNumber && (
              <div className="text-[#334155]">Счет / Тел: <span className="font-bold text-[#0f172a]">{bankingDetails.accountNumber}</span></div>
            )}
            {bankingDetails.referenceCode && (
              <div className="text-[#334155]">Назначение: <span className="text-[#0f172a] font-semibold">{bankingDetails.referenceCode}</span></div>
            )}
          </div>
        )}

        {paymentNotice && (
          <p className={`${isReoxy ? 'text-[11px] leading-snug' : 'text-[10px] leading-relaxed font-mono'} text-[#64748b]`}>
            {paymentNotice}
          </p>
        )}
      </div>

      {/* Right Column: Calculations & Totals */}
      <div className={`sm:col-span-5 space-y-1 ${isReoxy ? 'text-[12px]' : 'text-xs'}`}>
        <div className={`${isReoxy ? 'space-y-1.5 pb-2' : 'space-y-1 pb-2'} border-b border-[#e2e8f0]`}>
          {safeLines.map((line, idx) => (
            <div key={idx} className={`flex items-center justify-between font-mono ${isReoxy ? 'text-[12px]' : 'text-[11px]'}`}>
              <span className="text-[#475569]">{line.label}</span>
              <span className={`font-medium ${line.colorClass || 'text-[#0f172a]'}`}>
                {line.isNegative ? `-${line.amount}` : line.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className={`flex items-baseline justify-between ${isReoxy ? 'mt-2.5 bg-[#0284c7] text-white px-3.5 py-2.5 rounded-xl border-none' : 'mt-2 pt-2 border-b border-[#0f172a] pb-1.5'} font-mono`}>
          <span className={`font-bold uppercase tracking-wider ${isReoxy ? 'text-[12px] text-white' : 'text-xs text-[#0f172a]'}`}>
            {totalLabel}
          </span>
          <span className={`font-bold ${isReoxy ? 'text-2xl tracking-tight text-white' : 'text-base text-[#0f172a]'}`}>
            {totalAmount}
          </span>
        </div>
      </div>
    </div>
  );
};
