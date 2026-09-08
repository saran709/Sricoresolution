const fs = require('fs');
let code = fs.readFileSync('src/router.tsx', 'utf8');

if (!code.includes("const TellUsYourProblem = React.lazy")) {
  code = code.replace(
    "const Enquiry = React.lazy(() => import('./pages/Enquiry'));",
    "const Enquiry = React.lazy(() => import('./pages/Enquiry'));\nconst TellUsYourProblem = React.lazy(() => import('./pages/TellUsYourProblem'));"
  );
  
  code = code.replace(
    '<Route path="enquiry" element={<Enquiry />} />',
    '<Route path="enquiry" element={<Enquiry />} />\n            <Route path="tell-us-your-problem" element={<TellUsYourProblem />} />'
  );
  
  fs.writeFileSync('src/router.tsx', code);
}
