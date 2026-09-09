const fs = require('fs');
let code = fs.readFileSync('src/pages/TellUsYourProblem.tsx', 'utf8');

code = code.replace("import { collection, addDoc, serverTimestamp } from 'firebase/firestore';", "import { writeToSheet } from '../lib/sheets';");
code = code.replace("import { db } from '../lib/firebase';", "");

const firestoreLogic = `
      await addDoc(collection(db, 'solutionRequests'), formData);
`;
const sheetLogic = `
      await writeToSheet('solutionRequests', formData);
`;

code = code.replace(firestoreLogic, sheetLogic);
fs.writeFileSync('src/pages/TellUsYourProblem.tsx', code);
