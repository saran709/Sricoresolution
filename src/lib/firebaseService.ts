import { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export const firebaseService = {
  subscribeToCollection(collectionName: string, callback: (data: any[]) => void) {
    const q = collection(db, collectionName);
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error("Error subscribing to collection:", error);
    });
  },

  subscribeToQuery(collectionName: string, field: string, operator: any, value: any, callback: (data: any[]) => void) {
    const q = query(collection(db, collectionName), where(field, operator, value));
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error("Error subscribing to query:", error);
    });
  },

  async getAll(collectionName: string) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getByQuery(collectionName: string, field: string, operator: any, value: any) {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch(e: any) {
      console.warn('Ignored transient getDoc error:', e.message);
      return null;
    }
  },

  
  async createWithId(collectionName: string, id: string, data: any) {
    const docRef = doc(db, collectionName, id);
    const { id: _, ...saveData } = data; // strip id from data payload if it exists
    await setDoc(docRef, {
      ...saveData,
      createdAt: saveData.createdAt || new Date().toISOString()
    }, { merge: true });
    return { id, ...saveData };
  },

  async create(collectionName: string, data: any) {
    if (data.id) {
      return this.createWithId(collectionName, data.id, data);
    }
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async update(collectionName: string, id: string, data: any) {
    const { id: _, ...updateData } = data; // Exclude id
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...data };
  },

  async remove(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return id;
  }
};
