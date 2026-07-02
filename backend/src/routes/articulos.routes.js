// Artículos científicos publicados
import { Router } from 'express';
import { pool } from '../config/db.js';
import { verificarToken, permitirRoles } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, usaCloudinary } from '../config/cloudinary.js';

let almacenPdf;

if (usaCloudinary) {
  // PDFs se suben como recurso "raw" a Cloudinary (no son imágenes)
  almacenPdf = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'tetilla-sig/articulos', resource_type: 'raw' },
  });
} else {
  const dir = path.resolve('uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  almacenPdf = multer.diskStorage({
    destination: (_req, _f, cb) => cb(null, dir),
    filename: (_req, f, cb) => cb(null, `articulo-${Date.now()}${path.extname(f.originalname)}`),
  });
}

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
      const rutaPdf = req.file
        ? (usaCloudinary ? req.file.path : `/uploads/${req.file.filename}`)
        : null;
      const { rows } = await pool.query(
        `INSERT INTO articulos (titulo, autores, resumen, palabras_clave, ruta_pdf, fecha_publicacion)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [titulo, autores, resumen || null, palabras_clave || null,
         rutaPdf, fecha_publicacion || null]
      );
      res.status(201).json({ id: rows[0].id });
    } catch {
      res.status(500).json({ error: 'Error al publicar el artículo' });
    }
  }
);

export default router;
