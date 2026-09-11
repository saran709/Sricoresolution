const fs = require('fs');

const filesToPatch = [
  { path: 'src/pages/admin/Enquiries.tsx', arrName: 'items', setter: 'setEnquiries' },
  { path: 'src/pages/admin/Clients.tsx', arrName: 'items', setter: 'setClients' },
  { path: 'src/pages/admin/Documents.tsx', arrName: 'items', setter: 'setDocuments' },
  { path: 'src/pages/admin/Employees.tsx', arrName: 'emps', setter: 'setEmployees' },
  { path: 'src/pages/admin/Support.tsx', arrName: 'items', setter: 'setTickets' }
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file.path)) {
    let code = fs.readFileSync(file.path, 'utf8');

    const targetStr = `const snapshot = await getDocs(q);`;
    const idx = code.indexOf(targetStr);
    
    // Check if it's already using onSnapshot
    if (idx > -1 && !code.includes('return onSnapshot(q,')) {
      const startIdx = idx;
      const endIdx = code.indexOf('};', startIdx);
      
      const newBlock = `return onSnapshot(q, (snapshot) => {
        const ${file.arrName}: any[] = [];
        snapshot.forEach(doc => {
          ${file.arrName}.push({ id: doc.id, ...doc.data() });
        });
        ${file.setter}(${file.arrName});
        setLoading(false);
      });
      `;
      
      code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
      fs.writeFileSync(file.path, code);
      console.log('Fixed', file.path);
    }
  }
});
