import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let cachedDb: any = null;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (!cachedDb) {
            const connectionString = process.env.DATABASE_URL;
            if (!connectionString) {
                // Return a dummy object during build to avoid crashes
                return ({} as any)[prop];
            }
            const sql = neon(connectionString);
            cachedDb = drizzle(sql, { schema });
        }
        return cachedDb[prop];
    }
});
