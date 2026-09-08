const fs = require('fs');
let code = fs.readFileSync('src/router.tsx', 'utf8');

if (!code.includes("AdminDiscovery")) {
  code = code.replace(
    "const AdminSolutionRequests = React.lazy(() => import('./pages/admin/SolutionRequests'));",
    "const AdminSolutionRequests = React.lazy(() => import('./pages/admin/SolutionRequests'));\nconst AdminDiscovery = React.lazy(() => import('./pages/admin/Discovery'));\nconst AdminBusinessInsights = React.lazy(() => import('./pages/admin/BusinessInsights'));"
  );
  code = code.replace(
    '<Route path="discovery" element={<PagePlaceholder title="Solution Discovery" />} />',
    '<Route path="discovery" element={<AdminDiscovery />} />'
  );
  code = code.replace(
    '<Route path="business-insights" element={<PagePlaceholder title="Business Insights" />} />',
    '<Route path="business-insights" element={<AdminBusinessInsights />} />'
  );
  fs.writeFileSync('src/router.tsx', code);
}
