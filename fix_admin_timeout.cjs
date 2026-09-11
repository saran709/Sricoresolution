const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// Reduce safety timeout from 2000ms to 400ms so the dashboard renders instantly
code = code.replace(
  'setTimeout(() => {\n      setLoading(false);\n    }, 2000);',
  'setTimeout(() => {\n      setLoading(false);\n    }, 400);'
);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
