const fs = require('fs');
let emp = fs.readFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', 'utf8');

if (!emp.includes('import { serverTimestamp }')) {
    emp = `import { serverTimestamp } from 'firebase/firestore';\n` + emp;
}

fs.writeFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', emp);
