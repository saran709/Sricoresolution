import { useQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  doc,
  getDoc,
  limit,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { queryClient } from '../lib/queryClient';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';
import {
  CanonicalRole,
  DEFAULT_RESOURCE_PERMISSIONS,
  DEFAULT_ROLE_LIMITS,
  DEFAULT_ROLE_PERMISSIONS,
  FIVE_ROLES,
  normalizeToCanonicalRole,
  RBACConfigDocument,
  resolveResourcePermissionsMap,
  RoleLimits,
  RolePermissionsMap,
  UserUsageMetrics,
} from '../lib/rbac';
import {
  buildResolvedSidebarConfig,
  getRbacConfigCacheVersion,
  ResolvedSidebarConfig,
} from '../lib/sidebarConfig';
import {
  User,
  Project,
  ProjectTask,
  Enquiry,
  Document as AppDocument,
  InternshipApplication,
  InternshipProgram,
  ActivityHistory,
  AuditLog,
  Notification as AppNotification,
  LeaveRequest,
  Attendance,
} from '../types';

export const DEFAULT_RBAC_CONFIG: RBACConfigDocument = {
  rolePermissions: DEFAULT_ROLE_PERMISSIONS,
  roleLimits: DEFAULT_ROLE_LIMITS,
  resourcePermissions: DEFAULT_RESOURCE_PERMISSIONS,
};

export const createDefaultUsageMetrics = (): UserUsageMetrics => ({
  projectsCount: 0,
  assignedTasksCount: 0,
  aiRequestsToday: 0,
  aiRequestsDate: new Date().toISOString().slice(0, 10),
  storageUsedMB: 0,
  reportsGeneratedCount: 0,
  assignedMenteesCount: 0,
  activeClientProjectsCount: 0,
});

/**
 * Centralized TanStack Query key registry so components, sidebars, and prefetchers
 * always share identical cache keys without issuing duplicate Firestore reads.
 */
export const dashboardQueryKeys = {
  rbacConfig: ['rbac', 'config'] as const,
  userQuota: (uid?: string) => ['rbac', 'quota', uid || 'anonymous'] as const,
  sidebarConfig: (role: CanonicalRole, version: string) =>
    ['sidebar-config', role, version] as const,

  adminOverview: ['admin-dashboard-overview'] as const,
  adminUsers: ['admin', 'users'] as const,
  adminProjects: ['admin', 'projects'] as const,
  adminEnquiries: ['admin', 'enquiries'] as const,
  adminAuditLogs: (max = 500) => ['admin', 'auditLogs', max] as const,
  adminAttendance: ['admin', 'attendance'] as const,
  adminTasks: (max = 500) => ['admin', 'projectTasks', max] as const,
  adminDocuments: (max = 200) => ['admin', 'documents', max] as const,
  adminNotifications: (max = 100) => ['admin', 'notifications', max] as const,
  adminPayments: ['admin', 'payments'] as const,
  adminQuotas: ['admin', 'quotas'] as const,

  myProjects: (userId?: string) => ['my-projects', userId] as const,
  clientDashboard: (clientId?: string) => ['client-dashboard', clientId] as const,
  candidateDashboard: (candidateId?: string) => ['candidate-dashboard', candidateId] as const,
  employeeDashboard: (employeeId?: string) => ['employee-dashboard', employeeId] as const,
  mentorDashboard: (mentorId?: string) => ['mentor-dashboard', mentorId] as const,
  internDashboard: (uid?: string, mentorId?: string, programId?: string) =>
    ['intern-dashboard', uid, mentorId, programId] as const,
};

export function normalizeRbacConfigSnapshot(
  rawData?: Partial<RBACConfigDocument> | null
): RBACConfigDocument {
  if (!rawData) {
    return DEFAULT_RBAC_CONFIG;
  }

  const mergedPerms: Record<CanonicalRole, RolePermissionsMap> = {
    ADMIN: {
      ...DEFAULT_ROLE_PERMISSIONS.ADMIN,
      ...(rawData.rolePermissions?.ADMIN || {}),
    },
    CLIENT: {
      ...DEFAULT_ROLE_PERMISSIONS.CLIENT,
      ...(rawData.rolePermissions?.CLIENT || {}),
    },
    EMPLOYEE: {
      ...DEFAULT_ROLE_PERMISSIONS.EMPLOYEE,
      ...(rawData.rolePermissions?.EMPLOYEE || {}),
    },
    MENTOR: {
      ...DEFAULT_ROLE_PERMISSIONS.MENTOR,
      ...(rawData.rolePermissions?.MENTOR || {}),
    },
    INTERN_STUDENT: {
      ...DEFAULT_ROLE_PERMISSIONS.INTERN_STUDENT,
      ...(rawData.rolePermissions?.INTERN_STUDENT || {}),
    },
  };

  const mergedLimits: Record<CanonicalRole, RoleLimits> = {
    ADMIN: {
      ...DEFAULT_ROLE_LIMITS.ADMIN,
      ...(rawData.roleLimits?.ADMIN || {}),
    },
    CLIENT: {
      ...DEFAULT_ROLE_LIMITS.CLIENT,
      ...(rawData.roleLimits?.CLIENT || {}),
    },
    EMPLOYEE: {
      ...DEFAULT_ROLE_LIMITS.EMPLOYEE,
      ...(rawData.roleLimits?.EMPLOYEE || {}),
    },
    MENTOR: {
      ...DEFAULT_ROLE_LIMITS.MENTOR,
      ...(rawData.roleLimits?.MENTOR || {}),
    },
    INTERN_STUDENT: {
      ...DEFAULT_ROLE_LIMITS.INTERN_STUDENT,
      ...(rawData.roleLimits?.INTERN_STUDENT || {}),
    },
  };

  const mergedResources = rawData.resourcePermissions
    ? rawData.resourcePermissions
    : resolveResourcePermissionsMap(undefined);

  return {
    rolePermissions: mergedPerms,
    roleLimits: mergedLimits,
    resourcePermissions: mergedResources,
    updatedAt: rawData.updatedAt,
    updatedBy: rawData.updatedBy,
  };
}

export async function fetchRbacConfigFromFirestore(): Promise<RBACConfigDocument> {
  if (!auth.currentUser?.uid) {
    return DEFAULT_RBAC_CONFIG;
  }
  try {
    const configRef = doc(db, 'settings', 'rbac_config');
    const snap = await getDoc(configRef);
    if (!snap.exists()) {
      return DEFAULT_RBAC_CONFIG;
    }
    return normalizeRbacConfigSnapshot(snap.data() as Partial<RBACConfigDocument>);
  } catch (error: any) {
    const code = String(error?.code || error?.message || '').toLowerCase();
    // Gracefully fall back to built-in role defaults if document isn't readable yet
    if (code.includes('permission-denied') || code.includes('unavailable')) {
      return DEFAULT_RBAC_CONFIG;
    }
    handleFirestoreError(error, OperationType.GET, 'settings/rbac_config', auth);
  }
}

export async function fetchUserQuotaFromFirestore(uid?: string): Promise<UserUsageMetrics> {
  if (!uid || !auth.currentUser?.uid) {
    return createDefaultUsageMetrics();
  }
  try {
    const quotaRef = doc(db, 'quotas', uid);
    const snap = await getDoc(quotaRef);
    if (!snap.exists()) {
      return createDefaultUsageMetrics();
    }
    const data = snap.data() as Partial<UserUsageMetrics>;
    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      projectsCount: Number(data.projectsCount || 0),
      assignedTasksCount: Number(data.assignedTasksCount || 0),
      aiRequestsToday:
        data.aiRequestsDate === todayStr ? Number(data.aiRequestsToday || 0) : 0,
      aiRequestsDate: todayStr,
      storageUsedMB: Number(data.storageUsedMB || 0),
      reportsGeneratedCount: Number(data.reportsGeneratedCount || 0),
      assignedMenteesCount: Number(data.assignedMenteesCount || 0),
      activeClientProjectsCount: Number(data.activeClientProjectsCount || 0),
      lastUpdated: data.lastUpdated,
    };
  } catch (error: any) {
    const code = String(error?.code || error?.message || '').toLowerCase();
    if (code.includes('permission-denied') || code.includes('unavailable')) {
      return createDefaultUsageMetrics();
    }
    handleFirestoreError(error, OperationType.GET, `quotas/${uid}`, auth);
  }
}

