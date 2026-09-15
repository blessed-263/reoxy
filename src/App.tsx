import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptPreview } from './components/ReceiptPreview';
import { ReceiptsList } from './components/ReceiptsList';
import { QuickShareModal } from './components/QuickShareModal';

import { ItineraryForm } from './components/itinerary/ItineraryForm';
import { ItineraryPreview } from './components/itinerary/ItineraryPreview';
import { ItineraryList } from './components/itinerary/ItineraryList';
import { ItineraryShareModal } from './components/itinerary/ItineraryShareModal';

import { Receipt } from './types';
import { Itinerary } from './types/itinerary';
import { createEmptyItinerary, MICOR_TRAVELS_INFO } from './data/micorTravelsInfo';
import { generateReceiptId } from './utils/formatters';
import { REOXY_COMPANY } from './data/companyInfo';
import { Edit3, Eye } from 'lucide-react';
import { downloadActiveDocumentAsPdf } from './utils/exportPdf';
import {
  checkApiHealth,
  deleteItinerary as deleteItineraryRemote,
  deleteReceipt as deleteReceiptRemote,
  listItineraries,
  listReceipts,
  saveItinerary as saveItineraryRemote,
  saveReceipt as saveReceiptRemote,
} from './api/client';

const REOXY_STORAGE_KEY = 'reoxy_receipts_v1';
const MICOR_STORAGE_KEY = 'micor_itineraries_v1';

type StorageMode = 'connecting' | 'cloud' | 'local';

