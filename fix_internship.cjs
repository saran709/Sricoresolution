const fs = require('fs');
let code = fs.readFileSync('src/pages/InternshipRegistration.tsx', 'utf8');

code = code.replace("import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';", "import { writeToSheet, readFromSheet } from '../lib/sheets';");

const firestoreLogic1 = `
        const q = query(collection(db, 'internship_applications'), where('candidateId', '==', currentUser.uid), where('programId', '==', programId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setExistingApplication(true);
        }
`;
const sheetLogic1 = `
        const snap = await readFromSheet('internship_applications', 'candidateId', currentUser.uid);
        if (snap && snap.some((s: any) => s.programId === programId)) {
          setExistingApplication(true);
        }
`;

const firestoreLogic2 = `
      createdAt: serverTimestamp(),
      status: 'pending'
    };
    
    try {
      const docRef = await addDoc(collection(db, 'internship_applications'), data);
      setApplicationId(docRef.id);
`;
const sheetLogic2 = `
      status: 'pending'
    };
    
    try {
      // Create a unique ID for the application locally
      const id = 'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      data.id = id;
      await writeToSheet('internship_applications', data);
      setApplicationId(id);
`;

code = code.replace(firestoreLogic1, sheetLogic1);
code = code.replace(firestoreLogic2, sheetLogic2);
fs.writeFileSync('src/pages/InternshipRegistration.tsx', code);
