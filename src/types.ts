export type Currency = 'RUB' | 'USD' | 'EUR' | 'GBP';

export type PaymentMethod = 
  | 'cash' 
  | 'bank_card' 
  | 'sberbank' 
  | 'tinkoff' 
  | 'ecocash' 
  | 'wire_transfer';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export type TurnaroundSpeed = 'rush_24h' | 'typical_48h' | 'standard_3d' | 'extended';

export interface LineItem {
  id: string;
  title: string;
  description: string;
  category: 'translation' | 'printing' | 'cv_review' | 'legalisation' | 'other';
  quantity: number;
  unitPrice: number;
  total: number;
  hasStamps?: boolean;
  /** @deprecated Legacy alias — prefer `hasStamps` (kept for runtime parity). */
  stampsIncluded?: boolean;
  /** Optional small-print annotation rendered under the item title. */
  notes?: string;
}

export interface PromotionPerks {
  discountPercent: number; // e.g. 35 for 35% student discount
  freeTShirt2026: boolean; // Free T-shirt for graduate of 2026
  spotifyPremium: boolean; // 1 month Spotify Premium with academic package
  freeLegalConsultation: boolean; // Free Legalisation Consultation included
  customDiscountAmount: number;
}

export interface ClientInfo {
  fullName: string;
  email: string;
  phone: string;
  institution: string; // e.g. University of Zimbabwe, Peoples' Friendship University, etc.
  studentOrIdNumber?: string;
  /** Free-form purpose / delivery / notes entered by the user. */
  notes?: string;
}

export interface DocumentMeta {
  docTypes: string[]; // Degrees, Diplomas, Academic Transcripts, Visas, Dissertations, CV, etc.
  sourceLanguage: string;
  targetLanguage: string;
  pageCount: number;
  certifiedCopiesCount: number;
}

export interface Receipt {
  id: string; // e.g. ROX-2026-0042
  date: string;
  turnaroundDate: string;
  turnaroundSpeed: TurnaroundSpeed;
  /** Convenience display alias for turnaroundSpeed (set alongside it in forms). */
  turnaround?: TurnaroundSpeed;
  /** Absolute currency-amount discount applied (derived from % × subtotal + customDiscountAmount). */
  discount?: number;
  /** Absolute currency-amount 24h rush / expedited surcharge. */
  urgentFee?: number;
  client: ClientInfo;
  documentMeta: DocumentMeta;
  items: LineItem[];
  currency: Currency;
  promotions: PromotionPerks;
  subtotal: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  issuedBy: string;
  officialStamp: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePreset {
  id: string;
  title: string;
  description: string;
  category: 'translation' | 'printing' | 'cv_review' | 'legalisation' | 'other';
  defaultPriceRUB: number;
  defaultPriceUSD: number;
  hasStamps: boolean;
  badge?: string;
}
