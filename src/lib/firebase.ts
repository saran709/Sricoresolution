import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore specifying the named database
export const db = getFirestore(app, "ai-studio-sricoresolutions-785f07d0-b63b-4478-95d4-3d4e52e3e41f");
// Initialize Auth
export const auth = getAuth(app);
// Initialize Storage
export const storage = getStorage(app);
