const config = {
    database: {
      host: process.env.HOST_DB, // Dirección del servidor de la base de datos
      port: 5432,        // Puerto del servidor de la base de datos
      database: process.env.NAME_DB, // Nombre de la base de datos
      user: process.env.USER_DB,        // Usuario de la base de datos
      password: process.env.PASSWORD_DB,  // Contraseña de la base de datos
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
  