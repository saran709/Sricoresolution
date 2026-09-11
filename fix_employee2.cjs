const fs = require('fs');
let emp = fs.readFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', 'utf8');

if (!emp.includes('serverTimestamp,') && !emp.includes('serverTimestamp }')) {
    emp = emp.replace(/import \{.*?\} from 'firebase\/firestore';/, (match) => {
        return match.replace('}', ', serverTimestamp }');
    });
}
fs.writeFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', emp);
