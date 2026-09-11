const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Enquiries.tsx', 'utf8');
code = code.replace(/  const setupSubscription = \(\) => \{\n    setLoading\(true\);\n    try \{/m, "  const setupSubscription = () => {\n    setLoading(true);");
fs.writeFileSync('src/pages/admin/Enquiries.tsx', code);
