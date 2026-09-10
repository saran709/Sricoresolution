const fs = require('fs');
const filepath = 'src/pages/dashboard/roles/EmployeeDashboard.tsx';
if (fs.existsSync(filepath)) {
    let code = fs.readFileSync(filepath, 'utf8');
    const oldPromise = `        const [taskData, projData] = await Promise.all([
          readFromSheet('tasks'),
          readFromSheet('projects')
        ]);`;
    const newPromise = `        const taskData = await readFromSheet('tasks');
        const projData = await readFromSheet('projects');`;
    code = code.replace(oldPromise, newPromise);
    fs.writeFileSync(filepath, code);
    console.log("Fixed employee dashboard");
}
