import { randomUUID } from 'crypto';
import { requirePool } from './db.ts';
import { REOXY_SERVICES } from '../src/data/servicePresets.ts';

export type PortalQuoteItem = {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type PortalQuote = {
  id: string;
  userId: string;
  currency: 'USD';
  notes: string;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string;
  items: PortalQuoteItem[];
  customer?: { fullName: string; email: string; phone: string };
};

export function catalogServices() {
  return REOXY_SERVICES.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    category: service.category,
    priceUsd: Number(service.defaultPriceUSD) || 0,
    badge: service.badge || '',
  }));
}

export async function upsertPortalProfile(input: {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
}) {
  const db = requirePool();
  await db.query(
    `INSERT INTO portal_profiles (user_id, full_name, email, phone, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE portal_profiles.full_name END,
       email = EXCLUDED.email,
       phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE portal_profiles.phone END,
       updated_at = NOW()`,
    [input.userId, input.fullName, input.email, input.phone]
  );
}

async function nextQuoteId() {
  const db = requirePool();
  const year = new Date().getFullYear();
  const prefix = `RQ-${year}-`;
  const { rows } = await db.query<{ id: string }>(
    `SELECT id FROM portal_quotes WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  const last = rows[0]?.id || '';
  const n = Number(last.slice(prefix.length)) || 0;
  return `${prefix}${String(n + 1).padStart(4, '0')}`;
}

export async function createPortalQuote(input: {
  userId: string;
  serviceIds: string[];
  notes: string;
}): Promise<PortalQuote> {
  const selected = catalogServices().filter((service) => input.serviceIds.includes(service.id));
  if (!selected.length) {
    const err = new Error('Select at least one service');
    (err as Error & { status?: number }).status = 400;
    throw err;
  }
  const items = selected.map((service, index) => {
    const unitPrice = service.priceUsd;
    return {
      id: randomUUID(),
      serviceId: service.id,
      title: service.title,
      description: service.description,
      quantity: 1,
      unitPrice,
      total: unitPrice,
      sortOrder: index,
    };
  });
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const db = requirePool();
  const id = await nextQuoteId();
  await db.query(
    `INSERT INTO portal_quotes (id, user_id, currency, notes, status, subtotal, total)
     VALUES ($1, $2, 'USD', $3, 'quoted', $4, $4)`,
    [id, input.userId, input.notes, total]
  );
  for (const item of items) {
    await db.query(
      `INSERT INTO portal_quote_items
        (id, quote_id, service_id, title, description, quantity, unit_price, total, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        item.id,
        id,
        item.serviceId,
        item.title,
        item.description,
        item.quantity,
        item.unitPrice,
        item.total,
        item.sortOrder,
      ]
    );
  }
  const quote = await getPortalQuote(id, input.userId);
  if (!quote) {
    throw new Error('Quote was not saved');
  }
  return quote;
}

function mapQuote(
  row: Record<string, unknown>,
  items: PortalQuoteItem[],
  customer?: { fullName: string; email: string; phone: string }
): PortalQuote {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    currency: 'USD',
    notes: String(row.notes || ''),
    status: String(row.status || 'quoted'),
    subtotal: Number(row.subtotal) || 0,
    total: Number(row.total) || 0,
    createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : '',
    items,
    customer,
  };
}

export async function getPortalQuote(id: string, userId: string) {
  const db = requirePool();
  const { rows } = await db.query(
    `SELECT q.*, p.full_name, p.email, p.phone
     FROM portal_quotes q
     JOIN portal_profiles p ON p.user_id = q.user_id
     WHERE q.id = $1 AND q.user_id = $2`,
    [id, userId]
  );
  const row = rows[0];
  if (!row) return null;
  const { rows: itemRows } = await db.query(
    `SELECT * FROM portal_quote_items WHERE quote_id = $1 ORDER BY sort_order ASC`,
    [id]
  );
  return mapQuote(
    row,
    itemRows.map((item) => ({
      id: String(item.id),
      serviceId: String(item.service_id),
      title: String(item.title),
      description: String(item.description || ''),
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price) || 0,
      total: Number(item.total) || 0,
    })),
    {
      fullName: String(row.full_name || ''),
      email: String(row.email || ''),
      phone: String(row.phone || ''),
    }
  );
}

export async function listPortalQuotes(userId: string) {
  const db = requirePool();
  const { rows } = await db.query(
    `SELECT * FROM portal_quotes WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  const quotes: PortalQuote[] = [];
  for (const row of rows) {
    const { rows: itemRows } = await db.query(
      `SELECT * FROM portal_quote_items WHERE quote_id = $1 ORDER BY sort_order ASC`,
      [row.id]
    );
    quotes.push(
      mapQuote(
        row,
        itemRows.map((item) => ({
          id: String(item.id),
          serviceId: String(item.service_id),
          title: String(item.title),
          description: String(item.description || ''),
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unit_price) || 0,
          total: Number(item.total) || 0,
        }))
      )
    );
  }
  return quotes;
}
