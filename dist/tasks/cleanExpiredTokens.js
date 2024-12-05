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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../db");
// Configurar la tarea para ejecutar cada hora
node_cron_1.default.schedule('0 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Eliminando tokens expirados...');
        const expirationTime = 30 * 60 * 1000; // 30 minutos en milisegundos
        const expirationThreshold = new Date(Date.now() - expirationTime);
        // Eliminar tokens expirados de la base de datos
        yield db_1.dbPool.query('UPDATE usuarios SET session_token = NULL WHERE fecha_token < $1', [expirationThreshold]);
        console.log('Tokens expirados eliminados correctamente.');
    }
    catch (error) {
        console.error('Error al eliminar tokens expirados:', error);
    }
}));
