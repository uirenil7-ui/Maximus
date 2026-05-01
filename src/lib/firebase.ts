import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence explicitly to handle environment instabilities
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Auth persistence failed:", err);
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable persistence for better offline reliability and "unavailable" error resilience
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
    console.warn("Firestore persistence failed: multiple tabs open.");
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn("Firestore persistence failed: not supported by browser.");
  }
});

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    // Force set persistence before login attempt to ensure session is saved correctly in iframe
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/network-request-failed') {
      console.error("Firebase Auth Network Error: This often happens in sandboxed environments. Please ensure your current domain is 'Authorized' in the Firebase Console Auth settings.");
    }
    console.error("Login failed:", error);
    throw error;
  }
};
