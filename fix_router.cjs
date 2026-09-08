const fs = require('fs');
let code = fs.readFileSync('src/router.tsx', 'utf8');

code = code.replace(
  "const AdminContent = React.lazy(() => import('./pages/admin/Content'));",
  "const AdminContent = React.lazy(() => import('./pages/admin/Content'));\nconst AdminNewsletters = React.lazy(() => import('./pages/admin/Newsletters'));"
);

code = code.replace(
  "<Route path=\"website\" element={<AdminContent />} />",
  "<Route path=\"website\" element={<AdminContent />} />\n            <Route path=\"newsletters\" element={<AdminNewsletters />} />"
);

fs.writeFileSync('src/router.tsx', code);
