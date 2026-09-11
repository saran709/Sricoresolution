const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

if (!r.includes('AdminSolutionRequests')) {
    r = r.replace("const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));", 
                  "const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));\nconst AdminSolutionRequests = React.lazy(() => import('./pages/admin/SolutionRequests'));");
}

if (!r.includes('path="solution-requests"')) {
    r = r.replace('<Route path="enquiries" element={<AdminEnquiries />} />', 
                  '<Route path="enquiries" element={<AdminEnquiries />} />\n            <Route path="solution-requests" element={<AdminSolutionRequests />} />');
}

fs.writeFileSync('src/router.tsx', r);
