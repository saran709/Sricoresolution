const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// The Promise.all might still hammer the endpoint too hard. Let's load them in series or small batches.
const oldPromiseAll = `        const [
          users,
          projects,
          requests,
          apps,
          payments
        ] = await Promise.all([
          readFromSheet('users'),
          readFromSheet('projects'),
          readFromSheet('project_requests'),
          readFromSheet('internship_applications'),
          readFromSheet('payments')
        ]);`;

const newBatching = `        // Fetch sequentially or in smaller batches to avoid Google Apps Script concurrent rate limits
        const users = await readFromSheet('users');
        const projects = await readFromSheet('projects');
        const requests = await readFromSheet('project_requests');
        const apps = await readFromSheet('internship_applications');
        const payments = await readFromSheet('payments');`;

code = code.replace(oldPromiseAll, newBatching);

const oldAuditTasks = `        const [auditLogs, allTasks] = await Promise.all([
          readFromSheet('auditLogs'),
          readFromSheet('tasks')
        ]);`;

const newAuditTasks = `        const auditLogs = await readFromSheet('auditLogs');
        const allTasks = await readFromSheet('tasks');`;

code = code.replace(oldAuditTasks, newAuditTasks);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
console.log("Updated Dashboard.tsx to stagger fetches.");
