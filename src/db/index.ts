import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config/env";

const pool = new Pool({
  connectionString: env.DATABASE_CONNECTION,
  // ssl: true, <- use this external dbs (eg neon) in prod.
})

export const db = drizzle(pool);