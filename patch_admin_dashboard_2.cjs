const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

const regex = /  useEffect\(\(\) => \{\n    const fetchData = async \(\) => \{\n[\s\S]*?fetchData\(\);\n  \}, \[\]\);/m;

const newFetch = `  useEffect(() => {
    let usersData: any[] = [];
    let projectsData: any[] = [];
    let requestsData: any[] = [];
    let appsData: any[] = [];
    let paymentsData: any[] = [];
    let auditLogsData: any[] = [];
    let tasksData: any[] = [];

    const updateDashboard = () => {
      setStats({
        employees: usersData.filter((u: any) => u.role === 'EMPLOYEE').length,
        activeEmployees: usersData.filter((u: any) => u.role === 'EMPLOYEE' && String(u.isActive) === 'true').length,
        interns: usersData.filter((u: any) => u.role === 'INTERN').length,
        mentors: usersData.filter((u: any) => u.role === 'MENTOR').length,
        clients: usersData.filter((u: any) => u.role === 'CLIENT').length,
        activeProjects: projectsData.filter((p: any) => String(p.status).toLowerCase() === 'active').length,
        pendingEnquiries: requestsData.filter((r: any) => String(r.status).toLowerCase() === 'new' || !r.status).length,
        internApplications: appsData.filter((a: any) => String(a.status).toLowerCase() === 'pending' || !a.status).length,
        pendingPayments: paymentsData.filter((p: any) => String(p.status).toLowerCase() === 'pending' || !p.status).length
      });
      
      setActivities((auditLogsData || []).sort((a: any, b: any) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()).slice(0, 5));
      
      const activeTasks = (tasksData || []).filter((t: any) => ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW'].includes(t.status));
      setTasks(activeTasks.slice(0, 5));
      setLoading(false);
    };

    const unsubUsers = firebaseService.subscribeToCollection('users', (data) => { usersData = data; updateDashboard(); });
    const unsubProjects = firebaseService.subscribeToCollection('projects', (data) => { projectsData = data; updateDashboard(); });
    const unsubRequests = firebaseService.subscribeToCollection('project_requests', (data) => { requestsData = data; updateDashboard(); });
    const unsubApps = firebaseService.subscribeToCollection('internship_applications', (data) => { appsData = data; updateDashboard(); });
    const unsubPayments = firebaseService.subscribeToCollection('payments', (data) => { paymentsData = data; updateDashboard(); });
    const unsubAudit = firebaseService.subscribeToCollection('auditLogs', (data) => { auditLogsData = data; updateDashboard(); });
    const unsubTasks = firebaseService.subscribeToCollection('tasks', (data) => { tasksData = data; updateDashboard(); });

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubProjects) unsubProjects();
      if (unsubRequests) unsubRequests();
      if (unsubApps) unsubApps();
      if (unsubPayments) unsubPayments();
      if (unsubAudit) unsubAudit();
      if (unsubTasks) unsubTasks();
    };
  }, []);`;

code = code.replace(regex, newFetch);
fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
