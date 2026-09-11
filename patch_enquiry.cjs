const fs = require('fs');
let code = fs.readFileSync('src/pages/Enquiry.tsx', 'utf8');

if (code.includes('serverTimestamp()') && !code.includes('serverTimestamp } from')) {
    code = code.replace(/import { firebaseService } from '\.\.\/lib\/firebaseService';/, "import { firebaseService } from '../lib/firebaseService';\nimport { serverTimestamp } from 'firebase/firestore';");
    fs.writeFileSync('src/pages/Enquiry.tsx', code);
}
