import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();
const sql = neon(process.env.DATABASE_URL!);

async function testSessionData() {
    const usuario = 'devora'; // El usuario de Devora Pérez

    console.log(`Buscando usuario: ${usuario}`);
    const results = await sql`SELECT id, nombre, usuario, rol, departamento_id FROM usuarios WHERE usuario ILIKE ${usuario}`;
    const user = results[0];

    if (!user) {
        console.log("Usuario no encontrado");
        return;
    }

    console.log("Datos del usuario en BD:", JSON.stringify(user, null, 2));

    // Simular lo que se guarda en la sesión
    const sessionData = {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        rol: user.rol,
        departamentoId: user.departamento_id,
    };

    console.log("\nSimulación de datos de sesión:", JSON.stringify(sessionData, null, 2));
}

testSessionData();
