const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Audit.tsx', 'utf8');

const oldBlock = `      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setLogs(items);
      setLoading(false);`;

const newBlock = `      return onSnapshot(q, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setLogs(items);
        setLoading(false);
      }, (error) => {
        console.error("Error in subscription:", error);
        setLoading(false);
      });`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/admin/Audit.tsx', code);
