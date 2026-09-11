const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Internships.tsx', 'utf8');

const regex = /      const snapshot = await getDocs\(q\);\n      const items = await Promise\.all\(snapshot\.docs\.map\(async \(d\) => \{/m;
const newStr = `      return onSnapshot(q, async (snapshot) => {
        const items = await Promise.all(snapshot.docs.map(async (d) => {`;

code = code.replace(regex, newStr);

const regexEnd = /      \}\)\);\n      setApplications\(items\);\n  \};/m;
const newEnd = `      }));
      setApplications(items);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
  };`;

code = code.replace(regexEnd, newEnd);

fs.writeFileSync('src/pages/admin/Internships.tsx', code);