/**
 * Cached RBAC configuration hook (10-minute stale window avoids re-reading `settings/rbac_config` on every route/mount)
 */
export function useRbacConfigQuery(enabled: boolean) {
  return useQuery({
    queryKey: dashboardQueryKeys.rbacConfig,
    enabled,
    queryFn: fetchRbacConfigFromFirestore,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
  });
}

/**
 * Cached per-user quota usage hook
 */
export function useUserQuotaQuery(uid?: string) {
  return useQuery({
    queryKey: dashboardQueryKeys.userQuota(uid),
    enabled: Boolean(uid),
    queryFn: () => fetchUserQuotaFromFirestore(uid),
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });
}

/**
 * Cached role-based sidebar configuration query backed by TanStack Query.
 */
export function useSidebarNavigationQuery(params: {
  role: CanonicalRole;
  rbacConfig: RBACConfigDocument;
  permissionOverrides?: Partial<RolePermissionsMap>;
  limitOverrides?: Partial<RoleLimits>;
  suspended?: boolean;
}) {
  const { role, rbacConfig, permissionOverrides, limitOverrides, suspended } = params;
  const version = getRbacConfigCacheVersion(
    rbacConfig,
    permissionOverrides,
    limitOverrides,
    suspended
  );

  return useQuery<ResolvedSidebarConfig>({
    queryKey: dashboardQueryKeys.sidebarConfig(role, version),
    queryFn: () =>
      buildResolvedSidebarConfig({
        role,
        rbacConfig,
        permissionOverrides,
        limitOverrides,
        suspended,
      }),
    initialData: () =>
      queryClient.getQueryData<ResolvedSidebarConfig>(
        dashboardQueryKeys.sidebarConfig(role, version)
      ) ||
      buildResolvedSidebarConfig({
        role,
        rbacConfig,
        permissionOverrides,
        limitOverrides,
        suspended,
      }),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
  });
}

// ---------------------------------------------------------------------------
// Shared Admin / Telemetry Collection Fetchers & Hooks (Eliminate Duplicate Reads)
// ---------------------------------------------------------------------------

export async function fetchAdminUsers(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users', auth);
  }
}

export async function fetchAdminProjects(): Promise<Project[]> {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects', auth);
  }
}

export async function fetchAdminEnquiries(): Promise<Enquiry[]> {
  try {
    const snap = await getDocs(collection(db, 'enquiries'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Enquiry));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'enquiries', auth);
  }
}

