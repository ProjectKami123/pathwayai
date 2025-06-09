// lib/firebaseAdmin.js
import admin from 'firebase-admin';

// Get service account from individual environment variables
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Validate required environment variables
const requiredVars = ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optionally add your databaseURL here
      // databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`
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
