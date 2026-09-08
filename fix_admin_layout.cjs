const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AdminLayout.tsx', 'utf8');

code = code.replace(
  "{ name: 'Notifications', path: '/admin/notifications', icon: Bell },",
  "{ name: 'Notifications', path: '/admin/notifications', icon: Bell },\n        { name: 'Newsletters', path: '/admin/newsletters', icon: MessageSquare },"
);

fs.writeFileSync('src/components/layout/AdminLayout.tsx', code);
