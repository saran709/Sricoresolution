const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

code = code.replace("import { collection, query, where, getCountFromServer, getDocs, limit, orderBy } from 'firebase/firestore';", "import { readFromSheet } from '../../lib/sheets';");
code = code.replace("import { db } from '../../lib/firebase';", "");

const fetchLogic = `        const [
          empSnap,
          activeEmpSnap,
          internSnap,
          mentorSnap,
          clientSnap,
          projSnap,
          enqSnap,
          internAppSnap,
          paymentSnap
        ] = await Promise.all([
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'EMPLOYEE'))),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'EMPLOYEE'), where('isActive', '==', true))),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'INTERN'))),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'MENTOR'))),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'CLIENT'))),
          getCountFromServer(query(collection(db, 'projects'), where('status', '==', 'active'))),
          getCountFromServer(query(collection(db, 'project_requests'), where('status', 'in', ['NEW']))),
          getCountFromServer(query(collection(db, 'internship_applications'), where('status', '==', 'pending'))),
          getCountFromServer(query(collection(db, 'payments'), where('status', '==', 'pending')))
        ]);
        
        setStats({
          employees: empSnap.data().count,
          activeEmployees: activeEmpSnap.data().count,
          interns: internSnap.data().count,
          mentors: mentorSnap.data().count,
          clients: clientSnap.data().count,
          activeProjects: projSnap.data().count,
          pendingEnquiries: enqSnap.data().count,
          internApplications: internAppSnap.data().count,
          pendingPayments: paymentSnap.data().count
        });`;

const sheetLogic = `        const [
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
        });`;

code = code.replace(fetchLogic, sheetLogic);

// We should also look for recent activity fetch logic, which is usually right after this
const recentActivityLogic = `        const actQuery = query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(5));
        const actSnap = await getDocs(actQuery);
        setRecentActivity(actSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog)));`;
        
const sheetRecentActivityLogic = `        const logs = await readFromSheet('auditLogs');
        setRecentActivity((logs as AuditLog[]).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));`;

code = code.replace(recentActivityLogic, sheetRecentActivityLogic);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
