import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// All values come from environment variables so real keys never get
// committed to the repo. Copy .env.example to .env and fill these in
// with the values from Firebase Console → Project settings → General
// → "Your apps" → SDK setup and configuration.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Note: Cloud Storage is intentionally not initialized here — since
// Feb 2026 it requires the paid Blaze plan even at $0 usage. Chat file
// attachments upload to Cloudinary's free tier instead (see useChat.js).
