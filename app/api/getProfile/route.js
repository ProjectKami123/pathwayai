// app/api/getProfile/route.js

import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebaseAdmin'; // Path to your initialized Firebase Admin

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
    return decodedToken; // Token is valid
  } catch (error) {
    console.error('Token verification failed:', error.code, error.message);
    // Re-throw a more generic error or a specific one for the client
    throw new Error('Unauthorized: Invalid or expired token');
  }
}

/**
 * Handles GET requests to fetch a user profile.
 * This API route expects an Authorization header with a Bearer token.
 * The token is verified using Firebase Admin SDK to ensure authentication.
 * @param {Request} request The incoming Next.js request object.
 * @returns {Response} A Next.js Response object containing the user profile or an error.
 */
export async function GET(request) {
  let token = null; // Declare token here to access it in catch block
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or malformed token' }, { status: 401 });
    }

    token = authHeader.split('Bearer ')[1];
    console.log('Token being verified:', token);

    // Use the helper function to verify the token
    const decodedToken = await verifyToken(token);
    const uid = decodedToken.uid;

    // Fetch the full user record using the UID
    const userRecord = await adminAuth.getUser(uid);

    // Construct the response with desired user details
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName || null, // displayName might not always be set
      photoURL: userRecord.photoURL || null,       // photoURL might not always be set
      phoneNumber: userRecord.phoneNumber || null, // phoneNumber might not always be set
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      },
      // You can add other fields from userRecord if needed
      // e.g., customClaims: userRecord.customClaims
    };

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/getProfile:', error.message);
    if (token) {
      console.error('Failed token content during error:', token);
    }
    // If error is from getUser (e.g., user not found, though unlikely if token is valid)
    // or from verifyToken
    if (error.code === 'auth/user-not-found') {
        return NextResponse.json({ error: 'User not found after token verification.' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
