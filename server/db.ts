import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure for Neon compatibility
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Please add it to your .env file.");
  console.error("Example: DATABASE_URL=postgresql://username:password@host:port/database");
  process.exit(1);
}

// Enhanced connection configuration
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export { pool };
export const db = drizzle({ client: pool, schema });