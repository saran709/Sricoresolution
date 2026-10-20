import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getCountFromServer, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, Briefcase, MessageSquare, GraduationCap, Clock, AlertCircle, Shield, FileText, Database, CheckCircle2, Sparkles, Building2, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Button } from '../../components/ui/Button';
import { seedAdminDashboardData, SeedResult } from '../../lib/dataSeeder';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
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
  });
  
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        empSnap,
        activeEmpSnap,
        internSnap,
        mentorSnap,
        clientSnap,
        totalProjSnap,
        activeProjSnap,
        enqSnap,
        internAppSnap,
        paymentSnap
      ] = await Promise.all([
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'EMPLOYEE'))),
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'EMPLOYEE'), where('isActive', '==', true))),
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'INTERN'))),
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'MENTOR'))),
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'CLIENT'))),
        getCountFromServer(collection(db, 'projects')),
        getCountFromServer(query(collection(db, 'projects'), where('status', 'in', ['active', 'in_progress']))),
        getCountFromServer(query(collection(db, 'enquiries'), where('status', 'in', ['NEW']))),
        getCountFromServer(query(collection(db, 'internship_applications'), where('status', '==', 'pending'))),
        getCountFromServer(query(collection(db, 'payments'), where('status', '==', 'pending')))
      ]);
      
      setStats({
        employees: empSnap.data().count,
        activeEmployees: activeEmpSnap.data().count,
        interns: internSnap.data().count,
        mentors: mentorSnap.data().count,
        clients: clientSnap.data().count,
        totalProjects: totalProjSnap.data().count,
        activeProjects: activeProjSnap.data().count,
        pendingEnquiries: enqSnap.data().count,
        internApplications: internAppSnap.data().count,
        pendingPayments: paymentSnap.data().count
      });

      // Load activities
      try {
        const activitiesQuery = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(6));
        const actSnap = await getDocs(activitiesQuery);
        setActivities(actSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.warn("Audit logs listener note:", e);
      }

      // Load tasks (try projectTasks then tasks)
      try {
        let taskDocs: any[] = [];
        const taskSnap = await getDocs(query(collection(db, 'projectTasks'), limit(6)));
        if (!taskSnap.empty) {
          taskDocs = taskSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
          const fallbackTaskSnap = await getDocs(query(collection(db, 'tasks'), limit(6)));
          taskDocs = fallbackTaskSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        setTasks(taskDocs);
      } catch (e) {
        console.warn("Tasks listener note:", e);
      }

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    setSeedError(null);

    try {
      const res = await seedAdminDashboardData(currentUser?.uid);
      if (res.errors && res.errors.length > 0 && res.departmentsCount === 0 && res.usersCount === 0) {
        setSeedError(`Failed to insert sample data: ${res.errors.join('; ')}`);
      } else {
        const warningSuffix = res.errors && res.errors.length > 0 ? ` (Note: ${res.errors.length} notices: ${res.errors.slice(0, 2).join(', ')})` : '';
        setSeedResult(
          `Successfully populated demo operational data! Synced ${res.departmentsCount} Departments, ${res.usersCount} Staff & Mentors, ${res.projectsCount} Projects, ${res.tasksCount} Tasks, ${res.enquiriesCount} Enquiries, ${res.vendorsCount} Vendors, and ${res.announcementsCount} Announcements.${warningSuffix}`
        );
      }
      await fetchData();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-xs shrink-0">
            <img 
              src="/logo.png" 
              alt="Sri core solutions Logo" 
              className="h-10 w-auto object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Administrator Control Center</h1>
              <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Real-time organizational telemetry, workforce operations, and active delivery pipelines</p>
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
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 text-sm shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-emerald-900">Operational Data Inserted</h4>
            <p className="mt-0.5 leading-relaxed">{seedResult}</p>
          </div>
          <button onClick={() => setSeedResult(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {seedError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start gap-3 text-sm shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-red-900">Insertion Failed</h4>
            <p className="mt-0.5">{seedError}</p>
          </div>
          <button onClick={() => setSeedError(null)} className="text-red-700 hover:text-red-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State Banner if no employees yet */}
      {!loading && stats.employees === 0 && !seedResult && (
        <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Populate Initial Admin Dashboard Data</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Your database is ready. With one click, you can insert realistic operational records for Sri core solutions: 5 engineering departments, staff engineers, designated mentors, active interns, ongoing commercial and research projects, tasks, customer enquiries, and attendance logs.
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
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link 
              key={stat.name} 
              to={stat.link}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
            >
              <div className={`p-4 rounded-xl ${stat.color} bg-opacity-10 group-hover:scale-105 transition-transform`}>
                <stat.icon className={`w-8 h-8 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                  {stat.total !== null && (
                    <p className="text-xs text-slate-400 font-medium">/ {stat.total} total</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Application & Recruitment Inflow</h3>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Weekly Trend</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Mon', applications: 4 },
                { name: 'Tue', applications: 7 },
                { name: 'Wed', applications: 5 },
                { name: 'Thu', applications: 10 },
                { name: 'Fri', applications: 8 },
                { name: 'Sat', applications: 3 },
                { name: 'Sun', applications: 2 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" textAnchor="middle" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Workforce & Portal Activity</h3>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Active Sessions</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Mon', logins: 22 },
                { name: 'Tue', logins: 28 },
                { name: 'Wed', logins: 34 },
                { name: 'Thu', logins: 38 },
                { name: 'Fri', logins: 42 },
                { name: 'Sat', logins: 12 },
                { name: 'Sun', logins: 8 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="logins" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities & Attention Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Operations & Audit Log
            </h2>
            <Link to="/admin/audit" className="text-xs font-bold text-blue-600 hover:text-blue-700">View Full Log</Link>
          </div>
          <div className="p-0">
            {activities.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {activities.map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {activity.action}
                        </span>
                        <p className="text-sm font-medium text-slate-900 mt-1">{activity.details}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                        {activity.timestamp?.toDate ? format(activity.timestamp.toDate(), 'MMM d, h:mm a') : 'Recent'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No recent activity events logged yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Tasks Requiring Technical Attention
            </h2>
          </div>
          <div className="p-0">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <li key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Assigned: <strong className="text-slate-700">{task.assignedTo || 'Unassigned'}</strong> • {task.projectId || 'General'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                        task.status === 'TODO' ? 'bg-slate-100 text-slate-800' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                        task.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No active tasks found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
