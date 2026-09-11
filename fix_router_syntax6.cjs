const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

const regex = /<ProtectedRoute>\n\s*<Dashboard \/>\n\s*<\/ProtectedRoute>\n\s*<Route/g;
if (regex.test(r)) {
    r = r.replace(regex, '<ProtectedRoute><Dashboard /></ProtectedRoute>} />\n            <Route');
} else {
    // Brute force fix the end block
    r = r.replace(/<Route path="dashboard" element=\{[\s\S]*?<ProtectedRoute>\s*<Dashboard \/>\s*<\/ProtectedRoute>[\s\S]*?<Route/gm, '<Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />\n            <Route');
}

fs.writeFileSync('src/router.tsx', r);
