const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

const oldFetch = `  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data in parallel using Promise.all
        // This is much faster than sequential fetches and avoids Google Apps Script concurrent rate limits
        const [users, projects, requests, apps, payments, auditLogs, allTasks] = await Promise.all([
          firebaseService.getAll('users'),
          firebaseService.getAll('projects'),
          firebaseService.getAll('project_requests'),
          firebaseService.getAll('internship_applications'),
          firebaseService.getAll('payments'),
          firebaseService.getAll('auditLogs'),
          firebaseService.getAll('tasks')
        ]);
        
        setStats({
          employees: users.filter((u: any) => u.role === 'EMPLOYEE').length,
          activeEmployees: users.filter((u: any) => u.role === 'EMPLOYEE' && String(u.isActive) === 'true').length,
          interns: users.filter((u: any) => u.role === 'INTERN').length,
          mentors: users.filter((u: any) => u.role === 'MENTOR').length,
          clients: users.filter((u: any) => u.role === 'CLIENT').length,
          activeProjects: projects.filter((p: any) => String(p.status).toLowerCase() === 'active').length,
          pendingEnquiries: requests.filter((r: any) => String(r.status).toLowerCase() === 'new' || !r.status).length,
          internApplications: apps.filter((a: any) => String(a.status).toLowerCase() === 'pending' || !a.status).length,
          pendingPayments: payments.filter((p: any) => String(p.status).toLowerCase() === 'pending' || !p.status).length
        });
        
        setActivities((auditLogs || []).sort((a: any, b: any) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()).slice(0, 5));
        
        const activeTasks = (allTasks || []).filter((t: any) => ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW'].includes(t.status));
        setTasks(activeTasks.slice(0, 5));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);`;

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

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
