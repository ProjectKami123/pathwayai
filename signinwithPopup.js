import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBsersVMxPG21aqYErkQs0R1RB2Nnpr5jQ",
    authDomain: "pathwayai-55245.firebaseapp.com",
    PROJECT_ID="pathwayai-55245",
    FIREBASE_STORAGE_BUCKET="pathwayai-55245.firebasestorage.app",
    FIREBASE_MESSAGING_SENDER_ID="1001651411261",
    FIREBASE_APP_ID="1:1001651411261:web:b2bb462da75d7f99974d54"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.addEventListener('message', async (event) => {
  // Only accept messages from your extension
  if (event.origin !== "chrome-extension://YOUR_EXTENSION_ID") return;

  if (event.data === 'startSignInWithPopup') {
    try {
      const result = await signInWithPopup(auth, provider);
      window.parent.postMessage({ success: true, user: result.user }, event.origin);
    } catch (error) {
      window.parent.postMessage({ success: false, error: error.message }, event.origin);
    }
  }
});
