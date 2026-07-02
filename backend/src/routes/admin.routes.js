// Administración: usuarios, roles y logs (solo administrador)
import { Router } from 'express';
import { pool } from '../config/db.js';
import { verificarToken, permitirRoles } from '../middleware/auth.js';

const router = Router();
router.use(verificarToken, permitirRoles('administrador'));

// GET /api/admin/usuarios
router.get('/usuarios', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, nombre, correo, rol, activo, fecha_creacion FROM usuarios ORDER BY id'
  );
  res.json(rows);
});

// PUT /api/admin/usuarios/:id -> cambiar rol o estado
router.put('/usuarios/:id', async (req, res) => {
  const { rol, activo } = req.body;
  await pool.query(
    `UPDATE usuarios SET rol = COALESCE($1, rol), activo = COALESCE($2, activo) WHERE id = $3`,
    [rol, activo, req.params.id]
  );
  res.json({ mensaje: 'Usuario actualizado' });
});

// GET /api/admin/logs
router.get('/logs', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT l.id, u.nombre AS usuario, l.accion, l.detalle, l.fecha
     FROM logs l LEFT JOIN usuarios u ON u.id = l.usuario_id
     ORDER BY l.fecha DESC LIMIT 200`
  );
  res.json(rows);
});

// GET /api/admin/sesiones -> bitácora exclusiva de inicios y cierres de sesión
router.get('/sesiones', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT l.id, u.nombre AS usuario, u.correo, u.rol, l.accion, l.fecha
     FROM logs l LEFT JOIN usuarios u ON u.id = l.usuario_id
     WHERE l.accion IN ('inicio_sesion', 'cierre_sesion', 'registro_usuario')
     ORDER BY l.fecha DESC LIMIT 300`
  );
  res.json(rows);
});

export default router;

