import { db } from './src/lib/db/db';
import { usuarios } from './src/lib/db/schema';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function list() {
    console.log('🔍 Buscando usuarios...');
    try {
        const res = await db.select({
            id: usuarios.id,
            usuario: usuarios.usuario,
            nombre: usuarios.nombre,
            password: usuarios.password,
            rol: usuarios.rol
        }).from(usuarios);
        console.log('👥 Usuarios encontrados:', JSON.stringify(res, null, 2));

        const admin = res.find(u => u.usuario === 'admin');
        if (admin && admin.password) {
            console.log('🔐 Probando contraseña "admin" para el usuario admin...');
            const match = await bcrypt.compare('admin', admin.password);
            console.log('📊 Resultado del match:', match);
        }
    } catch (e) {
        console.error('❌ Error al listar usuarios:', e);
    }
    process.exit(0);
}
list();
