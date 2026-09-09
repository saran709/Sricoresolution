const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// Replace imports
code = code.replace("import { doc, getDoc } from 'firebase/firestore';", "import { readFromSheet } from '../lib/sheets';");

// Replace getDoc
const firestoreLogic = `
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile({ uid: user.uid, ...userDoc.data() } as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
`;
const sheetLogic = `
        try {
          const users = await readFromSheet('users', 'uid', user.uid);
          if (users && users.length > 0) {
            setUserProfile(users[0] as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
`;

code = code.replace(firestoreLogic, sheetLogic);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
