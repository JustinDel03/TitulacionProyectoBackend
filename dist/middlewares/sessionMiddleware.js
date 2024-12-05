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
exports.validarSessionToken = void 0;
const db_1 = require("../db");
const validarSessionToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo } = req.query; // El correo se envía como parte de la solicitud
    console.log('Validando sesión para correo:', correo);
    if (!correo) {
        return res.status(400).json({
            error: true,
            message: 'Correo no proporcionado',
        });
    }
    try {
        const result = yield db_1.dbPool.query('SELECT session_token, fecha_token FROM usuarios WHERE correo = $1', [correo]);
        if (result.rowCount === 0) {
            return res.status(401).json({
                error: true,
                message: 'Usuario no encontrado',
            });
        }
        const { session_token, fecha_token } = result.rows[0];
        const expirationTime = 60 * 30 * 1000; // 30 minutos en milisegundos
        // Verificar si el token ha expirado
        const tokenAge = Date.now() - new Date(fecha_token).getTime();
        if (tokenAge > expirationTime) {
            // Invalidar el token si ha expirado
            yield db_1.dbPool.query('UPDATE usuarios SET session_token = NULL, fecha_token = NULL WHERE correo = $1', [correo]);
            return res.status(401).json({
                error: true,
                message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            });
        }
        // Continuar con la solicitud
        next();
    }
    catch (error) {
        console.error('Error al validar el token:', error);
        res.status(500).json({
            error: true,
            message: 'Error interno del servidor',
        });
    }
});
exports.validarSessionToken = validarSessionToken;
