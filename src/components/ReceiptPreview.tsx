import React, { useState, useMemo } from 'react';
import { Receipt } from '../types';
import { REOXY_COMPANY } from '../data/companyInfo';
import {
  formatCurrency,
  formatDate,
  formatTurnaroundSpeed
} from '../utils/formatters';
import { A4Header } from './document/A4Header';
import { A4MetaGrid } from './document/A4MetaGrid';
import { A4PartyDetails } from './document/A4PartyDetails';
import { A4Table, ColumnDef } from './document/A4Table';
import { A4FinancialSummary } from './document/A4FinancialSummary';
import { A4Signatures } from './document/A4Signatures';
import { A4Footer } from './document/A4Footer';
import { A4Sheet } from './document/A4Sheet';
import { A4DocumentViewer } from './document/A4DocumentViewer';
import { ReOxyLogo } from './logos/ReOxyLogo';
import { QRCodeView } from './common/QRCodeView';
import { receiptVerifyUrl } from '../utils/publicUrls';
import { QrCode } from 'lucide-react';

interface ReceiptPreviewProps {
  receipt: Receipt;
  onShare: () => void;
}

export type QRMode = 'url' | 'json' | 'custom';

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  receipt,
  onShare
}) => {
  const [qrMode, setQrMode] = useState<QRMode>('url');
  const [customQrText, setCustomQrText] = useState('');
  const [showQrDrawer, setShowQrDrawer] = useState(false);

  const totalPages = 1;
  const filename = `Receipt-REOXY-${receipt.id}.pdf`;
  const safeItems = Array.isArray(receipt.items) ? receipt.items : [];

  const verificationUrl = useMemo(() => receiptVerifyUrl(receipt.id), [receipt.id]);

  // Offline JSON verification payload
  const jsonVerificationPayload = useMemo(() => {
    return JSON.stringify({
      issuer: 'AO РеOкси',
      reg: '2024/7749',
      docket: receipt.id,
      date: receipt.date,
      client: receipt.client?.fullName || 'Client',
      total: `${receipt.total} ${receipt.currency}`,
      status: receipt.paymentStatus,
      signatory: receipt.issuedBy?.trim() || 'Authorized registrar',
      hash: `RX-${receipt.id}-VERIFIED`
    }, null, 2);
  }, [receipt]);

  // Actual value encoded in the QR code
  const currentQrValue = useMemo(() => {
    if (qrMode === 'json') return jsonVerificationPayload;
    if (qrMode === 'custom') return customQrText.trim() || verificationUrl;
    return verificationUrl;
  }, [qrMode, jsonVerificationPayload, customQrText, verificationUrl]);

  // Item columns for Page 1 Table
  const tableColumns: ColumnDef<typeof safeItems[0]>[] = [
    {
      header: '№',
      width: '6%',
      align: 'center',
      isMono: true,
      render: (_, idx) => String(idx + 1).padStart(2, '0')
    },
    {
      header: 'Наименование сертифицированной услуги / Description',
      width: '44%',
      render: (item) => (
        <div>
          <div className="font-bold text-[#0f172a] leading-snug">{item.title}</div>
          {item.notes || item.description ? (
            <div className="text-[11px] text-[#64748b] font-mono leading-snug mt-0.5 line-clamp-1">
              {item.notes || item.description}
            </div>
          ) : null}
        </div>
      )
    },
    {
      header: 'Печати и нотариат',
      width: '20%',
      isMono: true,
      render: (item) => (
        <span className="text-[11px] text-[#16a34a] font-medium">
          {(item.stampsIncluded ?? item.hasStamps) ? 'Печати включены' : 'Базовый перевод'}
        </span>
      )
    },
    {
      header: 'Кол-во',
      width: '8%',
      align: 'center',
      isMono: true,
      accessor: 'quantity'
    },
    {
      header: 'Тариф',
      width: '11%',
      align: 'right',
      isMono: true,
      render: (item) => formatCurrency(item.unitPrice, receipt.currency)
    },
    {
      header: 'Сумма',
      width: '11%',
      align: 'right',
      isMono: true,
      render: (item) => formatCurrency(item.total, receipt.currency)
    }
  ];

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0">
      <A4DocumentViewer
        documentId={`REOXY-CERT-${receipt.id}`}
        documentTitle="STATEMENT OF CERTIFIED EXPENSES"
        filename={filename}
        totalPages={totalPages}
        onShare={onShare}
        extraToolbar={
          <button
            type="button"
            onClick={() => setShowQrDrawer((open) => !open)}
            className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-[12px] font-semibold ${
              showQrDrawer ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            QR
          </button>
        }
        extraPanel={
          showQrDrawer ? (
          <div className="no-print shrink-0 bg-white border-b border-slate-200 px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
            <div
              onClick={() => setQrMode('url')}
              className={`p-3 rounded-xl border cursor-pointer ${
                qrMode === 'url'
                  ? 'bg-sky-50 border-sky-300 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="font-semibold mb-1">Verification link</div>
              <p className="text-[12px] text-slate-500 leading-snug">Opens the ReOxy authenticity page.</p>
            </div>
            <div
              onClick={() => setQrMode('json')}
              className={`p-3 rounded-xl border cursor-pointer ${
                qrMode === 'json'
                  ? 'bg-sky-50 border-sky-300 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="font-semibold mb-1">Offline JSON</div>
              <p className="text-[12px] text-slate-500 leading-snug">Encodes docket details for camera scan.</p>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                qrMode === 'custom'
                  ? 'bg-sky-50 border-sky-300 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="font-semibold mb-1">Custom URL</div>
              <input
                type="text"
                placeholder="https://…"
                value={customQrText}
                onChange={(e) => {
                  setCustomQrText(e.target.value);
                  setQrMode('custom');
                }}
                className="mt-1.5 w-full ui-field"
              />
            </div>
          </div>
          ) : null
        }
      >
        {(_scale, activePage, viewMode) => (
          <div className="space-y-8 print:space-y-0">
            {/* ================= PAGE 1: OFFICIAL FISCAL RECEIPT WITH QR ================= */}
            <div className={viewMode === 'single' && activePage !== 1 ? 'hidden print:block' : 'block'}>
              <A4Sheet id="a4-page-reoxy-1" pageNumber={1} totalPages={totalPages} className="document-sheet" comfortable>
                {/* Header with authentic ReOxy vector logo */}
                <A4Header
                  logoNode={<ReOxyLogo size="md" />}
                  brandRegistration="REG № 2024/7749"
                  documentCategory="ОФИЦИАЛЬНАЯ ВЕДОМОСТЬ РАСХОДОВ И КВИТАНЦИЯ"
                  documentTitle="Фискальная квитанция / Receipt"
                  documentSubtext={`Docket Ref: ${receipt.id} • ${formatDate(receipt.date)}`}
                  theme="reoxy"
                />

                {/* Meta Grid */}
                <A4MetaGrid
                  theme="reoxy"
                  fields={[
                    {
                      label: 'Номер квитанции / Ref',
                      value: receipt.id,
                      isMono: true,
                      highlight: true
                    },
                    {
                      label: 'Дата оформления / Date',
                      value: formatDate(receipt.date),
                      isMono: true
                    },
                    {
                      label: 'Срок выполнения / SLA',
                      value: formatTurnaroundSpeed(receipt.turnaround ?? receipt.turnaroundSpeed).replace(' Typical Turnaround (Agreed)', '').replace(' Rush Expedited', '').replace(' Custom Schedule', ''),
                      isMono: true
                    },
                    {
                      label: 'Статус расчета / Status',
                      value: receipt.paymentStatus === 'paid' ? (
                        <span className="text-[#16a34a] uppercase font-bold">ПОЛНОСТЬЮ ОПЛАЧЕНО</span>
                      ) : receipt.paymentStatus === 'partial' ? (
                        <span className="text-[#0284c7] uppercase font-bold">ЧАСТИЧНАЯ ОПЛАТА</span>
                      ) : (
                        <span className="text-[#dc2626] uppercase font-bold">ОЖИДАЕТ ОПЛАТЫ</span>
                      ),
                      isMono: true
                    }
                  ]}
                />

                {/* Party Details (Client & Office) */}
                <A4PartyDetails
                  comfortable
                  primaryParty={{
                    sectionTitle: 'Заказчик / Applicant',
                    name: receipt.client?.fullName || 'Частный заказчик',
                    secondaryTitle: receipt.client?.institution || undefined,
                    phone: receipt.client?.phone,
                    email: receipt.client?.email
                  }}
                  secondaryParty={{
                    sectionTitle: 'Исполнитель / Bureau',
                    name: REOXY_COMPANY.name,
                    secondaryTitle: 'Бюро сертифицированных переводов',
                    idNumber: 'REG № 2024/7749',
                    phone: REOXY_COMPANY.contacts.primaryPhone,
                    email: REOXY_COMPANY.contacts.email
                  }}
                />

                {/* Line Items Table */}
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#0284c7] mb-1.5 font-semibold">
                    СПЕЦИФИКАЦИЯ ОКАЗАННЫХ УСЛУГ / ITEMIZED DOCKET SCHEDULE
                  </div>
                  <A4Table
                    columns={tableColumns}
                    data={safeItems}
                    theme="reoxy"
                  />
                </div>

                {/* Financial Calculation & Remittance Instructions */}
                <A4FinancialSummary
                  theme="reoxy"
                  lines={[
                    {
                      label: 'Сумма / Subtotal:',
                      amount: formatCurrency(receipt.subtotal, receipt.currency)
                    },
                    ...((receipt.discount ?? receipt.discountTotal) > 0 ? [{
                      label: 'Скидка 35% / Discount:',
                      amount: formatCurrency(receipt.discount ?? receipt.discountTotal, receipt.currency),
                      isNegative: true,
                      colorClass: 'text-[#16a34a]'
                    }] : []),
                    ...((receipt.urgentFee ?? 0) > 0 ? [{
                      label: 'Срочное 24ч / Rush:',
                      amount: formatCurrency(receipt.urgentFee ?? 0, receipt.currency)
                    }] : []),
                    {
                      label: 'Внесено / Paid:',
                      amount: formatCurrency(receipt.amountPaid, receipt.currency),
                      colorClass: 'text-[#16a34a] font-bold'
                    },
                    {
                      label: 'Остаток / Balance:',
                      amount: formatCurrency(receipt.balanceDue, receipt.currency),
                      colorClass: receipt.balanceDue > 0 ? 'text-[#dc2626] font-bold' : 'text-[#64748b]'
                    }
                  ]}
                  totalLabel="ИТОГО / TOTAL"
                  totalAmount={formatCurrency(receipt.total, receipt.currency)}
                  bankingDetails={{
                    bankName: 'Сбербанк / Т-Банк (СБП)',
                    accountNumber: '+7 985 052-04-66',
                    referenceCode: `REOXY-${receipt.id}`
                  }}
                  paymentNotice="Официальный расчетный документ ReOxy. Переводы скрепляются печатью бюро."
                />

                {/* Signatures with Integrated Mobile Verification QR Code */}
                <A4Signatures
                  theme="reoxy"
                  primarySignerTitle="AO РеOкси / УПОЛНОМОЧЕННЫЙ РЕГИСТРАТОР"
                  primarySignerName={receipt.issuedBy?.trim() || 'Authorized registrar'}
                  secondarySignerTitle="ПОДТВЕРЖДЕНИЕ КЛИЕНТА"
                  secondarySignerName={receipt.client?.fullName || 'Клиент'}
                  sealText="AO РеOкси"
                  showStamp={receipt.officialStamp !== false}
                  qrNode={
                    <div className="flex flex-col items-center justify-center p-1">
                      <QRCodeView value={currentQrValue} size={68} darkColor="#0f172a" />
                      <span className="font-mono text-[8px] uppercase font-bold text-[#0f172a] mt-1.5 tracking-wider">
                        ПРОВЕРКА QR
                      </span>
                    </div>
                  }
                />

                {/* A4 Footer */}
                <A4Footer
                  pageNumber={1}
                  totalPages={totalPages}
                  docketId={`REOXY-${receipt.id}`}
                  language="ru"
                  theme="reoxy"
                />
              </A4Sheet>
            </div>
          </div>
        )}
      </A4DocumentViewer>
      </div>
    </div>
  );
};
