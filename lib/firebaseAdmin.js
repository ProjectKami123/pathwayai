// lib/firebaseAdmin.js
import admin from 'firebase-admin';

// Get service account from environment variable
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  try {
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    let serviceAccountJson;
    try {
      serviceAccountJson = JSON.parse(serviceAccount);
    } catch {
      throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
      // Optionally add your databaseURL here
      // databaseURL: `https://${serviceAccountJson.project_id}.firebaseio.com`
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    throw error;
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

/**
 * Helper function to verify the Firebase ID token.
 * @param {string} idToken The Firebase ID token to verify.
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>} The decoded token if valid.
 * @throws {Error} If the token is missing, invalid, or expired.
 */
async function verifyToken(idToken) {
  if (!idToken) {
    throw new Error('No token provided');
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed in firebaseAdmin:', error.code, error.message);
    throw new Error('Unauthorized: Invalid or expired token (firebaseAdmin)');
  }
}

export { admin, adminAuth, adminDb, verifyToken };
