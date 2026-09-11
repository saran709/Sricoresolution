const fs = require('fs');
let r = fs.readFileSync('src/pages/dashboard/roles/InternDashboard.tsx', 'utf8');

r = r.replace(`        if (userProfile.mentorId) {
          const mDoc = await getDoc(doc(db, 'users', userProfile.mentorId));
          if (mDoc.exists()) {
            setMentor({ id: mDoc.id, ...mDoc.data() } as User);
          }
        }`, `        if (userProfile.mentorId) {
          try {
            const mDoc = await getDoc(doc(db, 'users', userProfile.mentorId));
            if (mDoc.exists()) {
              setMentor({ id: mDoc.id, ...mDoc.data() } as User);
            }
          } catch(e) { console.error(e); }
        }`);

r = r.replace(`        if (userProfile.programId) {
          const pDoc = await getDoc(doc(db, 'internship_programs', userProfile.programId));
          if (pDoc.exists()) {
            setProgram({ id: pDoc.id, ...pDoc.data() } as InternshipProgram);
          }
        }`, `        if (userProfile.programId) {
          try {
            const pDoc = await getDoc(doc(db, 'internship_programs', userProfile.programId));
            if (pDoc.exists()) {
              setProgram({ id: pDoc.id, ...pDoc.data() } as InternshipProgram);
            }
          } catch(e) { console.error(e); }
        }`);

fs.writeFileSync('src/pages/dashboard/roles/InternDashboard.tsx', r);
