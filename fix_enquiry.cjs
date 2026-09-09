const fs = require('fs');
let code = fs.readFileSync('src/pages/Enquiry.tsx', 'utf8');

code = code.replace("import { collection, addDoc, serverTimestamp } from 'firebase/firestore';", "import { writeToSheet } from '../lib/sheets';");
code = code.replace("import { db } from '../lib/firebase';", "");

const firestoreLogic = `
      await addDoc(collection(db, 'project_requests'), data);
`;
const sheetLogic = `
      await writeToSheet('project_requests', data);
`;

code = code.replace(firestoreLogic, sheetLogic);
fs.writeFileSync('src/pages/Enquiry.tsx', code);
