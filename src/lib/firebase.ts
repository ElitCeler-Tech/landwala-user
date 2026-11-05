import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config is public by design (it ships in every page bundle).
// The defaults are the production project, so the site builds and runs on a
// Vercel project that has no NEXT_PUBLIC_FIREBASE_* variables set.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDH1WYwJ3Hf2B7CgZJYg_qCSRRwDIS6cfI",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "landwala-fec40.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "landwala-fec40",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "landwala-fec40.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "938612729320",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:938612729320:web:92a6a089b26649ec0e305d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
