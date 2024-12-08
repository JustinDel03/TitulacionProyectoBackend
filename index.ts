import express from 'express';
import cors from 'cors';
import { initDbConnections, closeDbConnections } from './db';
import usuarioRoutes from './routes/usuario';
import alertaRoutes from './routes/alerta'
import config from './config/config';

const { maxRetries, retryDelay } = config.retryConfig;

async function startServer() {
  let connected = false;
  let attempts = 0;

  // Intentos de reconexión a la base de datos
  while (!connected && attempts < maxRetries) {
    try {
      await initDbConnections();
      connected = true;
      console.log('Conexiones a la base de datos inicializadas.');
    } catch (error) {
      attempts++;
      console.error(`Error al conectar a la base de datos (Intento ${attempts}/${maxRetries}):`, error);
      if (attempts < maxRetries) {
        console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('Número máximo de intentos alcanzado. No se pudo conectar a la base de datos.');
        process.exit(1);
      }
    }
  }

  const app = express();

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Rutas
  app.use('/api/Usuario', usuarioRoutes);
  app.use('/api/Alerta', alertaRoutes);

  // Inicio del servidor
  const port = process.env.PORT || config.server.port;
  const server = app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });

  // Manejo del cierre de la aplicación
  process.on('SIGINT', async () => {
    console.log('Deteniendo servidor...');
    server.close(async () => {
      await closeDbConnections();
      console.log('Servidor detenido correctamente.');
      process.exit(0);
    });
  });
}

startServer();
