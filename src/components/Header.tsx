import React from 'react';
import { History, Plus, Plane, FileText, FileDown, LogOut } from 'lucide-react';
import { useDeskAuth } from './AuthGate';
import { ReOxyLogo } from './logos/ReOxyLogo';
import { MicorLogo } from './logos/MicorLogo';

interface HeaderProps {
  currentApp: 'reoxy' | 'micor';
  setCurrentApp: (app: 'reoxy' | 'micor') => void;
  activeTab: 'editor' | 'history';
  setActiveTab: (tab: 'editor' | 'history') => void;
  receiptsCount: number;
  itinerariesCount: number;
  onNewItem: () => void;
  onDownloadPdf?: () => void;
  isExportingPdf?: boolean;
  storageMode?: 'connecting' | 'cloud' | 'local';
}

export const Header: React.FC<HeaderProps> = ({
  currentApp,
  setCurrentApp,
  activeTab,
  setActiveTab,
  receiptsCount,
  itinerariesCount,
  onNewItem,
  onDownloadPdf,
  isExportingPdf = false,
  storageMode = 'connecting'
}) => {
  const isMicor = currentApp === 'micor';
  const { logout } = useDeskAuth();

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-5 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {isMicor ? (
            <MicorLogo size="sm" variant="dark" />
          ) : (
            <ReOxyLogo size="sm" variant="dark" />
          )}

          <span
            className={`hidden md:inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              storageMode === 'cloud'
                ? 'bg-emerald-50 text-emerald-700'
                : storageMode === 'local'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-slate-100 text-slate-500'
            }`}
            title={
              storageMode === 'cloud'
                ? 'Saving live'
                : storageMode === 'local'
                  ? 'Live API unavailable — using this browser only'
                  : 'Connecting to live…'
            }
          >
            {storageMode === 'cloud' ? 'Live' : storageMode === 'local' ? 'Local only' : 'Connecting'}
          </span>

          <div className="hidden sm:flex items-center rounded-full bg-slate-100 p-0.5">
            <button
              id="switch-to-reoxy-btn"
              type="button"
              onClick={() => {
                setCurrentApp('reoxy');
                setActiveTab('editor');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                !isMicor
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              ReOxy
            </button>
            <button
              id="switch-to-micor-btn"
              type="button"
              onClick={() => {
                setCurrentApp('micor');
                setActiveTab('editor');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                isMicor
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plane className="w-3.5 h-3.5 text-sky-600" />
              Micor
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-slate-100 p-0.5">
            <button
              id="tab-editor-btn"
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isMicor ? 'Ticket' : 'Receipt'}
            </button>
            <button
              id="tab-history-btn"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5 opacity-70" />
              <span>{isMicor ? 'Archive' : 'Archive'}</span>
              <span className="min-w-5 h-5 px-1 rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-center">
                {isMicor ? itinerariesCount : receiptsCount}
              </span>
            </button>
          </div>

          <button
            id="new-item-btn"
            type="button"
            onClick={onNewItem}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            title={isMicor ? 'New ticket' : 'New receipt'}
          >
            <Plus className="w-4 h-4" />
            New
          </button>

          <button
            type="button"
            onClick={() => void logout()}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>

          {activeTab === 'editor' && onDownloadPdf && (
          <button
            id="download-pdf-top-btn"
            type="button"
            onClick={onDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExportingPdf ? 'Saving…' : 'Download PDF'}</span>
          </button>
          )}
        </div>
      </div>
    </header>
  );
};
