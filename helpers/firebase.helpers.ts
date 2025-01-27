import { bucket } from '../config/firebase';
  
/**
 * Subir una imagen y generar una URL firmada.
 * @param folder - Carpeta en Firebase Storage donde se guardará la imagen.
 * @param fileName - Nombre del archivo.
 * @param fileBuffer - Buffer del archivo.
 * @param mimeType - Tipo MIME del archivo (ejemplo: 'image/jpeg').
 * @returns URL firmada que permite acceder a la imagen.
 */
export async function subirImagen(
  folder: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const filePath = `${folder}/${Date.now()}-${fileName}`;
  const file = bucket.file(filePath);
  
  // Subir el archivo a Firebase Storage
  await new Promise<void>((resolve, reject) => {
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType,
      },
  });
  
    stream.on('error', (err) => reject(err));
    stream.on('finish', () => resolve());
    stream.end(fileBuffer);
  });
  
  // Obtener y devolver la URL pública
  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;

}