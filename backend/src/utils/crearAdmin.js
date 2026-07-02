// Script para crear el usuario administrador inicial
// Uso: npm run crear-admin
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const correo = 'admin@tetilla.co';
const contrasena = 'Admin2026*'; // Cambiar después del primer inicio de sesión

const hash = await bcrypt.hash(contrasena, 10);
await pool.query(
  `INSERT INTO usuarios (nombre, correo, contrasena, rol)
   VALUES ('Administrador', $1, $2, 'administrador')
   ON CONFLICT (correo) DO NOTHING`,
  [correo, hash]
);
console.log(`✔ Administrador creado -> correo: ${correo} | contraseña: ${contrasena}`);
process.exit(0);
