// CRUD de impactos ambientales con geometría PostGIS
import { Router } from 'express';
import { pool } from '../config/db.js';
import { verificarToken, permitirRoles } from '../middleware/auth.js';
import { upload, rutaArchivo } from '../middleware/upload.js';

const router = Router();

// GET /api/impactos  -> FeatureCollection GeoJSON
// Filtros opcionales: ?tipo=&estado=&desde=&hasta=
router.get('/', async (req, res) => {
  try {
    const { tipo, estado, desde, hasta } = req.query;
    const condiciones = [];
    const valores = [];
    if (tipo)   { valores.push(tipo);   condiciones.push(`tipo = $${valores.length}`); }
    if (estado) { valores.push(estado); condiciones.push(`estado = $${valores.length}`); }
    if (desde)  { valores.push(desde);  condiciones.push(`fecha >= $${valores.length}`); }
    if (hasta)  { valores.push(hasta);  condiciones.push(`fecha <= $${valores.length}`); }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT * FROM v_impactos_geojson ${where} ORDER BY fecha DESC`, valores
    );
    // Construir FeatureCollection compatible con Leaflet
    const features = rows.map((r) => ({
      type: 'Feature',
      geometry: r.geometria,
      properties: {
        id: r.id, fecha: r.fecha, hora: r.hora, tipo: r.tipo,
        descripcion: r.descripcion, gravedad: r.gravedad, estado: r.estado,
        observaciones: r.observaciones, responsable: r.responsable,
        tipo_geometria: r.tipo_geometria,
        area_m2: Number(r.area_m2), longitud_m: Number(r.longitud_m),
        num_fotos: Number(r.num_fotos),
      },
    }));
    res.json({ type: 'FeatureCollection', features });
  } catch {
    res.status(500).json({ error: 'Error al consultar los impactos' });
  }
});

// GET /api/impactos/:id/fotos
router.get('/:id/fotos', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, ruta_archivo, nombre_original FROM fotografias_impacto WHERE impacto_id = $1',
    [req.params.id]
  );
  res.json(rows);
});

// POST /api/impactos (investigador o administrador)
// Recibe multipart/form-data: campos + geometria (GeoJSON string) + fotos[]
router.post(
  '/',
  verificarToken,
  permitirRoles('investigador', 'administrador'),
  upload.array('fotos', 6),
  async (req, res) => {
    const cliente = await pool.connect();
    try {
      const { fecha, hora, tipo, descripcion, gravedad, estado, observaciones, geometria } = req.body;
      if (!fecha || !tipo || !descripcion || !geometria) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
      await cliente.query('BEGIN');
      const { rows } = await cliente.query(
        `INSERT INTO impactos_ambientales
           (fecha, hora, tipo, descripcion, gravedad, estado, observaciones, geometria, usuario_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7, ST_SetSRID(ST_GeomFromGeoJSON($8), 4326), $9)
         RETURNING id`,
        [fecha, hora || null, tipo, descripcion, gravedad || 'media',
         estado || 'activo', observaciones || null, geometria, req.usuario.id]
      );
      const impactoId = rows[0].id;
      for (const foto of req.files || []) {
        await cliente.query(
          `INSERT INTO fotografias_impacto (impacto_id, ruta_archivo, nombre_original)
           VALUES ($1, $2, $3)`,
          [impactoId, rutaArchivo(foto), foto.originalname]
        );
      }
      await cliente.query(
        'INSERT INTO logs (usuario_id, accion, detalle) VALUES ($1, $2, $3)',
        [req.usuario.id, 'crear_impacto', `Impacto #${impactoId} (${tipo})`]
      );
      await cliente.query('COMMIT');
      res.status(201).json({ id: impactoId, mensaje: 'Impacto registrado correctamente' });
    } catch (e) {
      await cliente.query('ROLLBACK');
      res.status(500).json({ error: 'Error al registrar el impacto', detalle: e.message });
    } finally {
      cliente.release();
    }
  }
);

// PUT /api/impactos/:id
router.put(
  '/:id',
  verificarToken,
  permitirRoles('investigador', 'administrador'),
  async (req, res) => {
    try {
      const { fecha, hora, tipo, descripcion, gravedad, estado, observaciones, geometria } = req.body;
      const { rowCount } = await pool.query(
        `UPDATE impactos_ambientales SET
           fecha = COALESCE($1, fecha),
           hora = COALESCE($2, hora),
           tipo = COALESCE($3, tipo),
           descripcion = COALESCE($4, descripcion),
           gravedad = COALESCE($5, gravedad),
           estado = COALESCE($6, estado),
           observaciones = COALESCE($7, observaciones),
           geometria = COALESCE(ST_SetSRID(ST_GeomFromGeoJSON($8), 4326), geometria)
         WHERE id = $9`,
        [fecha, hora, tipo, descripcion, gravedad, estado, observaciones, geometria || null, req.params.id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Impacto no encontrado' });
      res.json({ mensaje: 'Impacto actualizado' });
    } catch {
      res.status(500).json({ error: 'Error al actualizar el impacto' });
    }
  }
);

// DELETE /api/impactos/:id (solo administrador)
router.delete('/:id', verificarToken, permitirRoles('administrador'), async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM impactos_ambientales WHERE id = $1', [req.params.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Impacto no encontrado' });
  res.json({ mensaje: 'Impacto eliminado' });
});

export default router;
