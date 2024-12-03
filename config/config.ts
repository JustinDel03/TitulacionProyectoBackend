// config.ts

const config = {
    database: {
      host: 'localhost', // Dirección del servidor de la base de datos
      port: 5432,        // Puerto del servidor de la base de datos
      database: 'DBObservaGye', // Nombre de la base de datos
      user: 'postgres',        // Usuario de la base de datos
      password: 'Jn@del23',  // Contraseña de la base de datos
    },
    server: {
      port: 2500, // Puerto del servidor
    },
    retryConfig: {
      maxRetries: 5,        // Número máximo de reintentos para conexiones fallidas
      retryDelay: 5000,     // Tiempo de espera entre intentos en milisegundos
    },
  };
  
  export default config;
  