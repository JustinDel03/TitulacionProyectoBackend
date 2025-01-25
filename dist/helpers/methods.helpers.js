"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJwt = exports.createJwt = exports.responseService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("../globalconfig");
const responseService = (codigo, datos, mensaje = "", error, resp) => {
    resp.statusCode = codigo;
    return resp.json({
        "data": datos ? datos : null,
        "mensaje": mensaje,
        "error": error
    });
};
exports.responseService = responseService;
const createJwt = (datos) => {
    console.log(process.env.DURATION);
    return jsonwebtoken_1.default.sign(Object.assign({}, datos), process.env.KEY_JWT, {
        expiresIn: process.env.DURATION, // Usa un valor predeterminado si HORAS_JWT no está definido
    });
};
exports.createJwt = createJwt;
const validateJwt = (token) => {
    try {
        const valida = jsonwebtoken_1.default.verify(token, process.env.KEY_JWT);
        return valida;
    }
    catch (error) {
        console.error("Error al validar el token:", error);
        return null;
    }
};
exports.validateJwt = validateJwt;
