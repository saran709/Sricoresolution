const fs = require('fs');
let code = fs.readFileSync('src/components/NewsletterSignup.tsx', 'utf8');

const firestoreLogic = `      const q = query(collection(db, 'newsletter_subscribers'), where('email', '==', data.email.toLowerCase()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setStatus('error');
        setMessage('This email is already subscribed.');
        return;
      }
      
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: data.email.toLowerCase(),
        status: 'active',
        subscribedAt: serverTimestamp()
      });`;

const sheetsLogic = `      const snap = await readFromSheet('newsletter_subscribers', 'email', data.email.toLowerCase());
      
      if (snap && snap.length > 0) {
        setStatus('error');
        setMessage('This email is already subscribed.');
        return;
      }
      
      await writeToSheet('newsletter_subscribers', {
        email: data.email.toLowerCase(),
        status: 'active'
      });`;

code = code.replace(firestoreLogic, sheetsLogic);
fs.writeFileSync('src/components/NewsletterSignup.tsx', code);
