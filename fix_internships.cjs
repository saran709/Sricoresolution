const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Internships.tsx', 'utf8');

const regex = /      const snapshot = await getDocs\(q\);\n      const items = await Promise\.all\(snapshot\.docs\.map\(async \(d\) => \{\n[\s\S]*?      \}\)\);\n      setApplications\(items\);\n  \};/m;

const newBlock = `      return onSnapshot(q, async (snapshot) => {
        const items = await Promise.all(snapshot.docs.map(async (d) => {
          const app = { id: d.id, ...d.data() } as InternshipApplication;
          let candidate: User | undefined;
          if (app.candidateId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', app.candidateId));
              if (userDoc.exists()) candidate = { id: userDoc.id, ...userDoc.data() } as User;
            } catch (e) {
              console.error(e);
            }
          }
          return { ...app, candidate };
        }));
        setApplications(items);
        setLoading(false);
      }, (error) => {
        console.error("Error in subscription:", error);
        setLoading(false);
      });
  };`;

code = code.replace(regex, newBlock);
fs.writeFileSync('src/pages/admin/Internships.tsx', code);
