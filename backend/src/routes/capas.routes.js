// Gestión de capas SIG temáticas
import { Router } from 'express';
import { pool } from '../config/db.js';
import { verificarToken, permitirRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/capas -> lista de capas con geometría GeoJSON
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, tipo, fuente, descripcion, propiedades, visible_defecto,
              ST_AsGeoJSON(geometria)::json AS geometria
       FROM capas_sig ORDER BY tipo, nombre`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al consultar las capas' });
  }
});

// POST /api/capas (importación de GeoJSON, solo investigador/administrador)
router.post('/', verificarToken, permitirRoles('investigador', 'administrador'),
  async (req, res) => {
    try {
      const { nombre, tipo, fuente, descripcion, geometria, propiedades } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO capas_sig (nombre, tipo, fuente, descripcion, geometria, propiedades)
         VALUES ($1,$2,$3,$4, ST_SetSRID(ST_GeomFromGeoJSON($5), 4326), $6)
         RETURNING id`,
        [nombre, tipo, fuente || null, descripcion || null,
         JSON.stringify(geometria), propiedades || null]
      );
      res.status(201).json({ id: rows[0].id });
    } catch {
      res.status(500).json({ error: 'Error al crear la capa' });
    }
  }
);

// DELETE /api/capas/:id (solo administrador)
router.delete('/:id', verificarToken, permitirRoles('administrador'), async (req, res) => {
  await pool.query('DELETE FROM capas_sig WHERE id = $1', [req.params.id]);
  res.json({ mensaje: 'Capa eliminada' });
});

export default router;
