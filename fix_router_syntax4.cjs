const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

r = r.replace(/<Route path="dashboard" element=\{\n\s*<ProtectedRoute>\n\s*<\/ProtectedRoute>\n\s*<Route path="\*" element/g, '<Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />\n            <Route path="*" element');

fs.writeFileSync('src/router.tsx', r);
