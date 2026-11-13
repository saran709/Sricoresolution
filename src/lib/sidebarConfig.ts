import React from 'react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ShieldAlert,
  Building2,
  BadgeCheck,
  Award,
  Inbox,
  Handshake,
  FolderKanban,
  CreditCard,
  GraduationCap,
  UserCheck,
  BookOpenCheck,
  CalendarCheck2,
  CalendarOff,
  FileStack,
  Store,
  Megaphone,
  BellRing,
  Globe,
  KeyRound,
  Settings2,
  ListChecks,
  Compass,
  Clock,
  ClipboardCheck,
  Target,
  MessageSquareQuote,
  FileBadge,
  FileCheck2,
  FolderGit2,
  Receipt,
  FileSpreadsheet,
  Send,
  UserCog,
} from 'lucide-react';
import {
  CanonicalRole,
  DEFAULT_RESOURCE_PERMISSIONS,
  normalizeToCanonicalRole,
  PermissionAction,
  RBACConfigDocument,
  resolveEffectiveLimits,
  resolveEffectivePermissions,
  resolveRoleResourceAccess,
  ResourceCRUDAction,
  RoleLimits,
  RolePermissionsMap,
  isAccessExpired,
} from './rbac';

export interface SidebarItem {
  name: string;
  path?: string;
  tab?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  requiredPermission?: PermissionAction;
  requiredResource?: {
    resourceKey: string;
    action: ResourceCRUDAction;
  };
}

export interface SidebarCategory {
  title: string;
  items: SidebarItem[];
}

export const ADMIN_NAV_CATEGORIES: SidebarCategory[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, requiredPermission: 'view' },
      { name: 'Users', path: '/admin/users', icon: Users, requiredPermission: 'manage', requiredResource: { resourceKey: 'users', action: 'read' } },
      { name: 'Reports', path: '/admin/reports', icon: BarChart3, requiredPermission: 'view', requiredResource: { resourceKey: 'reports', action: 'read' } },
      { name: 'Audit Logs', path: '/admin/audit', icon: ShieldAlert, requiredPermission: 'manage', requiredResource: { resourceKey: 'auditLogs', action: 'read' } },
    ],
  },
  {
    title: 'Organization',
    items: [
      { name: 'Departments', path: '/admin/departments', icon: Building2, requiredPermission: 'manage' },
      { name: 'Employees', path: '/admin/employees', icon: BadgeCheck, requiredPermission: 'manage', requiredResource: { resourceKey: 'users', action: 'read' } },
      { name: 'Mentors', path: '/admin/mentors', icon: Award, requiredPermission: 'manage', requiredResource: { resourceKey: 'users', action: 'read' } },
    ],
  },
  {
    title: 'Business Operations',
    items: [
      { name: 'Enquiries', path: '/admin/enquiries', icon: Inbox, requiredPermission: 'view', requiredResource: { resourceKey: 'enquiries', action: 'read' } },
      { name: 'Clients', path: '/admin/clients', icon: Handshake, requiredPermission: 'manage', requiredResource: { resourceKey: 'users', action: 'read' } },
      { name: 'Projects', path: '/admin/projects', icon: FolderKanban, requiredPermission: 'view', requiredResource: { resourceKey: 'projects', action: 'read' } },
      { name: 'Payments', path: '/admin/payments', icon: CreditCard, requiredPermission: 'manage', requiredResource: { resourceKey: 'payments', action: 'read' } },
    ],
  },
  {
    title: 'Internship Program',
    items: [
      { name: 'Programs', path: '/admin/internships', icon: GraduationCap, requiredPermission: 'view', requiredResource: { resourceKey: 'internships', action: 'read' } },
      { name: 'Candidates', path: '/admin/candidates', icon: UserCheck, requiredPermission: 'review', requiredResource: { resourceKey: 'internships', action: 'read' } },
      { name: 'Interns', path: '/admin/interns', icon: BookOpenCheck, requiredPermission: 'assign', requiredResource: { resourceKey: 'internships', action: 'read' } },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck2, requiredPermission: 'view' },
      { name: 'Leave Requests', path: '/admin/leaves', icon: CalendarOff, requiredPermission: 'approve' },
      { name: 'Documents', path: '/admin/documents', icon: FileStack, requiredPermission: 'view', requiredResource: { resourceKey: 'documents', action: 'read' } },
      { name: 'Vendors', path: '/admin/vendors', icon: Store, requiredPermission: 'manage' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { name: 'Announcements', path: '/admin/announcements', icon: Megaphone, requiredPermission: 'create' },
      { name: 'Notifications', path: '/admin/notifications', icon: BellRing, requiredPermission: 'view' },
      { name: 'Website Content', path: '/admin/content', icon: Globe, requiredPermission: 'manage' },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Permissions', path: '/admin/permissions', icon: KeyRound, requiredPermission: 'manage', requiredResource: { resourceKey: 'settings', action: 'read' } },
      { name: 'Settings', path: '/admin/settings', icon: Settings2, requiredPermission: 'manage', requiredResource: { resourceKey: 'settings', action: 'read' } },
    ],
  },
];