export async function fetchAdminAuditLogs(max = 500): Promise<AuditLog[]> {
  try {
    try {
      const snap = await getDocs(
        query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(max))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
    } catch {
      const fallbackSnap = await getDocs(query(collection(db, 'auditLogs'), limit(max)));
      return fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'auditLogs', auth);
  }
}

export async function fetchAdminAttendance(): Promise<Attendance[]> {
  try {
    const snap = await getDocs(query(collection(db, 'attendance'), limit(500)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Attendance));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'attendance', auth);
  }
}

export async function fetchAdminTasks(max = 500): Promise<ProjectTask[]> {
  try {
    const taskSnap = await getDocs(query(collection(db, 'projectTasks'), limit(max)));
    if (!taskSnap.empty) {
      return taskSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectTask));
    }
    const fallbackSnap = await getDocs(query(collection(db, 'tasks'), limit(max)));
    return fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectTask));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projectTasks', auth);
  }
}

export async function fetchAdminDocuments(max = 200): Promise<AppDocument[]> {
  try {
    try {
      const snap = await getDocs(
        query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(max))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument));
    } catch {
      const fallbackSnap = await getDocs(query(collection(db, 'documents'), limit(max)));
      return fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'documents', auth);
  }
}

export async function fetchAdminNotifications(max = 100): Promise<AppNotification[]> {
  try {
    try {
      const snap = await getDocs(
        query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(max))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
    } catch {
      const fallbackSnap = await getDocs(query(collection(db, 'notifications'), limit(max)));
      return fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'notifications', auth);
  }
}

export async function fetchAdminPayments(): Promise<Record<string, any>[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'payments', auth);
  }
}

export async function fetchAdminQuotas(): Promise<
  Array<{ id: string } & Partial<UserUsageMetrics>>
> {
  try {
    const snap = await getDocs(query(collection(db, 'quotas'), limit(500)));
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Partial<UserUsageMetrics>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quotas', auth);
  }
}

export interface AdminOverviewData {
  stats: {
    employees: number;
    activeEmployees: number;
    interns: number;
    mentors: number;
    clients: number;
    totalProjects: number;
    activeProjects: number;
    pendingEnquiries: number;
    internApplications: number;
    pendingPayments: number;
  };
  activities: AuditLog[];
  tasks: ProjectTask[];
}

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  // Share cached users, projects, auditLogs, and tasks with all Admin sub-views via ensureQueryData
  const [
    allUsers,
    allProjects,
    enqSnap,
    internAppSnap,
    paymentSnap,
    allActivities,
    allTasks,
  ] = await Promise.all([
    queryClient.ensureQueryData({
      queryKey: dashboardQueryKeys.adminUsers,
      queryFn: fetchAdminUsers,
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.ensureQueryData({
      queryKey: dashboardQueryKeys.adminProjects,
      queryFn: fetchAdminProjects,
      staleTime: 1000 * 60 * 5,
    }),
    getCountFromServer(query(collection(db, 'enquiries'), where('status', '==', 'NEW'))),
    getCountFromServer(
      query(collection(db, 'internship_applications'), where('status', '==', 'pending'))
    ),
    getCountFromServer(query(collection(db, 'payments'), where('status', '==', 'pending'))),
    queryClient
      .ensureQueryData({
        queryKey: dashboardQueryKeys.adminAuditLogs(500),
        queryFn: () => fetchAdminAuditLogs(500),
        staleTime: 1000 * 60 * 3,
      })
      .catch(() => [] as AuditLog[]),
    queryClient
      .ensureQueryData({
        queryKey: dashboardQueryKeys.adminTasks(500),
        queryFn: () => fetchAdminTasks(500),
        staleTime: 1000 * 60 * 5,
      })
      .catch(() => [] as ProjectTask[]),
  ]);

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

  const totalProjects = allProjects.length;
  const activeProjects = allProjects.filter((p) =>
    ['active', 'in_progress'].includes(p.status || p.projectStatus || '')
  ).length;

  return {
    stats: {
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
    },
    activities: allActivities.slice(0, 6),
    tasks: allTasks.slice(0, 6),
  };
}

export function useAdminOverview(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminOverview,
    enabled,
    queryFn: fetchAdminOverview,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminUsers,
    enabled,
    queryFn: fetchAdminUsers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminProjects(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminProjects,
    enabled,
    queryFn: fetchAdminProjects,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminEnquiries(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminEnquiries,
    enabled,
    queryFn: fetchAdminEnquiries,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminAuditLogs(max = 500, enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminAuditLogs(max),
    enabled,
    queryFn: () => fetchAdminAuditLogs(max),
    staleTime: 1000 * 60 * 3,
  });
}

export function useAdminAttendance(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminAttendance,
    enabled,
    queryFn: fetchAdminAttendance,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminTasks(max = 500, enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminTasks(max),
    enabled,
    queryFn: () => fetchAdminTasks(max),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminDocuments(max = 200, enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminDocuments(max),
    enabled,
    queryFn: () => fetchAdminDocuments(max),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminNotifications(max = 100, enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminNotifications(max),
    enabled,
    queryFn: () => fetchAdminNotifications(max),
    staleTime: 1000 * 60 * 3,
  });
}

export function useAdminPayments(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminPayments,
    enabled,
    queryFn: fetchAdminPayments,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminQuotas(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminQuotas,
    enabled,
    queryFn: fetchAdminQuotas,
    staleTime: 1000 * 60 * 3,
  });
}

// ---------------------------------------------------------------------------
// Role-Specific Dashboard Fetchers & Hooks (Reusable by Prefetchers)
// ---------------------------------------------------------------------------

export async function fetchMyProjects(userId?: string) {
  if (!userId) return { projects: [] as Project[], tasks: [] as ProjectTask[] };

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
  const projQuery = query(collection(db, 'projects'), where('clientId', '==', userId));
  const projSnap = await Promise.race([getDocs(projQuery), timeout]);

  if (!projSnap) return { projects: [] as Project[], tasks: [] as ProjectTask[] };

  const projects = projSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
  let tasks: ProjectTask[] = [];

  if (projects.length > 0) {
    const projectIds = projects.map((p) => p.id as string).filter(Boolean).slice(0, 10);
    if (projectIds.length > 0) {
      const taskQuery = query(collection(db, 'projectTasks'), where('projectId', 'in', projectIds));
      const taskSnap = await Promise.race([getDocs(taskQuery), timeout]);
      if (taskSnap) {
        tasks = taskSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectTask));
      }
    }
  }

  return { projects, tasks };
}

