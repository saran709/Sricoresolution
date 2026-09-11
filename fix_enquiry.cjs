const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Enquiries.tsx', 'utf8');
code = code.replace(/    setEmailSuccess\(''\);\n    \n\n      const response = await fetch\('/m, "    setEmailSuccess('');\n    try {\n      const response = await fetch(");
code = code.replace(/    setEmailSuccess\(''\);\n    \n      const response = await fetch\('/m, "    setEmailSuccess('');\n    try {\n      const response = await fetch(");
fs.writeFileSync('src/pages/admin/Enquiries.tsx', code);
