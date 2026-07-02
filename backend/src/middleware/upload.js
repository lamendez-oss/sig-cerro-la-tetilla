// Configuración de Multer para carga de fotografías
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const dir = path.resolve('uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const unico = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unico}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB por foto
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Formato de imagen no permitido'), ok);
  },
});
