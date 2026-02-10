import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();
const sql = neon(process.env.DATABASE_URL!);
async function listDepts() {
    const res = await sql`SELECT * FROM departamentos`;
    console.log(JSON.stringify(res, null, 2));
}
listDepts();
