const fs = require('fs');

function removeDbImport(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes("import { db } from")) {
    code = code.replace(/import\s*\{\s*db\s*\}\s*from\s*['"]\.\.\/?lib\/firebase['"];?\n?/, "");
    code = code.replace(/import\s*\{\s*db\s*,\s*auth\s*\}\s*from\s*['"]\.\.\/?lib\/firebase['"];?\n?/, "import { auth } from '../lib/firebase';\n");
    code = code.replace(/import\s*\{\s*auth\s*,\s*db\s*\}\s*from\s*['"]\.\.\/?lib\/firebase['"];?\n?/, "import { auth } from '../../lib/firebase';\n");
    fs.writeFileSync(file, code);
  }
}

removeDbImport('src/pages/auth/Register.tsx');
removeDbImport('src/pages/auth/Login.tsx');
removeDbImport('src/components/payments/CheckoutButton.tsx');
removeDbImport('src/contexts/AuthContext.tsx');
removeDbImport('src/pages/InternshipRegistration.tsx');
