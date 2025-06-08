// lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// 👇 This exposes it globally for debugging in browser console
if (typeof window !== 'undefined') {
  window.auth = auth;
}

// Export providers for social logins
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { 
  auth, 
  db, 
  googleProvider, 
  facebookProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier
};