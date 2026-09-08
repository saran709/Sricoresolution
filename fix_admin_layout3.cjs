const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AdminLayout.tsx', 'utf8');

code = code.replace(
  "{ name: 'Discovery', path: '/admin/discovery', icon: Shield },",
  "{ name: 'Discovery', path: '/admin/discovery', icon: Shield },\n        { name: 'Business Insights', path: '/admin/business-insights', icon: Activity },"
);

fs.writeFileSync('src/components/layout/AdminLayout.tsx', code);
