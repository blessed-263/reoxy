import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface A4DocumentViewerProps {
  documentId: string;
  documentTitle: string;
  filename?: string;
  totalPages: number;
  onShare?: () => void;
  extraToolbar?: React.ReactNode;
  extraPanel?: React.ReactNode;
  children: (scale: number, activePage: number, viewMode: 'all' | 'single') => React.ReactNode;
}

export const A4DocumentViewer: React.FC<A4DocumentViewerProps> = ({
  documentId,
  documentTitle,
  totalPages,
  onShare,
  extraToolbar,
  extraPanel,
  children
}) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'all' | 'single'>(totalPages > 1 ? 'single' : 'all');
  const [scale, setScale] = useState<number>(0.72);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateFitScale = () => {
      const width = node.clientWidth;
      const a4PxWidth = 794;
      const gutter = width < 640 ? 32 : 64;
      const fit = Math.max(0.48, Math.min(0.98, (width - gutter) / a4PxWidth));
      setScale(Number(fit.toFixed(2)));
    };

    updateFitScale();
    const observer = new ResizeObserver(updateFitScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewMode]);

  const pageHeightPx = 1123;
  const gapPx = 28;
  const visiblePagesCount = viewMode === 'all' ? totalPages : 1;
  const totalUnscaledHeight = visiblePagesCount * pageHeightPx + (visiblePagesCount - 1) * gapPx;
  const scaledWrapperHeight = Math.round(totalUnscaledHeight * scale);

  return (
    <div className="flex flex-col min-h-0 h-full" ref={containerRef}>
      <div className="no-print shrink-0 px-3 sm:px-4 py-2 bg-white/90 backdrop-blur border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-slate-900 truncate">{documentId}</div>
          <div className="text-[12px] text-slate-500 truncate">{documentTitle}</div>
        </div>

        <div className="flex items-center gap-1">
          {totalPages > 1 && (
            <div className="flex items-center gap-0.5 mr-1">
              {viewMode === 'single' ? (
                <>
                  <button
                    type="button"
                    disabled={activePage <= 1}
                    onClick={() => setActivePage(p => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className="h-8 px-2 rounded-full text-[12px] font-semibold text-slate-700 hover:bg-slate-100 tabular-nums"
                    title="Show all pages"
                  >
                    {activePage} / {totalPages}
                  </button>
                  <button
                    type="button"
                    disabled={activePage >= totalPages}
                    onClick={() => setActivePage(p => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('single')}
                  className="h-8 px-2.5 rounded-full text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                >
                  One page
                </button>
              )}
            </div>
          )}

          <div className="hidden sm:flex items-center rounded-full bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setScale(s => Math.max(0.42, Number((s - 0.08).toFixed(2))))}
              className="w-7 h-7 rounded-full text-slate-600 hover:bg-white flex items-center justify-center"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[12px] font-semibold text-slate-700 tabular-nums w-11 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale(s => Math.min(1.12, Number((s + 0.08).toFixed(2))))}
              className="w-7 h-7 rounded-full text-slate-600 hover:bg-white flex items-center justify-center"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {extraToolbar}

          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          )}
        </div>
      </div>

      {extraPanel}

      <div className="preview-stage flex-1 min-h-[560px] p-4 sm:p-6 flex flex-col items-center overflow-auto">
        <div
          style={{
            height: `${scaledWrapperHeight}px`,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'visible'
          }}
          className="print:h-auto print:w-auto"
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="print:transform-none"
          >
            {children(scale, activePage, viewMode)}
          </div>
        </div>
      </div>
    </div>
  );
};