export function getRolePortalTitle(role?: string): string {
  const canonical = normalizeToCanonicalRole(role);
  switch (canonical) {
    case 'ADMIN':
      return 'Admin Console';
    case 'EMPLOYEE':
      return 'Employee Workspace';
    case 'MENTOR':
      return 'Mentor Workspace';
    case 'INTERN_STUDENT':
      return 'Intern / Student Workspace';
    case 'CLIENT':
    default:
      return 'Client Workspace';
  }
}

export function getRoleSidebarCategories(
  role?: string,
  canCheck?: (action: PermissionAction) => boolean,
  canAccessResourceCheck?: (resourceKey: string, action: ResourceCRUDAction) => boolean
): SidebarCategory[] {
  const canonical = normalizeToCanonicalRole(role);
  const filterByPermission = (categories: SidebarCategory[]): SidebarCategory[] => {
    if (canonical === 'ADMIN') return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const passesGlobal =
            !canCheck || !item.requiredPermission || canCheck(item.requiredPermission);
          const passesResource =
            !canAccessResourceCheck ||
            !item.requiredResource ||
            canAccessResourceCheck(
              item.requiredResource.resourceKey,
              item.requiredResource.action
            );
          return passesGlobal && passesResource;
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  };

  switch (canonical) {
    case 'ADMIN':
      return filterByPermission(ADMIN_NAV_CATEGORIES);

    case 'EMPLOYEE':
      return filterByPermission([
        {
          title: 'Overview & Delivery',
          items: [
            { name: 'Dashboard', tab: 'overview', icon: LayoutDashboard, requiredPermission: 'view' },
            { name: 'My Tasks', tab: 'tasks', icon: ListChecks, requiredPermission: 'view', requiredResource: { resourceKey: 'tasks', action: 'read' } },
            { name: 'Assigned Projects', tab: 'projects', icon: FolderKanban, requiredPermission: 'view', requiredResource: { resourceKey: 'projects', action: 'read' } },
            { name: 'Project Workspace', tab: 'portfolio', icon: Compass, requiredPermission: 'view', requiredResource: { resourceKey: 'projects', action: 'read' } },
          ],
        },
        {
          title: 'HR & Operations',
          items: [
            { name: 'Attendance & Leave', tab: 'attendance', icon: Clock, requiredPermission: 'view' },
          ],
        },
        {
          title: 'Account',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserCog, requiredPermission: 'view', requiredResource: { resourceKey: 'users', action: 'read' } },
          ],
        },
      ]);

    case 'MENTOR':
      return filterByPermission([
        {
          title: 'Mentorship & Cohorts',
          items: [
            { name: 'Dashboard', tab: 'overview', icon: LayoutDashboard, requiredPermission: 'view' },
            { name: 'Intern Management', tab: 'interns', icon: BookOpenCheck, requiredPermission: 'view', requiredResource: { resourceKey: 'internships', action: 'read' } },
            { name: 'Pending Evaluations', tab: 'evaluations', icon: ClipboardCheck, requiredPermission: 'review', requiredResource: { resourceKey: 'internships', action: 'approve' } },
          ],
        },
        {
          title: 'Account',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserCog, requiredPermission: 'view', requiredResource: { resourceKey: 'users', action: 'read' } },
          ],
        },
      ]);

    case 'INTERN_STUDENT':
      return filterByPermission([
        {
          title: 'Learning & Deliverables',
          items: [
            { name: 'Dashboard', tab: 'overview', icon: LayoutDashboard, requiredPermission: 'view' },
            { name: 'My Assignments', tab: 'assignments', icon: Target, requiredPermission: 'view', requiredResource: { resourceKey: 'tasks', action: 'read' } },
            { name: 'Feedback & Evals', tab: 'feedback', icon: MessageSquareQuote, requiredPermission: 'view', requiredResource: { resourceKey: 'auditLogs', action: 'read' } },
            { name: 'Certificates', tab: 'certificates', icon: FileBadge, requiredPermission: 'download', requiredResource: { resourceKey: 'internships', action: 'download' } },
          ],
        },
        {
          title: 'Applications & Programs',
          items: [
            { name: 'My Applications', tab: 'applications', icon: FileCheck2, requiredPermission: 'view', requiredResource: { resourceKey: 'internships', action: 'read' } },
            { name: 'Resume & Documents', tab: 'documents', icon: FolderGit2, requiredPermission: 'view', requiredResource: { resourceKey: 'documents', action: 'read' } },
            { name: 'Notifications', tab: 'notifications', icon: BellRing, requiredPermission: 'view' },
            { name: 'Browse Internships', href: '/internships', icon: GraduationCap, requiredPermission: 'view' },
          ],
        },
        {
          title: 'Account',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserCog, requiredPermission: 'view', requiredResource: { resourceKey: 'users', action: 'read' } },
          ],
        },
      ]);

    case 'CLIENT':
    default:
      return filterByPermission([
        {
          title: 'Workspace Overview',
          items: [
            { name: 'Dashboard', tab: 'overview', icon: LayoutDashboard, requiredPermission: 'view' },
            { name: 'My Projects', tab: 'projects', icon: FolderKanban, requiredPermission: 'view', requiredResource: { resourceKey: 'projects', action: 'read' } },
            { name: 'Project Tracker', tab: 'portfolio', icon: Compass, requiredPermission: 'view', requiredResource: { resourceKey: 'projects', action: 'read' } },
          ],
        },
        {
          title: 'Operations & Billing',
          items: [
            { name: 'Enquiries & Quotes', tab: 'enquiries', icon: Inbox, requiredPermission: 'view', requiredResource: { resourceKey: 'enquiries', action: 'read' } },
            { name: 'Payments & Proofs', tab: 'payments', icon: Receipt, requiredPermission: 'view', requiredResource: { resourceKey: 'payments', action: 'read' } },
            { name: 'Project Documents', tab: 'documents', icon: FileSpreadsheet, requiredPermission: 'download', requiredResource: { resourceKey: 'documents', action: 'download' } },
          ],
        },
        {
          title: 'Account & Support',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserCog, requiredPermission: 'view', requiredResource: { resourceKey: 'users', action: 'read' } },
            { name: 'New Project Enquiry', href: '/enquiry', icon: Send, requiredPermission: 'create', requiredResource: { resourceKey: 'enquiries', action: 'create' } },
          ],
        },
      ]);
  }
}

