import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyAsYnbzBU3UmuwmCrnJiHEMZ9A7f2NPzL8",
  authDomain: "sri-core-solutions.firebaseapp.com",
  projectId: "sri-core-solutions",
  storageBucket: "sri-core-solutions.firebasestorage.app",
  messagingSenderId: "520057348164",
  appId: "1:520057348164:web:ebd951a3bcd83461e0dc11",
  measurementId: "G-1F5YXP36TC"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Storage
export const storage = getStorage(app);
