const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// Add a safety timeout to ensure loading never gets stuck indefinitely
const target = '    const unsubTasks = firebaseService.subscribeToCollection(\'tasks\', (data) => { tasksData = data; updateDashboard(); });';
const replacement = `    const unsubTasks = firebaseService.subscribeToCollection('tasks', (data) => { tasksData = data; updateDashboard(); });

    // Safety timeout in case snapshots take too long or are empty
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);`;

code = code.replace(target, replacement);

// Also clean up the cleanup function to clear the timer
code = code.replace(
  'return () => {',
  'return () => {\n      clearTimeout(timer);'
);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
