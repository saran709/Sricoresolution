const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Enquiries.tsx', 'utf8');

code = code.replace(
  "return (\n    <div className=\"space-y-6\">",
  "return (\n    <>\n      <div className=\"space-y-6\">"
);

code = code.replace(
  "      )}\n\n  );\n}",
  "      )}\n    </>\n  );\n}"
);

fs.writeFileSync('src/pages/admin/Enquiries.tsx', code);