export async function fetchClientDashboard(clientId?: string) {
  if (!clientId) {
    return {
      enquiries: [] as Enquiry[],
      projects: [] as Project[],
      payments: [] as any[],
      documents: [] as AppDocument[],
    };
  }

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

  const enqPromise = getDocs(query(collection(db, 'enquiries'), where('clientId', '==', clientId)));
  const projPromise = getDocs(query(collection(db, 'projects'), where('clientId', '==', clientId)));
  const paymentPromise = getDocs(query(collection(db, 'payments'), where('clientId', '==', clientId)));
  const docPromise = getDocs(query(collection(db, 'documents'), where('ownerId', '==', clientId)));

  const [enqRes, projRes, paymentRes, docRes] = await Promise.allSettled([
    Promise.race([enqPromise, timeout]),
    Promise.race([projPromise, timeout]),
    Promise.race([paymentPromise, timeout]),
    Promise.race([docPromise, timeout]),
  ]);

  const enquiries: Enquiry[] =
    enqRes.status === 'fulfilled' && enqRes.value
      ? enqRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Enquiry))
      : [];

  const projects: Project[] =
    projRes.status === 'fulfilled' && projRes.value
      ? projRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Project))
      : [];

  const payments =
    paymentRes.status === 'fulfilled' && paymentRes.value
      ? paymentRes.value.docs.map((d) => ({ id: d.id, ...d.data() }))
      : [];

  const documents: AppDocument[] =
    docRes.status === 'fulfilled' && docRes.value
      ? docRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument))
      : [];

  return { enquiries, projects, payments, documents };
}

export async function fetchCandidateDashboard(candidateId?: string) {
  if (!candidateId) {
    return {
      applications: [] as (InternshipApplication & { programTitle?: string })[],
      documents: [] as AppDocument[],
      notifications: [] as AppNotification[],
    };
  }

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

  const appPromise = getDocs(
    query(collection(db, 'internship_applications'), where('candidateId', '==', candidateId))
  );
  const docPromise = getDocs(query(collection(db, 'documents'), where('ownerId', '==', candidateId)));
  const notifPromise = getDocs(query(collection(db, 'notifications'), where('userId', '==', candidateId)));

  const [appRes, docRes, notifRes] = await Promise.allSettled([
    Promise.race([appPromise, timeout]),
    Promise.race([docPromise, timeout]),
    Promise.race([notifPromise, timeout]),
  ]);

  const applications: (InternshipApplication & { programTitle?: string })[] =
    appRes.status === 'fulfilled' && appRes.value
      ? appRes.value.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            programTitle: data.programTitle || 'Internship Program',
          } as InternshipApplication & { programTitle?: string };
        })
      : [];

  const documents: AppDocument[] =
    docRes.status === 'fulfilled' && docRes.value
      ? docRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument))
      : [];

  const notifications: AppNotification[] =
    notifRes.status === 'fulfilled' && notifRes.value
      ? notifRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification))
      : [];

  return { applications, documents, notifications };
}

export async function fetchEmployeeDashboard(employeeId?: string) {
  if (!employeeId) {
    return {
      projects: [] as Project[],
      tasks: [] as ProjectTask[],
      leaveRequests: [] as LeaveRequest[],
      attendances: [] as Attendance[],
    };
  }

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

  const projPromise = getDocs(
    query(collection(db, 'projects'), where('assignedEmployees', 'array-contains', employeeId))
  );
  const taskPromise = getDocs(
    query(collection(db, 'projectTasks'), where('assignedTo', '==', employeeId))
  );
  const leavePromise = getDocs(
    query(collection(db, 'leaveRequests'), where('userId', '==', employeeId))
  );
  const attPromise = getDocs(
    query(collection(db, 'attendance'), where('userId', '==', employeeId))
  );

  const [projRes, taskRes, leaveRes, attRes] = await Promise.allSettled([
    Promise.race([projPromise, timeout]),
    Promise.race([taskPromise, timeout]),
    Promise.race([leavePromise, timeout]),
    Promise.race([attPromise, timeout]),
  ]);

  const projects: Project[] =
    projRes.status === 'fulfilled' && projRes.value
      ? projRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Project))
      : [];

  const tasks: ProjectTask[] =
    taskRes.status === 'fulfilled' && taskRes.value
      ? taskRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectTask))
      : [];

  const leaveRequests: LeaveRequest[] =
    leaveRes.status === 'fulfilled' && leaveRes.value
      ? leaveRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as LeaveRequest))
      : [];

  const attendances: Attendance[] =
    attRes.status === 'fulfilled' && attRes.value
      ? attRes.value.docs
          .map((d) => ({ id: d.id, ...d.data() } as Attendance))
          .sort((a, b) => {
            const dateA =
              typeof a.date === 'string'
                ? a.date
                : a.date?.toDate
                ? a.date.toDate().toISOString()
                : String(a.date || '');
            const dateB =
              typeof b.date === 'string'
                ? b.date
                : b.date?.toDate
                ? b.date.toDate().toISOString()
                : String(b.date || '');
            return dateB.localeCompare(dateA);
          })
      : [];

  return { projects, tasks, leaveRequests, attendances };
}

