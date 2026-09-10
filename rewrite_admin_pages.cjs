const fs = require('fs');
const path = require('path');

function writeCrudPage(filename, title, sheetName, columns, filterLogic = undefined) {
  const filterProp = filterLogic ? ` filterLogic={${filterLogic}}` : '';
  const code = `import React from 'react';
import { CrudTable } from '../../components/ui/CrudTable';

export default function ${filename.replace('.tsx', '')}() {
  const columns = ${JSON.stringify(columns, null, 2)};
  
  return (
    <CrudTable 
      title="${title}"
      sheetName="${sheetName}"
      columns={columns}${filterProp}
    />
  );
}
`;
  fs.writeFileSync(path.join('src/pages/admin', filename), code);
}

const deptCols = [
  { key: 'name', label: 'Department Name' },
  { key: 'head', label: 'Department Head' },
  { key: 'email', label: 'Contact Email', type: 'email' }
];

const userCols = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'role', label: 'Role' }
];

const vendorCols = [
  { key: 'companyName', label: 'Company Name' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' }
];

const attendanceCols = [
  { key: 'userId', label: 'User ID' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'status', label: 'Status' },
  { key: 'checkIn', label: 'Check In Time' }
];

const leaveCols = [
  { key: 'userId', label: 'User ID' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'endDate', label: 'End Date', type: 'date' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' }
];

const notificationCols = [
  { key: 'title', label: 'Title' },
  { key: 'message', label: 'Message' },
  { key: 'type', label: 'Type' },
  { key: 'audience', label: 'Audience (Role)' }
];

writeCrudPage('Departments.tsx', 'Departments', 'departments', deptCols);
writeCrudPage('Mentors.tsx', 'Mentors', 'users', userCols, "(u: any) => u.role === 'MENTOR'");
writeCrudPage('Interns.tsx', 'Interns', 'users', userCols, "(u: any) => u.role === 'INTERN'");
writeCrudPage('Candidates.tsx', 'Candidates', 'users', userCols, "(u: any) => u.role === 'CANDIDATE'");
writeCrudPage('Vendors.tsx', 'Vendors', 'vendors', vendorCols);
writeCrudPage('Attendance.tsx', 'Attendance Logs', 'attendance', attendanceCols);
writeCrudPage('Leave.tsx', 'Leave Requests', 'leaveRequests', leaveCols);
writeCrudPage('Notifications.tsx', 'Global Notifications', 'notifications', notificationCols);

console.log("Rewrote admin pages with CRUD table.");
