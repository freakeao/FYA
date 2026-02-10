import { db } from "./src/lib/db";
import { usuarios } from "./src/lib/db/schema";

async function check() {
    try {
        const users = await db.select().from(usuarios);
        console.log("Usuarios en BD:", JSON.stringify(users, null, 2));
    } catch (e) {
        console.error("Error consultando usuarios:", e);
    }
}

check();
