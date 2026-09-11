const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Tasks.tsx', 'utf8');

const targetStr = `      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setTasks(items);
  };`;

const newStr = `      return onSnapshot(q, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setTasks(items);
        setLoading(false);
      }, (error) => {
        console.error(error);
        setLoading(false);
      });
  };`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/pages/admin/Tasks.tsx', code);
