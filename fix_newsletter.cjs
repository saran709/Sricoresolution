const fs = require('fs');
let code = fs.readFileSync('src/components/NewsletterSignup.tsx', 'utf8');

code = code.replace("import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';", "import { writeToSheet, readFromSheet } from '../lib/sheets';");
code = code.replace("import { db } from '../lib/firebase';", "");

const checkLogic = `
      // Check if already subscribed
      const q = query(collection(db, 'newsletter_subscribers'), where('email', '==', data.email.toLowerCase()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setSubmitStatus('error');
        setErrorMessage('This email is already subscribed.');
        setLoading(false);
        return;
      }
      
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: data.email.toLowerCase(),
        source: 'footer',
        status: 'active',
        createdAt: serverTimestamp()
      });
`;
const checkLogicNew = `
      // Check if already subscribed
      const snap = await readFromSheet('newsletter_subscribers', 'email', data.email.toLowerCase());
      
      if (snap && snap.length > 0) {
        setSubmitStatus('error');
        setErrorMessage('This email is already subscribed.');
        setLoading(false);
        return;
      }
      
      await writeToSheet('newsletter_subscribers', {
        email: data.email.toLowerCase(),
        source: 'footer',
        status: 'active'
      });
`;

code = code.replace(checkLogic, checkLogicNew);
fs.writeFileSync('src/components/NewsletterSignup.tsx', code);
