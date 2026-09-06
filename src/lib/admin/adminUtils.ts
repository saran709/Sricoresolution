import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole } from '../../types';

// We use a secondary Firebase app instance to create users without signing out the current admin
const firebaseConfig = {
  projectId: "gen-lang-client-0077172740",
  appId: "1:581820378776:web:959d47acd51c1e8dba2aed",
  apiKey: "AIzaSyBKeDTGNow-q9TN5Os7hMDwin_hsVaMJ8c",
  authDomain: "gen-lang-client-0077172740.firebaseapp.com",
};

const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
const secondaryAuth = getAuth(secondaryApp);

export async function createSystemUser(
  adminUid: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole,
  additionalData: any = {}
) {
  try {
    // 1. Create user in Firebase Auth using the secondary app
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUid = userCredential.user.uid;

    // 2. Create the user document in Firestore
    await setDoc(doc(db, 'users', newUid), {
      email,
      firstName,
      lastName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      ...additionalData
    });

    // 3. Log the action
    await logAudit(adminUid, 'CREATE_USER', newUid, 'user', {
      email,
      role,
      message: `Created new ${role} user`
    });

    // 4. Sign out the secondary app so it's clean for the next use
    await secondaryAuth.signOut();

    return { success: true, uid: newUid };
  } catch (error: any) {
    console.error("Failed to create system user:", error);
    throw new Error(error.message || "Failed to create user");
  }
}

export async function logAudit(
  adminUid: string,
  action: string,
  resourceId: string,
  resourceType: string,
  details: any
) {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      action,
      performedBy: adminUid,
      resourceId,
      resourceType,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
