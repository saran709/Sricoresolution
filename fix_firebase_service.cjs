const fs = require('fs');
let r = fs.readFileSync('src/lib/firebaseService.ts', 'utf8');

r = r.replace(`  async getById(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },`, `  async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch(e) {
      console.error(e);
      return null;
    }
  },`);
fs.writeFileSync('src/lib/firebaseService.ts', r);
