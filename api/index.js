var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/schema.ts
var init_schema = __esm({
  "server/schema.ts"() {
  }
});

// server/db.ts
function databaseUrl() {
  let url = process.env.DATABASE_URL?.trim() || "";
  if (/:6543\b/.test(url) && !/[?&]pgbouncer=true/.test(url)) {
    url += `${url.includes("?") ? "&" : "?"}pgbouncer=true`;
  }
  return url || void 0;
}
function sslConfig() {
  if (!connectionString) return false;
  if (process.env.PGSSLMODE === "disable") return false;
  if (process.env.PGSSLMODE === "require") return { rejectUnauthorized: false };
  const local = /localhost|127\.0\.0\.1/.test(connectionString);
  return local ? false : { rejectUnauthorized: false };
}
function requirePool() {
  if (!pool) {
    const err = new Error("DATABASE_URL is not set");
    err.status = 503;
    throw err;
  }
  return pool;
}
var import_config, import_pg, Pool, connectionString, pool;
var init_db = __esm({
  "server/db.ts"() {
    import_config = require("dotenv/config");
    import_pg = __toESM(require("pg"));
    init_schema();
    ({ Pool } = import_pg.default);
    connectionString = databaseUrl();
    pool = connectionString ? new Pool({
      connectionString,
      ssl: sslConfig(),
      max: 1,
      connectionTimeoutMillis: 8e3
    }) : null;
  }
});

// server/coerce.ts
function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function str(value, fallback = "") {
  if (value == null) return fallback;
  return String(value);
}
function bool(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value == null) return fallback;
  return value === true || value === "true" || value === 1 || value === "1";
}
function dateStr(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}
function iso(value) {
  if (!value) return (/* @__PURE__ */ new Date()).toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
function idOr(prefix, value, index) {
  const raw = str(value).trim();
  return raw || `${prefix}-${index + 1}-${Date.now()}`;
}
var init_coerce = __esm({
  "server/coerce.ts"() {
  }
});

// server/receiptsRepo.ts
function clientIdFor(receiptId) {
  return `client-${receiptId}`;
}
function mapReceipt(row, extras) {
  const speed = str(row.turnaround_speed, "typical_48h");
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
      studentOrIdNumber: str(extras.client.student_or_id_number) || void 0,
      notes: str(extras.client.notes) || void 0
    },
    documentMeta: {
      docTypes: extras.docTypes,
      sourceLanguage: str(extras.meta?.source_language, "Russian"),
      targetLanguage: str(extras.meta?.target_language, "English"),
      pageCount: num(extras.meta?.page_count, 1),
      certifiedCopiesCount: num(extras.meta?.certified_copies_count, 1)
    },
    items: extras.items.map((item) => ({
      id: str(item.id),
      title: str(item.title),
      description: str(item.description),
      category: str(item.category, "other"),
      quantity: num(item.quantity, 1),
      unitPrice: num(item.unit_price),
      total: num(item.total),
      hasStamps: bool(item.has_stamps),
      notes: str(item.notes) || void 0
    })),
    currency: str(row.currency, "RUB"),
    promotions: {
      discountPercent: num(extras.promotions?.discount_percent),
      freeTShirt2026: bool(extras.promotions?.free_tshirt_2026),
      spotifyPremium: bool(extras.promotions?.spotify_premium),
      freeLegalConsultation: bool(extras.promotions?.free_legal_consultation, true),
      customDiscountAmount: num(extras.promotions?.custom_discount_amount)
    },
    subtotal: num(row.subtotal),
    discountTotal: num(row.discount_total),
    total: num(row.total),
    amountPaid: num(row.amount_paid),
    balanceDue: num(row.balance_due),
    paymentStatus: str(row.payment_status, "unpaid"),
    paymentMethod: str(row.payment_method, "sberbank"),
    issuedBy: str(row.issued_by),
    officialStamp: bool(row.official_stamp, true),
    notes: str(row.notes),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}
