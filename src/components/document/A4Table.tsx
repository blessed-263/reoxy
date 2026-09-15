import React from 'react';

export interface ColumnDef<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isMono?: boolean;
}

interface A4TableProps<T> {
  columns: ColumnDef<T>[];
  data?: T[] | null;
  emptyMessage?: string;
  className?: string;
  theme?: 'reoxy' | 'micor' | 'minimal';
}

export function A4Table<T>({
  columns = [],
  data = [],
  emptyMessage = 'Нет записей в текущем разделе',
  className = '',
  theme = 'minimal'
}: A4TableProps<T>) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  const isReoxy = theme === 'reoxy';
  const headerBg = isReoxy ? 'bg-[#e0f2fe] text-[#0284c7]' : 'bg-[#f8fafc] border-[#0f172a]';

  return (
    <div className={`w-full overflow-hidden ${isReoxy ? 'rounded-2xl border border-[#bae6fd]' : 'mb-3'} ${className}`}>
      <table className={`w-full text-left border-collapse ${isReoxy ? 'text-[13px]' : 'text-xs'}`}>
        <thead className={`table-header-group border-y ${headerBg}`}>
          <tr>
            {safeColumns.map((col, idx) => (
              <th
                key={idx}
                style={{ width: col.width }}
                className={`${isReoxy ? 'py-2 px-3 font-mono text-[9px]' : 'py-2 px-2.5 font-mono text-[9px]'} uppercase tracking-wider text-[#475569] ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e2e8f0]">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={Math.max(1, safeColumns.length)} className="py-5 text-center text-xs text-[#94a3b8] font-mono">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((item, rowIndex) => (
              <tr key={rowIndex} className="avoid-break hover:bg-[#f8fafc]/50 transition-colors">
                {safeColumns.map((col, colIndex) => {
                  if (!item) return <td key={colIndex} />;
                  
                  const content = col.render 
                    ? col.render(item, rowIndex)
                    : col.accessor 
                      ? (item[col.accessor] as unknown as React.ReactNode)
                      : null;

                  return (
                    <td
                      key={colIndex}
                      className={`${isReoxy ? 'py-1.5 px-3' : 'py-2 px-2.5'} align-middle ${col.isMono ? 'font-mono' : 'font-sans'} ${
                        col.align === 'right' 
                          ? 'text-right font-mono font-medium' 
                          : col.align === 'center' 
                            ? 'text-center' 
                            : 'text-left'
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
