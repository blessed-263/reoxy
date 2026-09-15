import React, { useState } from 'react';
import { Itinerary } from '../../types/itinerary';
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Download
} from 'lucide-react';
import { generateItineraryShareText } from '../../utils/itineraryFormatters';

interface ItineraryShareModalProps {
  itinerary: Itinerary;
  isOpen: boolean;
  onClose: () => void;
}

export const ItineraryShareModal: React.FC<ItineraryShareModalProps> = ({
  itinerary,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = generateItineraryShareText(itinerary);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleTelegram = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://t.me/share/url?url=&text=${encoded}`, '_blank');
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(itinerary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MicorTravels_${itinerary.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141519]/70 backdrop-blur-xs no-print">
      <div 
        className="bg-white border border-[#d8d5ca] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#141519]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#eeece4] flex items-center justify-between bg-[#faf9f5]">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-[#78756c] uppercase">
              ЭКСПЕДИЦИОННОЕ ОТПРАВЛЕНИЕ
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#141519] mt-0.5">
              Передача программы путешествия
            </h3>
            <p className="font-mono text-xs text-[#78756c] mt-0.5">
              Номер бронирования: <span className="font-bold text-[#141519]">{itinerary.id}</span> &bull; {itinerary.destination}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#78756c] hover:text-[#141519] border border-transparent hover:border-[#d8d5ca] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Channels */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#faf9f6] hover:bg-[#eeece4] text-[#141519] border border-[#d8d5ca] py-2 px-3 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#2b6b47]" />
              <span>WHATSAPP</span>
            </button>

            <button
              type="button"
              onClick={handleTelegram}
              className="flex items-center justify-center gap-2 bg-[#faf9f6] hover:bg-[#eeece4] text-[#141519] border border-[#d8d5ca] py-2 px-3 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#2176ae]" />
              <span>TELEGRAM</span>
            </button>
          </div>

          {/* Formatted Text Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="uppercase text-[#78756c]">
                ТЕКСТ ДЛЯ КЛИЕНТСКИХ МЕССЕНДЖЕРОВ:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[#141519] hover:underline"
              >
                {copied ? <Check className="w-3 h-3 text-[#2b6b47]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'СКОПИРОВАНО' : 'КОПИРОВАТЬ ТЕКСТ'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={shareText}
              rows={9}
              className="w-full text-xs font-mono p-3 border border-[#d8d5ca] bg-[#faf9f6] text-[#141519] focus:outline-none resize-none leading-relaxed select-all"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#eeece4] bg-[#faf9f5] flex items-center justify-between font-mono text-xs">
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 text-[#57554e] hover:text-[#141519] py-1 px-2.5 border border-[#d8d5ca] bg-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ЭКСПОРТ JSON</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-[#141519] bg-white hover:bg-[#eeece4] py-1 px-4 border border-[#d8d5ca] transition-colors font-semibold"
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
