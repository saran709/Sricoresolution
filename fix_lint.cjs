const fs = require('fs');
let code = fs.readFileSync('src/pages/InternshipRegistration.tsx', 'utf8');

code = code.replace(
  "if (existingApp.status === 'approved' || existingApp.status === 'completed' || existingApp.paymentStatus === 'paid')",
  "if ((existingApp as any).status === 'approved' || (existingApp as any).status === 'completed' || (existingApp as any).paymentStatus === 'paid')"
);

fs.writeFileSync('src/pages/InternshipRegistration.tsx', code);
