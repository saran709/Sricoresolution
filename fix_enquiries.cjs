const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Enquiries.tsx', 'utf8');
code = code.replace("import { getCachedAccessToken } from '../../lib/auth';", "");
fs.writeFileSync('src/pages/admin/Enquiries.tsx', code);