export async function fetchMentorDashboard(mentorId?: string) {
  if (!mentorId) {
    return { interns: [] as User[], tasks: [] as ProjectTask[] };
  }

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

  const mentorFieldPromise = getDocs(
    query(collection(db, 'users'), where('mentorId', '==', mentorId))
  );
  const assignedMentorPromise = getDocs(
    query(collection(db, 'users'), where('assignedMentorId', '==', mentorId))
  );

  const [resA, resB] = await Promise.allSettled([
    Promise.race([mentorFieldPromise, timeout]),
    Promise.race([assignedMentorPromise, timeout]),
  ]);

  const internMap = new Map<string, User>();
  if (resA.status === 'fulfilled' && resA.value) {
    resA.value.docs.forEach((d) => internMap.set(d.id, { id: d.id, ...d.data() } as User));
  }
  if (resB.status === 'fulfilled' && resB.value) {
    resB.value.docs.forEach((d) => internMap.set(d.id, { id: d.id, ...d.data() } as User));
  }

  const interns = Array.from(internMap.values());
  const tasks: ProjectTask[] = [];

  if (interns.length > 0) {
    const internIds = interns.map((i) => i.id!).filter(Boolean);
    const batchPromises = [];
    for (let i = 0; i < Math.min(internIds.length, 20); i += 10) {
      const batch = internIds.slice(i, i + 10);
      batchPromises.push(
        Promise.race([
          getDocs(query(collection(db, 'projectTasks'), where('assignedTo', 'in', batch))),
          timeout,
        ])
      );
    }
    const taskSnapshots = await Promise.allSettled(batchPromises);
    taskSnapshots.forEach((snapRes) => {
      if (snapRes.status === 'fulfilled' && snapRes.value) {
        snapRes.value.docs.forEach((d) => {
          tasks.push({ id: d.id, ...d.data() } as ProjectTask);
        });
      }
    });
  }

  return { interns, tasks };
}

export async function fetchInternDashboard(
  userProfile?: (User & { mentorId?: string; assignedMentorId?: string; programId?: string }) | null
) {
  const uid = userProfile?.uid;
  const mentorId = userProfile?.mentorId || userProfile?.assignedMentorId;
  const programId = userProfile?.programId;

  if (!uid) {
    return {
      mentor: null as User | null,
      program: null as InternshipProgram | null,
      tasks: [] as ProjectTask[],
      feedback: [] as ActivityHistory[],
    };
  }

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

  const mentorPromise = mentorId ? getDoc(doc(db, 'users', mentorId)) : Promise.resolve(null);
  const programPromise = programId
    ? getDoc(doc(db, 'internship_programs', programId))
    : Promise.resolve(null);
  const taskPromise = getDocs(query(collection(db, 'projectTasks'), where('assignedTo', '==', uid)));
  const fbPromise = getDocs(query(collection(db, 'auditLogs'), where('resourceId', '==', uid)));

  const [mentorRes, programRes, taskRes, fbRes] = await Promise.allSettled([
    Promise.race([mentorPromise, timeout]),
    Promise.race([programPromise, timeout]),
    Promise.race([taskPromise, timeout]),
    Promise.race([fbPromise, timeout]),
  ]);

  const mentor: User | null =
    mentorRes.status === 'fulfilled' &&
    mentorRes.value &&
    'exists' in mentorRes.value &&
    mentorRes.value.exists()
      ? ({ id: mentorRes.value.id, ...mentorRes.value.data() } as User)
      : null;

  const program: InternshipProgram | null =
    programRes.status === 'fulfilled' &&
    programRes.value &&
    'exists' in programRes.value &&
    programRes.value.exists()
      ? ({ id: programRes.value.id, ...programRes.value.data() } as InternshipProgram)
      : null;

  const tasks: ProjectTask[] =
    taskRes.status === 'fulfilled' && taskRes.value && 'docs' in taskRes.value
      ? taskRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectTask))
      : [];

  const feedback: ActivityHistory[] =
    fbRes.status === 'fulfilled' && fbRes.value && 'docs' in fbRes.value
      ? fbRes.value.docs
          .map((d) => ({ id: d.id, ...d.data() } as ActivityHistory))
          .filter((item) => ['INTERN_FEEDBACK', 'INTERN_EVALUATION'].includes(item.action))
      : [];

  return { mentor, program, tasks, feedback };
}

/**
 * Fetch projects and associated milestone tasks with React Query caching
 */
export function useMyProjects(userId?: string) {
  return useQuery({
    queryKey: dashboardQueryKeys.myProjects(userId),
    enabled: Boolean(userId),
    queryFn: () => fetchMyProjects(userId),
  });
}

/**
 * Fetch all client dashboard data concurrently with React Query caching
 */
