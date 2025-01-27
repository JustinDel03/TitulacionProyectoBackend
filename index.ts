import "./globalconfig";
import express from "express";
import cors from "cors";
import { createServer } from "http"; // Importamos HTTP para WebSockets
import { Server } from "socket.io"; // Importamos Socket.io
import { initDbConnections } from "./db";
import usuarioRoutes from "./routes/usuario";
import alertaRoutes from "./routes/alerta";
import especieRoutes from "./routes/especie";
import senderoRoutes from "./routes/sendero"
import config from "./config/config";
import home from './routes/home.route';
import observacionRoutes from './routes/observacion';
const { maxRetries, retryDelay } = config.retryConfig;


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

async function startServer() {
  let connected = false;
  let attempts = 0;

  while (!connected && attempts < maxRetries) {
    try {
      await initDbConnections();
      connected = true;
    } catch (error) {
      attempts++;
      console.error(
        `Error al conectar a la base de datos (Intento ${attempts}/${maxRetries}):`,
        error
      );
      if (attempts < maxRetries) {
        console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error(
          "Número máximo de intentos alcanzado. No se pudo conectar a la base de datos."
        );
        process.exit(1);
      }
    }
  }



  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

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
  app.use("/api/Usuario", usuarioRoutes);
  app.use("/api/Alerta", alertaRoutes);
  app.use("/api/Observacion", observacionRoutes);
  app.use("/api/Especie", especieRoutes);
  app.use("/api/Sendero", senderoRoutes);
  app.use('/api', home)



  // Iniciar servidor
  const port = process.env.PORT || config.server.port;
  server.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  });
}


startServer();
