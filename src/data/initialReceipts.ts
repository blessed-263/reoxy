import { Receipt } from '../types';

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'ROX-2026-0042',
    date: '2026-09-12',
    turnaroundDate: '2026-09-14',
    turnaroundSpeed: 'typical_48h',
    client: {
      fullName: 'Tatenda M.',
      email: 'tatenda.m@students.uz.ac.zw',
      phone: '+263 77 123 4567',
      institution: 'University of Zimbabwe',
      studentOrIdNumber: 'UZ-2022-8841'
    },
    documentMeta: {
      docTypes: ['Degree Certificate', 'Academic Transcript'],
      sourceLanguage: 'English',
      targetLanguage: 'Russian',
      pageCount: 4,
      certifiedCopiesCount: 2
    },
    items: [
      {
        id: 'item-1',
        title: 'Degrees & Diplomas Translation',
        description: 'Official translation with all required certification stamps included for postgraduate admission.',
        category: 'translation',
        quantity: 1,
        unitPrice: 5600,
        total: 5600,
        hasStamps: true
      },
      {
        id: 'item-2',
        title: 'Academic Transcripts & Marksheets',
        description: 'Full 4-semester academic breakdown with university verification seal.',
        category: 'translation',
        quantity: 1,
        unitPrice: 4200,
        total: 4200,
        hasStamps: true
      }
    ],
    currency: 'RUB',
    promotions: {
      discountPercent: 35, // 35% discount offer
      freeTShirt2026: true,
      spotifyPremium: true,
      freeLegalConsultation: true,
      customDiscountAmount: 0
    },
    subtotal: 9800,
    discountTotal: 3430,
    total: 6370,
    amountPaid: 6370,
    balanceDue: 0,
    paymentStatus: 'paid',
    paymentMethod: 'sberbank',
    issuedBy: 'ReOxy Document Desk - Officer K. Moyo',
    officialStamp: true,
    notes: 'University submission deadline verified. Client qualified for 2026 Graduate T-shirt and 1-month Spotify Premium code.',
    createdAt: '2026-09-12T10:30:00.000Z',
    updatedAt: '2026-09-12T10:30:00.000Z'
  },
  {
    id: 'ROX-2026-0041',
    date: '2026-09-10',
    turnaroundDate: '2026-09-12',
    turnaroundSpeed: 'typical_48h',
    client: {
      fullName: 'Julia S.',
      email: 'julia.s.internat@gmail.com',
      phone: '+7 916 430-89-11',
      institution: 'Peoples\' Friendship University (RUDN)',
      studentOrIdNumber: 'RUDN-INT-409'
    },
    documentMeta: {
      docTypes: ['Dissertation / Thesis'],
      sourceLanguage: 'Russian',
      targetLanguage: 'English',
      pageCount: 85,
      certifiedCopiesCount: 1
    },
    items: [
      {
        id: 'item-3',
        title: 'Printing & Binding (Dissertations & Theses)',
        description: 'Hardcover thesis binding in dark navy gold-foil lettering + 85 color pages.',
        category: 'printing',
        quantity: 1,
        unitPrice: 2800,
        total: 2800,
        hasStamps: false
      },
      {
        id: 'item-4',
        title: 'CV & Resume Review',
        description: 'Structured graduate CV review for European research placement application.',
        category: 'cv_review',
        quantity: 1,
        unitPrice: 2500,
        total: 2500,
        hasStamps: false
      }
    ],
    currency: 'RUB',
    promotions: {
      discountPercent: 0,
      freeTShirt2026: false,
      spotifyPremium: false,
      freeLegalConsultation: true,
      customDiscountAmount: 500
    },
    subtotal: 5300,
    discountTotal: 500,
    total: 4800,
    amountPaid: 4800,
    balanceDue: 0,
    paymentStatus: 'paid',
    paymentMethod: 'bank_card',
    issuedBy: 'ReOxy Document Desk - Desk Admin',
    officialStamp: true,
    notes: 'Printed and bound according to university dissertation formatting guidelines.',
    createdAt: '2026-09-10T14:15:00.000Z',
    updatedAt: '2026-09-10T14:15:00.000Z'
  },
  {
    id: 'ROX-2026-0040',
    date: '2026-09-08',
    turnaroundDate: '2026-09-09',
    turnaroundSpeed: 'rush_24h',
    client: {
      fullName: 'Michael T.',
      email: 'm.t.applications@outlook.com',
      phone: '+7 985 991-00-24',
      institution: 'Graduate Applicant',
      studentOrIdNumber: ''
    },
    documentMeta: {
      docTypes: ['Degree Certificate', 'Police Clearance'],
      sourceLanguage: 'Russian',
      targetLanguage: 'English',
      pageCount: 2,
      certifiedCopiesCount: 2
    },
    items: [
      {
        id: 'item-5',
        title: 'Visa & Legal Documents Translation',
        description: 'Express certified translation for employment visa submission with sworn stamps.',
        category: 'translation',
        quantity: 2,
        unitPrice: 3500,
        total: 7000,
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
    subtotal: 7000,
    discountTotal: 0,
    total: 7000,
    amountPaid: 3500,
    balanceDue: 3500,
    paymentStatus: 'partial',
    paymentMethod: 'tinkoff',
    issuedBy: 'РеOкси AO — бюро сертифицированных переводов',
    officialStamp: true,
    notes: '50% advance deposit paid via Tinkoff. Balance of 3,500₽ due upon collection of certified originals.',
    createdAt: '2026-09-08T09:00:00.000Z',
    updatedAt: '2026-09-08T09:00:00.000Z'
  }
];
