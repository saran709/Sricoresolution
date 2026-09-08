const fs = require('fs');
let code = fs.readFileSync('src/router.tsx', 'utf8');

code = code.replace(
  "const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));",
  "const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));\nconst AdminSolutionRequests = React.lazy(() => import('./pages/admin/SolutionRequests'));"
);

code = code.replace(
  '<Route path="solution-requests" element={<PagePlaceholder title="Solution Requests" />} />',
  '<Route path="solution-requests" element={<AdminSolutionRequests />} />'
);

fs.writeFileSync('src/router.tsx', code);
