import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "gen-lang-client-0077172740",
  appId: "1:581820378776:web:959d47acd51c1e8dba2aed",
  apiKey: "AIzaSyBKeDTGNow-q9TN5Os7hMDwin_hsVaMJ8c",
  authDomain: "gen-lang-client-0077172740.firebaseapp.com",
  storageBucket: "gen-lang-client-0077172740.firebasestorage.app",
  messagingSenderId: "581820378776",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore specifying the named database
export const db = getFirestore(app, "ai-studio-sricoresolutions-785f07d0-b63b-4478-95d4-3d4e52e3e41f");

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);
