const fs = require('fs');
let emp = fs.readFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', 'utf8');

emp = emp.replace(/docRef\.id/g, 'docId');
if (!emp.includes('serverTimestamp')) {
    emp = emp.replace(/import \{.*?\} from 'firebase\/firestore';/, (match) => {
        if (!match.includes('serverTimestamp')) {
            return match.replace('}', ', serverTimestamp }');
        }
        return match;
    });
}
// Add import serverTimestamp from 'firebase/firestore' explicitly if it's missing
if (!emp.includes('serverTimestamp')) {
    emp = `import { serverTimestamp } from 'firebase/firestore';\n` + emp;
}

fs.writeFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', emp);

// Also fix InternshipRegistration
let reg = fs.readFileSync('src/pages/InternshipRegistration.tsx', 'utf8');
reg = reg.replace(/payload\.id = id;/g, '(payload as any).id = id;');
fs.writeFileSync('src/pages/InternshipRegistration.tsx', reg);

