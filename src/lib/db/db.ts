import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let cachedDb: any = null;

// Helper to handle chaining during build time or missing DB scenarios
const buildProxy: any = new Proxy(() => buildProxy, {
    get: (target, prop) => {
        if (prop === 'then') return undefined; // Not a real promise
        if (prop === Symbol.iterator) return function* () { yield buildProxy; };
        return buildProxy;
    },
    apply: () => buildProxy
});

export const db = new Proxy({} as any, {
    get(target, prop) {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            // If it's likely runtime (not a known build phase or common build-time prop access)
            // we should still return something that won't crash immediately, 
            // but we'll log a clear warning.
            if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
                console.warn("⚠️ DATABASE_URL is missing in production environment!");
            }
            return buildProxy;
        }

        if (!cachedDb) {
            const sql = neon(connectionString);
            cachedDb = drizzle(sql, { schema });
        }

        const value = cachedDb[prop];
        if (typeof value === 'function') {
            return value.bind(cachedDb);
        }
        return value;
    }
});
