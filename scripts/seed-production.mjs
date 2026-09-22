const API = (process.env.SEED_API_URL || 'https://reoxy.vercel.app').replace(/\/$/, '');
const SEED_ID = 'SEED-ROX-0001';

const seededReceipt = {
  id: SEED_ID,
  date: '2026-09-15',
  turnaroundDate: '2026-09-17',
  turnaroundSpeed: 'typical_48h',
  turnaround: 'typical_48h',
  discount: 0,
  urgentFee: 0,
  client: {
    fullName: 'Seeded Translation Client',
    email: 'seeded.client@reoxy.example',
    phone: '+7 000 000-00-00',
    institution: 'Seeded Demo University',
    studentOrIdNumber: 'SEED-ID-0001',
    notes: 'This record is seeded test data.',
  },
  documentMeta: {
    docTypes: ['Degree Certificate'],
    sourceLanguage: 'Russian',
    targetLanguage: 'English',
    pageCount: 1,
    certifiedCopiesCount: 1,
  },
  items: [
    {
      id: 'seed-item-translation-1',
      title: 'Seeded Official Translation',
      description: 'Seeded degree translation line — not a real client order.',
      category: 'translation',
      quantity: 1,
      unitPrice: 5600,
      total: 5600,
      hasStamps: true,
      notes: 'Seeded translation service',
    },
  ],
  currency: 'RUB',
  promotions: {
    discountPercent: 0,
    freeTShirt2026: false,
    spotifyPremium: false,
    freeLegalConsultation: false,
    customDiscountAmount: 0,
  },
  subtotal: 5600,
  discountTotal: 0,
  total: 5600,
  amountPaid: 5600,
  balanceDue: 0,
  paymentStatus: 'paid',
  paymentMethod: 'sberbank',
  issuedBy: 'Seeded Registrar — AO РеOкси',
  officialStamp: true,
  notes: 'SEEDED DATA. Safe to delete. QR should open /verify/receipt/SEED-ROX-0001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

async function json(path, init) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${body.error || res.statusText}`);
  }
  return body;
}

const receipts = await json('/api/receipts');
const itineraries = await json('/api/itineraries');
console.log(`Clearing ${receipts.length} receipts and ${itineraries.length} tickets…`);

for (const row of receipts) {
  await json(`/api/receipts/${encodeURIComponent(row.id)}`, { method: 'DELETE' });
}
for (const row of itineraries) {
  await json(`/api/itineraries/${encodeURIComponent(row.id)}`, { method: 'DELETE' });
}

await json(`/api/receipts/${encodeURIComponent(SEED_ID)}`, {
  method: 'PUT',
  body: JSON.stringify(seededReceipt),
});

const verify = await json(`/api/public/receipts/${encodeURIComponent(SEED_ID)}`);
const qr = `https://reoxy.vercel.app/verify/receipt/${encodeURIComponent(SEED_ID)}`;

console.log('Seeded receipt:', verify.document?.id, verify.document?.client?.fullName);
console.log('QR URL:', qr);
if (verify.document?.id !== SEED_ID || !String(verify.document?.client?.fullName || '').includes('Seeded')) {
  throw new Error('Seeded receipt did not verify over the public QR API');
}
console.log('QR public API OK');
