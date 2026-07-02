// Exportación de datos: GeoJSON y CSV
// (PDF y Excel se generan en el frontend; Shapefile requiere ogr2ogr, ver README)
import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

// GET /api/reportes/geojson -> descarga FeatureCollection completa
router.get('/geojson', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM v_impactos_geojson');
  const fc = {
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      geometry: r.geometria,
      properties: {
        id: r.id, fecha: r.fecha, tipo: r.tipo, descripcion: r.descripcion,
        gravedad: r.gravedad, estado: r.estado, responsable: r.responsable,
        area_m2: Number(r.area_m2), longitud_m: Number(r.longitud_m),
      },
    })),
  };
  res.setHeader('Content-Disposition', 'attachment; filename=impactos_tetilla.geojson');
  res.json(fc);
});

// GET /api/reportes/csv -> descarga tabla de atributos
router.get('/csv', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, fecha, tipo, descripcion, gravedad, estado, responsable,
            ROUND(area_m2::numeric, 2) AS area_m2,
            ROUND(longitud_m::numeric, 2) AS longitud_m
     FROM v_impactos_geojson ORDER BY fecha`
  );
  const cab = 'id;fecha;tipo;descripcion;gravedad;estado;responsable;area_m2;longitud_m';
  const limpiar = (v) => String(v ?? '').replace(/;/g, ',').replace(/\r?\n/g, ' ');
  const cuerpo = rows.map((r) =>
    [r.id, r.fecha?.toISOString?.().slice(0,10) ?? r.fecha, r.tipo, limpiar(r.descripcion),
     r.gravedad, r.estado, limpiar(r.responsable), r.area_m2, r.longitud_m].join(';')
  ).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=impactos_tetilla.csv');
  res.send(`\uFEFF${cab}\n${cuerpo}`);
});

export default router;
