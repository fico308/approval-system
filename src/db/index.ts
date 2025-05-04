import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Don't use HTTP Keep-Alive for Vercel Serverless Functions
neonConfig.fetchConnectionCache = false;

let db: Pool;

if (process.env.NODE_ENV === 'production') {
  // In production, use Neon's serverless driver
  const sql = neon(process.env.DATABASE_URL!);
  db = {
    query: (text: string, params?: any[]) => sql(text, params)
  } as Pool;
} else {
  // In development, use a regular Pool for better local debugging
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export { db };