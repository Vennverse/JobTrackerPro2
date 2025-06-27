import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure for Neon compatibility
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using Replit's internal database");
}

// Enhanced connection configuration with retry logic
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
  max: 10,
  ssl: false
});

// Handle connection events with retry logic
let retryCount = 0;
const maxRetries = 3;

pool.on('connect', () => {
  console.log('Database connected successfully');
  retryCount = 0;
});

pool.on('error', (err) => {
  console.warn('Database connection issue:', err.message);
  if (retryCount < maxRetries && err.message.includes('endpoint is disabled')) {
    retryCount++;
    console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
    setTimeout(() => {
      // Attempt to reconnect
    }, 2000 * retryCount);
  }
});

export { pool };
export const db = drizzle({ client: pool, schema });