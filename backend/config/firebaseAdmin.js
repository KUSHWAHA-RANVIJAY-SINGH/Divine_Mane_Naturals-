const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let app;

if (getApps().length === 0) {
  try {
    if (serviceAccountKey) {
      let serviceAccount;
      const trimmedKey = serviceAccountKey.trim();
      
      if (trimmedKey.startsWith('{')) {
        serviceAccount = JSON.parse(trimmedKey);
      } else if (fs.existsSync(trimmedKey)) {
        serviceAccount = JSON.parse(fs.readFileSync(trimmedKey, 'utf8'));
      } else {
        // Try decoding as base64
        const decoded = Buffer.from(trimmedKey, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      }
      
      app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with service account cert.');
    } else {
      console.log('ℹ️ FIREBASE_SERVICE_ACCOUNT_KEY is not set. Initializing Firebase Admin with projectId (sufficient for verifying ID tokens).');
      app = initializeApp({
        projectId: 'divine-mane-naturals',
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
  }
} else {
  app = getApps()[0];
}

module.exports = {
  auth: () => getAuth(app),
};
