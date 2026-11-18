import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Activity,
  Lock,
  LogIn,
  Cpu,
  Users,
  RefreshCw,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import { format, isSameDay, startOfDay, subDays } from 'date-fns';
import { useRBAC } from '../contexts/RBACContext';
import {
  CanonicalRole,
  FIVE_ROLES,
  normalizeToCanonicalRole,
  ROLE_METADATA,
} from '../lib/rbac';
import {
  useAdminAttendance,
  useAdminAuditLogs,
  useAdminDocuments,
  useAdminQuotas,
  useAdminTasks,
  useAdminUsers,
} from '../hooks/useDashboardQueries';
import { ShimmerBlock } from './ui/DashboardSuspense';

type MetricMode = 'logins' | 'resources' | 'combined';
type TimeWindow = 7 | 14 | 30;
type RoleFilter = 'ALL' | CanonicalRole;

const ROLE_CHART_COLORS: Record<CanonicalRole, string> = {
  ADMIN: '#d97706', // amber-600
  CLIENT: '#0891b2', // cyan-600
  EMPLOYEE: '#2563eb', // blue-600
  MENTOR: '#6366f1', // indigo-600
  INTERN_STUDENT: '#10b981', // emerald-500
};

const LOGIN_ACTIONS = new Set([
  'USER_LOGIN',
  'MANUAL_ATTENDANCE',
  'AUTO_ATTENDANCE',
  'ATTENDANCE_CHECK_IN',
]);

interface DailyRoleActivityPoint {
  dateKey: string;
  shortLabel: string;
  fullLabel: string;
  // Login frequency by role
  ADMIN_logins: number;
  CLIENT_logins: number;
  EMPLOYEE_logins: number;
  MENTOR_logins: number;
  INTERN_STUDENT_logins: number;
  totalLogins: number;
  // Resource usage events by role
  ADMIN_resources: number;
  CLIENT_resources: number;
  EMPLOYEE_resources: number;
  MENTOR_resources: number;
  INTERN_STUDENT_resources: number;
  totalResources: number;
}

interface RoleSummaryRow {
  role: CanonicalRole;
  label: string;
  shortLabel: string;
  accounts: number;
  logins30d: number;
  resourceEvents30d: number;
  storageUsedMB: number;
  aiRequestsToday: number;
  activeTasks: number;
  color: string;
}

