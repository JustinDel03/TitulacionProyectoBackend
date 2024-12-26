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
const db_1 = require("../../db");
const firebase_helpers_1 = require("../../helpers/firebase.helpers");
const methods_helpers_1 = require("../../helpers/methods.helpers");
const message_helpers_1 = require("../../helpers/message.helpers");
function ListaAlertas(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Consulta las alertas desde la base de datos
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_alertas');
            const alertas = result.rows;
            return (0, methods_helpers_1.responseService)(200, alertas, message_helpers_1.messageRespone["200"], false, res);
        }
        catch (err) {
            console.error('Error:', err);
            (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageRespone["500"], false, res);
        }
    });
}
exports.ListaAlertas = ListaAlertas;
function CrearAlerta(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Body recibido:', req.body.alerta);
        const alerta = JSON.parse(req.body.alerta);
        // Validar que los campos requeridos estén presentes
        if (!alerta || !alerta.id_usuario || !alerta.id_tipo_alerta || !alerta.descripcion) {
            return res.status(400).json({
                error: true,
                message: 'Datos incompletos: id_usuario, id_tipo_alerta y descripcion son requeridos',
            });
        }
        // Validar que se haya enviado un archivo
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: 'No se ha proporcionado ninguna imagen',
            });
        }
        const { originalname, buffer, mimetype } = req.file;
        try {
            // Subir la imagen a Firebase Storage y obtener la URL firmada
            const signedUrl = yield (0, firebase_helpers_1.subirImagen)('alertas', originalname, buffer, mimetype);
            // Agregar la URL al objeto alerta
            alerta.imagen = signedUrl;
            // Llamar al procedimiento almacenado para guardar la alerta
            yield db_1.dbPool.query('CALL insertar_alerta($1::JSON)', [alerta]);
            res.status(200).json({
                error: false,
                message: 'Alerta creada exitosamente',
                data: {
                    image_url: signedUrl,
                },
            });
        }
        catch (err) {
            console.error('Error al crear la alerta:', err);
            res.status(500).json({
                error: true,
                message: 'Error al subir la imagen o guardar la alerta',
            });
        }
    });
}
exports.CrearAlerta = CrearAlerta;
