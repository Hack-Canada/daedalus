import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

declare global {
  var _pool: Pool | undefined;
  var _db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

const pool =
  globalThis._pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

export const db = globalThis._db ?? drizzle({ client: pool, schema: schema });

if (process.env.NODE_ENV !== "production") {
  globalThis._pool = pool;
  globalThis._db = db;
}
