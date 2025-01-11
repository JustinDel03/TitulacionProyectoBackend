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
exports.closeDbConnections = exports.initDbConnections = exports.dbPool = void 0;
const pg_1 = require("pg");
const config_1 = __importDefault(require("./config/config"));
// Inicializa las conexiones a la base de datos
function initDbConnections() {
    return __awaiter(this, void 0, void 0, function* () {
        exports.dbPool = new pg_1.Pool(config_1.default.database);
        console.log(config_1.default.database);
        try {
            yield exports.dbPool.connect();
            console.log('Conexión a la base de datos establecida.');
        }
        catch (err) {
            console.error('Error al conectar a la base de datos:', err);
            throw err; // Lanza el error para ser manejado por el servidor
        }
    });
}
exports.initDbConnections = initDbConnections;
// Finaliza las conexiones (útil al cerrar la aplicación)
function closeDbConnections() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.dbPool) {
            yield exports.dbPool.end();
            console.log('Conexiones a la base de datos cerradas.');
        }
    });
}
exports.closeDbConnections = closeDbConnections;
