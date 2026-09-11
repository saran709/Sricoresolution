const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

if (!r.includes('AdminDiscovery')) {
    r = r.replace("const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));", 
                  "const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));\nconst AdminDiscovery = React.lazy(() => import('./pages/admin/Discovery'));");
}

if (!r.includes('path="discovery"')) {
    r = r.replace('<Route path="enquiries" element={<AdminEnquiries />} />', 
                  '<Route path="enquiries" element={<AdminEnquiries />} />\n            <Route path="discovery" element={<AdminDiscovery />} />');
}

fs.writeFileSync('src/router.tsx', r);
