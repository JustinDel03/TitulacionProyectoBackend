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
  firebase: {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  },
  };
  
  export default config;
  