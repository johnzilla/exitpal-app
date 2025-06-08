// Firebase configuration with static export compatibility
let app = null;
let db = null;
let auth = null;

// Only initialize Firebase in browser environment and when not doing static export
const initializeFirebase = async () => {
  // Skip Firebase initialization during build/static export
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return false;
  }

  try {
    // Dynamic import to avoid build issues
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');

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
    
    if (!hasValidConfig) {
      console.log('Firebase config not found, using localStorage fallback');
      return false;
    }

    // Initialize Firebase (only once)
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firestore and Auth
    db = getFirestore(app);
    auth = getAuth(app);
    
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.warn('Firebase initialization failed, using localStorage fallback:', error);
    return false;
  }
};

// Export with fallbacks
export { db, auth };
export default app;

// Helper to check if Firebase is available
export const isFirebaseAvailable = () => {
  return db !== null && auth !== null;
};

// Initialize Firebase when this module is imported (browser only)
if (typeof window !== 'undefined') {
  initializeFirebase();
}