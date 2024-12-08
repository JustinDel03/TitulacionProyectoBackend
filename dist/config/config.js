"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// config.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const config = {
    database: {
        host: process.env.HOST_DB, // Dirección del servidor de la base de datos
        port: 5432, // Puerto del servidor de la base de datos
        database: process.env.NAME_DB, // Nombre de la base de datos
        user: process.env.USER_DB, // Usuario de la base de datos
        password: process.env.PASSWORD_DB, // Contraseña de la base de datos
    },
    server: {
        port: 2500, // Puerto del servidor
    },
    retryConfig: {
        maxRetries: 5, // Número máximo de reintentos para conexiones fallidas
        retryDelay: 5000, // Tiempo de espera entre intentos en milisegundos
    },
};
exports.default = config;
