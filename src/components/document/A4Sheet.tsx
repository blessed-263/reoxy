import React from 'react';

interface A4SheetProps {
  id?: string;
  pageNumber: number;
  totalPages: number;
  children: React.ReactNode;
  className?: string;
  /** Extra page margins and looser inner rhythm — used by ReOxy receipts. */
  comfortable?: boolean;
}

/**
 * Physical A4 Document Page Container.
 * Standard A4 dimensions: 210mm x 297mm.
 */
export const A4Sheet: React.FC<A4SheetProps> = ({
  id,
  pageNumber,
  totalPages,
  children,
  className = '',
  comfortable = false
}) => {
  return (
    <div
      id={id}
      data-page-number={pageNumber}
      className={`a4-page relative bg-white mx-auto text-[#0f172a] flex flex-col justify-between select-text ${comfortable ? 'a4-comfortable' : ''} ${className}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        height: '297mm',
        padding: comfortable ? '18mm 18mm 16mm' : '15mm',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {comfortable ? (
        <div className="pointer-events-none absolute inset-4 rounded-[18px] border border-[#7dd3fc]/70" />
      ) : (
        <>
          <div className="absolute top-2 left-2.5 pointer-events-none font-mono text-[7px] text-[#cbd5e1] select-none leading-none">
            ┌ A4 210×297
          </div>
          <div className="absolute top-2 right-2.5 pointer-events-none font-mono text-[7px] text-[#cbd5e1] select-none leading-none">
            ┐
          </div>
          <div className="absolute bottom-2 left-2.5 pointer-events-none font-mono text-[7px] text-[#cbd5e1] select-none leading-none">
            └
          </div>
          <div className="absolute bottom-2 right-2.5 pointer-events-none font-mono text-[7px] text-[#cbd5e1] select-none leading-none">
            P.{pageNumber}/{totalPages} ┘
          </div>
        </>
      )}

      {/* Main Page Content Body */}
      <div className={`flex-1 flex flex-col w-full h-full relative z-10 ${comfortable ? 'gap-3 justify-start *:shrink-0' : 'justify-between'}`}>
        {children}
      </div>
    </div>
  );
};
