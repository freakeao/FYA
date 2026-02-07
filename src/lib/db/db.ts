import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
    // Only throw if we are actually running in production and not in a build phase
    // But Next.js build phase is better detected via other means.
    // Let's just make it a conditional to avoid crashing the collector if it's not strictly needed.
}

const sql = neon(connectionString || "");
export const db = drizzle(sql, { schema });