export function useClientDashboard(clientId?: string) {
  return useQuery({
    queryKey: dashboardQueryKeys.clientDashboard(clientId),
    enabled: Boolean(clientId),
    queryFn: () => fetchClientDashboard(clientId),
  });
}

/**
 * Fetch candidate dashboard data with React Query caching
 */
export function useCandidateDashboard(candidateId?: string) {
  return useQuery({
    queryKey: dashboardQueryKeys.candidateDashboard(candidateId),
    enabled: Boolean(candidateId),
    queryFn: () => fetchCandidateDashboard(candidateId),
  });
}

/**
 * Fetch employee dashboard data with React Query caching
 */
export function useEmployeeDashboard(employeeId?: string) {
  return useQuery({
    queryKey: dashboardQueryKeys.employeeDashboard(employeeId),
    enabled: Boolean(employeeId),
    queryFn: () => fetchEmployeeDashboard(employeeId),
  });
}

/**
 * Fetch mentor dashboard data with React Query caching and single-field index safety
 */
export function useMentorDashboard(mentorId?: string) {
  return useQuery({
    queryKey: dashboardQueryKeys.mentorDashboard(mentorId),
    enabled: Boolean(mentorId),
    queryFn: () => fetchMentorDashboard(mentorId),
  });
}

/**
 * Fetch intern/student dashboard data with React Query caching and single-field index safety
 */
export function useInternDashboard(
  userProfile?: (User & { mentorId?: string; assignedMentorId?: string; programId?: string }) | null
) {
  const uid = userProfile?.uid;
  const mentorId = userProfile?.mentorId || userProfile?.assignedMentorId;
  const programId = userProfile?.programId;

  return useQuery({
    queryKey: dashboardQueryKeys.internDashboard(uid, mentorId, programId),
    enabled: Boolean(uid),
    queryFn: () => fetchInternDashboard(userProfile),
  });
}

// ---------------------------------------------------------------------------
// TanStack Query Prefetching Orchestration (RBAC, Sidebar Config, & Dashboards)
// ---------------------------------------------------------------------------

/**
 * Warm cached sidebar navigation structure for one or all 5 canonical roles.
 * Ensures switching routes or previewing roles in Admin Console incurs 0 Firestore reads.
 */
export async function prefetchSidebarNavigation(params: {
  roles: CanonicalRole[];
  rbacConfig?: RBACConfigDocument;
  permissionOverrides?: Partial<RolePermissionsMap>;
  limitOverrides?: Partial<RoleLimits>;
  suspended?: boolean;
}) {
  const config =
    params.rbacConfig ||
    (await queryClient.ensureQueryData({
      queryKey: dashboardQueryKeys.rbacConfig,
      queryFn: fetchRbacConfigFromFirestore,
      staleTime: 1000 * 60 * 10,
    }));

  const version = getRbacConfigCacheVersion(
    config,
    params.permissionOverrides,
    params.limitOverrides,
    params.suspended
  );

  await Promise.allSettled(
    params.roles.map((role) =>
      queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.sidebarConfig(role, version),
        queryFn: () =>
          buildResolvedSidebarConfig({
            role,
            rbacConfig: config,
            permissionOverrides: params.permissionOverrides,
            limitOverrides: params.limitOverrides,
            suspended: params.suspended,
          }),
        staleTime: 1000 * 60 * 15,
      })
    )
  );
}

/**
 * Warm lazy React JS chunks alongside TanStack Query data so clicking a sidebar link
 * or switching tabs opens immediately with no chunk waterfall.
 */
const preloadedChunks = new Set<string>();

export function preloadDashboardChunk(params: {
  path?: string;
  tab?: string;
  role?: CanonicalRole;
}) {
  const key = `${params.path || ''}|${params.tab || ''}|${params.role || ''}`;
  if (preloadedChunks.has(key)) return;
  preloadedChunks.add(key);

  const load = (importer: () => Promise<unknown>) => {
    void importer().catch(() => {
      preloadedChunks.delete(key);
    });
  };

  if (params.path) {
    if (params.path === '/admin') {
      load(() => import('../pages/admin/Dashboard'));
      return;
    }
    if (params.path.startsWith('/admin/reports')) return load(() => import('../pages/admin/Reports'));
    if (params.path.startsWith('/admin/audit')) return load(() => import('../pages/admin/Audit'));
    if (params.path.startsWith('/admin/content')) return load(() => import('../pages/admin/Content'));
    if (params.path.startsWith('/admin/users')) return load(() => import('../pages/admin/Users'));
    if (params.path.startsWith('/admin/departments')) return load(() => import('../pages/admin/Departments'));
    if (params.path.startsWith('/admin/employees')) return load(() => import('../pages/admin/Employees'));
    if (params.path.startsWith('/admin/mentors')) return load(() => import('../pages/admin/Mentors'));
    if (params.path.startsWith('/admin/enquiries')) return load(() => import('../pages/admin/Enquiries'));
    if (params.path.startsWith('/admin/clients')) return load(() => import('../pages/admin/Clients'));
    if (params.path.startsWith('/admin/projects')) return load(() => import('../pages/admin/Projects'));
    if (params.path.startsWith('/admin/payments')) return load(() => import('../pages/admin/Payments'));
    if (params.path.startsWith('/admin/internships')) return load(() => import('../pages/admin/Internships'));
    if (params.path.startsWith('/admin/candidates')) return load(() => import('../pages/admin/Candidates'));
    if (params.path.startsWith('/admin/interns')) return load(() => import('../pages/admin/Interns'));
    if (params.path.startsWith('/admin/attendance')) return load(() => import('../pages/admin/Attendance'));
    if (params.path.startsWith('/admin/leaves')) return load(() => import('../pages/admin/Leaves'));
    if (params.path.startsWith('/admin/documents')) return load(() => import('../pages/admin/Documents'));
    if (params.path.startsWith('/admin/vendors')) return load(() => import('../pages/admin/Vendors'));
    if (params.path.startsWith('/admin/announcements')) return load(() => import('../pages/admin/Announcements'));
    if (params.path.startsWith('/admin/notifications')) return load(() => import('../pages/admin/Notifications'));
    if (params.path.startsWith('/admin/permissions')) return load(() => import('../components/PermissionConfiguration'));
    if (params.path.startsWith('/admin/settings')) return load(() => import('../pages/admin/Settings'));
  }

  if (params.tab) {
    if (params.tab === 'profile') return load(() => import('../components/user/UserProfile'));
    if (params.tab === 'portfolio') return load(() => import('../components/dashboard/MyProjects'));
    if (
      params.role === 'INTERN_STUDENT' &&
      (params.tab === 'applications' || params.tab === 'documents' || params.tab === 'notifications')
    ) {
      return load(() => import('../pages/dashboard/roles/CandidateDashboard'));
    }
  }

  switch (params.role) {
    case 'ADMIN':
      load(() => import('../pages/admin/Dashboard'));
      break;
    case 'CLIENT':
      load(() => import('../pages/dashboard/roles/ClientDashboard'));
      break;
    case 'EMPLOYEE':
      load(() => import('../pages/dashboard/roles/EmployeeDashboard'));
      break;
    case 'MENTOR':
      load(() => import('../pages/dashboard/roles/MentorDashboard'));
      break;
    case 'INTERN_STUDENT':
      load(() => import('../pages/dashboard/roles/InternDashboard'));
      break;
  }
}

