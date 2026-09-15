import { ServicePreset } from '../types';

export const REOXY_SERVICES: ServicePreset[] = [
  {
    id: 'trans_degrees',
    title: 'Degrees & Diplomas Translation',
    description: 'Official translations for academic degree certificates and diplomas with all required stamps included.',
    category: 'translation',
    defaultPriceRUB: 5600,
    defaultPriceUSD: 65,
    hasStamps: true,
    badge: 'Popular Academic'
  },
  {
    id: 'trans_transcripts',
    title: 'Academic Transcripts & Marksheets',
    description: 'Official translations for academic transcripts, course modules, and grade sheets accepted worldwide.',
    category: 'translation',
    defaultPriceRUB: 4200,
    defaultPriceUSD: 48,
    hasStamps: true,
    badge: 'Worldwide Acceptance'
  },
  {
    id: 'trans_visas',
    title: 'Visa & Legal Documents Translation',
    description: 'Official translations for visa applications, birth certificates, police clearance, and embassy submissions.',
    category: 'translation',
    defaultPriceRUB: 3500,
    defaultPriceUSD: 40,
    hasStamps: true,
    badge: 'Embassy Approved'
  },
  {
    id: 'print_dissertations',
    title: 'Printing & Binding (Dissertations & Theses)',
    description: 'Professional high-grade printing and hardcover / thermal binding for academic thesis submissions.',
    category: 'printing',
    defaultPriceRUB: 2800,
    defaultPriceUSD: 32,
    hasStamps: false,
    badge: 'High Grade'
  },
  {
    id: 'print_academic',
    title: 'Academic Printing & Spiral Binding',
    description: 'Crisp color/monochrome document printing and spiral binding for coursework and research papers.',
    category: 'printing',
    defaultPriceRUB: 1200,
    defaultPriceUSD: 15,
    hasStamps: false
  },
  {
    id: 'cv_review',
    title: 'CV & Resume Review',
    description: 'Structured review of your CV or resume before job applications and graduate placements.',
    category: 'cv_review',
    defaultPriceRUB: 2500,
    defaultPriceUSD: 30,
    hasStamps: false,
    badge: 'Career Ready'
  },
  {
    id: 'legalisation_consult',
    title: 'Legalisation & Apostille Consultation',
    description: 'Guidance and advisory support through university and foreign ministry legalisation procedures.',
    category: 'legalisation',
    defaultPriceRUB: 0,
    defaultPriceUSD: 0,
    hasStamps: false,
    badge: 'Free Consultation'
  }
];

export const COMMON_DOCUMENT_TYPES = [
  'Degree Certificate',
  'Academic Transcript',
  'High School Diploma',
  'Dissertation / Thesis',
  'Passport / ID Document',
  'Birth Certificate',
  'Police Clearance',
  'Medical Certificate',
  'CV / Resume',
  'Recommendation Letter'
];

export const COMMON_LANGUAGES = [
  'Russian ➔ English',
  'English ➔ Russian',
  'Shona ➔ English',
  'English ➔ Shona',
  'French ➔ English',
  'English ➔ French',
  'Portuguese ➔ English',
  'Spanish ➔ English',
  'Arabic ➔ English',
  'German ➔ English',
  'Other Language Pair'
];
