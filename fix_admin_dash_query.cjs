const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

const regex = /const activitiesQuery = query\([\s\S]*?setTasks\(taskSnap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\);/;

const sheetLogic = `
        const [auditLogs, allTasks] = await Promise.all([
          readFromSheet('auditLogs'),
          readFromSheet('tasks')
        ]);
        
        setActivities((auditLogs || []).sort((a: any, b: any) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()).slice(0, 5));
        
        const activeTasks = (allTasks || []).filter((t: any) => ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW'].includes(t.status));
        setTasks(activeTasks.slice(0, 5));
`;

if(regex.test(code)) {
    code = code.replace(regex, sheetLogic);
    fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
    console.log("Success: Replaced old queries with sheet logic");
} else {
    console.log("Regex did not match");
}
