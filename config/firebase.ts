import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import serviceAccountJson from './firebase-service-account.json';

const serviceAccount = serviceAccountJson as ServiceAccount;


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'observagye-38e85.firebasestorage.app',
  });
  
  const bucket = admin.storage().bucket();
  
  export { bucket };
