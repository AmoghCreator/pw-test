import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

/**
 * Returns a singleton Firebase Admin Firestore instance.
 * On GCP (Cloud Run), uses Application Default Credentials automatically.
 * Locally, uses FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY from .env.local.
 */
export function getFirestoreAdmin(): Firestore {
  if (!adminApp) {
    if (getApps().length > 0) {
      adminApp = getApps()[0]!;
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.GOOGLE_CLOUD_PROJECT,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      adminApp = initializeApp();
    }
  }

  return getFirestore(adminApp);
}