/**
 * Prefetch RBAC configuration, user quota, role-based sidebar configuration,
 * and active role dashboard data concurrently before child views mount.
 */
export async function prefetchDashboardForRole(params: {
  role: CanonicalRole;
  actualRole?: CanonicalRole;
  userProfile?: (User & { mentorId?: string; assignedMentorId?: string; programId?: string }) | null;
}) {
  const uid = params.userProfile?.uid || auth.currentUser?.uid;
  if (!uid) return;

  preloadDashboardChunk({ role: params.role });

  const rbacConfigPromise = queryClient.ensureQueryData({
    queryKey: dashboardQueryKeys.rbacConfig,
    queryFn: fetchRbacConfigFromFirestore,
    staleTime: 1000 * 60 * 10,
  });

  const quotaPromise = queryClient.prefetchQuery({
    queryKey: dashboardQueryKeys.userQuota(uid),
    queryFn: () => fetchUserQuotaFromFirestore(uid),
    staleTime: 1000 * 60 * 3,
  });

  const config = await rbacConfigPromise.catch(() => DEFAULT_RBAC_CONFIG);
  const rolesToWarm =
    params.actualRole === 'ADMIN' ? [...FIVE_ROLES] : [params.role];

  const sidebarPromise = prefetchSidebarNavigation({
    roles: rolesToWarm,
    rbacConfig: config,
    permissionOverrides:
      params.actualRole === 'ADMIN' && params.role !== 'ADMIN'
        ? undefined
        : (params.userProfile?.permissionOverrides as Partial<RolePermissionsMap> | undefined),
    limitOverrides:
      params.actualRole === 'ADMIN' && params.role !== 'ADMIN'
        ? undefined
        : (params.userProfile?.limitOverrides as Partial<RoleLimits> | undefined),
    suspended: params.userProfile?.isActive === false,
  });

  const roleTasks: Promise<unknown>[] = [quotaPromise, sidebarPromise];

  switch (params.role) {
    case 'ADMIN':
      roleTasks.push(
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.adminOverview,
          queryFn: fetchAdminOverview,
          staleTime: 1000 * 60 * 5,
        })
      );
      roleTasks.push(
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.adminEnquiries,
          queryFn: fetchAdminEnquiries,
          staleTime: 1000 * 60 * 5,
        })
      );
      break;

    case 'CLIENT':
      roleTasks.push(
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.clientDashboard(uid),
          queryFn: () => fetchClientDashboard(uid),
          staleTime: 1000 * 60 * 5,
        }),
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.myProjects(uid),
          queryFn: () => fetchMyProjects(uid),
          staleTime: 1000 * 60 * 5,
        })
      );
      break;

    case 'EMPLOYEE':
      roleTasks.push(
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.employeeDashboard(uid),
          queryFn: () => fetchEmployeeDashboard(uid),
          staleTime: 1000 * 60 * 5,
        }),
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.myProjects(uid),
          queryFn: () => fetchMyProjects(uid),
          staleTime: 1000 * 60 * 5,
        })
      );
      break;

    case 'MENTOR':
      roleTasks.push(
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.mentorDashboard(uid),
          queryFn: () => fetchMentorDashboard(uid),
          staleTime: 1000 * 60 * 5,
        }),
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.adminUsers,
          queryFn: fetchAdminUsers,
          staleTime: 1000 * 60 * 5,
        }),
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.adminAuditLogs(500),
          queryFn: () => fetchAdminAuditLogs(500),
          staleTime: 1000 * 60 * 3,
        })
      );
      break;

    case 'INTERN_STUDENT':
    default: {
      const mentorId =
        params.userProfile?.mentorId || params.userProfile?.assignedMentorId;
      const programId = params.userProfile?.programId;
      roleTasks.push(
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.internDashboard(uid, mentorId, programId),
          queryFn: () => fetchInternDashboard(params.userProfile),
          staleTime: 1000 * 60 * 5,
        }),
        queryClient.prefetchQuery({
          queryKey: dashboardQueryKeys.candidateDashboard(uid),
          queryFn: () => fetchCandidateDashboard(uid),
          staleTime: 1000 * 60 * 5,
        })
      );
      break;
    }
  }

  await Promise.allSettled(roleTasks);
}

