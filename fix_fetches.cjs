const fs = require('fs');
['src/pages/admin/Documents.tsx', 'src/pages/admin/Employees.tsx', 'src/pages/admin/Payments.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/await fetchDocuments\(\);/g, '');
  content = content.replace(/fetchEmployees\(\);/g, '');
  content = content.replace(/fetchPayments\(\);/g, '');
  fs.writeFileSync(file, content);
});
