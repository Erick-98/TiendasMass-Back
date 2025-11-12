import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

// Asegurar que el directorio existe
const uploadDir = 'src/public/uploads/productos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    cb(null, 'src/public/uploads/productos');
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Intentar usar el nombre del producto (si se envía en el mismo multipart/form-data)
    // para generar un nombre legible; si no está disponible, usar el original o un sufijo único.
    const originalName = path.parse(file.originalname).name;

    const fromBodyName = (req.body && (req.body.nombre || req.body.name)) ? String(req.body.nombre || req.body.name) : null;

    const sanitize = (str: string) => {
      // Normalizar acentos, eliminar caracteres no alfanuméricos y limitar longitud
      return str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-zA-Z0-9\-_. ]+/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()
        .slice(0, 50);
    };

    const base = fromBodyName ? sanitize(fromBodyName) : sanitize(originalName) || 'imagen';
    const uniqueName = `${base}-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  }
});

export default upload;