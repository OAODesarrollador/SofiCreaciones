import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
    schema: './src/lib/db/schema.js',
    out: './drizzle',
    dialect: 'turso', // Activa soporte nativo para Turso en Drizzle v0.32+
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    },
});
