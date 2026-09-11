const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

if (!r.includes('AdminBusinessInsights')) {
    r = r.replace("const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));", 
                  "const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));\nconst AdminBusinessInsights = React.lazy(() => import('./pages/admin/BusinessInsights'));\nconst AdminOrganization = React.lazy(() => import('./pages/admin/Departments'));\nconst AdminProfile = React.lazy(() => import('./pages/admin/Settings'));");
}

if (!r.includes('path="business-insights"')) {
    r = r.replace('<Route path="reports" element={<AdminReports />} />', 
                  '<Route path="reports" element={<AdminReports />} />\n            <Route path="business-insights" element={<AdminBusinessInsights />} />\n            <Route path="organization" element={<AdminOrganization />} />\n            <Route path="profile" element={<AdminProfile />} />');
}

fs.writeFileSync('src/router.tsx', r);
