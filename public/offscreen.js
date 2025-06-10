// This script runs in the offscreen document.
// It handles Firebase authentication methods that require a window context,
// like signInWithPopup.

// Import Firebase SDKs - these imports will be handled by your web build process
// when you bundle offscreen.js for deployment to Vercel.
import { initializeApp } from 'firebase/app'; // Use the regular web SDK here, not the SW one
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Your Firebase configuration - Needs to be the same as in background.js
// You should get this from your Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <--- Get this from your Firebase project settings
  authDomain: "pathwayai-55245.firebaseapp.com",
  projectId: "pathwayai-55245",
  storageBucket: "pathwayai-55245.appspot.com",
  messagingSenderId: "1001651411261",
  appId: "YOUR_APP_ID", // <--- Get this from your Firebase project settings
  // measurementId: "G-XXXXXXXXXX" // Not needed here
};

// Initialize Firebase (only if not already initialized in this context)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  // App might already be initialized if the offscreen document is reused
  console.warn("Firebase app already initialized in offscreen document.");
  app = getApp(); // Or use getApps()[0] or getApp('YOUR_APP_NAME')
}
const auth = getAuth(app);

console.log('[offscreen.js] Offscreen document script loaded.');

// --- Message Listener (from background.js) ---
// Listen for messages sent from the background service worker
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('[offscreen.js] Received message from background:', request);

  if (request.action === 'firebaseAuth') {
    const { method, providerId } = request;

    try {
      let result;
      let credential = null; // For methods that return a credential

      if (method === 'signInWithPopup') {
        let provider;
        if (providerId === 'google') {
          provider = new GoogleAuthProvider();
        } else if (providerId === 'facebook') {
          provider = new FacebookAuthProvider();
        } else {
          throw new Error(`Unsupported provider: ${providerId}`);
        }

        // Perform the sign-in with popup
        result = await signInWithPopup(auth, provider);
        console.log('[offscreen.js] signInWithPopup successful:', result);

        // The result object contains the user and credential
        const user = result.user;
        credential = GoogleAuthProvider.credentialFromResult(result) || FacebookAuthProvider.credentialFromResult(result); // Get the specific credential if available

        // Send success message back to the service worker
        sendResponse({
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            // Add other user properties needed
          },
          credential: credential ? {
              accessToken: credential.accessToken,
              idToken: credential.idToken // Add idToken if available/needed
              // Add other credential properties needed
          } : null,
          message: 'signInWithPopup success'
        });

      } else {
        throw new Error(`Unsupported Firebase Auth method in offscreen document: ${method}`);
      }

    } catch (error) {
      console.error('[offscreen.js] Firebase Auth method failed:', error);
      // Send error message back to the service worker
      sendResponse({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          // Include other error details if necessary
        },
        message: 'signInWithPopup failed'
      });
    }
     // Important: Return true to indicate that sendResponse will be called asynchronously
    return true;
  }

  // Handle other potential messages from background script if needed
  // ...

  // If the message is not handled by this listener, return false or omit return
  // return false;
});
