import { requirePool } from './db.ts';
import { bool, dateStr, idOr, iso, num, str } from './coerce.ts';

type ReceiptBody = Record<string, unknown>;

function clientIdFor(receiptId: string) {
  return `client-${receiptId}`;
}

function mapReceipt(
  row: Record<string, unknown>,
  extras: {
    client: Record<string, unknown>;
    promotions: Record<string, unknown> | null;
    meta: Record<string, unknown> | null;
    docTypes: string[];
    items: Record<string, unknown>[];
  }
) {
  const speed = str(row.turnaround_speed, 'typical_48h');
  return {
    id: str(row.id),
    date: dateStr(row.issue_date),
    turnaroundDate: dateStr(row.turnaround_date),
    turnaroundSpeed: speed,
    turnaround: speed,
    discount: num(row.discount),
    urgentFee: num(row.urgent_fee),
    client: {
      fullName: str(extras.client.full_name),
      email: str(extras.client.email),
      phone: str(extras.client.phone),
      institution: str(extras.client.institution),
      studentOrIdNumber: str(extras.client.student_or_id_number) || undefined,
      notes: str(extras.client.notes) || undefined,
    },
    documentMeta: {
      docTypes: extras.docTypes,
      sourceLanguage: str(extras.meta?.source_language, 'Russian'),
      targetLanguage: str(extras.meta?.target_language, 'English'),
      pageCount: num(extras.meta?.page_count, 1),
      certifiedCopiesCount: num(extras.meta?.certified_copies_count, 1),
    },
    items: extras.items.map((item) => ({
      id: str(item.id),
      title: str(item.title),
      description: str(item.description),
      category: str(item.category, 'other'),
      quantity: num(item.quantity, 1),
      unitPrice: num(item.unit_price),
      total: num(item.total),
      hasStamps: bool(item.has_stamps),
      notes: str(item.notes) || undefined,
    })),
    currency: str(row.currency, 'RUB'),
    promotions: {
      discountPercent: num(extras.promotions?.discount_percent),
      freeTShirt2026: bool(extras.promotions?.free_tshirt_2026),
      spotifyPremium: bool(extras.promotions?.spotify_premium),
      freeLegalConsultation: bool(extras.promotions?.free_legal_consultation, true),
      customDiscountAmount: num(extras.promotions?.custom_discount_amount),
    },
    subtotal: num(row.subtotal),
    discountTotal: num(row.discount_total),
    total: num(row.total),
    amountPaid: num(row.amount_paid),
    balanceDue: num(row.balance_due),
    paymentStatus: str(row.payment_status, 'unpaid'),
    paymentMethod: str(row.payment_method, 'sberbank'),
    issuedBy: str(row.issued_by),
    officialStamp: bool(row.official_stamp, true),
    notes: str(row.notes),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

async function assemble(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return [];
  const db = requirePool();
  const ids = rows.map((row) => str(row.id));
  const clientIds = rows.map((row) => str(row.client_id));

  const [clients, promotions, metas, types, items] = await Promise.all([
    db.query(`SELECT * FROM clients WHERE id = ANY($1::text[])`, [clientIds]),
    db.query(`SELECT * FROM receipt_promotions WHERE receipt_id = ANY($1::text[])`, [ids]),
    db.query(`SELECT * FROM receipt_document_meta WHERE receipt_id = ANY($1::text[])`, [ids]),
    db.query(
      `SELECT * FROM receipt_document_types WHERE receipt_id = ANY($1::text[]) ORDER BY sort_order ASC`,
      [ids]
    ),
    db.query(
      `SELECT * FROM receipt_items WHERE receipt_id = ANY($1::text[]) ORDER BY sort_order ASC`,
      [ids]
    ),
  ]);

  const clientById = new Map(clients.rows.map((row) => [str(row.id), row]));
  const promoById = new Map(promotions.rows.map((row) => [str(row.receipt_id), row]));
  const metaById = new Map(metas.rows.map((row) => [str(row.receipt_id), row]));
  const typesById = new Map<string, string[]>();
  for (const row of types.rows) {
    const rid = str(row.receipt_id);
    const list = typesById.get(rid) || [];
    list.push(str(row.doc_type));
    typesById.set(rid, list);
  }
  const itemsById = new Map<string, Record<string, unknown>[]>();
  for (const row of items.rows) {
    const rid = str(row.receipt_id);
    const list = itemsById.get(rid) || [];
    list.push(row);
    itemsById.set(rid, list);
  }

  return rows.map((row) =>
    mapReceipt(row, {
      client: clientById.get(str(row.client_id)) || {},
      promotions: promoById.get(str(row.id)) || null,
      meta: metaById.get(str(row.id)) || null,
      docTypes: typesById.get(str(row.id)) || [],
      items: itemsById.get(str(row.id)) || [],
    })
  );
}

export async function listReceipts() {
  const db = requirePool();
  const { rows } = await db.query(`SELECT * FROM receipts ORDER BY updated_at DESC`);
  return assemble(rows);
}

export async function getReceipt(id: string) {
  const db = requirePool();
  const { rows } = await db.query(`SELECT * FROM receipts WHERE id = $1 LIMIT 1`, [id]);
  if (!rows[0]) return null;
  const [doc] = await assemble(rows);
  return doc || null;
}

export async function upsertReceipt(id: string, body: ReceiptBody) {
  const db = requirePool();
  const clientInfo = (body.client || {}) as ReceiptBody;
  const meta = (body.documentMeta || {}) as ReceiptBody;
  const promotions = (body.promotions || {}) as ReceiptBody;
  const items = Array.isArray(body.items) ? body.items : [];
  const docTypes = Array.isArray(meta.docTypes) ? meta.docTypes.map(String) : [];
  const clientId = clientIdFor(id);
  const now = new Date().toISOString();
  const createdAt = str(body.createdAt, now);
  const cx = await db.connect();

  try {
    await cx.query('BEGIN');
    await cx.query(
      `INSERT INTO clients (id, full_name, email, phone, institution, student_or_id_number, notes, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
       ON CONFLICT (id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         institution = EXCLUDED.institution,
         student_or_id_number = EXCLUDED.student_or_id_number,
         notes = EXCLUDED.notes,
         updated_at = NOW()`,
      [
        clientId,
        str(clientInfo.fullName),
        str(clientInfo.email),
        str(clientInfo.phone),
        str(clientInfo.institution),
        str(clientInfo.studentOrIdNumber),
        str(clientInfo.notes),
      ]
    );

    await cx.query(
      `INSERT INTO receipts (
         id, client_id, issue_date, turnaround_date, turnaround_speed, discount, urgent_fee,
         currency, subtotal, discount_total, total, amount_paid, balance_due, payment_status,
         payment_method, issued_by, official_stamp, notes, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW())
       ON CONFLICT (id) DO UPDATE SET
         client_id = EXCLUDED.client_id,
         issue_date = EXCLUDED.issue_date,
         turnaround_date = EXCLUDED.turnaround_date,
         turnaround_speed = EXCLUDED.turnaround_speed,
         discount = EXCLUDED.discount,
         urgent_fee = EXCLUDED.urgent_fee,
         currency = EXCLUDED.currency,
         subtotal = EXCLUDED.subtotal,
         discount_total = EXCLUDED.discount_total,
         total = EXCLUDED.total,
         amount_paid = EXCLUDED.amount_paid,
         balance_due = EXCLUDED.balance_due,
         payment_status = EXCLUDED.payment_status,
         payment_method = EXCLUDED.payment_method,
         issued_by = EXCLUDED.issued_by,
         official_stamp = EXCLUDED.official_stamp,
         notes = EXCLUDED.notes,
         updated_at = NOW()`,
      [
        id,
        clientId,
        str(body.date) || null,
        str(body.turnaroundDate) || null,
        str(body.turnaroundSpeed || body.turnaround, 'typical_48h'),
        num(body.discount),
        num(body.urgentFee),
        str(body.currency, 'RUB'),
        num(body.subtotal),
        num(body.discountTotal),
        num(body.total),
        num(body.amountPaid),
        num(body.balanceDue),
        str(body.paymentStatus, 'unpaid'),
        str(body.paymentMethod, 'sberbank'),
        str(body.issuedBy),
        bool(body.officialStamp, true),
        str(body.notes),
        createdAt,
      ]
    );

    await cx.query(
      `INSERT INTO receipt_promotions (
         receipt_id, discount_percent, free_tshirt_2026, spotify_premium,
         free_legal_consultation, custom_discount_amount
       ) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (receipt_id) DO UPDATE SET
         discount_percent = EXCLUDED.discount_percent,
         free_tshirt_2026 = EXCLUDED.free_tshirt_2026,
         spotify_premium = EXCLUDED.spotify_premium,
         free_legal_consultation = EXCLUDED.free_legal_consultation,
         custom_discount_amount = EXCLUDED.custom_discount_amount`,
      [
        id,
        num(promotions.discountPercent),
        bool(promotions.freeTShirt2026),
        bool(promotions.spotifyPremium),
        bool(promotions.freeLegalConsultation),
        num(promotions.customDiscountAmount),
      ]
    );

    await cx.query(
      `INSERT INTO receipt_document_meta (
         receipt_id, source_language, target_language, page_count, certified_copies_count
       ) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (receipt_id) DO UPDATE SET
         source_language = EXCLUDED.source_language,
         target_language = EXCLUDED.target_language,
         page_count = EXCLUDED.page_count,
         certified_copies_count = EXCLUDED.certified_copies_count`,
      [
        id,
        str(meta.sourceLanguage, 'Russian'),
        str(meta.targetLanguage, 'English'),
        num(meta.pageCount, 1),
        num(meta.certifiedCopiesCount, 1),
      ]
    );

    await cx.query(`DELETE FROM receipt_document_types WHERE receipt_id = $1`, [id]);
    for (let i = 0; i < docTypes.length; i++) {
      await cx.query(
        `INSERT INTO receipt_document_types (id, receipt_id, doc_type, sort_order) VALUES ($1,$2,$3,$4)`,
        [`${id}-doctype-${i}`, id, docTypes[i], i]
      );
    }

    await cx.query(`DELETE FROM receipt_items WHERE receipt_id = $1`, [id]);
    for (let i = 0; i < items.length; i++) {
      const item = (items[i] || {}) as ReceiptBody;
      await cx.query(
        `INSERT INTO receipt_items (
           id, receipt_id, title, description, category, quantity, unit_price, total, has_stamps, notes, sort_order
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          idOr(`${id}-item`, item.id, i),
          id,
          str(item.title),
          str(item.description),
          str(item.category, 'other'),
          num(item.quantity, 1),
          num(item.unitPrice),
          num(item.total),
          bool(item.hasStamps ?? item.stampsIncluded),
          str(item.notes),
          i,
        ]
      );
    }

    await cx.query('COMMIT');
  } catch (err) {
    await cx.query('ROLLBACK');
    throw err;
  } finally {
    cx.release();
  }

  return getReceipt(id);
}

export async function deleteReceipt(id: string) {
  const db = requirePool();
  const cx = await db.connect();
  try {
    await cx.query('BEGIN');
    const { rows } = await cx.query(`SELECT client_id FROM receipts WHERE id = $1`, [id]);
    const result = await cx.query(`DELETE FROM receipts WHERE id = $1`, [id]);
    const clientId = rows[0]?.client_id;
    if (clientId) {
      await cx.query(
        `DELETE FROM clients WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM receipts WHERE client_id = $1)`,
        [clientId]
      );
    }
    await cx.query('COMMIT');
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    await cx.query('ROLLBACK');
    throw err;
  } finally {
    cx.release();
  }
}
