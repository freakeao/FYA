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
            // Throw a real error in production runtime to avoid cryptic crashes later
            if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
                // Check if we are in the build phase (Next.js sets NEXT_PHASE)
                if (process.env.NEXT_PHASE !== 'phase-production-build') {
                    throw new Error("DATABASE_URL is missing. Please configure it in your environment variables.");
                }
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
