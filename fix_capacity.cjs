const fs = require('fs');
let r = fs.readFileSync('src/pages/admin/Internships.tsx', 'utf8');

const oldHandle = `  const handleStatusChange = async (app: InternshipApplication, newStatus: InternshipApplication['status']) => {
    try {
      if (!app.id) return;`;

const newHandle = `  const handleStatusChange = async (app: InternshipApplication, newStatus: InternshipApplication['status']) => {
    try {
      if (!app.id) return;
      
      // Enforce Capacity logic for moving into 'approved' or later stages
      const activeStatuses = ['approved', 'onboarding', 'mentor_assignment', 'training', 'assignments', 'practical_work', 'project', 'evaluation', 'completed', 'certificate'];
      if (activeStatuses.includes(newStatus) && !activeStatuses.includes(app.status)) {
        if (app.programId) {
          const programDoc = await getDoc(doc(db, 'internships', app.programId));
          if (programDoc.exists()) {
             const capacity = programDoc.data().capacity || 0;
             if (capacity > 0) {
               // Count how many are currently active
               const allAppsSnap = await getDocs(query(collection(db, 'internship_applications'), orderBy('createdAt', 'desc')));
               let activeCount = 0;
               allAppsSnap.forEach(d => {
                 const data = d.data();
                 if (data.programId === app.programId && activeStatuses.includes(data.status)) {
                   activeCount++;
                 }
               });
               if (activeCount >= capacity) {
                 if (!window.confirm(\`This program has reached its capacity of \${capacity}. Do you want to intentionally override and approve this candidate anyway?\`)) {
                   return; // Cancel
                 }
               }
             }
          }
        }
      }
`;

r = r.replace(oldHandle, newHandle);
fs.writeFileSync('src/pages/admin/Internships.tsx', r);
console.log("Fixed internships capacity check");
