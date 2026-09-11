const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');
r = r.replace(/<Route path="dashboard" element=\{\n\s*<ProtectedRoute>\n\s*<Dashboard \/>\n\s*<\/ProtectedRoute>\n\s*<Route/g, '<Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />\n            <Route');
fs.writeFileSync('src/router.tsx', r);
