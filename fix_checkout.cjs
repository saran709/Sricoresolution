const fs = require('fs');
let code = fs.readFileSync('src/components/payments/CheckoutButton.tsx', 'utf8');

code = code.replace("import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';", "import { writeToSheet } from '../../lib/sheets';");

const firestoreLogic = `
      // 1. Create a payment record in Firestore
      const paymentData = {
        itemId,
        itemType,
        amount,
        clientId: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        reference: ''
      };
      
      const paymentRef = await addDoc(collection(db, 'payments'), paymentData);
      
      // Update with reference
      await updateDoc(doc(db, 'payments', paymentRef.id), {
        reference: paymentRef.id
      });
`;
const sheetLogic = `
      // 1. Create a payment record in Sheets
      const paymentId = 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const paymentData = {
        id: paymentId,
        itemId,
        itemType,
        amount,
        clientId: currentUser.uid,
        status: 'pending',
        reference: paymentId
      };
      
      await writeToSheet('payments', paymentData);
`;

code = code.replace(firestoreLogic, sheetLogic);
fs.writeFileSync('src/components/payments/CheckoutButton.tsx', code);
