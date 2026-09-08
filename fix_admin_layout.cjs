const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AdminLayout.tsx', 'utf8');

const injection = `
    {
      title: 'Client Acquisition',
      items: [
        { name: 'Solution Requests', path: '/admin/solution-requests', icon: MessageSquare },
        { name: 'Discovery', path: '/admin/discovery', icon: Shield },
      ]
    },`;

// insert right after "Dashboard" category
code = code.replace(
  "    {      title: 'Dashboard',      items: [        { name: 'Overview', path: '/admin', icon: LayoutDashboard },      ]    },",
  "    {      title: 'Dashboard',      items: [        { name: 'Overview', path: '/admin', icon: LayoutDashboard },      ]    }," + injection
);

// We should also replace the System icon from 'FileSpreadsheet' and 'Activity' as they are needed but I should check if they are imported.
// 'Activity' is imported. 'FileSpreadsheet' is imported.

fs.writeFileSync('src/components/layout/AdminLayout.tsx', code);
