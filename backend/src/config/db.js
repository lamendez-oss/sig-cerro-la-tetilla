// Configuración del pool de conexiones a PostgreSQL/PostGIS
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Neon (y la mayoría de proveedores en la nube) exigen conexión cifrada.
// PGSSLMODE=require en las variables de entorno activa SSL; en local se deja sin definir.
const usaSSL = process.env.PGSSLMODE === 'require';

export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: usaSSL ? { rejectUnauthorized: false } : false,
});

pool.query('SELECT PostGIS_Version()')
  .then((r) => console.log('✔ PostGIS conectado:', r.rows[0].postgis_version))
  .catch((e) => console.error('✖ Error de conexión a la base de datos:', e.message));
