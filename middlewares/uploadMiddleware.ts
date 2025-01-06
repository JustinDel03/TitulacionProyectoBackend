import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req: Request, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
  limits: {
    files: 3, // Límite de 3 archivos
  },
});

export { upload };
