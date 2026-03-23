import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Create global instance to prevent multiple connections in serverless hot reloads (dev)
const globalForDb = global;

export const client = globalForDb.tursoClient || createClient({
    url: url || 'file:local.db', // Fallback for pure local dev if needed, logic for Turso main
    authToken: authToken,
});

if (process.env.NODE_ENV !== 'production') {
    globalForDb.tursoClient = client;
}

export const db = drizzle(client, { schema });
