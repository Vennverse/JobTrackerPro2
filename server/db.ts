import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import ws from "ws";

const { Pool: PgPool } = pkg;
import * as schema from "@shared/schema";

// Configure database based on environment
const isProduction = process.env.NODE_ENV === 'production';
const hasReplitDb = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');
const hasExternalDb = process.env.DATABASE_URL && 
  (process.env.DATABASE_URL.includes('neon') || 
   process.env.DATABASE_URL.includes('supabase') ||
   process.env.DATABASE_URL.includes('planetscale'));

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>;

if ((isProduction && hasExternalDb) || (hasReplitDb && process.env.DATABASE_URL?.includes('neon'))) {
  // Production with external database (Neon, Supabase, etc.)
  console.log('Using external database for production');
  neonConfig.webSocketConstructor = ws;
  
  // Decode the DATABASE_URL if it's URL-encoded
  let connectionString = process.env.DATABASE_URL;
  if (connectionString?.includes('%')) {
    connectionString = decodeURIComponent(connectionString);
  }
  
  const pool = new Pool({ connectionString });
  db = drizzle({ client: pool, schema });
} else if (hasReplitDb) {
  // Replit database (PostgreSQL)
  console.log('Using Replit PostgreSQL database');
  
  const pool = new PgPool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: false, // Disable SSL for Replit database
    max: 50, // Increased pool size for better concurrent handling
    min: 5,  // Maintain minimum connections
    idleTimeoutMillis: 60000, // Keep connections alive longer
    connectionTimeoutMillis: 5000, // Faster timeout for failed connections
  });
  
  // Handle connection events
  pool.on('connect', () => {
    console.log('Database connected successfully');
  });
  
  pool.on('error', (err) => {
    console.error('Database connection error:', err.message);
  });
  
  db = drizzlePg(pool, { schema });
} else {
  // Fallback to local development
  console.log('Using local database for development');
  
  const pool = new PgPool({ 
    connectionString: 'postgresql://localhost:5432/autojobr',
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  db = drizzlePg(pool, { schema });
}

export { db };