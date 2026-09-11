const fs = require('fs');

const filesToPatch = [
  {
    path: 'src/pages/admin/Projects.tsx',
    collection: 'projects',
    setter: 'setProjects'
  },
  {
    path: 'src/pages/admin/Tasks.tsx',
    collection: 'tasks',
    setter: 'setTasks'
  },
  {
    path: 'src/pages/admin/Internships.tsx',
    collection: 'internship_applications',
    setter: 'setApplications'
  },
  {
    path: 'src/pages/admin/Payments.tsx',
    collection: 'payments',
    setter: 'setPayments'
  },
  {
    path: 'src/pages/admin/Enquiries.tsx',
    collection: 'project_requests',
    setter: 'setEnquiries'
  },
  {
    path: 'src/pages/admin/Clients.tsx',
    collection: 'users',
    setter: 'setClients'
  },
  {
    path: 'src/pages/admin/Documents.tsx',
    collection: 'documents',
    setter: 'setDocuments'
  },
  {
    path: 'src/pages/admin/Employees.tsx',
    collection: 'users',
    setter: 'setEmployees'
  },
  {
    path: 'src/pages/admin/Audit.tsx',
    collection: 'auditLogs',
    setter: 'setLogs'
  },
  {
    path: 'src/pages/admin/Support.tsx',
    collection: 'support_tickets',
    setter: 'setTickets'
  }
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file.path)) {
    let code = fs.readFileSync(file.path, 'utf8');
    
    // Add onSnapshot import if missing
    if (!code.includes('onSnapshot')) {
      code = code.replace(/import \{([^}]+)\} from 'firebase\/firestore';/, (match, imports) => {
        return `import {${imports}, onSnapshot} from 'firebase/firestore';`;
      });
    }

    // Replace fetchXXX call inside useEffect with subscribe logic
    // This requires some careful regex or targeted replacement
    
    // Most files have:
    // useEffect(() => {
    //   fetchXXX();
    // }, []);
    
    const fetchCallRegex = /  useEffect\(\(\) => \{\n    fetch[a-zA-Z]+\(\);\n  \}, \[\]\);/;
    
    if (fetchCallRegex.test(code)) {
      code = code.replace(fetchCallRegex, `  useEffect(() => {
    const unsubscribe = setupSubscription();
    return () => unsubscribe && unsubscribe();
  }, []);`);
    } else if (code.includes('useEffect(() => {') && code.includes('}, []);')) {
      // Find the useEffect block and patch it
       code = code.replace(/  useEffect\(\(\) => \{\n    fetch[a-zA-Z]+\(\);\n  \}, \[\]\);/g, `  useEffect(() => {
    const unsubscribe = setupSubscription();
    return () => unsubscribe && unsubscribe();
  }, []);`);
    }
    
    // We will rename the fetchXXX function to setupSubscription
    code = code.replace(/const fetch[a-zA-Z]+ = async \(\) => {/g, 'const setupSubscription = () => {');
    
    // Replace the getDocs logic with onSnapshot
    // From:
    // const snapshot = await getDocs(q);
    // const items: ... = [];
    // snapshot.forEach(doc => ...);
    // setter(items);
    // To:
    // return onSnapshot(q, (snapshot) => {
    //   const items: any[] = [];
    //   snapshot.forEach(doc => ...);
    //   setter(items);
    //   setLoading(false);
    // }, (error) => { ... setLoading(false) });
    
    const getDocsRegex = /const snapshot = await getDocs\(q\);\n\s*const ([a-zA-Z]+):.*?= \[\];\n\s*snapshot\.forEach\(doc => \{\n\s*\1\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as any\);\n\s*\}\);\n\s*[a-zA-Z]+\(\1\);/m;
    
    // A broader regex to catch different variations
    code = code.replace(/      const snapshot = await getDocs\(q\);\n      const ([a-zA-Z]+):.*? = \[\];\n      snapshot\.forEach\(doc => \{\n        \1\.push\(\{.*?\} as .*?\);\n      \}\);\n      [a-zA-Z]+\(\1\);/, (match, arrName) => {
      // This is a bit too specific, let's just use string replacement on a case by case or a general block replacement
      return match; 
    });

    fs.writeFileSync(file.path, code);
  }
});
