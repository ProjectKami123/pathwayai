// c:\users\kiron\pathwayai\public\signInWithPopup.js

// This file is part of your web application, which is hosted on Vercel
// (e.g., https://pathwayai-jet.vercel.app/).
// It runs inside an iframe loaded by your Chrome extension's offscreen document.

// Import necessary Firebase modules for web authentication.
// We use the standard 'firebase/auth' and 'firebase/app' imports here
// because this code runs in a standard web context (inside an iframe),
// not directly within the Chrome extension environment.
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import firebaseConfig from './firebaseConfig.js'; // Import your Firebase config from the same directory

// Initialize the Firebase app with your configuration.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize the Google Auth Provider.
// Ensure Google Sign-in is enabled in your Firebase Console (Authentication > Sign-in method).
const PROVIDER = new GoogleAuthProvider();

// Determine the origin of the parent frame (the offscreen document).
// This is crucial for securely sending messages back to the extension.
// `document.location.ancestorOrigins[0]` provides the origin of the frame that embedded this iframe.
const PARENT_FRAME = document.location.ancestorOrigins[0];

/**
 * Sends a result (either success or error) back to the parent frame
 * (the offscreen document) using postMessage.
 * This function serializes the result object to a JSON string.
 * @param {object} result - The authentication result object (user data or error details).
 */
function sendResponse(result) {
  // Ensure the message is sent to the correct origin for security.
  // The '*' target origin can be used but is less secure. For production,
  // `PARENT_FRAME` is preferred if it reliably resolves.
  globalThis.parent.self.postMessage(JSON.stringify(result), PARENT_FRAME);
}

// Listen for 'message' events from the parent frame (the offscreen document).
// The offscreen document will send a message to trigger the authentication flow.
globalThis.addEventListener('message', function({ data }) {
  try {
    // Attempt to parse the incoming message data as JSON.
    const message = JSON.parse(data);

    // If the message contains 'initAuth: true', it's a signal to start authentication.
    if (message.initAuth) {
      console.log('signInWithPopup.js: Received initAuth message, initiating signInWithPopup...');

      // Perform the signInWithPopup operation. This will open the Google sign-in
      // flow in a new pop-up window within the iframe's context.
      signInWithPopup(auth, PROVIDER)
        .then(userCredential => {
          // On successful sign-in, extract relevant user data.
          const user = userCredential.user;
          console.log('signInWithPopup.js: User signed in successfully:', user.uid);
          // Send the user data back to the offscreen document.
          sendResponse({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            // You can add more user properties here if needed.
            isSuccess: true // Indicate success explicitly
          });
        })
        .catch(error => {
          // On error during sign-in, log the error and send its details back.
          console.error('signInWithPopup.js: signInWithPopup error:', error);
          sendResponse({
            name: error.name,
            code: error.code,
            message: error.message,
            isSuccess: false // Indicate failure explicitly
          });
        });
    }
  } catch (e) {
    // This catch block handles cases where the incoming message is not valid JSON
    // or is not the expected 'initAuth' message.
    console.warn('signInWithPopup.js: Received non-JSON or unexpected message:', data, 'Error:', e);
    // Firebase SDKs also send internal postMessages that start with '!_{'.
    // We should ignore these to avoid unnecessary warnings.
    if (!data.startsWith('!_{')) {
      sendResponse({
        name: 'MessageParseError',
        message: 'Could not parse message or unexpected format from parent frame.',
        isSuccess: false
      });
    }
  }
});

console.log('signInWithPopup.js loaded and listening for messages from parent frame.');
