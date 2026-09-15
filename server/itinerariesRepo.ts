import type { PoolClient } from 'pg';
import { requirePool } from './db.ts';
import { bool, dateStr, idOr, iso, num, str } from './coerce.ts';

type Body = Record<string, unknown>;

function mapItinerary(
  row: Record<string, unknown>,
  extras: {
    travelers: Record<string, unknown>[];
    flights: Record<string, unknown>[];
    accommodations: Record<string, unknown>[];
    days: {
      row: Record<string, unknown>;
      meals: string[];
      activities: Record<string, unknown>[];
    }[];
    inclusions: string[];
    exclusions: string[];
    importantNotes: string[];
  }
) {
  return {
    id: str(row.id),
    pnr: str(row.pnr) || undefined,
    title: str(row.title),
    destination: str(row.destination),
    startDate: dateStr(row.start_date),
    endDate: dateStr(row.end_date),
    totalDays: num(row.total_days),
    totalNights: num(row.total_nights),
    status: str(row.status, 'draft'),
    travelers: extras.travelers.map((t) => ({
      id: str(t.id),
      name: str(t.full_name),
      type: str(t.passenger_type, 'adult'),
      passportNumber: str(t.passport_number) || undefined,
      ticketNumber: str(t.ticket_number) || undefined,
      seat: str(t.seat) || undefined,
      frequentFlyer: str(t.frequent_flyer) || undefined,
      notes: str(t.notes) || undefined,
    })),
    flights: extras.flights.map((f) => ({
      id: str(f.id),
      airline: str(f.airline),
      flightNumber: str(f.flight_number),
      departureCity: str(f.departure_city),
      departureAirport: str(f.departure_airport) || undefined,
      arrivalCity: str(f.arrival_city),
      arrivalAirport: str(f.arrival_airport) || undefined,
      departureDate: dateStr(f.departure_date),
      departureTime: str(f.departure_time),
      arrivalDate: dateStr(f.arrival_date),
      arrivalTime: str(f.arrival_time),
      terminal: str(f.terminal) || undefined,
      terminalArrival: str(f.terminal_arrival) || undefined,
      gate: str(f.gate) || undefined,
      aircraft: str(f.aircraft) || undefined,
      cabinClass: str(f.cabin_class, 'economy'),
      bookingRef: str(f.booking_ref) || undefined,
      baggageAllowance: str(f.baggage_allowance) || undefined,
      seat: str(f.seat) || undefined,
      duration: str(f.duration) || undefined,
      status: str(f.status) || undefined,
    })),
    accommodations: extras.accommodations.map((a) => ({
      id: str(a.id),
      hotelName: str(a.hotel_name),
      city: str(a.city),
      address: str(a.address) || undefined,
      checkInDate: dateStr(a.check_in_date),
      checkOutDate: dateStr(a.check_out_date),
      roomType: str(a.room_type),
      mealPlan: str(a.meal_plan, 'BB'),
      bookingRef: str(a.booking_ref) || undefined,
      phone: str(a.phone) || undefined,
      stars: a.stars == null ? undefined : num(a.stars),
    })),
    days: extras.days.map((day) => ({
      id: str(day.row.id),
      dayNumber: num(day.row.day_number, 1),
      date: dateStr(day.row.day_date),
      title: str(day.row.title),
      description: str(day.row.description) || undefined,
      mealsIncluded: day.meals,
      activities: day.activities.map((act) => ({
        id: str(act.id),
        time: str(act.activity_time),
        title: str(act.title),
        location: str(act.location) || undefined,
        description: str(act.description),
        category: str(act.category, 'event'),
        isIncluded: bool(act.is_included, true),
      })),
    })),
    inclusions: extras.inclusions,
    exclusions: extras.exclusions,
    importantNotes: extras.importantNotes,
    totalPrice: num(row.total_price),
    currency: str(row.currency, 'RUB'),
    paymentStatus: str(row.payment_status, 'pending'),
    amountPaid: num(row.amount_paid),
    fareBreakdown: {
      baseFare: num(row.base_fare),
      taxesAndFees: num(row.taxes_and_fees),
      fuelSurcharge: num(row.fuel_surcharge),
      serviceFee: num(row.service_fee),
    },
    baggagePolicy: str(row.baggage_policy) || undefined,
    checkInPolicy: str(row.check_in_policy) || undefined,
    agentName: str(row.agent_name),
    agentPhone: str(row.agent_phone),
    agentEmail: str(row.agent_email),
    emergencyPhone: str(row.emergency_phone),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

async function assemble(client: PoolClient, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => str(row.id));

  const [travelers, flights, accommodations, days, meals, activities, notes] = await Promise.all([
    client.query(`SELECT * FROM travelers WHERE itinerary_id = ANY($1::text[]) ORDER BY sort_order ASC`, [ids]),
    client.query(`SELECT * FROM flights WHERE itinerary_id = ANY($1::text[]) ORDER BY sort_order ASC`, [ids]),
    client.query(`SELECT * FROM accommodations WHERE itinerary_id = ANY($1::text[]) ORDER BY sort_order ASC`, [ids]),
    client.query(`SELECT * FROM itinerary_days WHERE itinerary_id = ANY($1::text[]) ORDER BY sort_order ASC, day_number ASC`, [ids]),
    client.query(
      `SELECT m.* FROM itinerary_day_meals m
       JOIN itinerary_days d ON d.id = m.day_id
       WHERE d.itinerary_id = ANY($1::text[])
       ORDER BY m.sort_order ASC`,
      [ids]
    ),
    client.query(
      `SELECT a.* FROM itinerary_day_activities a
       JOIN itinerary_days d ON d.id = a.day_id
       WHERE d.itinerary_id = ANY($1::text[])
       ORDER BY a.sort_order ASC`,
      [ids]
    ),
    client.query(
      `SELECT * FROM itinerary_notes WHERE itinerary_id = ANY($1::text[]) ORDER BY kind ASC, sort_order ASC`,
      [ids]
    ),
  ]);

  const travelersBy = group(travelers.rows, 'itinerary_id');
  const flightsBy = group(flights.rows, 'itinerary_id');
  const staysBy = group(accommodations.rows, 'itinerary_id');
  const daysBy = group(days.rows, 'itinerary_id');
  const mealsBy = group(meals.rows, 'day_id');
  const actsBy = group(activities.rows, 'day_id');
  const notesBy = group(notes.rows, 'itinerary_id');

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
        activities: actsBy.get(str(day.id)) || [],
      })),
      inclusions: noteRows.filter((n) => n.kind === 'inclusion').map((n) => str(n.body)),
      exclusions: noteRows.filter((n) => n.kind === 'exclusion').map((n) => str(n.body)),
      importantNotes: noteRows.filter((n) => n.kind === 'note').map((n) => str(n.body)),
    });
  });
}

