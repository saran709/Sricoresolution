const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Payments.tsx', 'utf8');

const targetStr = `const snapshot = await getDocs(q);`;
const idx = code.indexOf(targetStr);
if (idx > -1) {
  const startIdx = idx;
  const endIdx = code.indexOf('};', startIdx);
  
  const newBlock = `return onSnapshot(q, (snapshot) => {
        const items: Payment[] = [];
        
        let totalCollected = 0;
        let pending = 0;
        let successful = 0;
        let failed = 0;
        let refunds = 0;
        let internshipRevenue = 0;
        let projectRevenue = 0;

        snapshot.forEach(doc => {
          const p = { id: doc.id, ...doc.data() } as Payment;
          items.push(p);
          
          if (p.status === 'SUCCESS' || p.status === 'COMPLETED') {
            successful++;
            totalCollected += p.amount;
            if (p.type === 'INTERNSHIP') internshipRevenue += p.amount;
            if (p.type === 'PROJECT') projectRevenue += p.amount;
          } else if (p.status === 'PENDING' || p.status === 'CREATED') {
            pending++;
          } else if (p.status === 'FAILED') {
            failed++;
          } else if (p.status === 'REFUNDED') {
            refunds++;
          }
        });

        setPayments(items);
        setStats({
          totalCollected,
          pending,
          successful,
          failed,
          refunds,
          internshipRevenue,
          projectRevenue
        });
        setLoading(false);
      });
  `;
  
  code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
  fs.writeFileSync('src/pages/admin/Payments.tsx', code);
}