export interface ResolvedSidebarConfig {
  role: CanonicalRole;
  portalTitle: string;
  categories: SidebarCategory[];
  version: string;
}

/**
 * Compute a lightweight deterministic signature for an RBACConfigDocument + overrides
 * so cached sidebar menus automatically stay in sync when permissions/limits mutate.
 */
export function getRbacConfigCacheVersion(
  config: RBACConfigDocument,
  permissionOverrides?: Partial<RolePermissionsMap>,
  limitOverrides?: Partial<RoleLimits>,
  suspended?: boolean
): string {
  const updatedMs =
    typeof (config.updatedAt as any)?.toMillis === 'function'
      ? (config.updatedAt as any).toMillis()
      : typeof (config.updatedAt as any)?.seconds === 'number'
      ? (config.updatedAt as any).seconds
      : config.updatedAt
      ? String(config.updatedAt)
      : 'default';

  const resourceKeys = Object.keys(config.resourcePermissions || DEFAULT_RESOURCE_PERMISSIONS)
    .sort()
    .join(',');

  const permDigest = JSON.stringify(config.rolePermissions || {});
  const overrideDigest = permissionOverrides || limitOverrides || suspended
    ? `${JSON.stringify(permissionOverrides || {})}:${JSON.stringify(limitOverrides || {})}:${Boolean(suspended)}`
    : 'none';

  return `${updatedMs}|${resourceKeys.length}|${permDigest.length}|${overrideDigest}`;
}

/**
 * Pure builder for resolved, permission-filtered sidebar navigation configuration.
 */
export function buildResolvedSidebarConfig(params: {
  role: CanonicalRole;
  rbacConfig: RBACConfigDocument;
  permissionOverrides?: Partial<RolePermissionsMap>;
  limitOverrides?: Partial<RoleLimits>;
  suspended?: boolean;
}): ResolvedSidebarConfig {
  const { role, rbacConfig, permissionOverrides, limitOverrides, suspended = false } = params;
  const effectivePermissions = resolveEffectivePermissions(role, rbacConfig, permissionOverrides);
  const effectiveLimits = resolveEffectiveLimits(role, rbacConfig, limitOverrides);
  const expired = isAccessExpired(effectiveLimits);
  const resourceMap =
    rbacConfig.resourcePermissions && Object.keys(rbacConfig.resourcePermissions).length > 0
      ? rbacConfig.resourcePermissions
      : DEFAULT_RESOURCE_PERMISSIONS;

  const canCheck = (action: PermissionAction): boolean => {
    if (suspended || expired) return false;
    if (role === 'ADMIN') return true;
    return Boolean(effectivePermissions[action]);
  };

  const canAccessResourceCheck = (
    resourceKey: string,
    action: ResourceCRUDAction
  ): boolean => {
    if (suspended || expired) return false;
    if (role === 'ADMIN') return true;
    const entry = resourceMap[resourceKey];
    if (!entry) {
      const resolved = resolveRoleResourceAccess(role, resourceKey, rbacConfig);
      return resolved.scope !== 'none' && Boolean(resolved[action]);
    }
    const roleEntry = entry.roleAccess?.[role];
    if (!roleEntry || roleEntry.scope === 'none') return false;
    return Boolean(roleEntry[action]);
  };

  return {
    role,
    portalTitle: getRolePortalTitle(role),
    categories: getRoleSidebarCategories(role, canCheck, canAccessResourceCheck),
    version: getRbacConfigCacheVersion(
      rbacConfig,
      permissionOverrides,
      limitOverrides,
      suspended
    ),
  };
}