function group(rows: Record<string, unknown>[], key: string) {
  const map = new Map<string, Record<string, unknown>[]>();
  for (const row of rows) {
    const id = str(row[key]);
    const list = map.get(id) || [];
    list.push(row);
    map.set(id, list);
  }
  return map;
}

export async function listItineraries() {
  const db = requirePool();
  const { rows } = await db.query(`SELECT * FROM itineraries ORDER BY updated_at DESC`);
  const client = await db.connect();
  try {
    return await assemble(client, rows);
  } finally {
    client.release();
  }
}

export async function getItinerary(id: string) {
  const db = requirePool();
  const { rows } = await db.query(
    `SELECT * FROM itineraries WHERE id = $1 OR pnr = $1 LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const client = await db.connect();
  try {
    const [doc] = await assemble(client, rows);
    return doc || null;
  } finally {
    client.release();
  }
}

export async function upsertItinerary(id: string, body: Body) {
  const db = requirePool();
  const fare = (body.fareBreakdown || {}) as Body;
  const travelers = Array.isArray(body.travelers) ? body.travelers : [];
  const flights = Array.isArray(body.flights) ? body.flights : [];
  const stays = Array.isArray(body.accommodations) ? body.accommodations : [];
  const days = Array.isArray(body.days) ? body.days : [];
  const now = new Date().toISOString();
  const cx = await db.connect();

  try {
    await cx.query('BEGIN');
    await cx.query(
      `INSERT INTO itineraries (
         id, pnr, title, destination, start_date, end_date, total_days, total_nights, status,
         total_price, currency, payment_status, amount_paid, base_fare, taxes_and_fees,
         fuel_surcharge, service_fee, baggage_policy, check_in_policy, agent_name, agent_phone,
         agent_email, emergency_phone, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW())
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
         amount_paid = EXCLUDED.amount_paid,
         base_fare = EXCLUDED.base_fare,
         taxes_and_fees = EXCLUDED.taxes_and_fees,
         fuel_surcharge = EXCLUDED.fuel_surcharge,
         service_fee = EXCLUDED.service_fee,
         baggage_policy = EXCLUDED.baggage_policy,
         check_in_policy = EXCLUDED.check_in_policy,
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
        str(body.status, 'draft'),
        num(body.totalPrice),
        str(body.currency, 'RUB'),
        str(body.paymentStatus, 'pending'),
        num(body.amountPaid),
        num(fare.baseFare),
        num(fare.taxesAndFees),
        num(fare.fuelSurcharge),
        num(fare.serviceFee),
        str(body.baggagePolicy),
        str(body.checkInPolicy),
        str(body.agentName),
        str(body.agentPhone),
        str(body.agentEmail),
        str(body.emergencyPhone),
        str(body.createdAt, now),
      ]
    );

    await replaceChildren(cx, 'travelers', 'itinerary_id', id, travelers, (item, i) => [
      idOr(`${id}-pax`, item.id, i),
      id,
      str(item.name),
      str(item.type, 'adult'),
      str(item.passportNumber),
      str(item.ticketNumber),
      str(item.seat),
      str(item.frequentFlyer),
      str(item.notes),
      i,
    ], `(id, itinerary_id, full_name, passenger_type, passport_number, ticket_number, seat, frequent_flyer, notes, sort_order)`);

    await replaceChildren(cx, 'flights', 'itinerary_id', id, flights, (item, i) => [
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
      str(item.cabinClass, 'economy'),
      str(item.bookingRef),
      str(item.baggageAllowance),
      str(item.seat),
      str(item.duration),
      str(item.status),
      i,
    ], `(id, itinerary_id, airline, flight_number, departure_city, departure_airport, arrival_city, arrival_airport, departure_date, departure_time, arrival_date, arrival_time, terminal, terminal_arrival, gate, aircraft, cabin_class, booking_ref, baggage_allowance, seat, duration, status, sort_order)`);

    await replaceChildren(cx, 'accommodations', 'itinerary_id', id, stays, (item, i) => [
      idOr(`${id}-stay`, item.id, i),
      id,
      str(item.hotelName),
      str(item.city),
      str(item.address),
      str(item.checkInDate) || null,
      str(item.checkOutDate) || null,
      str(item.roomType),
      str(item.mealPlan, 'BB'),
      str(item.bookingRef),
      str(item.phone),
      item.stars == null || item.stars === '' ? null : num(item.stars),
      i,
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
      const day = (days[i] || {}) as Body;
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
        const act = (activities[a] || {}) as Body;
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
            str(act.category, 'event'),
            bool(act.isIncluded, true),
            a,
          ]
        );
      }
    }

    await cx.query(`DELETE FROM itinerary_notes WHERE itinerary_id = $1`, [id]);
    await insertNotes(cx, id, 'inclusion', Array.isArray(body.inclusions) ? body.inclusions : []);
    await insertNotes(cx, id, 'exclusion', Array.isArray(body.exclusions) ? body.exclusions : []);
    await insertNotes(cx, id, 'note', Array.isArray(body.importantNotes) ? body.importantNotes : []);

    await cx.query('COMMIT');
  } catch (err) {
    await cx.query('ROLLBACK');
    throw err;
  } finally {
    cx.release();
  }

  return getItinerary(id);
}

async function insertNotes(cx: PoolClient, itineraryId: string, kind: string, values: unknown[]) {
  for (let i = 0; i < values.length; i++) {
    await cx.query(
      `INSERT INTO itinerary_notes (id, itinerary_id, kind, body, sort_order) VALUES ($1,$2,$3,$4,$5)`,
      [`${itineraryId}-${kind}-${i}`, itineraryId, kind, str(values[i]), i]
    );
  }
}

async function replaceChildren(
  cx: PoolClient,
  table: string,
  fk: string,
  parentId: string,
  rows: unknown[],
  values: (item: Body, index: number) => unknown[],
  columns: string
) {
  await cx.query(`DELETE FROM ${table} WHERE ${fk} = $1`, [parentId]);
  for (let i = 0; i < rows.length; i++) {
    const item = (rows[i] || {}) as Body;
    const vals = values(item, i);
    const placeholders = vals.map((_, idx) => `$${idx + 1}`).join(',');
    await cx.query(`INSERT INTO ${table} ${columns} VALUES (${placeholders})`, vals);
  }
}

export async function deleteItinerary(id: string) {
  const db = requirePool();
  const result = await db.query(`DELETE FROM itineraries WHERE id = $1 OR pnr = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
