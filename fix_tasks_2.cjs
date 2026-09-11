const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Tasks.tsx', 'utf8');

const regex = /      const snapshot = await getDocs\(q\);\n      const items: any\[\] = \[\];\n      snapshot\.forEach\(doc => \{\n        items\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);\n      \}\);\n      setTasks\(items\);\n  \};/m;

const newStr = `      return onSnapshot(q, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setTasks(items);
        setLoading(false);
      });
  };`;

code = code.replace(regex, newStr);
fs.writeFileSync('src/pages/admin/Tasks.tsx', code);
