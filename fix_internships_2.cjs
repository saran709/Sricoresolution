const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Internships.tsx', 'utf8');

const targetStr = `      const snapshot = await getDocs(q);
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
  };`;

const newStr = `      return onSnapshot(q, async (snapshot) => {
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

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/pages/admin/Internships.tsx', code);
