import React, { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getCountFromServer, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, Briefcase, MessageSquare, GraduationCap, Clock, AlertCircle, FileText, Database, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { normalizeToCanonicalRole } from '../../lib/rbac';

const RBACManagement = React.lazy(() =>
  import('../../components/admin/RBACManagement').then((m) => ({ default: m.RBACManagement }))
);
const SystemInsights = React.lazy(() =>
  import('../../components/SystemInsights').then((m) => ({ default: m.SystemInsights }))
);
const UserActivity = React.lazy(() =>
  import('../../components/UserActivity').then((m) => ({ default: m.UserActivity }))
);
const UserManagement = React.lazy(() =>
  import('../../components/UserManagement').then((m) => ({ default: m.UserManagement }))
);

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: async () => {
      const [
        usersSnap,
        projectsSnap,
        enqSnap,
        internAppSnap,
        paymentSnap
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'projects')),
        getCountFromServer(query(collection(db, 'enquiries'), where('status', '==', 'NEW'))),
        getCountFromServer(query(collection(db, 'internship_applications'), where('status', '==', 'pending'))),
        getCountFromServer(query(collection(db, 'payments'), where('status', '==', 'pending')))
      ]);

      const allUsers = usersSnap.docs.map((d) => d.data());
      const employees = allUsers.filter(
        (u) => normalizeToCanonicalRole(u.role) === 'EMPLOYEE'
      ).length;
      const activeEmployees = allUsers.filter(
        (u) => normalizeToCanonicalRole(u.role) === 'EMPLOYEE' && u.isActive !== false
      ).length;
      const interns = allUsers.filter(
        (u) => normalizeToCanonicalRole(u.role) === 'INTERN_STUDENT'
      ).length;
      const mentors = allUsers.filter(
        (u) => normalizeToCanonicalRole(u.role) === 'MENTOR'
      ).length;
      const clients = allUsers.filter(
        (u) => normalizeToCanonicalRole(u.role) === 'CLIENT'
      ).length;

      const allProjects = projectsSnap.docs.map((d) => d.data());
      const totalProjects = allProjects.length;
      const activeProjects = allProjects.filter((p) =>
        ['active', 'in_progress'].includes(p.status || p.projectStatus)
      ).length;

      const stats = {
        employees,
        activeEmployees,
        interns,
        mentors,
        clients,
        totalProjects,
        activeProjects,
        pendingEnquiries: enqSnap.data().count,
        internApplications: internAppSnap.data().count,
        pendingPayments: paymentSnap.data().count,
      };

      let activities: any[] = [];
      try {
        const activitiesQuery = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(6));
        const actSnap = await getDocs(activitiesQuery);
        activities = actSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch {
        try {
          const fallbackActSnap = await getDocs(query(collection(db, 'auditLogs'), limit(6)));
          activities = fallbackActSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {}
      }

      let tasks: any[] = [];
      try {
        const taskSnap = await getDocs(query(collection(db, 'projectTasks'), limit(6)));
        if (!taskSnap.empty) {
          tasks = taskSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } else {
          const fallbackTaskSnap = await getDocs(query(collection(db, 'tasks'), limit(6)));
          tasks = fallbackTaskSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      } catch {}

      return { stats, activities, tasks };
    },
  });

  const stats = data?.stats || {
    employees: 0,
    activeEmployees: 0,
    interns: 0,
    mentors: 0,
    clients: 0,
    activeProjects: 0,
    totalProjects: 0,
    pendingEnquiries: 0,
    internApplications: 0,
    pendingPayments: 0,
  };
  const activities = data?.activities || [];
  const tasks = data?.tasks || [];

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    setSeedError(null);

    try {
      const { seedAdminDashboardData } = await import('../../lib/dataSeeder');
      const res = await seedAdminDashboardData(currentUser?.uid);
      if (res.errors && res.errors.length > 0 && res.departmentsCount === 0 && res.usersCount === 0) {
        setSeedError(`Failed to insert sample data: ${res.errors.join('; ')}`);
      } else {
        const warningSuffix = res.errors && res.errors.length > 0 ? ` (Note: ${res.errors.length} notices: ${res.errors.slice(0, 2).join(', ')})` : '';
        setSeedResult(
          `Successfully populated demo operational data! Synced ${res.departmentsCount} Departments, ${res.usersCount} Staff & Mentors, ${res.projectsCount} Projects, ${res.tasksCount} Tasks, ${res.enquiriesCount} Enquiries, ${res.vendorsCount} Vendors, and ${res.announcementsCount} Announcements.${warningSuffix}`
        );
      }
      await refetch();
    } catch (err: any) {
      console.error("Error inserting sample data:", err);
      setSeedError(err?.message || "Failed to insert sample data. Please verify Firestore permissions.");
    } finally {
      setIsSeeding(false);
    }
  };

  const statCards = [
    { name: 'Active Employees', value: stats.activeEmployees, total: stats.employees, icon: Users, color: 'bg-blue-500', link: '/admin/employees' },
    { name: 'Mentors', value: stats.mentors, total: null, icon: Users, color: 'bg-indigo-500', link: '/admin/mentors' },
    { name: 'Interns', value: stats.interns, total: null, icon: GraduationCap, color: 'bg-teal-500', link: '/admin/interns' },
    { name: 'Clients', value: stats.clients, total: null, icon: Users, color: 'bg-cyan-500', link: '/admin/clients' },
    { name: 'Active Projects', value: stats.activeProjects, total: stats.totalProjects, icon: Briefcase, color: 'bg-emerald-500', link: '/admin/projects' },
    { name: 'Pending Enquiries', value: stats.pendingEnquiries, total: null, icon: MessageSquare, color: 'bg-amber-500', link: '/admin/enquiries' },
    { name: 'Intern Applications', value: stats.internApplications, total: null, icon: GraduationCap, color: 'bg-purple-500', link: '/admin/internships' },
    { name: 'Pending Payments', value: stats.pendingPayments, total: null, icon: FileText, color: 'bg-rose-500', link: '/admin/payments' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header with Company Logo & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
            <img 
              src="/logo.png" 
              alt="Sricore Solutions Logo" 
              className="h-10 w-auto object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Administrator Control Center</h1>
              <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md">
                Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time organizational telemetry, workforce operations, and active delivery pipelines</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleSeedData} 
            isLoading={isSeeding} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md text-xs sm:text-sm font-semibold"
          >
            <Database className="w-4 h-4" />
            Insert Sample Operations Data
          </Button>
        </div>
      </div>

      {/* Seed Success or Error Banner */}
      {seedResult && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-start gap-3 text-sm shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Operational Data Inserted</h4>
            <p className="mt-0.5 leading-relaxed">{seedResult}</p>
          </div>
          <button onClick={() => setSeedResult(null)} className="text-emerald-700 dark:text-emerald-300 hover:underline text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {seedError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 rounded-2xl flex items-start gap-3 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-red-900 dark:text-red-200">Insertion Failed</h4>
            <p className="mt-0.5">{seedError}</p>
          </div>
          <button onClick={() => setSeedError(null)} className="text-red-700 dark:text-red-300 hover:underline text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State Banner if no employees yet */}
      {!loading && stats.employees === 0 && !seedResult && (
        <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-blue-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Populate Initial Admin Dashboard Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Your database is ready. With one click, you can insert realistic operational records for Sricore Solutions: 5 engineering departments, staff engineers, designated mentors, active interns, ongoing commercial and research projects, tasks, customer enquiries, and attendance logs.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSeedData} 
            isLoading={isSeeding}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Populate Sample Data Now
          </Button>
        </div>
      )}

      {/* Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link 
              key={stat.name} 
              to={stat.link}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
            >
              <div className={`p-4 rounded-xl ${stat.color} bg-opacity-10 group-hover:scale-105 transition-transform`}>
                <stat.icon className={`w-8 h-8 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{stat.value}</p>
                  {stat.total !== null && (
                    <p className="text-xs text-slate-400 font-medium tabular-nums">/ {stat.total} total</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Centralized Five-Role RBAC, Permission Engine & Dynamic Limits Management */}
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />}>
          <RBACManagement />
        </Suspense>
      </div>

      {/* System Insights Widget (30-Day Registration Trends & Engagement Metrics) */}
      <div className="mt-8">
        <Suspense fallback={<div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />}>
          <SystemInsights />
        </Suspense>
      </div>

      {/* User Activity Widget (30-Day Role Login Frequency & Resource Usage — Admin & Mentor Only) */}
      <div className="mt-8">
        <Suspense fallback={<div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />}>
          <UserActivity />
        </Suspense>
      </div>

      {/* Embedded User Management Interface */}
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />}>
          <UserManagement compact maxRows={8} />
        </Suspense>
      </div>

      {/* Recent Activities & Attention Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Operations & Audit Log
            </h2>
            <Link to="/admin/audit" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View Full Log</Link>
          </div>
          <div className="p-0">
            {activities.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                          {activity.action}
                        </span>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mt-1">{activity.details}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 tabular-nums">
                        {activity.timestamp?.toDate ? format(activity.timestamp.toDate(), 'MMM d, h:mm a') : 'Recent'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No recent activity events logged yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Tasks Requiring Technical Attention
            </h2>
          </div>
          <div className="p-0">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((task) => (
                  <li key={task.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assigned: <strong className="text-slate-700 dark:text-slate-300">{task.assignedTo || 'Unassigned'}</strong> • {task.projectId || 'General'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                        task.status === 'TODO' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' :
                        task.status === 'BLOCKED' ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300' :
                        task.status === 'REVIEW' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                        'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No active tasks found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
