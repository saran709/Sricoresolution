const fs = require('fs');

const filesToPatch = [
  { path: 'src/pages/admin/Projects.tsx', arrName: 'items', setter: 'setProjects' },
  { path: 'src/pages/admin/Tasks.tsx', arrName: 'items', setter: 'setTasks' },
  { path: 'src/pages/admin/Internships.tsx', arrName: 'items', setter: 'setApplications' },
  { path: 'src/pages/admin/Payments.tsx', arrName: 'items', setter: 'setPayments' },
  { path: 'src/pages/admin/Enquiries.tsx', arrName: 'items', setter: 'setEnquiries' },
  { path: 'src/pages/admin/Clients.tsx', arrName: 'items', setter: 'setClients' },
  { path: 'src/pages/admin/Documents.tsx', arrName: 'items', setter: 'setDocuments' },
  { path: 'src/pages/admin/Employees.tsx', arrName: 'emps', setter: 'setEmployees' },
  { path: 'src/pages/admin/Audit.tsx', arrName: 'items', setter: 'setLogs' },
  { path: 'src/pages/admin/Support.tsx', arrName: 'items', setter: 'setTickets' }
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file.path)) {
    let code = fs.readFileSync(file.path, 'utf8');

    // Replace getDocs logic with onSnapshot properly
    const oldBlockRegex = new RegExp(`const snapshot = await getDocs\\(q\\);\\s*const ${file.arrName}:.*?\\[\\];\\s*snapshot\\.forEach\\(doc => \\{\\s*${file.arrName}\\.push\\(\\{.*?\\} as .*?\\);\\s*\\}\\);\\s*${file.setter}\\(${file.arrName}\\);`, 'm');

    if (oldBlockRegex.test(code)) {
      code = code.replace(oldBlockRegex, `return onSnapshot(q, (snapshot) => {
        const ${file.arrName}: any[] = [];
        snapshot.forEach(doc => {
          ${file.arrName}.push({ id: doc.id, ...doc.data() });
        });
        ${file.setter}(${file.arrName});
        setLoading(false);
      }, (error) => {
        console.error("Error in subscription:", error);
        setLoading(false);
      });`);
    }

    // Now remove try/catch and finally block if onSnapshot handles it
    // From:
    // const setupSubscription = () => {
    //   setLoading(true);
    //   try {
    //     const q = ...;
    //     return onSnapshot(...)
    //   } catch (error) { ... } finally { ... }
    // }
    
    code = code.replace(/    } catch \(error\) {[\s\S]*?} finally {[\s\S]*?}/m, '');
    code = code.replace(/    try {/m, '');
    
    fs.writeFileSync(file.path, code);
  }
});
