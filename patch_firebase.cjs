const fs = require('fs');
let code = fs.readFileSync('src/lib/firebaseService.ts', 'utf8');

const importStatement = `import { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';`;

code = code.replace(/import \{.*?\} from 'firebase\/firestore';/, importStatement);

const newMethods = `
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
`;

code = code.replace('export const firebaseService = {', 'export const firebaseService = {' + newMethods);

fs.writeFileSync('src/lib/firebaseService.ts', code);
