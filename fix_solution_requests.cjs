const fs = require('fs');
let r = fs.readFileSync('src/pages/admin/SolutionRequests.tsx', 'utf8');
r = r.replace(/solutionRequests/g, 'project_requests');
r = r.replace(/project_requests\(\)/g, 'SolutionRequests()'); // Ensure function name remains correct
fs.writeFileSync('src/pages/admin/SolutionRequests.tsx', r);
console.log("Fixed solution requests collection name");
