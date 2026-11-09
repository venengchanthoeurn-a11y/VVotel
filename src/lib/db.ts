import { Pool, PoolClient } from "pg";
import fs from "fs";
import path from "path";
import { BookingRecord } from "./bookings";

declare global {
  var _vvotelPgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

let pool: Pool | null = null;

if (connectionString) {
  if (!globalThis._vvotelPgPool) {
    globalThis._vvotelPgPool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3500,
    });

    globalThis._vvotelPgPool.on("error", (err) => {
      console.warn("PostgreSQL Pool Idle Client Error:", err.message);
    });
  }
  pool = globalThis._vvotelPgPool;
}

export function isPostgresConfigured(): boolean {
  return Boolean(connectionString);
}

export async function checkPostgresHealth(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  if (!pool) {
    return { connected: false, latencyMs: 0, error: "DATABASE_URL not configured" };
  }
  const start = Date.now();
  try {
    const res = await pool.query("SELECT NOW() as current_time;");
    return { connected: Boolean(res.rows[0]), latencyMs: Date.now() - start };
  } catch (err: any) {
    return { connected: false, latencyMs: Date.now() - start, error: err.message };
  }
}

/**
 * Execute an isolated ACID transaction with automatic COMMIT and ROLLBACK
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  if (!pool) {
    throw new Error("POSTGRES_UNAVAILABLE: Cannot execute transaction without DATABASE_URL.");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN;");
    const result = await callback(client);
    await client.query("COMMIT;");
    return result;
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Atomic Inventory Allocation using Row-Level Locking (SELECT ... FOR UPDATE)
 */
export async function allocateInventoryPostgres(
  client: PoolClient,
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
  roomCount: number
): Promise<boolean> {
  // 1. Lock the inventory rows for the stay dates to serialize concurrent writes
  const lockQuery = `
    SELECT stay_date, total_capacity, allocated_count
    FROM room_inventory
    WHERE room_type_id = $1 AND stay_date >= $2 AND stay_date < $3
    FOR UPDATE;
  `;
  const res = await client.query(lockQuery, [roomTypeId, checkIn, checkOut]);

  // Check capacity across every night in stay duration
  for (const row of res.rows) {
    if (row.allocated_count + roomCount > row.total_capacity) {
      return false; // Overcapacity on this date
    }
  }

  // 2. Increment allocated count atomically
  const updateQuery = `
    UPDATE room_inventory
    SET allocated_count = allocated_count + $1
    WHERE room_type_id = $2 AND stay_date >= $3 AND stay_date < $4;
  `;
  await client.query(updateQuery, [roomCount, roomTypeId, checkIn, checkOut]);
  return true;
}

/**
 * Insert new booking record in PostgreSQL
 */
export async function saveBookingPostgres(
  client: PoolClient,
  booking: BookingRecord
): Promise<void> {
  const query = `
    INSERT INTO bookings (
      id, booking_reference, booking_category, guest_name, email, phone,
      room_type_id, room_count, room_number, check_in, check_out, nights,
      adults, children, include_breakfast, base_rate_cents, breakfast_cents,
      discount_cents, total_amount_cents, total_amount_usd, total_amount_khr,
      stay_status, payment_status, payment_method, transaction_id,
      signature_hmac, price_snapshot, special_requests, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
    )
    ON CONFLICT (id) DO UPDATE SET
      stay_status = EXCLUDED.stay_status,
      payment_status = EXCLUDED.payment_status,
      room_number = EXCLUDED.room_number,
      updated_at = NOW();
  `;

  const cents = Math.round(booking.totalAmountUSD * 100);
  const baseCents = Math.round(booking.basePrice * 100);
  const breakfastCents = Math.round((booking.breakfastCost || 0) * 100);
  const discountCents = Math.round((booking.discount || 0) * 100);

  await client.query(query, [
    booking.id,
    booking.id,
    booking.bookingCategory || "ROOM",
    booking.guestName,
    booking.email,
    booking.phone,
    booking.roomType,
    booking.roomCount,
    booking.roomNumber,
    booking.checkIn,
    booking.checkOut,
    booking.nights,
    booking.adults,
    booking.children || 0,
    booking.includeBreakfast,
    baseCents,
    breakfastCents,
    discountCents,
    cents,
    booking.totalAmountUSD,
    booking.totalAmountKHR,
    booking.stayStatus,
    booking.paymentStatus,
    booking.paymentMethod,
    booking.transactionId,
    booking.signatureHMAC,
    JSON.stringify(booking.priceSnapshot || {}),
    booking.specialRequests || "",
    booking.createdAt || new Date().toISOString(),
  ]);

  // Insert payment transaction record with unique transaction hash
  if (booking.transactionId) {
    const txnQuery = `
      INSERT INTO payment_transactions (
        id, booking_id, provider, transaction_hash, amount_cents, currency, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (transaction_hash) DO NOTHING;
    `;
    await client.query(txnQuery, [
      `TXN-${booking.id}`,
      booking.id,
      booking.paymentMethod,
      booking.transactionId,
      cents,
      "USD",
      booking.paymentStatus,
    ]);
  }
}

/**
 * Execute Schema Migration DDL against connected PostgreSQL instance
 */
export async function runDatabaseMigrations(): Promise<{ success: boolean; appliedStatements: number; error?: string }> {
  if (!pool) {
    return { success: false, appliedStatements: 0, error: "DATABASE_URL not configured" };
  }

  const schemaPath = path.join(process.cwd(), "src", "lib", "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    return { success: false, appliedStatements: 0, error: "schema.sql file not found" };
  }

  const sqlContent = fs.readFileSync(schemaPath, "utf-8");
  const statements = sqlContent
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const client = await pool.connect();
  let applied = 0;
  try {
    await client.query("BEGIN;");
    for (const stmt of statements) {
      await client.query(stmt);
      applied++;
    }
    await client.query("COMMIT;");
    return { success: true, appliedStatements: applied };
  } catch (err: any) {
    await client.query("ROLLBACK;");
    return { success: false, appliedStatements: applied, error: err.message };
  } finally {
    client.release();
  }
}
