const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Audit.tsx', 'utf8');

const targetStr = `const snapshot = await getDocs(q);`;
const idx = code.indexOf(targetStr);
if (idx > -1) {
  const startIdx = idx;
  const endIdx = code.indexOf('};', startIdx);
  
  const newBlock = `return onSnapshot(q, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setLogs(items);
        setLoading(false);
      });
  `;
  
  code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
  fs.writeFileSync('src/pages/admin/Audit.tsx', code);
}
