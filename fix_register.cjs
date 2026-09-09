const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Register.tsx', 'utf8');

code = code.replace("import { doc, setDoc, serverTimestamp } from 'firebase/firestore';", "import { writeToSheet } from '../../lib/sheets';");

const firestoreLogic = `
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName,
        lastName,
        role: role === 'CLIENT' ? 'CLIENT' : 'CANDIDATE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });
`;
const sheetLogic = `
      await writeToSheet('users', {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        role: role === 'CLIENT' ? 'CLIENT' : 'CANDIDATE',
        isActive: true,
      });
`;

code = code.replace(firestoreLogic, sheetLogic);
fs.writeFileSync('src/pages/auth/Register.tsx', code);
