import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Copy,
  Trash2,
  Download
} from 'lucide-react';
import { Receipt } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ReceiptsListProps {
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
  onDuplicateReceipt: (receipt: Receipt) => void;
  onDeleteReceipt: (id: string) => void;
}

export const ReceiptsList: React.FC<ReceiptsListProps> = ({
  receipts,
  onSelectReceipt,
  onDuplicateReceipt,
  onDeleteReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        r.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.client.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.items.some(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || r.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    receipts.forEach((r) => {
      totalBilled += r.total;
      totalPaid += r.amountPaid;
      totalBalance += r.balanceDue;
    });

    return { totalBilled, totalPaid, totalBalance, count: receipts.length };
  }, [receipts]);

  const handleExportCSV = () => {
    const headers = ['Receipt ID', 'Date', 'Client Name', 'Institution', 'Phone', 'Services', 'Total', 'Amount Paid', 'Balance Due', 'Status', 'Currency'];
    const rows = receipts.map(r => [
      r.id,
      r.date,
      `"${r.client.fullName.replace(/"/g, '""')}"`,
      `"${r.client.institution.replace(/"/g, '""')}"`,
      `"${r.client.phone.replace(/"/g, '""')}"`,
      `"${r.items.map(i => i.title).join('; ').replace(/"/g, '""')}"`,
      r.total,
      r.amountPaid,
      r.balanceDue,
      r.paymentStatus,
      r.currency
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reoxy_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusChip = (status: Receipt['paymentStatus']) => {
    if (status === 'paid') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (status === 'partial') {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-4 text-slate-800">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Receipts', value: String(stats.count), hint: 'Archived dockets', accent: 'text-slate-900' },
          { label: 'Billed', value: formatCurrency(stats.totalBilled, 'RUB'), hint: 'Total invoiced', accent: 'text-slate-900' },
          { label: 'Settled', value: formatCurrency(stats.totalPaid, 'RUB'), hint: 'Paid in full', accent: 'text-emerald-600' },
          { label: 'Outstanding', value: formatCurrency(stats.totalBalance, 'RUB'), hint: 'Awaiting collection', accent: 'text-rose-600' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
              {card.label}
            </div>
            <div className={`text-2xl font-semibold mt-1 tabular-nums ${card.accent}`}>
              {card.value}
            </div>
            <div className="text-[13px] text-slate-500 mt-0.5">{card.hint}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, reference, or service…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ui-field pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-slate-100 p-0.5">
            {(['all', 'paid', 'partial', 'unpaid'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'all' ? 'All' : st === 'paid' ? 'Paid' : st === 'partial' ? 'Partial' : 'Due'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-left text-[14px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[12px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Services</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-right">Balance</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReceipts.map((receipt) => (
              <tr
                key={receipt.id}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                onClick={() => onSelectReceipt(receipt)}
              >
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">
                    {receipt.id}
                  </div>
                  <div className="text-[12px] text-slate-500">
                    {formatDate(receipt.date)}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-900">
                    {receipt.client.fullName || 'Valued Candidate'}
                  </div>
                  <div className="text-[13px] text-slate-500">
                    {receipt.client.institution || 'Private Registration'}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="text-slate-800 line-clamp-1">
                    {receipt.items.map(i => i.title).join(', ') || 'No services listed'}
                  </div>
                  <div className="text-[12px] text-slate-500">
                    {receipt.documentMeta.sourceLanguage} → {receipt.documentMeta.targetLanguage}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right tabular-nums font-medium text-slate-900">
                  {formatCurrency(receipt.total, receipt.currency)}
                </td>

                <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                  <span className={receipt.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {receipt.balanceDue > 0 ? formatCurrency(receipt.balanceDue, receipt.currency) : '0'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-flex text-[11px] font-semibold uppercase tracking-wide border rounded-full px-2.5 py-0.5 ${statusChip(receipt.paymentStatus)}`}>
                    {receipt.paymentStatus}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onSelectReceipt(receipt)}
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                      title="Open"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateReceipt(receipt)}
                      className="w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteReceipt(receipt.id)}
                      className="w-8 h-8 rounded-full text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReceipts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[14px] text-slate-400">
                  No receipts match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
