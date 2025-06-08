// lib/firebaseAdmin.js
import admin from 'firebase-admin';
import serviceAccount from '../firebase-service-account.json'; // Adjust path if needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optionally add your databaseURL here
    // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  console.log('✅ Firebase Admin SDK initialized using local JSON key.');
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
