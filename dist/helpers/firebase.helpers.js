"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subirImagen = subirImagen;
const firebase_1 = require("../config/firebase");
/**
 * Subir una imagen y generar una URL firmada.
 * @param folder - Carpeta en Firebase Storage donde se guardará la imagen.
 * @param fileName - Nombre del archivo.
 * @param fileBuffer - Buffer del archivo.
 * @param mimeType - Tipo MIME del archivo (ejemplo: 'image/jpeg').
 * @returns URL firmada que permite acceder a la imagen.
 */
function subirImagen(folder, fileName, fileBuffer, mimeType) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `${folder}/${Date.now()}-${fileName}`;
        const file = firebase_1.bucket.file(filePath);
        // Subir el archivo a Firebase Storage
        yield new Promise((resolve, reject) => {
            const stream = file.createWriteStream({
                metadata: {
                    contentType: mimeType,
                },
            });
            stream.on('error', (err) => reject(err));
            stream.on('finish', () => resolve());
            stream.end(fileBuffer);
        });
        // Generar una URL firmada válida por 1 hora (3600 segundos)
        const [signedUrl] = yield file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 3600 * 1000, // 1 hora
        });
        return signedUrl;
    });
}
