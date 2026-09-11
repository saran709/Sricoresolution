const fs = require('fs');
let r = fs.readFileSync('src/pages/admin/Invoices.tsx', 'utf8');

const oldCalc = `      const subtotal = newInvoice.items.reduce((sum, item) => sum + ((item.quantity || 1) * (item.amount || 0)), 0);
      const taxAmount = subtotal * ((newInvoice.taxRate || 0) / 100);
      const total = subtotal + taxAmount;`;

const newCalc = `      const subtotal = newInvoice.items.reduce((sum, item) => sum + ((item.quantity || 1) * (item.amount || 0)), 0);
      const taxAmount = Math.round((subtotal * ((newInvoice.taxRate || 0) / 100)) * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;`;

r = r.replace(oldCalc, newCalc);
fs.writeFileSync('src/pages/admin/Invoices.tsx', r);
console.log("Fixed invoice math");
