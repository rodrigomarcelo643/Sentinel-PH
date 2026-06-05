import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,

};

const app = initializeApp(firebaseConfig);

/** Isolated Auth instance — registration must not sign in the main app session */
const REGISTRATION_APP_NAME = 'HealthWatchRegistration';
const registrationApp = getApps().some((a) => a.name === REGISTRATION_APP_NAME)
  ? getApp(REGISTRATION_APP_NAME)
  : initializeApp(firebaseConfig, REGISTRATION_APP_NAME);

export const auth = getAuth(app);
export const registrationAuth = getAuth(registrationApp);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
