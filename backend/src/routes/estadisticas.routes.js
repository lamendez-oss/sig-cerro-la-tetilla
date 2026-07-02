// Estadísticas para el dashboard y la comparación multitemporal
import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

// GET /api/estadisticas/resumen
router.get('/resumen', async (_req, res) => {
  try {
    const [total, porTipo, porAnio, porGravedad, area] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM impactos_ambientales'),
      pool.query(`SELECT tipo, COUNT(*)::int AS cantidad
                  FROM impactos_ambientales GROUP BY tipo ORDER BY cantidad DESC`),
      pool.query(`SELECT EXTRACT(YEAR FROM fecha)::int AS anio, COUNT(*)::int AS cantidad
                  FROM impactos_ambientales GROUP BY anio ORDER BY anio`),
      pool.query(`SELECT gravedad, COUNT(*)::int AS cantidad
                  FROM impactos_ambientales GROUP BY gravedad`),
      pool.query(`SELECT COALESCE(SUM(ST_Area(geometria::geography)), 0) AS area_total_m2
                  FROM impactos_ambientales
                  WHERE GeometryType(geometria) = 'POLYGON'`),
    ]);
    res.json({
      total: total.rows[0].total,
      por_tipo: porTipo.rows,
      por_anio: porAnio.rows,
      por_gravedad: porGravedad.rows,
      area_total_m2: Number(area.rows[0].area_total_m2),
    });
  } catch {
    res.status(500).json({ error: 'Error al calcular las estadísticas' });
  }
});

// GET /api/estadisticas/comparacion?fecha1=YYYY-MM-DD&fecha2=YYYY-MM-DD
// Compara los impactos acumulados hasta cada fecha
router.get('/comparacion', async (req, res) => {
  try {
    const { fecha1, fecha2 } = req.query;
    if (!fecha1 || !fecha2) {
      return res.status(400).json({ error: 'Se requieren fecha1 y fecha2' });
    }
    const consulta = `
      SELECT COUNT(*)::int AS impactos,
             COALESCE(SUM(ST_Area(geometria::geography))
               FILTER (WHERE GeometryType(geometria) = 'POLYGON'), 0) AS area_m2
      FROM impactos_ambientales WHERE fecha <= $1`;
    const [a, b] = await Promise.all([
      pool.query(consulta, [fecha1]),
      pool.query(consulta, [fecha2]),
    ]);
    const r1 = { fecha: fecha1, impactos: a.rows[0].impactos, area_m2: Number(a.rows[0].area_m2) };
    const r2 = { fecha: fecha2, impactos: b.rows[0].impactos, area_m2: Number(b.rows[0].area_m2) };
    const cambioImpactos = r1.impactos
      ? ((r2.impactos - r1.impactos) / r1.impactos) * 100 : null;
    const cambioArea = r1.area_m2
      ? ((r2.area_m2 - r1.area_m2) / r1.area_m2) * 100 : null;
    res.json({ periodo1: r1, periodo2: r2,
               cambio_impactos_pct: cambioImpactos, cambio_area_pct: cambioArea });
  } catch {
    res.status(500).json({ error: 'Error en la comparación multitemporal' });
  }
});

export default router;
