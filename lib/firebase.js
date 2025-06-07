// lib/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (replace with your actual config)
// These values are typically loaded from environment variables in a Next.js app
// For a production app, you would use process.env.NEXT_PUBLIC_FIREBASE_API_KEY etc.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
// Initialize Firebase
let app;
if (!getApps().length) {
  // If no Firebase app is already initialized, initialize a new one
  app = initializeApp(firebaseConfig);
} else {
  // If an app is already initialized, use that one (prevents re-initialization errors)
  app = getApp();
}

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// --- Authentication Logic (for Canvas environment or initial setup) ---
// This part is crucial for the Canvas environment to simulate authentication.
// In a real Next.js app, you'd likely handle authentication in a global context or layout.
if (typeof window !== 'undefined') { // Ensure this runs only in the browser
  onAuthStateChanged(auth, (user) => {
    if (!user) { // If no user is signed in
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        // Attempt to sign in with the provided custom token (for Canvas)
        signInWithCustomToken(auth, __initial_auth_token)
          .then(() => {
            console.log('Firebase: Signed in with custom token.');
          })
          .catch((error) => {
            console.error('Firebase: Error signing in with custom token:', error);
            // Fallback to anonymous sign-in if custom token fails or is not available
            signInAnonymously(auth)
              .then(() => {
                console.log('Firebase: Signed in anonymously after token failure.');
              })
              .catch((anonError) => {
                console.error('Firebase: Error signing in anonymously:', anonError);
              });
          });
      } else {
        // If no custom token, sign in anonymously (common for initial anonymous access)
        signInAnonymously(auth)
          .then(() => {
            console.log('Firebase: Signed in anonymously.');
          })
          .catch((error) => {
            console.error('Firebase: Error signing in anonymously:', error);
          });
      }
    }
  });
}


// Export the initialized services
export { db, auth };
