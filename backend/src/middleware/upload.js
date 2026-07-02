// Configuración de Multer para carga de fotografías e imágenes de artículos.
// Usa Cloudinary si hay credenciales configuradas (producción / Render),
// o disco local si no las hay (desarrollo local sin cuenta de Cloudinary).
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, usaCloudinary } from '../config/cloudinary.js';

const FORMATOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];

let storage;

if (usaCloudinary) {
  // Almacenamiento en la nube: cada archivo queda con una URL pública fija
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'tetilla-sig/impactos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });
} else {
  // Almacenamiento local en disco (comportamiento original, para desarrollo)
  const dir = path.resolve('uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const unico = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unico}${path.extname(file.originalname)}`);
    },
  });
}

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB por foto
  fileFilter: (_req, file, cb) => {
    const ok = FORMATOS_IMAGEN.includes(file.mimetype);
    cb(ok ? null : new Error('Formato de imagen no permitido'), ok);
  },
});

// Devuelve la URL pública o la ruta local de un archivo subido, según el modo activo
export function rutaArchivo(file) {
  return usaCloudinary ? file.path : `/uploads/${file.filename}`;
}
