const fs = require('fs');

// 1. AuthContext.tsx
let authCtx = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
authCtx = authCtx.replace(/users\[0\] as UserProfile/g, 'users[0] as unknown as UserProfile');
fs.writeFileSync('src/contexts/AuthContext.tsx', authCtx);

// 2. sheets.ts
let sheets = fs.readFileSync('src/lib/sheets.ts', 'utf8');
sheets = sheets.replace(/getByField/g, 'getByQuery');
sheets = sheets.replace(/queryKey, queryValue/g, "queryKey, '==', queryValue");
sheets = sheets.replace(/matchKey, matchValue/g, "matchKey, '==', matchValue");
fs.writeFileSync('src/lib/sheets.ts', sheets);

// 3. InternshipRegistration.tsx
let reg = fs.readFileSync('src/pages/InternshipRegistration.tsx', 'utf8');
reg = reg.replace(/id:\s*undefined,\s*\/\/\s*Let Firebase generate ID/, '');
fs.writeFileSync('src/pages/InternshipRegistration.tsx', reg);

// 4. EmployeeDashboard.tsx
let empDash = fs.readFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', 'utf8');
empDash = empDash.replace("docRef = await firebaseService.create", "const docRef = await firebaseService.create");
if (!empDash.includes('serverTimestamp')) {
    empDash = empDash.replace(/import \{.*?\} from 'firebase\/firestore';/, (match) => {
        return match.replace('}', ', serverTimestamp }');
    });
}
fs.writeFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', empDash);

