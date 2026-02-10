import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();
const sql = neon(process.env.DATABASE_URL!);
async function rawCheck() {
    const res = await sql`SELECT * FROM asistencia_docentes`;
    console.log(JSON.stringify(res, null, 2));
}
rawCheck();
