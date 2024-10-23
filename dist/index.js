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
const usuario_1 = __importDefault(require("./routes/usuario"));
const db_1 = require("./db");
const maxRetries = 5; // Número máximo de intentos de reconexión
const retryDelay = 5000; // Tiempo de espera entre intentos en milisegundos (5 segundos)
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        let connected = false;
        let attempts = 0;
        while (!connected && attempts < maxRetries) {
            try {
                yield (0, db_1.initDbConnections)();
                connected = true;
                console.log('Conexiones a la base de datos inicializadas.');
            }
            catch (error) {
                attempts++;
                console.error(`Error al intentar conectar a la base de datos (Intento ${attempts}/${maxRetries}):`, error);
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
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        app.use((0, cors_1.default)());
        app.use('/api/Usuario', usuario_1.default);
        const port = process.env.PORT || 2500;
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    });
}
startServer();
