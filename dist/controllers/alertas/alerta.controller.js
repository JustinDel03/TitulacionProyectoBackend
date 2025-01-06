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
exports.EliminarAlerta = exports.CambiarEstadoAlerta = exports.CrearAlerta = exports.ListaAlertas = void 0;
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
            return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageRespone["400"], true, res);
        }
        // Validar que se haya enviado un archivo
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({
                error: true,
                message: 'No se ha proporcionado ninguna imagen',
            });
        }
        try {
            // Subir las imágenes a Firebase Storage y obtener las URLs firmadas
            const imageUrls = yield Promise.all(req.files.map((file) => (0, firebase_helpers_1.subirImagen)('alertas', file.originalname, file.buffer, file.mimetype)));
            // Agregar las URLs de las imágenes directamente al objeto alerta
            alerta.imagen_1 = imageUrls[0] || null;
            alerta.imagen_2 = imageUrls[1] || null;
            alerta.imagen_3 = imageUrls[2] || null;
            // Llamar al procedimiento almacenado para guardar la alerta
            const insertResult = yield db_1.dbPool.query('CALL insertar_alerta($1::JSON, $2)', [alerta, null]);
            const id_alerta = insertResult.rows[0].new_id;
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_alertas WHERE id_alerta = $1', [id_alerta]);
            if (result.rowCount === 0) {
                return (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageRespone["500"], true, res);
            }
            const alertaCompleta = result.rows[0];
            // 📢 Emitimos la nueva alerta a todos los clientes conectados
            const io = req.app.get("socketio");
            io.emit("actualizarAlerta", alertaCompleta);
            return (0, methods_helpers_1.responseService)(201, null, message_helpers_1.messageRespone["201"], false, res);
        }
        catch (err) {
            console.error('Error al crear la alerta:', err);
            (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageRespone["500"], true, res);
        }
    });
}
exports.CrearAlerta = CrearAlerta;
function CambiarEstadoAlerta(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id_alerta, nuevo_estado } = req.body;
            if (!id_alerta || !nuevo_estado) {
                return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageRespone["400"], true, res);
            }
            const result = yield db_1.dbPool.query('UPDATE tbv_alertas SET estado = $1 WHERE id_alerta = $2 RETURNING *', [nuevo_estado, id_alerta]);
            if (result.rowCount === 0) {
                return (0, methods_helpers_1.responseService)(404, null, message_helpers_1.messageRespone["404"], true, res);
            }
            const alertaActualizada = result.rows[0];
            // 📢 Emitimos la actualización de estado a los clientes conectados
            const io = req.app.get("socketio");
            io.emit("actualizarAlerta", alertaActualizada);
            return (0, methods_helpers_1.responseService)(200, alertaActualizada, "Estado de alerta actualizado", false, res);
        }
        catch (error) {
            console.error("Error al cambiar el estado de la alerta:", error);
            (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageRespone["500"], true, res);
        }
    });
}
exports.CambiarEstadoAlerta = CambiarEstadoAlerta;
function EliminarAlerta(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id_alerta } = req.params;
            if (!id_alerta) {
                return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageRespone["400"], true, res);
            }
            const result = yield db_1.dbPool.query('DELETE FROM tbv_alertas WHERE id_alerta = $1 RETURNING *', [id_alerta]);
            if (result.rowCount === 0) {
                return (0, methods_helpers_1.responseService)(404, null, message_helpers_1.messageRespone["404"], true, res);
            }
            // 📢 Emitimos evento de eliminación a todos los clientes conectados
            const io = req.app.get("socketio");
            io.emit("actualizarAlerta", { id_alerta, eliminada: true });
            return (0, methods_helpers_1.responseService)(200, null, message_helpers_1.messageRespone["200"], false, res);
        }
        catch (error) {
            console.error("Error al eliminar la alerta:", error);
            (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageRespone["500"], true, res);
        }
    });
}
exports.EliminarAlerta = EliminarAlerta;