const createDefaultReceipt = (): Receipt => {
  const today = new Date();
  const turnaround = new Date(today);
  turnaround.setDate(today.getDate() + 2); // 48hr typical

  return {
    id: generateReceiptId(),
    date: today.toISOString().slice(0, 10),
    turnaroundDate: turnaround.toISOString().slice(0, 10),
    turnaroundSpeed: 'typical_48h',
    client: {
      fullName: '',
      email: '',
      phone: '',
      institution: '',
      studentOrIdNumber: ''
    },
    documentMeta: {
      docTypes: ['Degree Certificate'],
      sourceLanguage: 'Russian',
      targetLanguage: 'English',
      pageCount: 1,
      certifiedCopiesCount: 1
    },
    items: [
      {
        id: `item-${Date.now()}`,
        title: 'Degrees & Diplomas Translation',
        description: 'Official translation with all required certification stamps included.',
        category: 'translation',
        quantity: 1,
        unitPrice: 5600,
        total: 5600,
        hasStamps: true
      }
    ],
    currency: 'RUB',
    promotions: {
      discountPercent: 0,
      freeTShirt2026: false,
      spotifyPremium: false,
      freeLegalConsultation: true,
      customDiscountAmount: 0
    },
    subtotal: 5600,
    discountTotal: 0,
    total: 5600,
    amountPaid: 5600,
    balanceDue: 0,
    paymentStatus: 'paid',
    paymentMethod: 'sberbank',
    issuedBy: 'ReOxy Document Desk - Authorized Officer',
    officialStamp: true,
    notes: 'Document received for official translation. All official stamps included in fee.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export default function App() {
  // Top level tool selection: 'micor' (Travel Itinerary) or 'reoxy' (Document Receipts)
  const [currentApp, setCurrentApp] = useState<'micor' | 'reoxy'>('micor');

  // Navigation tab: editor vs history
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [editorMobileView, setEditorMobileView] = useState<'form' | 'preview'>('preview');

  // =====================
  // MICOR TRAVELS STATE
  // =====================
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary>(() => createEmptyItinerary());
  const [isItineraryShareOpen, setIsItineraryShareOpen] = useState(false);
  const [itinerarySavedAlert, setItinerarySavedAlert] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>('connecting');

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt>(() => createDefaultReceipt());
  const [isReceiptShareOpen, setIsReceiptShareOpen] = useState(false);
  const [receiptSavedAlert, setReceiptSavedAlert] = useState(false);

  const readLocalReceipts = (): Receipt[] => {
    try {
      const saved = localStorage.getItem(REOXY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved receipts', e);
    }
    return [];
  };

  const readLocalItineraries = (): Itinerary[] => {
    try {
      const saved = localStorage.getItem(MICOR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved itineraries', e);
    }
    return [];
  };

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      void fetch('/api/status').catch(() => {});
      const online = await checkApiHealth();
      if (cancelled) return;

      if (online) {
        try {
          const [remoteReceipts, remoteItineraries] = await Promise.all([
            listReceipts(),
            listItineraries(),
          ]);
          if (cancelled) return;
          setReceipts(remoteReceipts);
          setItineraries(remoteItineraries);
          if (remoteReceipts[0]) setCurrentReceipt(remoteReceipts[0]);
          if (remoteItineraries[0]) setCurrentItinerary(remoteItineraries[0]);
          setStorageMode('cloud');
          return;
        } catch (err) {
          console.error('Failed to load from Postgres', err);
        }
      }

      const localReceipts = readLocalReceipts();
      const localItineraries = readLocalItineraries();
      setReceipts(localReceipts);
      setItineraries(localItineraries);
      if (localReceipts[0]) setCurrentReceipt(localReceipts[0]);
      if (localItineraries[0]) setCurrentItinerary(localItineraries[0]);
      setStorageMode('local');
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (storageMode !== 'local') return;
    try {
      localStorage.setItem(MICOR_STORAGE_KEY, JSON.stringify(itineraries));
    } catch (e) {
      console.error('Failed to save itineraries', e);
    }
  }, [itineraries, storageMode]);

  useEffect(() => {
    if (storageMode !== 'local') return;
    try {
      localStorage.setItem(REOXY_STORAGE_KEY, JSON.stringify(receipts));
    } catch (e) {
      console.error('Failed to save receipts', e);
    }
  }, [receipts, storageMode]);

  // =====================
  // ACTIONS HANDLERS
  // =====================

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');

  // Universal Direct PDF Download via jsPDF & html2canvas
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setPdfProgressText('Подготовка A4 документа к экспорту...');

      // Ensure we are viewing document preview
      if (activeTab !== 'editor') {
        setActiveTab('editor');
      }
      setEditorMobileView('preview');

      // Allow DOM to settle for preview rendering
      await new Promise(r => setTimeout(r, 150));

      const filename = currentApp === 'micor'
        ? `FlightTicket-${currentItinerary.pnr || currentItinerary.id}.pdf`
        : `Receipt-${currentReceipt.id}.pdf`;

      await downloadActiveDocumentAsPdf(filename, (_, text) => {
        setPdfProgressText(text);
      });
    } catch (err: unknown) {
      console.error('PDF export error:', err);
      const message = err instanceof Error ? err.message : 'Could not create the PDF file.';
      window.alert(message);
    } finally {
      setIsExportingPdf(false);
      setPdfProgressText('');
    }
  };

  // Universal New Item
  const handleNewItem = () => {
    if (currentApp === 'micor') {
      const fresh = createEmptyItinerary();
      setCurrentItinerary(fresh);
      setActiveTab('editor');
      setEditorMobileView('form');
    } else {
      const fresh = createDefaultReceipt();
      setCurrentReceipt(fresh);
      setActiveTab('editor');
      setEditorMobileView('form');
    }
  };

  // Micor Itinerary Handlers
  const persistItinerary = async (updated: Itinerary) => {
    setItineraries((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === updated.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
    setCurrentItinerary(updated);

    if (storageMode === 'cloud') {
      try {
        await saveItineraryRemote(updated);
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : 'Could not save ticket to the database.');
      }
    }
  };

  const handleSaveItinerary = () => {
    const updated = {
      ...currentItinerary,
      updatedAt: new Date().toISOString()
    };
    void persistItinerary(updated);
    setItinerarySavedAlert(true);
    setTimeout(() => setItinerarySavedAlert(false), 3000);
  };

  const handleDuplicateItinerary = (source: Itinerary) => {
    const cloned: Itinerary = {
      ...source,
      id: `MT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    void persistItinerary(cloned);
    setActiveTab('editor');
  };

  const handleDeleteItinerary = (id: string) => {
    setItineraries((prev) => prev.filter((it) => it.id !== id));
    if (currentItinerary.id === id) {
      const remaining = itineraries.filter((it) => it.id !== id);
      setCurrentItinerary(remaining[0] ? remaining[0] : createEmptyItinerary());
    }
    if (storageMode === 'cloud') {
      void deleteItineraryRemote(id).catch((err) => {
        console.error(err);
        window.alert(err instanceof Error ? err.message : 'Could not delete ticket.');
      });
    }
  };

  const handleSelectItineraryFromHistory = (it: Itinerary) => {
    setCurrentItinerary({ ...it });
    setActiveTab('editor');
    setEditorMobileView('preview');
  };

  // ReOxy Receipt Handlers
  const persistReceipt = async (updated: Receipt) => {
    setReceipts((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === updated.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
    setCurrentReceipt(updated);

    if (storageMode === 'cloud') {
      try {
        await saveReceiptRemote(updated);
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : 'Could not save receipt to the database.');
      }
    }
  };

  const handleSaveReceipt = () => {
    const updated = {
      ...currentReceipt,
      updatedAt: new Date().toISOString()
    };
    void persistReceipt(updated);
    setReceiptSavedAlert(true);
    setTimeout(() => setReceiptSavedAlert(false), 3000);
  };

  const handleDuplicateReceipt = (source: Receipt) => {
    const cloned: Receipt = {
      ...source,
      id: generateReceiptId(),
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    void persistReceipt(cloned);
    setActiveTab('editor');
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    if (currentReceipt.id === id) {
      const remaining = receipts.filter((r) => r.id !== id);
      setCurrentReceipt(remaining[0] ? remaining[0] : createDefaultReceipt());
    }
    if (storageMode === 'cloud') {
      void deleteReceiptRemote(id).catch((err) => {
        console.error(err);
        window.alert(err instanceof Error ? err.message : 'Could not delete receipt.');
      });
    }
  };

  const handleSelectReceiptFromHistory = (receipt: Receipt) => {
    setCurrentReceipt({ ...receipt });
    setActiveTab('editor');
    setEditorMobileView('preview');
  };

  const isMicor = currentApp === 'micor';

  return (
    <div className="min-h-screen bg-[#eef1f5] flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {/* Top Header with ReOxy / Micor Travels switcher */}
      <Header
        currentApp={currentApp}
        setCurrentApp={setCurrentApp}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        receiptsCount={receipts.length}
        itinerariesCount={itineraries.length}
        onNewItem={handleNewItem}
        onDownloadPdf={handleDownloadPdf}
        isExportingPdf={isExportingPdf}
        storageMode={storageMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-h-0">
        {isMicor ? (
          /* =========================================
             MICOR TRAVELS ITINERARY GENERATOR VIEW
             ========================================= */
          activeTab === 'editor' ? (
            <div className="lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
              <div className="no-print lg:hidden px-3 pt-3">
                <div className="flex rounded-full bg-white p-1 border border-slate-200 text-[13px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setEditorMobileView('form')}
                    className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 ${
                      editorMobileView === 'form' ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMobileView('preview')}
                    className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 ${
                      editorMobileView === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>

              <div className="lg:flex lg:h-full">
                <div className={`no-print lg:w-[420px] xl:w-[460px] shrink-0 bg-white lg:border-r lg:border-slate-200 lg:overflow-y-auto ${editorMobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
                  <ItineraryForm
                    itinerary={currentItinerary}
                    onChange={setCurrentItinerary}
                    onSave={handleSaveItinerary}
                    onReset={handleNewItem}
                    isSavedNotification={itinerarySavedAlert}
                  />
                </div>

                <div className={`flex-1 min-w-0 min-h-0 lg:overflow-hidden ${editorMobileView === 'form' ? 'hidden lg:flex' : 'flex'} flex-col`}>
                  <ItineraryPreview
                    itinerary={currentItinerary}
                    onShare={() => setIsItineraryShareOpen(true)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <ItineraryList
              itineraries={itineraries}
              onSelectItinerary={handleSelectItineraryFromHistory}
              onDuplicateItinerary={handleDuplicateItinerary}
              onDeleteItinerary={handleDeleteItinerary}
              onNewItinerary={handleNewItem}
            />
            </div>
          )
        ) : (
          /* =========================================
             REOXY RECEIPT GENERATOR VIEW
             ========================================= */
          activeTab === 'editor' ? (
            <div className="lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
              <div className="no-print lg:hidden px-3 pt-3">
                <div className="flex rounded-full bg-white p-1 border border-slate-200 text-[13px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setEditorMobileView('form')}
                    className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 ${
                      editorMobileView === 'form' ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMobileView('preview')}
                    className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 ${
                      editorMobileView === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>

              <div className="lg:flex lg:h-full">
                <div className={`no-print lg:w-[420px] xl:w-[460px] shrink-0 bg-white lg:border-r lg:border-slate-200 lg:overflow-y-auto ${editorMobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
                  <ReceiptForm
                    receipt={currentReceipt}
                    onChange={setCurrentReceipt}
                    onSave={handleSaveReceipt}
                    onReset={handleNewItem}
                    isSavedNotification={receiptSavedAlert}
                  />
                </div>

                <div className={`flex-1 min-w-0 min-h-0 lg:overflow-hidden ${editorMobileView === 'form' ? 'hidden lg:flex' : 'flex'} flex-col`}>
                  <ReceiptPreview
                    receipt={currentReceipt}
                    onShare={() => setIsReceiptShareOpen(true)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <ReceiptsList
              receipts={receipts}
              onSelectReceipt={handleSelectReceiptFromHistory}
              onDuplicateReceipt={handleDuplicateReceipt}
              onDeleteReceipt={handleDeleteReceipt}
            />
            </div>
          )
        )}
      </main>

      {/* Micor Itinerary Share Modal */}
      <ItineraryShareModal
        itinerary={currentItinerary}
        isOpen={isItineraryShareOpen}
        onClose={() => setIsItineraryShareOpen(false)}
      />

      {/* ReOxy Receipt Share Modal */}
      <QuickShareModal
        receipt={currentReceipt}
        isOpen={isReceiptShareOpen}
        onClose={() => setIsReceiptShareOpen(false)}
      />

      {/* Screen Footer */}
      {activeTab === 'history' && (
      <footer className="no-print border-t border-slate-200 bg-white py-4 text-[12px] text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          {isMicor ? (
            <>
              <p>
                <span className="font-semibold text-slate-800">{MICOR_TRAVELS_INFO.name}</span> · {MICOR_TRAVELS_INFO.tagline}
              </p>
              <p>{MICOR_TRAVELS_INFO.phone}</p>
            </>
          ) : (
            <>
              <p>
                <span className="font-semibold text-slate-800">{REOXY_COMPANY.brandName}</span> · {REOXY_COMPANY.tagline}
              </p>
              <p>{REOXY_COMPANY.contacts.website}</p>
            </>
          )}
        </div>
      </footer>
      )}

      {/* Global PDF Export Loading Modal / Toast */}
      {isExportingPdf && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center space-y-4">
            <div className="w-10 h-10 mx-auto border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Creating PDF
              </div>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
                {pdfProgressText || 'Rendering pages…'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
