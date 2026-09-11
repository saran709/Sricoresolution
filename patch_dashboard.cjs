const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

const oldFetch = `const users = await firebaseService.getAll('users');
        const projects = await firebaseService.getAll('projects');
        const requests = await firebaseService.getAll('project_requests');
        const apps = await firebaseService.getAll('internship_applications');
        const payments = await firebaseService.getAll('payments');`;

const newFetch = `const [users, projects, requests, apps, payments, auditLogs, allTasks] = await Promise.all([
          firebaseService.getAll('users'),
          firebaseService.getAll('projects'),
          firebaseService.getAll('project_requests'),
          firebaseService.getAll('internship_applications'),
          firebaseService.getAll('payments'),
          firebaseService.getAll('auditLogs'),
          firebaseService.getAll('tasks')
        ]);`;

code = code.replace(oldFetch, newFetch);
code = code.replace(/const auditLogs = await firebaseService\.getAll\('auditLogs'\);\s*const allTasks = await firebaseService\.getAll\('tasks'\);/, '');
fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