async function assemble(rows) {
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
    )
  ]);
  const clientById = new Map(clients.rows.map((row) => [str(row.id), row]));
  const promoById = new Map(promotions.rows.map((row) => [str(row.receipt_id), row]));
  const metaById = new Map(metas.rows.map((row) => [str(row.receipt_id), row]));
  const typesById = /* @__PURE__ */ new Map();
  for (const row of types.rows) {
    const rid = str(row.receipt_id);
    const list = typesById.get(rid) || [];
    list.push(str(row.doc_type));
    typesById.set(rid, list);
  }
  const itemsById = /* @__PURE__ */ new Map();
  for (const row of items.rows) {
    const rid = str(row.receipt_id);
    const list = itemsById.get(rid) || [];
    list.push(row);
    itemsById.set(rid, list);
  }
  return rows.map(
    (row) => mapReceipt(row, {
      client: clientById.get(str(row.client_id)) || {},
      promotions: promoById.get(str(row.id)) || null,
      meta: metaById.get(str(row.id)) || null,
      docTypes: typesById.get(str(row.id)) || [],
      items: itemsById.get(str(row.id)) || []
    })
  );
}
async function listReceipts() {
  const db = requirePool();
  const { rows } = await db.query(`SELECT * FROM receipts ORDER BY updated_at DESC`);
  return assemble(rows);
}
async function getReceipt(id) {
  const db = requirePool();
  const { rows } = await db.query(`SELECT * FROM receipts WHERE id = $1 LIMIT 1`, [id]);
  if (!rows[0]) return null;
  const [doc] = await assemble(rows);
  return doc || null;
}
async function upsertReceipt(id, body) {
  const db = requirePool();
  const clientInfo = body.client || {};
  const meta = body.documentMeta || {};
  const promotions = body.promotions || {};
  const items = Array.isArray(body.items) ? body.items : [];
  const docTypes = Array.isArray(meta.docTypes) ? meta.docTypes.map(String) : [];
  const clientId = clientIdFor(id);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const createdAt = str(body.createdAt, now);
  const cx = await db.connect();
  try {
    await cx.query("BEGIN");
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
        str(clientInfo.notes)
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
        str(body.turnaroundSpeed || body.turnaround, "typical_48h"),
        num(body.discount),
        num(body.urgentFee),
        str(body.currency, "RUB"),
        num(body.subtotal),
        num(body.discountTotal),
        num(body.total),
        num(body.amountPaid),
        num(body.balanceDue),
        str(body.paymentStatus, "unpaid"),
        str(body.paymentMethod, "sberbank"),
        str(body.issuedBy),
        bool(body.officialStamp, true),
        str(body.notes),
        createdAt
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
        num(promotions.customDiscountAmount)
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
        str(meta.sourceLanguage, "Russian"),
        str(meta.targetLanguage, "English"),
        num(meta.pageCount, 1),
        num(meta.certifiedCopiesCount, 1)
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
      const item = items[i] || {};
      await cx.query(
        `INSERT INTO receipt_items (
           id, receipt_id, title, description, category, quantity, unit_price, total, has_stamps, notes, sort_order
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          idOr(`${id}-item`, item.id, i),
          id,
          str(item.title),
          str(item.description),
          str(item.category, "other"),
          num(item.quantity, 1),
          num(item.unitPrice),
          num(item.total),
          bool(item.hasStamps ?? item.stampsIncluded),
          str(item.notes),
          i
        ]
      );
    }
    await cx.query("COMMIT");
  } catch (err) {
    await cx.query("ROLLBACK");
    throw err;
  } finally {
    cx.release();
  }
  return getReceipt(id);
}
async function deleteReceipt(id) {
  const db = requirePool();
  const cx = await db.connect();
  try {
    await cx.query("BEGIN");
    const { rows } = await cx.query(`SELECT client_id FROM receipts WHERE id = $1`, [id]);
    const result = await cx.query(`DELETE FROM receipts WHERE id = $1`, [id]);
    const clientId = rows[0]?.client_id;
    if (clientId) {
      await cx.query(
        `DELETE FROM clients WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM receipts WHERE client_id = $1)`,
        [clientId]
      );
    }
    await cx.query("COMMIT");
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    await cx.query("ROLLBACK");
    throw err;
  } finally {
    cx.release();
  }
}
var init_receiptsRepo = __esm({
  "server/receiptsRepo.ts"() {
    init_db();
    init_coerce();
  }
});

// server/itinerariesRepo.ts
function mapItinerary(row, extras) {
  return {
    id: str(row.id),
    pnr: str(row.pnr) || void 0,
    title: str(row.title),
    destination: str(row.destination),
    startDate: dateStr(row.start_date),
    endDate: dateStr(row.end_date),
    totalDays: num(row.total_days),
    totalNights: num(row.total_nights),
    status: str(row.status, "draft"),
    travelers: extras.travelers.map((t) => ({
      id: str(t.id),
      name: str(t.full_name),
      type: str(t.passenger_type, "adult"),
      passportNumber: str(t.passport_number) || void 0,
      ticketNumber: str(t.ticket_number) || void 0,
      seat: str(t.seat) || void 0,
      frequentFlyer: str(t.frequent_flyer) || void 0,
      notes: str(t.notes) || void 0
    })),
    flights: extras.flights.map((f) => ({
      id: str(f.id),
      airline: str(f.airline),
      flightNumber: str(f.flight_number),
      departureCity: str(f.departure_city),
      departureAirport: str(f.departure_airport) || void 0,
      arrivalCity: str(f.arrival_city),
      arrivalAirport: str(f.arrival_airport) || void 0,
      departureDate: dateStr(f.departure_date),
      departureTime: str(f.departure_time),
      arrivalDate: dateStr(f.arrival_date),
      arrivalTime: str(f.arrival_time),
      terminal: str(f.terminal) || void 0,
      terminalArrival: str(f.terminal_arrival) || void 0,
      gate: str(f.gate) || void 0,
      aircraft: str(f.aircraft) || void 0,
      cabinClass: str(f.cabin_class, "economy"),
      bookingRef: str(f.booking_ref) || void 0,
      baggageAllowance: str(f.baggage_allowance) || void 0,
      seat: str(f.seat) || void 0,
      duration: str(f.duration) || void 0,
      status: str(f.status) || void 0
    })),
    accommodations: extras.accommodations.map((a) => ({
      id: str(a.id),
      hotelName: str(a.hotel_name),
      city: str(a.city),
      address: str(a.address) || void 0,
      checkInDate: dateStr(a.check_in_date),
      checkOutDate: dateStr(a.check_out_date),
      roomType: str(a.room_type),
      mealPlan: str(a.meal_plan, "BB"),
      bookingRef: str(a.booking_ref) || void 0,
      phone: str(a.phone) || void 0,
      stars: a.stars == null ? void 0 : num(a.stars)
    })),
    days: extras.days.map((day) => ({
      id: str(day.row.id),
      dayNumber: num(day.row.day_number, 1),
      date: dateStr(day.row.day_date),
      title: str(day.row.title),
      description: str(day.row.description) || void 0,
      mealsIncluded: day.meals,
      activities: day.activities.map((act) => ({
        id: str(act.id),
        time: str(act.activity_time),
        title: str(act.title),
        location: str(act.location) || void 0,
        description: str(act.description),
        category: str(act.category, "event"),
        isIncluded: bool(act.is_included, true)
      }))
    })),
    inclusions: extras.inclusions,
    exclusions: extras.exclusions,
    importantNotes: extras.importantNotes,
    totalPrice: num(row.total_price),
    currency: str(row.currency, "RUB"),
    paymentStatus: str(row.payment_status, "pending"),
    paymentMethod: str(row.payment_method, "bank_card"),
    amountPaid: num(row.amount_paid),
    fareBreakdown: {
      baseFare: num(row.base_fare),
      taxesAndFees: num(row.taxes_and_fees),
      fuelSurcharge: num(row.fuel_surcharge),
      serviceFee: num(row.service_fee)
    },
    baggagePolicy: str(row.baggage_policy) || void 0,
    checkInPolicy: str(row.check_in_policy) || void 0,
    visaPolicy: str(row.visa_policy) || void 0,
    farePolicy: str(row.fare_policy) || void 0,
    boardingPolicy: str(row.boarding_policy) || void 0,
    agentName: str(row.agent_name),
    agentPhone: str(row.agent_phone),
    agentEmail: str(row.agent_email),
    emergencyPhone: str(row.emergency_phone),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}
async function assemble2(rows) {
  if (rows.length === 0) return [];
  const db = requirePool();
  const ids = rows.map((row) => str(row.id));
  const [travelers, flights, accommodations, days, meals, activities, notes] = await Promise.all([
    db.query(`SELECT * FROM travelers WHERE itinerary_id = ANY($1::text[]) ORDER BY sort_order ASC`, [ids]),
    db.query(`SELECT * FROM flights WHERE itinerary_id = ANY($1::text[]) ORDER BY sort_order ASC`, [ids]),
    db.query(`SELECT * FROM accommodations WHERE itinerary_id = ANY($1::text[]) ORDER BY sort_order ASC`, [ids]),
    db.query(`SELECT * FROM itinerary_days WHERE itinerary_id = ANY($1::text[]) ORDER BY sort_order ASC, day_number ASC`, [ids]),
    db.query(
      `SELECT m.* FROM itinerary_day_meals m
       JOIN itinerary_days d ON d.id = m.day_id
       WHERE d.itinerary_id = ANY($1::text[])
       ORDER BY m.sort_order ASC`,
      [ids]
    ),
    db.query(
      `SELECT a.* FROM itinerary_day_activities a
       JOIN itinerary_days d ON d.id = a.day_id
       WHERE d.itinerary_id = ANY($1::text[])
       ORDER BY a.sort_order ASC`,
      [ids]
    ),
    db.query(
      `SELECT * FROM itinerary_notes WHERE itinerary_id = ANY($1::text[]) ORDER BY kind ASC, sort_order ASC`,
      [ids]
    )
  ]);
  const travelersBy = group(travelers.rows, "itinerary_id");
  const flightsBy = group(flights.rows, "itinerary_id");
  const staysBy = group(accommodations.rows, "itinerary_id");
  const daysBy = group(days.rows, "itinerary_id");
  const mealsBy = group(meals.rows, "day_id");
  const actsBy = group(activities.rows, "day_id");
  const notesBy = group(notes.rows, "itinerary_id");
  return rows.map((row) => {
    const id = str(row.id);
    const dayRows = daysBy.get(id) || [];
    const noteRows = notesBy.get(id) || [];
    return mapItinerary(row, {
      travelers: travelersBy.get(id) || [],
      flights: flightsBy.get(id) || [],
      accommodations: staysBy.get(id) || [],
      days: dayRows.map((day) => ({
        row: day,
        meals: (mealsBy.get(str(day.id)) || []).map((meal) => str(meal.meal)),
        activities: actsBy.get(str(day.id)) || []
      })),
      inclusions: noteRows.filter((n) => n.kind === "inclusion").map((n) => str(n.body)),
      exclusions: noteRows.filter((n) => n.kind === "exclusion").map((n) => str(n.body)),
      importantNotes: noteRows.filter((n) => n.kind === "note").map((n) => str(n.body))
    });
  });
}
function group(rows, key) {
  const map = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const id = str(row[key]);
    const list = map.get(id) || [];
    list.push(row);
    map.set(id, list);
  }
  return map;
}
async function listItineraries() {
  const db = requirePool();
  const { rows } = await db.query(`SELECT * FROM itineraries ORDER BY updated_at DESC`);
  return assemble2(rows);
}
async function getItinerary(id) {
  const db = requirePool();
  const { rows } = await db.query(
    `SELECT * FROM itineraries WHERE id = $1 OR pnr = $1 LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const [doc] = await assemble2(rows);
  return doc || null;
}
async function upsertItinerary(id, body) {
  const db = requirePool();
  const fare = body.fareBreakdown || {};
  const travelers = Array.isArray(body.travelers) ? body.travelers : [];
  const flights = Array.isArray(body.flights) ? body.flights : [];
  const stays = Array.isArray(body.accommodations) ? body.accommodations : [];
  const days = Array.isArray(body.days) ? body.days : [];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const cx = await db.connect();
  try {
    await cx.query("BEGIN");
    await cx.query(
      `INSERT INTO itineraries (
         id, pnr, title, destination, start_date, end_date, total_days, total_nights, status,
         total_price, currency, payment_status, payment_method, amount_paid, base_fare, taxes_and_fees,
         fuel_surcharge, service_fee, baggage_policy, check_in_policy, visa_policy, fare_policy,
         boarding_policy, agent_name, agent_phone, agent_email, emergency_phone, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,NOW())
       ON CONFLICT (id) DO UPDATE SET
         pnr = EXCLUDED.pnr,
         title = EXCLUDED.title,
         destination = EXCLUDED.destination,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         total_days = EXCLUDED.total_days,
         total_nights = EXCLUDED.total_nights,
         status = EXCLUDED.status,
         total_price = EXCLUDED.total_price,
         currency = EXCLUDED.currency,
         payment_status = EXCLUDED.payment_status,
         payment_method = EXCLUDED.payment_method,
         amount_paid = EXCLUDED.amount_paid,
         base_fare = EXCLUDED.base_fare,
         taxes_and_fees = EXCLUDED.taxes_and_fees,
         fuel_surcharge = EXCLUDED.fuel_surcharge,
         service_fee = EXCLUDED.service_fee,
         baggage_policy = EXCLUDED.baggage_policy,
         check_in_policy = EXCLUDED.check_in_policy,
         visa_policy = EXCLUDED.visa_policy,
         fare_policy = EXCLUDED.fare_policy,
         boarding_policy = EXCLUDED.boarding_policy,
         agent_name = EXCLUDED.agent_name,
         agent_phone = EXCLUDED.agent_phone,
         agent_email = EXCLUDED.agent_email,
         emergency_phone = EXCLUDED.emergency_phone,
         updated_at = NOW()`,
      [
        id,
        str(body.pnr) || null,
        str(body.title),
        str(body.destination),
        str(body.startDate) || null,
        str(body.endDate) || null,
        num(body.totalDays),
        num(body.totalNights),
        str(body.status, "draft"),
        num(body.totalPrice),
        str(body.currency, "RUB"),
        str(body.paymentStatus, "pending"),
        str(body.paymentMethod, "bank_card"),
        num(body.amountPaid),
        num(fare.baseFare),
        num(fare.taxesAndFees),
        num(fare.fuelSurcharge),
        num(fare.serviceFee),
        str(body.baggagePolicy),
        str(body.checkInPolicy),
        str(body.visaPolicy),
        str(body.farePolicy),
        str(body.boardingPolicy),
        str(body.agentName),
        str(body.agentPhone),
        str(body.agentEmail),
        str(body.emergencyPhone),
        str(body.createdAt, now)
      ]
    );
    await replaceChildren(cx, "travelers", "itinerary_id", id, travelers, (item, i) => [
      idOr(`${id}-pax`, item.id, i),
      id,
      str(item.name),
      str(item.type, "adult"),
      str(item.passportNumber),
      str(item.ticketNumber),
      str(item.seat),
      str(item.frequentFlyer),
      str(item.notes),
      i
    ], `(id, itinerary_id, full_name, passenger_type, passport_number, ticket_number, seat, frequent_flyer, notes, sort_order)`);
    await replaceChildren(cx, "flights", "itinerary_id", id, flights, (item, i) => [
      idOr(`${id}-flt`, item.id, i),
      id,
      str(item.airline),
      str(item.flightNumber),
      str(item.departureCity),
      str(item.departureAirport),
      str(item.arrivalCity),
      str(item.arrivalAirport),
      str(item.departureDate) || null,
      str(item.departureTime),
      str(item.arrivalDate) || null,
      str(item.arrivalTime),
      str(item.terminal),
      str(item.terminalArrival),
      str(item.gate),
      str(item.aircraft),
      str(item.cabinClass, "economy"),
      str(item.bookingRef),
      str(item.baggageAllowance),
      str(item.seat),
      str(item.duration),
      str(item.status),
      i
    ], `(id, itinerary_id, airline, flight_number, departure_city, departure_airport, arrival_city, arrival_airport, departure_date, departure_time, arrival_date, arrival_time, terminal, terminal_arrival, gate, aircraft, cabin_class, booking_ref, baggage_allowance, seat, duration, status, sort_order)`);
    await replaceChildren(cx, "accommodations", "itinerary_id", id, stays, (item, i) => [
      idOr(`${id}-stay`, item.id, i),
      id,
      str(item.hotelName),
      str(item.city),
      str(item.address),
      str(item.checkInDate) || null,
      str(item.checkOutDate) || null,
      str(item.roomType),
      str(item.mealPlan, "BB"),
      str(item.bookingRef),
      str(item.phone),
      item.stars == null || item.stars === "" ? null : num(item.stars),
      i
    ], `(id, itinerary_id, hotel_name, city, address, check_in_date, check_out_date, room_type, meal_plan, booking_ref, phone, stars, sort_order)`);
    await cx.query(
      `DELETE FROM itinerary_day_activities WHERE day_id IN (SELECT id FROM itinerary_days WHERE itinerary_id = $1)`,
      [id]
    );
    await cx.query(
      `DELETE FROM itinerary_day_meals WHERE day_id IN (SELECT id FROM itinerary_days WHERE itinerary_id = $1)`,
      [id]
    );
    await cx.query(`DELETE FROM itinerary_days WHERE itinerary_id = $1`, [id]);
    for (let i = 0; i < days.length; i++) {
      const day = days[i] || {};
      const dayId = idOr(`${id}-day`, day.id, i);
      await cx.query(
        `INSERT INTO itinerary_days (id, itinerary_id, day_number, day_date, title, description, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [dayId, id, num(day.dayNumber, i + 1), str(day.date) || null, str(day.title), str(day.description), i]
      );
      const meals = Array.isArray(day.mealsIncluded) ? day.mealsIncluded : [];
      for (let m = 0; m < meals.length; m++) {
        await cx.query(
          `INSERT INTO itinerary_day_meals (id, day_id, meal, sort_order) VALUES ($1,$2,$3,$4)`,
          [`${dayId}-meal-${m}`, dayId, str(meals[m]), m]
        );
      }
      const activities = Array.isArray(day.activities) ? day.activities : [];
      for (let a = 0; a < activities.length; a++) {
        const act = activities[a] || {};
        await cx.query(
          `INSERT INTO itinerary_day_activities (
             id, day_id, activity_time, title, location, description, category, is_included, sort_order
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            idOr(`${dayId}-act`, act.id, a),
            dayId,
            str(act.time),
            str(act.title),
            str(act.location),
            str(act.description),
            str(act.category, "event"),
            bool(act.isIncluded, true),
            a
          ]
        );
      }
    }
    await cx.query(`DELETE FROM itinerary_notes WHERE itinerary_id = $1`, [id]);
    await insertNotes(cx, id, "inclusion", Array.isArray(body.inclusions) ? body.inclusions : []);
    await insertNotes(cx, id, "exclusion", Array.isArray(body.exclusions) ? body.exclusions : []);
    await insertNotes(cx, id, "note", Array.isArray(body.importantNotes) ? body.importantNotes : []);
    await cx.query("COMMIT");
  } catch (err) {
    await cx.query("ROLLBACK");
    throw err;
  } finally {
    cx.release();
  }
  return getItinerary(id);
}
async function insertNotes(cx, itineraryId, kind, values) {
  for (let i = 0; i < values.length; i++) {
    await cx.query(
      `INSERT INTO itinerary_notes (id, itinerary_id, kind, body, sort_order) VALUES ($1,$2,$3,$4,$5)`,
      [`${itineraryId}-${kind}-${i}`, itineraryId, kind, str(values[i]), i]
    );
  }
}
async function replaceChildren(cx, table, fk, parentId, rows, values, columns) {
  await cx.query(`DELETE FROM ${table} WHERE ${fk} = $1`, [parentId]);
  for (let i = 0; i < rows.length; i++) {
    const item = rows[i] || {};
    const vals = values(item, i);
    const placeholders = vals.map((_, idx) => `$${idx + 1}`).join(",");
    await cx.query(`INSERT INTO ${table} ${columns} VALUES (${placeholders})`, vals);
  }
}
async function deleteItinerary(id) {
  const db = requirePool();
  const result = await db.query(`DELETE FROM itineraries WHERE id = $1 OR pnr = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
var init_itinerariesRepo = __esm({
  "server/itinerariesRepo.ts"() {
    init_db();
    init_coerce();
  }
});

// server/vercel-entry.ts
var vercel_entry_exports = {};
__export(vercel_entry_exports, {
  default: () => handler
});
module.exports = __toCommonJS(vercel_entry_exports);

// server/app.ts
var import_config2 = require("dotenv/config");
var import_express = __toESM(require("express"));
init_db();

// server/cors.ts
var import_cors = __toESM(require("cors"));
function listedOrigins() {
  const joined = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173"
  ].filter(Boolean).join(",");
  return joined.split(",").map((value) => value.trim().replace(/\/$/, "")).filter(Boolean);
}
function isOriginAllowed(origin) {
  if (!origin) return true;
  const allow = listedOrigins();
  if (allow.includes("*")) return true;
  if (allow.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }
  return false;
}
var corsMiddleware = (0, import_cors.default)({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, origin || true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"],
  maxAge: 86400,
  optionsSuccessStatus: 204
});

// server/app.ts
init_receiptsRepo();
init_itinerariesRepo();

// server/supabaseAuth.ts
var import_supabase_js = require("@supabase/supabase-js");
function supabaseUrl() {
  return String(process.env.SUPABASE_URL || "").replace(/\/$/, "").trim();
}
function supabaseAnonKey() {
  return String(process.env.SUPABASE_ANON_KEY || "").trim();
}
function deskOperators() {
  return String(process.env.DESK_OPERATORS || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
}
function authConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey() && deskOperators().length > 0);
}
function isDeskOperator(email) {
  if (!email) return false;
  return deskOperators().includes(email.trim().toLowerCase());
}
function createAnonClient() {
  if (!authConfigured()) {
    throw new Error("Supabase Auth is not configured");
  }
  return (0, import_supabase_js.createClient)(supabaseUrl(), supabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

// server/auth.ts
var ACCESS_COOKIE = "desk_access";
var REFRESH_COOKIE = "desk_refresh";
var ACCESS_MAX_AGE = 60 * 60;
var REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
var LOGIN_WINDOW_MS = 15 * 60 * 1e3;
var LOGIN_MAX = 8;
var loginHits = /* @__PURE__ */ new Map();
function parseCookies(header) {
  const out = {};
  for (const part of String(header || "").split(";")) {
    const idx = part.indexOf("=");
    if (idx < 1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}
function cookieParts(req, name, value, maxAge) {
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "http").split(",")[0].trim();
  const secure = proto === "https";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
function setAuthCookies(req, res, accessToken, refreshToken) {
  res.setHeader("Set-Cookie", [
    cookieParts(req, ACCESS_COOKIE, accessToken, ACCESS_MAX_AGE),
    cookieParts(req, REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE)
  ]);
}
function clearAuthCookies(req, res) {
  res.setHeader("Set-Cookie", [
    cookieParts(req, ACCESS_COOKIE, "", 0),
    cookieParts(req, REFRESH_COOKIE, "", 0)
  ]);
}
function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}
function loginAllowed(ip) {
  const now = Date.now();
  const row = loginHits.get(ip);
  if (!row || row.reset < now) {
    loginHits.set(ip, { n: 1, reset: now + LOGIN_WINDOW_MS });
    return true;
  }
  if (row.n >= LOGIN_MAX) return false;
  row.n += 1;
  return true;
}
async function resolveOperator(req, res) {
  if (!authConfigured()) return null;
  const cookies = parseCookies(req.headers.cookie);
  let access = cookies[ACCESS_COOKIE] || "";
  const refresh = cookies[REFRESH_COOKIE] || "";
  if (!access && !refresh) return null;
  const supabase = createAnonClient();
  const tryUser = async (token) => {
    const { data: data2, error: error2 } = await supabase.auth.getUser(token);
    if (error2 || !data2.user?.email) return null;
    if (!isDeskOperator(data2.user.email)) return null;
    return data2.user.email;
  };
  if (access) {
    const email = await tryUser(access);
    if (email) return email;
  }
  if (!refresh) return null;
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refresh });
  if (error || !data.session?.access_token || !data.user?.email) return null;
  if (!isDeskOperator(data.user.email)) return null;
  setAuthCookies(req, res, data.session.access_token, data.session.refresh_token);
  return data.user.email;
}
async function requireAuth(req, res, next) {
  if (!authConfigured()) {
    return res.status(503).json({ error: "Desk lock is not configured on the server." });
  }
  const machine = process.env.API_KEY?.trim();
  if (machine && req.header("x-api-key") === machine) {
    return next();
  }
  const email = await resolveOperator(req, res);
  if (!email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
async function handleLogin(req, res) {
  if (!authConfigured()) {
    return res.status(503).json({ error: "Desk lock is not configured on the server." });
  }
  const ip = clientIp(req);
  if (!loginAllowed(ip)) {
    return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
  }
  const email = String(req.body?.email || req.body?.username || "").trim().toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user?.email) {
    console.error("[auth] sign-in failed", error?.message || "no session");
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (!isDeskOperator(data.user.email)) {
    return res.status(403).json({ error: "This account is not on DESK_OPERATORS" });
  }
  setAuthCookies(req, res, data.session.access_token, data.session.refresh_token);
  return res.json({ ok: true, user: data.user.email });
}
async function handleLogout(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const access = cookies[ACCESS_COOKIE];
  const refresh = cookies[REFRESH_COOKIE];
  if (access && refresh && authConfigured()) {
    try {
      const supabase = createAnonClient();
      await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
      await supabase.auth.signOut();
    } catch {
    }
  }
  clearAuthCookies(req, res);
  return res.json({ ok: true });
}
async function handleMe(req, res) {
  if (!authConfigured()) {
    return res.status(503).json({ error: "Desk lock is not configured on the server." });
  }
  const email = await resolveOperator(req, res);
  if (!email) return res.status(401).json({ error: "Unauthorized" });
  return res.json({ ok: true, user: email });
}

// server/app.ts
var apiRouter = (0, import_express.Router)();
function pingDb() {
  if (!pool) {
    const err = new Error("DATABASE_URL is not set");
    err.status = 503;
    throw err;
  }
  return pool.query("SELECT 1");
}
apiRouter.use((req, res, next) => {
  if (req.path === "/health" || req.path.startsWith("/public/")) return next();
  if (req.path === "/auth/login" || req.path === "/auth/logout" || req.path === "/auth/me") return next();
  void requireAuth(req, res, next).catch(next);
});
apiRouter.post("/auth/login", (req, res, next) => {
  void handleLogin(req, res).catch(next);
});
apiRouter.post("/auth/logout", (req, res, next) => {
  void handleLogout(req, res).catch(next);
});
apiRouter.get("/auth/me", (req, res, next) => {
  void handleMe(req, res).catch(next);
});
apiRouter.get("/health", async (_req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, database: "missing", error: "DATABASE_URL is not set" });
  }
  try {
    await pingDb();
    return res.json({ ok: true, database: "connected" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return res.status(503).json({ ok: false, database: "error", error: message });
  }
});
function sendError(res, err) {
  const status = typeof err === "object" && err && "status" in err ? Number(err.status) : 500;
  const message = err instanceof Error ? err.message : "Server error";
  res.status(status || 500).json({ error: message });
}
apiRouter.get("/receipts", async (_req, res) => {
  try {
    res.json(await listReceipts());
  } catch (err) {
    sendError(res, err);
  }
});
apiRouter.put("/receipts/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!id) return res.status(400).json({ error: "Missing id" });
    res.json(await upsertReceipt(id, req.body || {}));
  } catch (err) {
    sendError(res, err);
  }
});
apiRouter.delete("/receipts/:id", async (req, res) => {
  try {
    const ok = await deleteReceipt(String(req.params.id));
    res.status(ok ? 204 : 404).end();
  } catch (err) {
    sendError(res, err);
  }
});
apiRouter.get("/itineraries", async (_req, res) => {
  try {
    res.json(await listItineraries());
  } catch (err) {
    sendError(res, err);
  }
});
apiRouter.put("/itineraries/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!id) return res.status(400).json({ error: "Missing id" });
    res.json(await upsertItinerary(id, req.body || {}));
  } catch (err) {
    sendError(res, err);
  }
});
apiRouter.delete("/itineraries/:id", async (req, res) => {
  try {
    const ok = await deleteItinerary(String(req.params.id));
    res.status(ok ? 204 : 404).end();
  } catch (err) {
    sendError(res, err);
  }
});
apiRouter.get("/public/receipts/:id", async (req, res) => {
  try {
    const doc = await getReceipt(String(req.params.id));
    if (!doc) return res.status(404).json({ ok: false, error: "Receipt not found" });
    res.json({ ok: true, type: "receipt", document: doc });
  } catch (err) {
    sendError(res, err);
  }
});
apiRouter.get("/public/itineraries/:id", async (req, res) => {
  try {
    const doc = await getItinerary(String(req.params.id));
    if (!doc) return res.status(404).json({ ok: false, error: "Ticket not found" });
    res.json({ ok: true, type: "itinerary", document: doc });
  } catch (err) {
    sendError(res, err);
  }
});
function createApiExpress() {
  const app2 = (0, import_express.default)();
  app2.disable("x-powered-by");
  app2.set("trust proxy", 1);
  app2.use(corsMiddleware);
  app2.options("*", corsMiddleware);
  app2.use((req, _res, next) => {
    const body = req.body;
    if (Buffer.isBuffer(body)) {
      try {
        req.body = JSON.parse(body.toString("utf8"));
      } catch {
        req.body = {};
      }
      req._body = true;
    } else if (typeof body === "string" && body.trim()) {
      try {
        req.body = JSON.parse(body);
      } catch {
        req.body = {};
      }
      req._body = true;
    } else if (body && typeof body === "object") {
      req._body = true;
    }
    next();
  });
  app2.use(import_express.default.json({ limit: "2mb" }));
  app2.use("/api", apiRouter);
  app2.use(apiRouter);
  app2.use((err, _req, res, _next) => {
    sendError(res, err);
  });
  return app2;
}

// server/vercel-entry.ts
var app = createApiExpress();
function handler(req, res) {
  return app(req, res);
}
