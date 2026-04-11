// core/db.ts
// ─────────────────────────────────────────────
// Replit PostgreSQL client
// Replit auto-injects DATABASE_URL into env
// when you enable PostgreSQL in your Repl
// ─────────────────────────────────────────────

import { Pool, PoolClient, QueryResult } from "pg";

// Replit injects this automatically — no manual config needed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
  max:             10,   // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

// ─────────────────────────────────────────────
// Core query helpers
// ─────────────────────────────────────────────

/** Run a single parameterized query */
export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result: QueryResult<T> = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/** Run a query expecting exactly one row (throws if none) */
export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Run multiple queries in a single transaction */
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Health check */
export async function dbPing(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export { pool };
