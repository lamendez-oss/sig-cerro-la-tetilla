// Configuración de Cloudinary para almacenamiento externo de fotografías
// Se activa solo si las variables de entorno CLOUDINARY_* están definidas;
// si no, el proyecto sigue funcionando con almacenamiento local (uploads/)
import { v2 as cloudinary } from 'cloudinary';

export const usaCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (usaCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export { cloudinary };
