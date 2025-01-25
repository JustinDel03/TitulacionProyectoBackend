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
require("./globalconfig");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http"); // Importamos HTTP para WebSockets
const socket_io_1 = require("socket.io"); // Importamos Socket.io
const db_1 = require("./db");
const usuario_1 = __importDefault(require("./routes/usuario"));
const alerta_1 = __importDefault(require("./routes/alerta"));
const especie_1 = __importDefault(require("./routes/especie"));
const sendero_1 = __importDefault(require("./routes/sendero"));
const config_1 = __importDefault(require("./config/config"));
const home_route_1 = __importDefault(require("./routes/home.route"));
const observacion_1 = __importDefault(require("./routes/observacion"));
const { maxRetries, retryDelay } = config_1.default.retryConfig;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
    },
});
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        let connected = false;
        let attempts = 0;
        while (!connected && attempts < maxRetries) {
            try {
                yield (0, db_1.initDbConnections)();
                connected = true;
            }
            catch (error) {
                attempts++;
                console.error(`Error al conectar a la base de datos (Intento ${attempts}/${maxRetries}):`, error);
                if (attempts < maxRetries) {
                    console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
                    yield new Promise((resolve) => setTimeout(resolve, retryDelay));
                }
                else {
                    console.error("Número máximo de intentos alcanzado. No se pudo conectar a la base de datos.");
                    process.exit(1);
                }
            }
        }
        // Middleware
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        app.use((0, cors_1.default)());
        // WebSockets
        io.on("connection", (socket) => {
            console.log(`🔌 Cliente conectado: ${socket.id}`);
            socket.on("disconnect", () => {
                console.log(`❌ Cliente desconectado: ${socket.id}`);
            });
        });
        // Exponer io para su uso en controladores
        app.set("socketio", io);
        // Rutas API
        app.use("/api/Usuario", usuario_1.default);
        app.use("/api/Alerta", alerta_1.default);
        app.use("/api/Observacion", observacion_1.default);
        app.use("/api/Especie", especie_1.default);
        app.use("/api/Sendero", sendero_1.default);
        app.use('/api', home_route_1.default);
        // Iniciar servidor
        const port = process.env.PORT || config_1.default.server.port;
        server.listen(port, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
        });
    });
}
startServer();