/**
 * Prefetch target data & lazy chunks on sidebar link hover/focus so route transitions
 * open instantaneously from cache.
 */
export function prefetchSidebarTarget(params: {
  path?: string;
  tab?: string;
  effectiveRole: CanonicalRole;
  userProfile?: (User & { mentorId?: string; assignedMentorId?: string; programId?: string }) | null;
}) {
  const { path, tab, effectiveRole, userProfile } = params;
  preloadDashboardChunk({ path, tab, role: effectiveRole });
  const uid = userProfile?.uid || auth.currentUser?.uid;
  if (!uid) return;

  if (path) {
    if (path === '/admin') {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminOverview,
        queryFn: fetchAdminOverview,
        staleTime: 1000 * 60 * 5,
      });
      return;
    }

    if (
      path.startsWith('/admin/users') ||
      path.startsWith('/admin/employees') ||
      path.startsWith('/admin/mentors') ||
      path.startsWith('/admin/clients')
    ) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminUsers,
        queryFn: fetchAdminUsers,
        staleTime: 1000 * 60 * 5,
      });
      return;
    }

    if (path.startsWith('/admin/projects')) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminProjects,
        queryFn: fetchAdminProjects,
        staleTime: 1000 * 60 * 5,
      });
      return;
    }

    if (path.startsWith('/admin/enquiries')) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminEnquiries,
        queryFn: fetchAdminEnquiries,
        staleTime: 1000 * 60 * 5,
      });
      return;
    }

    if (path.startsWith('/admin/audit')) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminAuditLogs(500),
        queryFn: () => fetchAdminAuditLogs(500),
        staleTime: 1000 * 60 * 3,
      });
      return;
    }

    if (path.startsWith('/admin/documents')) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminDocuments(200),
        queryFn: () => fetchAdminDocuments(200),
        staleTime: 1000 * 60 * 5,
      });
      return;
    }

    if (path.startsWith('/admin/notifications')) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminNotifications(100),
        queryFn: () => fetchAdminNotifications(100),
        staleTime: 1000 * 60 * 3,
      });
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminUsers,
        queryFn: fetchAdminUsers,
        staleTime: 1000 * 60 * 5,
      });
      return;
    }

    if (path.startsWith('/admin/reports')) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminUsers,
        queryFn: fetchAdminUsers,
        staleTime: 1000 * 60 * 5,
      });
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminProjects,
        queryFn: fetchAdminProjects,
        staleTime: 1000 * 60 * 5,
      });
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminPayments,
        queryFn: fetchAdminPayments,
        staleTime: 1000 * 60 * 5,
      });
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminEnquiries,
        queryFn: fetchAdminEnquiries,
        staleTime: 1000 * 60 * 5,
      });
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.adminTasks(500),
        queryFn: () => fetchAdminTasks(500),
        staleTime: 1000 * 60 * 5,
      });
      return;
    }

    if (path.startsWith('/admin/permissions')) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.rbacConfig,
        queryFn: fetchRbacConfigFromFirestore,
        staleTime: 1000 * 60 * 10,
      });
      return;
    }
  }

  if (tab) {
    if (tab === 'portfolio' || tab === 'projects') {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.myProjects(uid),
        queryFn: () => fetchMyProjects(uid),
        staleTime: 1000 * 60 * 5,
      });
    }

    if (
      effectiveRole === 'INTERN_STUDENT' &&
      (tab === 'applications' || tab === 'documents' || tab === 'notifications')
    ) {
      void queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.candidateDashboard(uid),
        queryFn: () => fetchCandidateDashboard(uid),
        staleTime: 1000 * 60 * 5,
      });
    }
  }
}

export function invalidateAdminCaches(
  keys: Array<
    | 'overview'
    | 'users'
    | 'projects'
    | 'enquiries'
    | 'auditLogs'
    | 'attendance'
    | 'tasks'
    | 'documents'
    | 'notifications'
    | 'payments'
    | 'quotas'
    | 'rbac'
  >
) {
  keys.forEach((key) => {
    switch (key) {
      case 'overview':
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.adminOverview });
        break;
      case 'users':
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.adminUsers });
        break;
      case 'projects':
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.adminProjects });
        break;
      case 'enquiries':
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.adminEnquiries });
        break;
      case 'auditLogs':
        void queryClient.invalidateQueries({ queryKey: ['admin', 'auditLogs'] });
        break;
      case 'attendance':
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.adminAttendance });
        break;
      case 'tasks':
        void queryClient.invalidateQueries({ queryKey: ['admin', 'projectTasks'] });
        break;
      case 'documents':
        void queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
        break;
      case 'notifications':
        void queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
        break;
      case 'payments':
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.adminPayments });
        break;
      case 'quotas':
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.adminQuotas });
        break;
      case 'rbac':
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.rbacConfig });
        void queryClient.invalidateQueries({ queryKey: ['sidebar-config'] });
        break;
    }
  });
}
