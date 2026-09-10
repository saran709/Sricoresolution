const fs = require('fs');

let code = fs.readFileSync('src/router.tsx', 'utf8');

// Add imports for the new admin pages
const importsToInsert = `
const AdminDepartments = React.lazy(() => import('./pages/admin/Departments'));
const AdminMentors = React.lazy(() => import('./pages/admin/Mentors'));
const AdminInterns = React.lazy(() => import('./pages/admin/Interns'));
const AdminCandidates = React.lazy(() => import('./pages/admin/Candidates'));
const AdminAttendance = React.lazy(() => import('./pages/admin/Attendance'));
const AdminLeave = React.lazy(() => import('./pages/admin/Leave'));
const AdminVendors = React.lazy(() => import('./pages/admin/Vendors'));
const AdminNotifications = React.lazy(() => import('./pages/admin/Notifications'));
const AdminReports = React.lazy(() => import('./pages/admin/Reports'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));
`;

// Insert after the last Admin import
code = code.replace(
  /const AdminInvoices = React.lazy\(\(\) => import\('\.\/pages\/admin\/Invoices'\)\);/,
  "const AdminInvoices = React.lazy(() => import('./pages/admin/Invoices'));" + importsToInsert
);

// Replace the placeholders with the actual components
code = code.replace(/<Route path="departments" element=\{<PagePlaceholder title="Departments" \/>\} \/>/, '<Route path="departments" element={<AdminDepartments />} />');
code = code.replace(/<Route path="mentors" element=\{<PagePlaceholder title="Mentors" \/>\} \/>/, '<Route path="mentors" element={<AdminMentors />} />');
code = code.replace(/<Route path="interns" element=\{<PagePlaceholder title="Interns" \/>\} \/>/, '<Route path="interns" element={<AdminInterns />} />');
code = code.replace(/<Route path="candidates" element=\{<PagePlaceholder title="Candidates" \/>\} \/>/, '<Route path="candidates" element={<AdminCandidates />} />');
code = code.replace(/<Route path="attendance" element=\{<PagePlaceholder title="Attendance" \/>\} \/>/, '<Route path="attendance" element={<AdminAttendance />} />');
code = code.replace(/<Route path="leave" element=\{<PagePlaceholder title="Leave" \/>\} \/>/, '<Route path="leave" element={<AdminLeave />} />');
code = code.replace(/<Route path="vendors" element=\{<PagePlaceholder title="Vendors" \/>\} \/>/, '<Route path="vendors" element={<AdminVendors />} />');
code = code.replace(/<Route path="notifications" element=\{<PagePlaceholder title="Notifications" \/>\} \/>/, '<Route path="notifications" element={<AdminNotifications />} />');
code = code.replace(/<Route path="reports" element=\{<PagePlaceholder title="Reports" \/>\} \/>/, '<Route path="reports" element={<AdminReports />} />');
code = code.replace(/<Route path="settings" element=\{<PagePlaceholder title="Settings" \/>\} \/>/, '<Route path="settings" element={<AdminSettings />} />');

fs.writeFileSync('src/router.tsx', code);
console.log("Patched router.tsx");
