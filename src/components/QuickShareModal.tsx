import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Mail } from 'lucide-react';
import { Receipt } from '../types';
import { generateReceiptTextSummary } from '../utils/formatters';

interface QuickShareModalProps {
  receipt: Receipt;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickShareModal: React.FC<QuickShareModalProps> = ({
  receipt,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const textSummary = generateReceiptTextSummary(receipt);

  const handleCopy = () => {
    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(textSummary);
    const phone = receipt.client.phone.replace(/[^0-9]/g, '');
    const url = phone 
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Квитанция AO РеOкси — ${receipt.id}`);
    const body = encodeURIComponent(textSummary);
    window.open(`mailto:${receipt.client.email || ''}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-[#141519]/70 p-4 backdrop-blur-xs">
      <div className="bg-white border border-[#d8d5ca] shadow-2xl max-w-lg w-full overflow-hidden text-[#141519]">
        <div className="p-4 sm:p-5 border-b border-[#eeece4] flex items-center justify-between bg-[#faf9f5]">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-[#78756c] uppercase">
              Share receipt
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#141519] mt-0.5">Transmit summary</h3>
            <p className="font-mono text-xs text-[#78756c] mt-0.5">
              Ref: <span className="font-bold text-[#141519]">{receipt.id}</span> &bull; {receipt.client.fullName || 'Client'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#78756c] hover:text-[#141519] p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center p-3 border border-[#d8d5ca] bg-[#faf9f6] hover:bg-[#eeece4] text-[#141519] transition-colors gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-[#2b6b47]" />
              <span className="text-[11px] font-semibold uppercase">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleEmailShare}
              className="flex flex-col items-center justify-center p-3 border border-[#d8d5ca] bg-[#faf9f6] hover:bg-[#eeece4] text-[#141519] transition-colors gap-1.5"
            >
              <Mail className="w-4 h-4 text-[#2176ae]" />
              <span className="text-[11px] font-semibold uppercase">Email</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="text-[#78756c] uppercase">Client memo</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[#141519] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-[#2b6b47]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={textSummary}
              className="w-full text-xs font-mono bg-[#faf9f6] border border-[#d8d5ca] p-3 text-[#141519] focus:outline-none select-all leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
