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
exports.CrearAlerta = exports.ListaAlertas = void 0;
const db_1 = require("../db");
const firebase_1 = require("../config/firebase");
function ListaAlertas(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_alertas');
            const usuarios = result.rows[0];
            res.status(200).json({
                error: false,
                message: 'Usuarios obtenidos',
                data: usuarios
            });
        }
        catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor',
            });
        }
    });
}
exports.ListaAlertas = ListaAlertas;
function CrearAlerta(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Body recibido:', req.body.alerta);
        const alerta = JSON.parse(req.body.alerta);
        if (!alerta || !alerta.id_usuario || !alerta.id_tipo_alerta || !alerta.descripcion) {
            return res.status(400).json({
                error: true,
                message: 'Datos incompletos: id_usuario, id_tipo_alerta y descripcion son requeridos',
            });
        }
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: 'No se ha proporcionado ninguna imagen',
            });
        }
        const { originalname, buffer } = req.file;
        try {
            // Subir la imagen a Firebase Storage
            const blob = firebase_1.bucket.file(`alertas/${Date.now()}-${originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype,
                },
            });
            blobStream.on('error', (err) => {
                console.error('Error al subir la imagen:', err);
                res.status(500).json({
                    error: true,
                    message: 'Error al subir la imagen',
                });
            });
            blobStream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                const public_url = `https://storage.googleapis.com/${firebase_1.bucket.name}/${blob.name}`;
                // Agregar la URL al objeto alerta
                alerta.imagen = public_url;
                // Llamar al procedimiento almacenado para guardar la alerta
                try {
                    // Llamar al procedimiento almacenado
                    yield db_1.dbPool.query("CALL insertar_alerta($1::JSON)", [alerta]);
                    res.status(200).json({
                        error: false,
                        message: 'Alerta creada exitosamente',
                        data: {
                            image_url: public_url,
                        },
                    });
                }
                catch (dbError) {
                    console.error('Error al guardar la alerta en la base de datos:', dbError);
                    res.status(500).json({
                        error: true,
                        message: 'Error al guardar la alerta en la base de datos',
                    });
                }
            }));
            blobStream.end(buffer);
        }
        catch (err) {
            console.error('Error interno al crear la alerta:', err);
            res.status(500).json({
                error: true,
                message: 'Error interno al crear la alerta',
            });
        }
    });
}
exports.CrearAlerta = CrearAlerta;