const parseFirestoreDate = (raw: unknown): Date | null => {
  if (!raw) return null;
  if (typeof (raw as { toDate?: () => Date }).toDate === 'function') {
    return (raw as { toDate: () => Date }).toDate();
  }
  if (typeof (raw as { seconds?: number }).seconds === 'number') {
    return new Date((raw as { seconds: number }).seconds * 1000);
  }
  const d = new Date(raw as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
};

export interface UserActivityProps {
  compact?: boolean;
}

export const UserActivity: React.FC<UserActivityProps> = ({ compact = false }) => {
  const { activeRole } = useRBAC();
  const isAuthorized = activeRole === 'ADMIN' || activeRole === 'MENTOR';

  const [metricMode, setMetricMode] = useState<MetricMode>('logins');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(30);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  // Shared TanStack Query caches (only enabled when ADMIN or MENTOR views activity analytics)
  const { data: users = [], isLoading: usersLoading } = useAdminUsers(isAuthorized);
  const { data: auditLogs = [], isLoading: auditLoading } = useAdminAuditLogs(500, isAuthorized);
  const { data: attendanceLogs = [] } = useAdminAttendance(isAuthorized);
  const { data: quotas = [] } = useAdminQuotas(isAuthorized);
  const { data: tasks = [] } = useAdminTasks(500, isAuthorized);
  const { data: documentsList = [] } = useAdminDocuments(200, isAuthorized);
  const loading = isAuthorized && usersLoading && auditLoading;

  // Lookup map: userId / email -> CanonicalRole
  const userRoleLookup = useMemo(() => {
    const map = new Map<string, CanonicalRole>();
    users.forEach((u) => {
      const canonical = normalizeToCanonicalRole(
        (u as any).canonicalRole || u.role
      );
      if (u.id) map.set(u.id, canonical);
      if (u.uid) map.set(u.uid, canonical);
      if (u.email) map.set(u.email.toLowerCase().trim(), canonical);
    });
    return map;
  }, [users]);

  // Build 30-day activity series per role from Firestore collections
  const thirtyDaySeries = useMemo<DailyRoleActivityPoint[]>(() => {
    const today = startOfDay(new Date());
    const windowStart = subDays(today, 29);

    const resolveRoleForActor = (
      actorId?: string,
      fallbackRole?: string,
      details?: string
    ): CanonicalRole | null => {
      if (actorId) {
        const mapped =
          userRoleLookup.get(actorId) ||
          userRoleLookup.get(actorId.toLowerCase().trim());
        if (mapped) return mapped;
      }
      if (fallbackRole) {
        return normalizeToCanonicalRole(fallbackRole);
      }
      if (details) {
        for (const r of FIVE_ROLES) {
          if (details.toUpperCase().includes(r)) {
            return r;
          }
        }
      }
      return null;
    };

    const points: DailyRoleActivityPoint[] = [];

    for (let i = 29; i >= 0; i--) {
      const targetDay = subDays(today, i);
      const loginCounts: Record<CanonicalRole, number> = {
        ADMIN: 0,
        CLIENT: 0,
        EMPLOYEE: 0,
        MENTOR: 0,
        INTERN_STUDENT: 0,
      };
      const resourceCounts: Record<CanonicalRole, number> = {
        ADMIN: 0,
        CLIENT: 0,
        EMPLOYEE: 0,
        MENTOR: 0,
        INTERN_STUDENT: 0,
      };
      const seenUserLoginOnDay = new Set<string>();

      // 1. Audit Logs -> Login & Resource Events
      auditLogs.forEach((log) => {
        const dt = parseFirestoreDate(log.timestamp);
        if (!dt || !isSameDay(dt, targetDay)) return;

        const actionUpper = (log.action || '').toUpperCase();
        const role =
          resolveRoleForActor(log.performedBy, undefined, log.details) ||
          resolveRoleForActor((log as any).resourceId, undefined, log.details) ||
          'CLIENT';

        if (LOGIN_ACTIONS.has(actionUpper) || actionUpper.includes('LOGIN')) {
          loginCounts[role] += 1;
          if (log.performedBy) {
            seenUserLoginOnDay.add(log.performedBy);
          }
        } else {
          resourceCounts[role] += 1;
        }
      });

      // 2. Attendance check-ins -> count as authenticated login/session if not logged separately
      attendanceLogs.forEach((att) => {
        const attAny = att as any;
        const dt = parseFirestoreDate(att.date || attAny.checkIn || attAny.createdAt);
        if (!dt || !isSameDay(dt, targetDay)) return;
        const uid = att.userId;
        if (uid && seenUserLoginOnDay.has(uid)) return;

        const role = resolveRoleForActor(uid, attAny.role);
        if (role) {
          loginCounts[role] += 1;
          if (uid) seenUserLoginOnDay.add(uid);
        }
      });

      // 3. User `lastLoginAt` timestamps not yet represented in auditLogs for that day
      users.forEach((u) => {
        const dt = parseFirestoreDate((u as any).lastLoginAt);
        if (!dt || dt < windowStart || !isSameDay(dt, targetDay)) return;
        const uid = u.uid || u.id;
        if (uid && seenUserLoginOnDay.has(uid)) return;
        const role = normalizeToCanonicalRole((u as any).canonicalRole || u.role);
        loginCounts[role] += 1;
        if (uid) seenUserLoginOnDay.add(uid);
      });

      // 4. Direct Task & Document resource mutations
      tasks.forEach((t) => {
        const taskAny = t as any;
        const dt = parseFirestoreDate(taskAny.submittedAt || taskAny.updatedAt || t.createdAt);
        if (!dt || !isSameDay(dt, targetDay)) return;
        const role =
          resolveRoleForActor(t.assignedTo) ||
          resolveRoleForActor(taskAny.createdBy) ||
          'EMPLOYEE';
        resourceCounts[role] += 1;
      });

      documentsList.forEach((d) => {
        const docAny = d as any;
        const dt = parseFirestoreDate(d.createdAt || docAny.uploadedAt);
        if (!dt || !isSameDay(dt, targetDay)) return;
        const role =
          resolveRoleForActor(docAny.uploadedBy || d.ownerId || docAny.userId, docAny.role) ||
          'EMPLOYEE';
        resourceCounts[role] += 1;
      });

      const totalLogins = FIVE_ROLES.reduce((acc, r) => acc + loginCounts[r], 0);
      const totalResources = FIVE_ROLES.reduce((acc, r) => acc + resourceCounts[r], 0);

      points.push({
        dateKey: format(targetDay, 'yyyy-MM-dd'),
        shortLabel: format(targetDay, 'MMM d'),
        fullLabel: format(targetDay, 'MMM d, yyyy'),
        ADMIN_logins: loginCounts.ADMIN,
        CLIENT_logins: loginCounts.CLIENT,
        EMPLOYEE_logins: loginCounts.EMPLOYEE,
        MENTOR_logins: loginCounts.MENTOR,
        INTERN_STUDENT_logins: loginCounts.INTERN_STUDENT,
        totalLogins,
        ADMIN_resources: resourceCounts.ADMIN,
        CLIENT_resources: resourceCounts.CLIENT,
        EMPLOYEE_resources: resourceCounts.EMPLOYEE,
        MENTOR_resources: resourceCounts.MENTOR,
        INTERN_STUDENT_resources: resourceCounts.INTERN_STUDENT,
        totalResources,
      });
    }

    return points;
  }, [users, auditLogs, attendanceLogs, tasks, documentsList, userRoleLookup]);

  const visibleSeries = useMemo(
    () => thirtyDaySeries.slice(30 - timeWindow),
    [thirtyDaySeries, timeWindow]
  );

  // Per-role summary combining 30-day totals & live quota usage metrics
  const roleSummary = useMemo<RoleSummaryRow[]>(() => {
    const accountCounts: Record<CanonicalRole, number> = {
      ADMIN: 0,
      CLIENT: 0,
      EMPLOYEE: 0,
      MENTOR: 0,
      INTERN_STUDENT: 0,
    };
    users.forEach((u) => {
      const r = normalizeToCanonicalRole((u as any).canonicalRole || u.role);
      accountCounts[r] += 1;
    });

    const storageByRole: Record<CanonicalRole, number> = {
      ADMIN: 0,
      CLIENT: 0,
      EMPLOYEE: 0,
      MENTOR: 0,
      INTERN_STUDENT: 0,
    };
    const aiByRole: Record<CanonicalRole, number> = {
      ADMIN: 0,
      CLIENT: 0,
      EMPLOYEE: 0,
      MENTOR: 0,
      INTERN_STUDENT: 0,
    };
    const tasksByRole: Record<CanonicalRole, number> = {
      ADMIN: 0,
      CLIENT: 0,
      EMPLOYEE: 0,
      MENTOR: 0,
      INTERN_STUDENT: 0,
    };

    const todayStr = new Date().toISOString().slice(0, 10);
    quotas.forEach((q) => {
      const r = userRoleLookup.get(q.id) || 'INTERN_STUDENT';
      storageByRole[r] += Number(q.storageUsedMB || 0);
      aiByRole[r] += q.aiRequestsDate === todayStr ? Number(q.aiRequestsToday || 0) : 0;
      tasksByRole[r] += Number(q.assignedTasksCount || 0);
    });

    return FIVE_ROLES.map((role) => {
      const logins30d = visibleSeries.reduce(
        (sum, d) => sum + Number(d[`${role}_logins` as keyof DailyRoleActivityPoint] || 0),
        0
      );
      const resourceEvents30d = visibleSeries.reduce(
        (sum, d) => sum + Number(d[`${role}_resources` as keyof DailyRoleActivityPoint] || 0),
        0
      );

      return {
        role,
        label: ROLE_METADATA[role].label,
        shortLabel: ROLE_METADATA[role].shortLabel,
        accounts: accountCounts[role],
        logins30d,
        resourceEvents30d,
        storageUsedMB: Number(storageByRole[role].toFixed(2)),
        aiRequestsToday: aiByRole[role],
        activeTasks: tasksByRole[role],
        color: ROLE_CHART_COLORS[role],
      };
    });
  }, [users, quotas, userRoleLookup, visibleSeries]);

  const summaryTotals = useMemo(() => {
    const totalLogins = visibleSeries.reduce((s, d) => s + d.totalLogins, 0);
    const totalResources = visibleSeries.reduce((s, d) => s + d.totalResources, 0);
    const totalStorageMB = roleSummary.reduce((s, r) => s + r.storageUsedMB, 0);
    const mostActiveRole =
      [...roleSummary].sort(
        (a, b) => b.logins30d + b.resourceEvents30d - (a.logins30d + a.resourceEvents30d)
      )[0] || roleSummary[0];

    return {
      totalLogins,
      totalResources,
      totalStorageMB: Number(totalStorageMB.toFixed(1)),
      mostActiveRole,
    };
  }, [visibleSeries, roleSummary]);

  const activeRolesToPlot: CanonicalRole[] =
    roleFilter === 'ALL' ? [...FIVE_ROLES] : [roleFilter];

  const combinedResourceKey: string =
    roleFilter === 'ALL' ? 'totalResources' : `${roleFilter}_resources`;
  const combinedLoginKey: string =
    roleFilter === 'ALL' ? 'totalLogins' : `${roleFilter}_logins`;

  // Strict RBAC Access Enforcement: Only ADMIN and MENTOR may view UserActivity
  if (!isAuthorized) {
    return (
      <section
        aria-label="User Activity Restricted"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/60 p-6 flex items-center gap-3 text-sm text-red-700 dark:text-red-300"
      >
        <Lock className="w-5 h-5 shrink-0" />
        <span>
          Access Restricted: The <strong>User Activity</strong> analytics widget is exclusively accessible to{' '}
          <strong>ADMIN</strong> and <strong>MENTOR</strong> roles.
        </span>
      </section>
    );
  }

  return (
    <section
      aria-label="User Activity Analytics Widget"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
    >
      {/* Widget Header & Controls */}
      <div
        className={`${
          compact ? 'p-5' : 'p-6'
        } border-b border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                User Activity · Role Login Frequency &amp; Resource Usage
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                <ShieldCheck className="w-3 h-3" />
                Admin &amp; Mentor Only
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live 30-day breakdown of authenticated logins and resource consumption across all five canonical roles
            </p>
          </div>
        </div>

        {/* Interactive Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div
            role="group"
            aria-label="Select activity time range"
            className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {([7, 14, 30] as TimeWindow[]).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setTimeWindow(days)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  timeWindow === days
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>

          {/* Metric View Selector */}
          <div
            role="group"
            aria-label="Select activity metric view"
            className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => setMetricMode('logins')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                metricMode === 'logins'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Frequency</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('resources')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                metricMode === 'resources'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Resource Usage</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('combined')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                metricMode === 'combined'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Combined</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Filter Bar */}
      <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRoleFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            All 5 Roles
          </button>
          {FIVE_ROLES.map((role) => {
            const active = roleFilter === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: ROLE_CHART_COLORS[role] }}
                />
                <span>{ROLE_METADATA[role].shortLabel}</span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
          {visibleSeries[0]?.shortLabel} – {visibleSeries[visibleSeries.length - 1]?.shortLabel}
        </span>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Logins ({timeWindow}d)
            </span>
            <LogIn className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-1.5 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {summaryTotals.totalLogins.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Session check-ins across 5 roles
          </p>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resource Events ({timeWindow}d)
            </span>
            <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-1.5 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {summaryTotals.totalResources.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tasks, uploads, quotas &amp; reviews
          </p>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Storage Consumed
            </span>
            <HardDrive className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="mt-1.5 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {summaryTotals.totalStorageMB} MB
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Live quota footprint across accounts
          </p>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Most Active Role
            </span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-1.5 text-xl font-extrabold text-slate-900 dark:text-white truncate">
            {summaryTotals.mostActiveRole?.shortLabel || '—'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            {(summaryTotals.mostActiveRole?.logins30d || 0) +
              (summaryTotals.mostActiveRole?.resourceEvents30d || 0)}{' '}
            total interactions
          </p>
        </div>
      </div>

      {/* Main Recharts Grid */}
      <div className="p-6">
        {loading ? (
          <div
            role="status"
            aria-label="Loading 30-day role login and resource usage analytics..."
            className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
          >
            <div className="xl:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <ShimmerBlock className="h-3.5 w-60 max-w-full" />
                <ShimmerBlock className="h-3 w-24" />
              </div>
              <div className="h-80 w-full rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 px-6 pb-5 pt-8 flex items-end gap-2 sm:gap-3">
                {['h-28', 'h-40', 'h-24', 'h-52', 'h-36', 'h-48', 'h-32', 'h-44', 'h-56', 'h-36', 'h-48', 'h-40'].map((hClass, idx) => (
                  <div key={idx} className={`flex-1 flex flex-col justify-end ${idx > 7 ? 'hidden sm:flex' : ''}`}>
                    <ShimmerBlock className={`w-full ${hClass} rounded-t-md rounded-b-none`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="xl:col-span-4 space-y-3">
              <ShimmerBlock className="h-4 w-44" />
              {[...Array(5)].map((_, idx) => (
                <ShimmerBlock key={idx} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left (8 cols): 30-Day Role Time-Series Trend */}
            <div className="xl:col-span-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {metricMode === 'logins'
                    ? `Daily Login Frequency by Role (${timeWindow} Days)`
                    : metricMode === 'resources'
                    ? `Daily Resource Usage Events by Role (${timeWindow} Days)`
                    : `Combined Logins vs Resource Usage Events (${timeWindow} Days)`}
                </h3>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {metricMode === 'combined' ? (
                    <ComposedChart
                      data={visibleSeries}
                      margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="uaResourceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="shortLabel"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        minTickGap={16}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey={combinedResourceKey}
                        name={
                          roleFilter === 'ALL'
                            ? 'Total Resource Events'
                            : `${ROLE_METADATA[roleFilter].shortLabel} Resource Events`
                        }
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#uaResourceGrad)"
                      />
                      <Bar
                        dataKey={combinedLoginKey}
                        name={
                          roleFilter === 'ALL'
                            ? 'Total Login Sessions'
                            : `${ROLE_METADATA[roleFilter].shortLabel} Logins`
                        }
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={14}
                      />
                    </ComposedChart>
                  ) : (
                    <LineChart
                      data={visibleSeries}
                      margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="shortLabel"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        minTickGap={16}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      {activeRolesToPlot.map((role) => (
                        <Line
                          key={role}
                          type="monotone"
                          dataKey={
                            metricMode === 'logins' ? `${role}_logins` : `${role}_resources`
                          }
                          name={ROLE_METADATA[role].shortLabel}
                          stroke={ROLE_CHART_COLORS[role]}
                          strokeWidth={2.25}
                          dot={{ r: 2 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right (4 cols): Role Comparison Bar Chart + Quota Breakdown */}
            <div className="xl:col-span-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Role Activity Comparison ({timeWindow}D)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Cumulative logins &amp; resource events per role
                </p>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={roleSummary}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      tickFormatter={(v: string) => v.split(' ')[0]}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar
                      dataKey="logins30d"
                      name="Logins"
                      fill="#10b981"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="resourceEvents30d"
                      name="Resource Events"
                      fill="#6366f1"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/70 space-y-2">
                {roleSummary.map((row) => (
                  <div
                    key={row.role}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {row.shortLabel}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        ({row.accounts})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] tabular-nums shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {row.logins30d}L
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {row.resourceEvents30d}R
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {row.storageUsedMB} MB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserActivity;
