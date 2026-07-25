import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, type Auth, type UserCredential } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported, type Analytics } from "firebase/analytics";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const isFirebaseConfigured = Boolean(apiKey && apiKey !== "demo-key" && !apiKey.startsWith("your_"));

const firebaseConfig = {
  apiKey: isFirebaseConfigured ? apiKey : "AIzaSyDummyKeyForSafeInitOnly12345",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "haven-bridge.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "promptwars-503421",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "haven-bridge.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Singleton Firebase app initialization */
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

/** Returns Firebase Analytics instance ONLY if valid config exists & supported in browser */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured) return null;
  try {
    const supported = await isSupported();
    return supported ? getAnalytics(app) : null;
  } catch {
    return null;
  }
}

/** Safely logs client event to Firebase Analytics */
export async function logAnalyticsEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const instance = await getFirebaseAnalytics();
    if (instance) {
      logEvent(instance, eventName, eventParams);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Analytics] Non-fatal log failure:", msg);
  }
}

/** Signs in user using Google Auth Provider */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/** Signs in user anonymously for quick session access */
export async function signInAnon(): Promise<UserCredential> {
  return signInAnonymously(auth);
}

export default app;
