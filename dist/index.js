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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const usuario_1 = __importDefault(require("./routes/usuario"));
const config_1 = __importDefault(require("./config/config"));
const { maxRetries, retryDelay } = config_1.default.retryConfig;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        let connected = false;
        let attempts = 0;
        // Intentos de reconexión a la base de datos
        while (!connected && attempts < maxRetries) {
            try {
                yield (0, db_1.initDbConnections)();
                connected = true;
                console.log('Conexiones a la base de datos inicializadas.');
            }
            catch (error) {
                attempts++;
                console.error(`Error al conectar a la base de datos (Intento ${attempts}/${maxRetries}):`, error);
                if (attempts < maxRetries) {
                    console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
                    yield new Promise(resolve => setTimeout(resolve, retryDelay));
                }
                else {
                    console.error('Número máximo de intentos alcanzado. No se pudo conectar a la base de datos.');
                    process.exit(1);
                }
            }
        }
        const app = (0, express_1.default)();
        // Middlewares
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        app.use((0, cors_1.default)());
        // Rutas
        app.use('/api/Usuario', usuario_1.default);
        // Inicio del servidor
        const port = process.env.PORT || config_1.default.server.port;
        const server = app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
        // Manejo del cierre de la aplicación
        process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Deteniendo servidor...');
            server.close(() => __awaiter(this, void 0, void 0, function* () {
                yield (0, db_1.closeDbConnections)();
                console.log('Servidor detenido correctamente.');
                process.exit(0);
            }));
        }));
    });
}
startServer();
