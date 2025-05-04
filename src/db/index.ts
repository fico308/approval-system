import { neon, neonConfig } from "@neondatabase/serverless";
import { Pool } from "pg";

// Don't use HTTP Keep-Alive for Vercel Serverless Functions
neonConfig.fetchConnectionCache = false;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { db };
