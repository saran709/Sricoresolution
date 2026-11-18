import React, { useState } from 'react';
import { Users, Briefcase, MessageSquare, GraduationCap, Clock, AlertCircle, FileText, Database, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { CanonicalRole, normalizeToCanonicalRole } from '../../lib/rbac';
import { RoleGreetingHeader } from '../../components/dashboard/RoleGreetingHeader';
import {
  DashboardModuleSkeleton,
  DashboardSuspense,
} from '../../components/ui/DashboardSuspense';
import {
  invalidateAdminCaches,
  prefetchSidebarTarget,
  useAdminOverview,
} from '../../hooks/useDashboardQueries';

const WorkspaceGuide = React.lazy(() =>
  import('../../components/dashboard/WorkspaceGuide').then((m) => ({ default: m.WorkspaceGuide }))
);
const StructuredOperationsPipeline = React.lazy(() =>
  import('../../components/dashboard/StructuredOperationsPipeline').then((m) => ({
    default: m.StructuredOperationsPipeline,
  }))
);
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
const ProjectTracker = React.lazy(() =>
  import('../../components/dashboard/ProjectTracker').then((m) => ({ default: m.ProjectTracker }))
);

export default function AdminDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { activeRole, simulatedRole } = useRBAC();
  const { settings } = useWebsiteSettings();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const effectiveRole: CanonicalRole =
    activeRole || normalizeToCanonicalRole(userProfile?.role);
  const displayName =
    userProfile?.firstName || userProfile?.lastName
      ? `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim()
      : currentUser?.email || undefined;

  const { data, isLoading: loading, refetch } = useAdminOverview(Boolean(currentUser?.uid));

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
      invalidateAdminCaches([
        'overview',
        'users',
        'projects',
        'enquiries',
        'auditLogs',
        'tasks',
        'attendance',
      ]);
      await refetch();
    } catch (err: any) {
      console.error("Error inserting sample data:", err);
      setSeedError(err?.message || "Failed to insert sample data. Please verify Firestore permissions.");
    } finally {
      setIsSeeding(false);
    }
  };

  const statCardsByRole: Record<
    CanonicalRole,
    Array<{
      name: string;
      value: number;
      total: number | null;
      icon: typeof Users;
      color: string;
      link: string;
    }>
  > = {
    ADMIN: [
      { name: 'Active Employees', value: stats.activeEmployees, total: stats.employees, icon: Users, color: 'bg-blue-500', link: '/admin/employees' },
      { name: 'Mentors', value: stats.mentors, total: null, icon: Users, color: 'bg-indigo-500', link: '/admin/mentors' },
      { name: 'Interns', value: stats.interns, total: null, icon: GraduationCap, color: 'bg-teal-500', link: '/admin/interns' },
      { name: 'Clients', value: stats.clients, total: null, icon: Users, color: 'bg-cyan-500', link: '/admin/clients' },
      { name: 'Active Projects', value: stats.activeProjects, total: stats.totalProjects, icon: Briefcase, color: 'bg-emerald-500', link: '/admin/projects' },
      { name: 'Pending Enquiries', value: stats.pendingEnquiries, total: null, icon: MessageSquare, color: 'bg-amber-500', link: '/admin/enquiries' },
      { name: 'Intern Applications', value: stats.internApplications, total: null, icon: GraduationCap, color: 'bg-purple-500', link: '/admin/internships' },
      { name: 'Pending Payments', value: stats.pendingPayments, total: null, icon: FileText, color: 'bg-rose-500', link: '/admin/payments' },
    ],
    MENTOR: [
      { name: 'Assigned Cohort Interns', value: stats.interns, total: null, icon: GraduationCap, color: 'bg-teal-500', link: '/admin/interns' },
      { name: 'Pending Applications', value: stats.internApplications, total: null, icon: Users, color: 'bg-purple-500', link: '/admin/candidates' },
      { name: 'Active Projects', value: stats.activeProjects, total: stats.totalProjects, icon: Briefcase, color: 'bg-emerald-500', link: '/admin/projects' },
      { name: 'Tasks Under Review', value: tasks.filter((t) => t.status === 'REVIEW').length, total: tasks.length, icon: Clock, color: 'bg-amber-500', link: '/admin/reports' },
    ],
    EMPLOYEE: [
      { name: 'Active Projects', value: stats.activeProjects, total: stats.totalProjects, icon: Briefcase, color: 'bg-emerald-500', link: '/admin/projects' },
      { name: 'Open Sprint Tasks', value: tasks.filter((t) => t.status !== 'COMPLETED').length, total: tasks.length, icon: Clock, color: 'bg-blue-500', link: '/admin/projects' },
      { name: 'Active Team Members', value: stats.activeEmployees, total: stats.employees, icon: Users, color: 'bg-indigo-500', link: '/admin/employees' },
      { name: 'Pending Enquiries', value: stats.pendingEnquiries, total: null, icon: MessageSquare, color: 'bg-amber-500', link: '/admin/enquiries' },
    ],
    CLIENT: [
      { name: 'Active Projects', value: stats.activeProjects, total: stats.totalProjects, icon: Briefcase, color: 'bg-emerald-500', link: '/admin/projects' },
      { name: 'Pending Enquiries', value: stats.pendingEnquiries, total: null, icon: MessageSquare, color: 'bg-amber-500', link: '/admin/enquiries' },
      { name: 'Pending Payments', value: stats.pendingPayments, total: null, icon: FileText, color: 'bg-rose-500', link: '/admin/payments' },
      { name: 'Delivery Engineers', value: stats.activeEmployees, total: null, icon: Users, color: 'bg-blue-500', link: '/admin/employees' },
    ],
    INTERN_STUDENT: [
      { name: 'Open Internship Cohorts', value: stats.internApplications, total: null, icon: GraduationCap, color: 'bg-purple-500', link: '/admin/internships' },
      { name: 'Available Mentors', value: stats.mentors, total: null, icon: Users, color: 'bg-indigo-500', link: '/admin/mentors' },
      { name: 'Active Projects', value: stats.activeProjects, total: stats.totalProjects, icon: Briefcase, color: 'bg-emerald-500', link: '/admin/projects' },
      { name: 'Active Assignments', value: tasks.length, total: null, icon: Clock, color: 'bg-amber-500', link: '/admin/reports' },
    ],
  };

  const statCards = statCardsByRole[effectiveRole] || statCardsByRole.ADMIN;

  return (
    <div className="space-y-6">
      {/* Personalized Role-Aware Greeting & Quick Action Header */}
      <RoleGreetingHeader
        role={effectiveRole}
        displayName={displayName}
        logoUrl={settings?.logoUrl || '/logo.png'}
        isSimulated={Boolean(simulatedRole)}
        rightSlot={
          effectiveRole === 'ADMIN' ? (
            <Button
              onClick={handleSeedData}
              isLoading={isSeeding}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md text-xs sm:text-sm font-semibold"
            >
              <Database className="w-4 h-4" />
              Insert Sample Operations Data
            </Button>
          ) : undefined
        }
      />

      {/* Structured 5-Stage Standard Operating Procedure Pipeline */}
      <DashboardSuspense variant="panel" moduleName="Structured Operations Pipeline">
        <StructuredOperationsPipeline role={effectiveRole} />
      </DashboardSuspense>

      {/* Dismissible Quick Start Guide tailored to Active Role */}
      <DashboardSuspense variant="panel" moduleName="Quick Start Guide">
        <WorkspaceGuide role={effectiveRole} />
      </DashboardSuspense>

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
        <DashboardModuleSkeleton
          variant="cards"
          count={8}
          label="Loading overview metrics..."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link 
              key={stat.name} 
              to={stat.link}
              onMouseEnter={() =>
                prefetchSidebarTarget({
                  path: stat.link,
                  effectiveRole,
                  userProfile: userProfile as any,
                })
              }
              onFocus={() =>
                prefetchSidebarTarget({
                  path: stat.link,
                  effectiveRole,
                  userProfile: userProfile as any,
                })
              }
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

      {/* Real-Time Project Tracker (Statuses, Milestones, and Deadlines) */}
      <div className="mt-8">
        <DashboardSuspense variant="table" moduleName="Project Tracker">
          <ProjectTracker maxItems={6} />
        </DashboardSuspense>
      </div>

      {/* Centralized Five-Role RBAC, Permission Engine & Dynamic Limits Management */}
      <div className="mt-8">
        <DashboardSuspense variant="panel" moduleName="Role & Permission Engine">
          <RBACManagement />
        </DashboardSuspense>
      </div>

      {/* System Insights Widget (30-Day Registration Trends & Engagement Metrics) */}
      <div className="mt-8">
        <DashboardSuspense variant="chart" moduleName="System Insights">
          <SystemInsights />
        </DashboardSuspense>
      </div>

      {/* User Activity Widget (30-Day Role Login Frequency & Resource Usage — Admin & Mentor Only) */}
      <div className="mt-8">
        <DashboardSuspense variant="chart" moduleName="User Activity Analytics">
          <UserActivity />
        </DashboardSuspense>
      </div>

      {/* Embedded User Management Interface */}
      <div className="mt-8">
        <DashboardSuspense variant="table" moduleName="User Directory">
          <UserManagement compact maxRows={8} />
        </DashboardSuspense>
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
