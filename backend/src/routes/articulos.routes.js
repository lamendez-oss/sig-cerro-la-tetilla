// Artículos científicos publicados
import { Router } from 'express';
import { pool } from '../config/db.js';
import { verificarToken, permitirRoles } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const almacenPdf = multer.diskStorage({
  destination: (_req, _f, cb) => cb(null, path.resolve('uploads')),
  filename: (_req, f, cb) => cb(null, `articulo-${Date.now()}${path.extname(f.originalname)}`),
});
const subirPdf = multer({
  storage: almacenPdf,
  fileFilter: (_req, f, cb) => cb(null, f.mimetype === 'application/pdf'),
});

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM articulos ORDER BY fecha_publicacion DESC');
  res.json(rows);
});

router.post('/', verificarToken, permitirRoles('administrador', 'investigador'),
  subirPdf.single('pdf'), async (req, res) => {
    try {
      const { titulo, autores, resumen, palabras_clave, fecha_publicacion } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO articulos (titulo, autores, resumen, palabras_clave, ruta_pdf, fecha_publicacion)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [titulo, autores, resumen || null, palabras_clave || null,
         req.file ? `/uploads/${req.file.filename}` : null, fecha_publicacion || null]
      );
      res.status(201).json({ id: rows[0].id });
    } catch {
      res.status(500).json({ error: 'Error al publicar el artículo' });
    }
  }
);

export default router;
