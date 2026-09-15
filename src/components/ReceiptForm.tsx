import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Check,
  Save,
  Clock,
  User,
  ListOrdered,
  FileText,
  CreditCard
} from 'lucide-react';
import { 
  Receipt, 
  LineItem, 
  Currency, 
  PaymentMethod, 
  PaymentStatus, 
  TurnaroundSpeed 
} from '../types';
import { REOXY_SERVICES, COMMON_DOCUMENT_TYPES, COMMON_LANGUAGES } from '../data/servicePresets';
import { formatCurrency } from '../utils/formatters';

interface ReceiptFormProps {
  receipt: Receipt;
  onChange: (updated: Receipt) => void;
  onSave: () => void;
  onReset: () => void;
  isSavedNotification?: boolean;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  receipt,
  onChange,
  onSave,
  isSavedNotification
}) => {
  const [selectedQuickDoc, setSelectedQuickDoc] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'details' | 'client' | 'services' | 'payment'>('details');

  const tabClass = (id: typeof activeSection) =>
    `flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
      activeSection === id
        ? 'border-sky-500 text-slate-900 font-semibold'
        : 'border-transparent text-slate-500 hover:text-slate-800'
    }`;

  const updateCalculations = (
    newItems: LineItem[], 
    discountPercent: number, 
    customDiscount: number, 
    amountPaid: number,
    currency = receipt.currency
  ) => {
    const subtotal = newItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const percentDiscountVal = (subtotal * (discountPercent || 0)) / 100;
    const discountTotal = Math.min(subtotal, Math.round(percentDiscountVal + (customDiscount || 0)));
    const total = Math.max(0, subtotal - discountTotal);
    
    let paymentStatus: PaymentStatus = receipt.paymentStatus;
    if (amountPaid >= total && total > 0) {
      paymentStatus = 'paid';
    } else if (amountPaid > 0 && amountPaid < total) {
      paymentStatus = 'partial';
    } else if (amountPaid === 0 && total > 0) {
      paymentStatus = 'unpaid';
    }

    const balanceDue = Math.max(0, total - amountPaid);

    return {
      subtotal,
      discountTotal,
      total,
      balanceDue,
      paymentStatus
    };
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    const updatedItems = receipt.items.map(item => {
      const preset = REOXY_SERVICES.find(s => s.title === item.title);
      if (preset) {
        const unitPrice = newCurrency === 'USD' ? preset.defaultPriceUSD : preset.defaultPriceRUB;
        return {
          ...item,
          unitPrice,
          total: unitPrice * item.quantity
        };
      }
      return item;
    });

    const calcs = updateCalculations(
      updatedItems, 
      receipt.promotions.discountPercent, 
      receipt.promotions.customDiscountAmount, 
      receipt.amountPaid,
      newCurrency
    );

    onChange({
      ...receipt,
      currency: newCurrency,
      items: updatedItems,
      ...calcs
    });
  };

  const handleAddItem = (preset?: typeof REOXY_SERVICES[0]) => {
    const unitPrice = preset 
      ? (receipt.currency === 'USD' ? preset.defaultPriceUSD : preset.defaultPriceRUB)
      : 0;

    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: preset ? preset.title : 'Custom Document Translation',
      description: preset ? preset.description : '',
      category: preset ? preset.category : 'other',
      quantity: 1,
      unitPrice,
      total: unitPrice,
      hasStamps: preset?.hasStamps ?? true
    };

    const newItems = [...receipt.items, newItem];
    const calcs = updateCalculations(
      newItems, 
      receipt.promotions.discountPercent, 
      receipt.promotions.customDiscountAmount, 
      receipt.amountPaid
    );

    onChange({
      ...receipt,
      items: newItems,
      ...calcs
    });
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...receipt.items];
    const current = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      current.total = (Number(current.quantity) || 0) * (Number(current.unitPrice) || 0);
    }
    
    updatedItems[index] = current;

    const calcs = updateCalculations(
      updatedItems, 
      receipt.promotions.discountPercent, 
      receipt.promotions.customDiscountAmount, 
      receipt.amountPaid
    );

    onChange({
      ...receipt,
      items: updatedItems,
      ...calcs
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = receipt.items.filter((_, i) => i !== index);
    const calcs = updateCalculations(
      updatedItems, 
      receipt.promotions.discountPercent, 
      receipt.promotions.customDiscountAmount, 
      receipt.amountPaid
    );

    onChange({
      ...receipt,
      items: updatedItems,
      ...calcs
    });
  };

  const handlePromotionChange = (key: keyof typeof receipt.promotions, value: any) => {
    const newPromotions = {
      ...receipt.promotions,
      [key]: value
    };

    const calcs = updateCalculations(
      receipt.items, 
      newPromotions.discountPercent, 
      newPromotions.customDiscountAmount, 
      receipt.amountPaid
    );

    onChange({
      ...receipt,
      promotions: newPromotions,
      ...calcs
    });
  };

  const handleAmountPaidChange = (amount: number) => {
    const calcs = updateCalculations(
      receipt.items, 
      receipt.promotions.discountPercent, 
      receipt.promotions.customDiscountAmount, 
      amount
    );

    onChange({
      ...receipt,
      amountPaid: amount,
      ...calcs
    });
  };

  const handleAddDocType = (docType: string) => {
    if (!docType) return;
    if (!receipt.documentMeta.docTypes.includes(docType)) {
      onChange({
        ...receipt,
        documentMeta: {
          ...receipt.documentMeta,
          docTypes: [...receipt.documentMeta.docTypes, docType]
        }
      });
    }
    setSelectedQuickDoc('');
  };

  const handleRemoveDocType = (docType: string) => {
    onChange({
      ...receipt,
      documentMeta: {
        ...receipt.documentMeta,
        docTypes: receipt.documentMeta.docTypes.filter(d => d !== docType)
      }
    });
  };

  return (
    <div className="p-5 space-y-5 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" />
          <span className="font-semibold text-slate-900">Receipt</span>
          <span className="ui-chip font-mono-num">{receipt.id}</span>
        </div>
      </div>

      <div className="flex flex-nowrap overflow-x-auto gap-1 border-b border-slate-200 text-[13px]">
        <button type="button" onClick={() => setActiveSection('details')} className={tabClass('details')}>
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>Details</span>
        </button>
        <button type="button" onClick={() => setActiveSection('client')} className={tabClass('client')}>
          <User className="w-3.5 h-3.5 text-sky-600" />
          <span>Client</span>
        </button>
        <button type="button" onClick={() => setActiveSection('services')} className={tabClass('services')}>
          <ListOrdered className="w-3.5 h-3.5 text-sky-600" />
          <span>Services ({receipt.items.length})</span>
        </button>
        <button type="button" onClick={() => setActiveSection('payment')} className={tabClass('payment')}>
          <CreditCard className="w-3.5 h-3.5 text-sky-600" />
          <span>Payment</span>
        </button>
      </div>

      {activeSection === 'details' && (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-slate-500">Currency</span>
          {(['RUB', 'USD', 'EUR', 'GBP'] as Currency[]).map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => handleCurrencyChange(curr)}
              className={`ui-chip ${receipt.currency === curr ? 'ui-chip-on' : ''}`}
            >
              {curr}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="ui-label">Receipt reference</label>
            <input
              type="text"
              value={receipt.id}
              onChange={(e) => onChange({ ...receipt, id: e.target.value })}
              className="ui-field font-mono"
            />
          </div>
          <div>
            <label className="ui-label">Date of issue</label>
            <input
              type="date"
              value={receipt.date}
              onChange={(e) => onChange({ ...receipt, date: e.target.value })}
              className="ui-field font-mono"
            />
          </div>
          <div>
            <label className="ui-label">Turnaround</label>
            <select
              value={receipt.turnaroundSpeed}
              onChange={(e) => onChange({ ...receipt, turnaroundSpeed: e.target.value as TurnaroundSpeed })}
              className="ui-field"
            >
              <option value="typical_48h">48hr Standard Turnaround</option>
              <option value="rush_24h">24hr Rush Expedited</option>
              <option value="standard_3d">3-5 Business Days</option>
              <option value="extended">Extended Schedule</option>
            </select>
          </div>
          <div>
            <label className="ui-label">Agreed handover</label>
            <input
              type="date"
              value={receipt.turnaroundDate}
              onChange={(e) => onChange({ ...receipt, turnaroundDate: e.target.value })}
              className="ui-field font-mono"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
          <input
            type="checkbox"
            checked={receipt.officialStamp}
            onChange={(e) => onChange({ ...receipt, officialStamp: e.target.checked })}
            className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>Affix ReOxy certification stamp</span>
        </label>
      </div>
      )}

      {activeSection === 'client' && (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="ui-label">Full legal name</label>
            <input
              type="text"
              placeholder="e.g. Tatenda M. / Julia S."
              value={receipt.client.fullName}
              onChange={(e) => onChange({
                ...receipt,
                client: { ...receipt.client, fullName: e.target.value }
              })}
              className="ui-field"
            />
          </div>
          <div>
            <label className="ui-label">Institution / university</label>
            <input
              type="text"
              placeholder="e.g. University of Zimbabwe / RUDN"
              value={receipt.client.institution}
              onChange={(e) => onChange({
                ...receipt,
                client: { ...receipt.client, institution: e.target.value }
              })}
              className="ui-field"
            />
          </div>
          <div>
            <label className="ui-label">Telephone / WhatsApp</label>
            <input
              type="text"
              placeholder="e.g. +7 985 052-04-66"
              value={receipt.client.phone}
              onChange={(e) => onChange({
                ...receipt,
                client: { ...receipt.client, phone: e.target.value }
              })}
              className="ui-field"
            />
          </div>
          <div>
            <label className="ui-label">Email</label>
            <input
              type="email"
              placeholder="candidate@university.ac.zw"
              value={receipt.client.email}
              onChange={(e) => onChange({
                ...receipt,
                client: { ...receipt.client, email: e.target.value }
              })}
              className="ui-field"
            />
          </div>
          <div>
            <label className="ui-label">Student / applicant ID</label>
            <input
              type="text"
              placeholder="e.g. UZ-2026-992"
              value={receipt.client.studentOrIdNumber || ''}
              onChange={(e) => onChange({
                ...receipt,
                client: { ...receipt.client, studentOrIdNumber: e.target.value }
              })}
              className="ui-field font-mono"
            />
          </div>
          <div>
            <label className="ui-label">Languages</label>
            <select
              value={`${receipt.documentMeta.sourceLanguage} ➔ ${receipt.documentMeta.targetLanguage}`}
              onChange={(e) => {
                const parts = e.target.value.split(' ➔ ');
                if (parts.length === 2) {
                  onChange({
                    ...receipt,
                    documentMeta: {
                      ...receipt.documentMeta,
                      sourceLanguage: parts[0],
                      targetLanguage: parts[1]
                    }
                  });
                }
              }}
              className="ui-field"
            >
              {COMMON_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="ui-label mb-0">Documents</label>
            <select
              value={selectedQuickDoc}
              onChange={(e) => handleAddDocType(e.target.value)}
              className="ui-field w-auto min-w-[200px]"
            >
              <option value="">Add document type</option>
              {COMMON_DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {receipt.documentMeta.docTypes.map((type) => (
              <span key={type} className="ui-chip">
                <span>{type}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDocType(type)}
                  className="text-slate-400 hover:text-slate-800"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      )}

      {activeSection === 'services' && (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <button type="button" onClick={() => handleAddItem()} className="ui-chip">
            <Plus className="w-3.5 h-3.5" />
            Add custom line
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {REOXY_SERVICES.map((srv) => (
            <button
              key={srv.id}
              type="button"
              onClick={() => handleAddItem(srv)}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-sky-300 text-left transition-colors"
            >
              <div>
                <div className="text-[13px] font-semibold text-slate-900">{srv.title}</div>
                <div className="text-[12px] text-slate-500">{srv.category}</div>
              </div>
              <div className="font-mono-num text-[13px] font-semibold text-slate-800 ml-2">
                {formatCurrency(receipt.currency === 'USD' ? srv.defaultPriceUSD : srv.defaultPriceRUB, receipt.currency)}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {receipt.items.map((item, index) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono-num text-[12px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                <input
                  type="text"
                  placeholder="Service title"
                  value={item.title}
                  onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  className="ui-field"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-1.5 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Notes, apostille or certification specifics"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="ui-field"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="ui-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    className="ui-field font-mono"
                  />
                </div>
                <div>
                  <label className="ui-label">Rate ({receipt.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="ui-field font-mono"
                  />
                </div>
                <div>
                  <label className="ui-label">Total</label>
                  <div className="ui-field font-mono font-semibold">
                    {formatCurrency(item.total, receipt.currency)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {activeSection === 'payment' && (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <label className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
            receipt.promotions.discountPercent === 35 ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white'
          }`}>
            <span className="text-[13px] text-slate-800">35% academic discount</span>
            <input
              type="checkbox"
              checked={receipt.promotions.discountPercent === 35}
              onChange={() => handlePromotionChange('discountPercent', receipt.promotions.discountPercent === 35 ? 0 : 35)}
              className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
            />
          </label>
          <label className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
            receipt.promotions.freeTShirt2026 ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white'
          }`}>
            <span className="text-[13px] text-slate-800">ReOxy edition T-shirt</span>
            <input
              type="checkbox"
              checked={receipt.promotions.freeTShirt2026}
              onChange={() => handlePromotionChange('freeTShirt2026', !receipt.promotions.freeTShirt2026)}
              className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
            />
          </label>
          <label className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
            receipt.promotions.spotifyPremium ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white'
          }`}>
            <span className="text-[13px] text-slate-800">1 month Spotify Premium</span>
            <input
              type="checkbox"
              checked={receipt.promotions.spotifyPremium}
              onChange={() => handlePromotionChange('spotifyPremium', !receipt.promotions.spotifyPremium)}
              className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
            />
          </label>
          <label className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
            receipt.promotions.freeLegalConsultation ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white'
          }`}>
            <span className="text-[13px] text-slate-800">Legalisation guidance</span>
            <input
              type="checkbox"
              checked={receipt.promotions.freeLegalConsultation}
              onChange={() => handlePromotionChange('freeLegalConsultation', !receipt.promotions.freeLegalConsultation)}
              className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="ui-label">Custom discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={receipt.promotions.discountPercent}
              onChange={(e) => handlePromotionChange('discountPercent', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="ui-field font-mono"
            />
          </div>
          <div>
            <label className="ui-label">Fixed discount ({receipt.currency})</label>
            <input
              type="number"
              min="0"
              value={receipt.promotions.customDiscountAmount}
              onChange={(e) => handlePromotionChange('customDiscountAmount', Math.max(0, parseFloat(e.target.value) || 0))}
              className="ui-field font-mono"
            />
          </div>
          <div>
            <label className="ui-label">Payment method</label>
            <select
              value={receipt.paymentMethod}
              onChange={(e) => onChange({ ...receipt, paymentMethod: e.target.value as PaymentMethod })}
              className="ui-field"
            >
              <option value="sberbank">Sberbank / SBP</option>
              <option value="tinkoff">Tinkoff Bank</option>
              <option value="bank_card">Bank Card (Debit/Credit)</option>
              <option value="cash">Cash at Consular Desk</option>
              <option value="ecocash">EcoCash / Zimbabwe Mobile</option>
              <option value="wire_transfer">University / Wire Transfer</option>
            </select>
          </div>
          <div>
            <label className="ui-label">Amount remitted ({receipt.currency})</label>
            <input
              type="number"
              min="0"
              value={receipt.amountPaid}
              onChange={(e) => handleAmountPaidChange(parseFloat(e.target.value) || 0)}
              className="ui-field font-mono font-semibold"
            />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => handleAmountPaidChange(receipt.total)} className="ui-chip">
                Mark full
              </button>
              <button type="button" onClick={() => handleAmountPaidChange(Math.round(receipt.total / 2))} className="ui-chip">
                50% advance
              </button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="ui-label">Authorized signatory</label>
            <input
              type="text"
              value={receipt.issuedBy}
              onChange={(e) => onChange({ ...receipt, issuedBy: e.target.value })}
              className="ui-field"
              placeholder="e.g. ReOxy Document Desk - Admin"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="ui-label">Notes</label>
            <textarea
              rows={3}
              value={receipt.notes}
              onChange={(e) => onChange({ ...receipt, notes: e.target.value })}
              placeholder="Collection remarks, notarisation notes..."
              className="ui-field leading-relaxed"
            />
          </div>
        </div>
      </div>
      )}

      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 text-[13px] transition-colors"
        >
          {isSavedNotification ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{isSavedNotification ? 'Saved' : 'Save receipt'}</span>
        </button>
      </div>
    </div>
  );
};
