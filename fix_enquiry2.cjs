const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Enquiries.tsx', 'utf8');

code = code.replace(/  const handleStatusChange = async \(id: string, newStatus: string\) => \{\n      await updateDoc/m, "  const handleStatusChange = async (id: string, newStatus: string) => {\n    try {\n      await updateDoc");

code = code.replace(/  const convertToProject = async \(enquiry: Enquiry\) => \{\n      if \(!enquiry\.clientId\) \{/m, "  const convertToProject = async (enquiry: Enquiry) => {\n    try {\n      if (!enquiry.clientId) {");

fs.writeFileSync('src/pages/admin/Enquiries.tsx', code);
