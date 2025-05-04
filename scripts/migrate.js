const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const schema = fs.readFileSync(
      path.join(__dirname, '../src/db/schema.sql'),
      'utf8'
    );
    
    await pool.query(schema);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();