// Firebase configuration and initialization with better error handling
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase config object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if we have all required config
const hasValidConfig = Object.values(firebaseConfig).every(value => value && value !== 'undefined');

let app;
let db;
let auth;

if (hasValidConfig && typeof window !== 'undefined') {
  try {
    // Initialize Firebase (only once and only in browser)
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firestore and Auth
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Export with fallbacks
export { db, auth };
export default app;

// Helper to check if Firebase is available
export const isFirebaseAvailable = () => {
  return hasValidConfig && typeof window !== 'undefined' && db && auth;
};