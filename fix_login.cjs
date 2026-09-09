const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Login.tsx', 'utf8');

code = code.replace("import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';", "import { readFromSheet, writeToSheet } from '../../lib/sheets';");

const firestoreLogic = `
        // Create user profile if it doesn't exist
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'CANDIDATE', // default role
            createdAt: serverTimestamp(),
            status: 'active'
          });
        }
`;
const sheetLogic = `
        // Create user profile if it doesn't exist
        const users = await readFromSheet('users', 'uid', result.user.uid);
        if (!users || users.length === 0) {
          await writeToSheet('users', {
            uid: result.user.uid,
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'CANDIDATE',
            status: 'active'
          });
        }
`;

code = code.replace(firestoreLogic, sheetLogic);
fs.writeFileSync('src/pages/auth/Login.tsx', code);
