import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import ws from "ws";

const { Pool: PgPool } = pkg;
import * as schema from "@shared/schema";

// Configure database based on environment
const isProduction = process.env.NODE_ENV === 'production';
const hasExternalDb = process.env.DATABASE_URL && 
  (process.env.DATABASE_URL.includes('neon') || 
   process.env.DATABASE_URL.includes('supabase') ||
   process.env.DATABASE_URL.includes('planetscale'));

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>;

if (isProduction && hasExternalDb) {
  // Production with external database (Neon, Supabase, etc.)
  console.log('Using external database for production');
  neonConfig.webSocketConstructor = ws;
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Development with Replit database
  console.log('Using Replit database for development');
  
  // Use Replit's DATABASE_URL or fallback to local
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/autojobr';
  
  const pool = new PgPool({ 
    connectionString: databaseUrl,
    ssl: false, // Disable SSL for Replit database
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  // Handle connection events
  pool.on('connect', () => {
    console.log('Database connected successfully');
  });
  
  pool.on('error', (err) => {
    console.error('Database connection error:', err.message);
  });
  
  db = drizzlePg(pool, { schema });
}

export { db };