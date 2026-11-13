import {
  doc,
  runTransaction,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { logActivity } from './activityLogger';

/**
 * Exactly FIVE canonical roles permitted across the Sricore Solutions Unified Dashboard System.
 */
export const FIVE_ROLES = [
  'ADMIN',
  'CLIENT',
  'EMPLOYEE',
  'MENTOR',
  'INTERN_STUDENT',
] as const;

export type CanonicalRole = (typeof FIVE_ROLES)[number];

export const ROLE_METADATA: Record<
  CanonicalRole,
  {
    label: string;
    shortLabel: string;
    badgeColor: string;
    description: string;
    capabilities: string[];
  }
> = {
  ADMIN: {
    label: 'Administrator (ADMIN)',
    shortLabel: 'ADMIN',
    badgeColor:
      'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    description:
      'Full website management, RBAC permission & limit configuration, user lifecycle control, and system-wide audit visibility.',
    capabilities: [
      'Full website management',
      'Manage all users and roles',
      'Create, edit, suspend and activate accounts',
      'Assign employees, clients, mentors and interns',
      'Configure role permissions and usage limits',
      'Manage projects, services, tasks and reports',
      'Monitor website analytics and activity',
      'Access audit logs',
    ],
  },
  CLIENT: {
    label: 'Client Partner (CLIENT)',
    shortLabel: 'CLIENT',
    badgeColor:
      'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
    description:
      'Access assigned commercial & R&D projects, track milestones, submit requirements/feedback, and communicate with assigned engineers.',
    capabilities: [
      'Access assigned projects',
      'View project progress and milestones',
      'Submit requirements and feedback',
      'View assigned documents and reports',
      'Access service requests',
      'Communicate with assigned employees',
      'Manage personal profile',
    ],
  },
  EMPLOYEE: {
    label: 'Staff Engineer (EMPLOYEE)',
    shortLabel: 'EMPLOYEE',
    badgeColor:
      'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    description:
      'Execute assigned engineering projects, update tasks and work progress, upload technical documents, and submit delivery reports.',
    capabilities: [
      'Access assigned projects',
      'View and update assigned tasks',
      'Update work progress',
      'Upload project documents',
      'Submit reports',
      'Communicate with clients and mentors where authorized',
      'View performance information',
    ],
  },
  MENTOR: {
    label: 'Technical Mentor (MENTOR)',
    shortLabel: 'MENTOR',
    badgeColor:
      'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    description:
      'Supervise assigned interns and students, assign/review learning tasks, evaluate project submissions, and generate mentee reports.',
    capabilities: [
      'Access assigned interns and students',
      'Assign and review learning tasks',
      'Monitor student progress',
      'Review project submissions',
      'Provide feedback and evaluations',
      'Schedule mentoring sessions',
      'Generate mentee progress reports',
    ],
  },
  INTERN_STUDENT: {
    label: 'Intern / Student (INTERN_STUDENT)',
    shortLabel: 'INTERN / STUDENT',
    badgeColor:
      'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    description:
      'Access learning materials, view assigned projects/tasks, submit assignments, view mentor evaluations, and download certificates.',
    capabilities: [
      'Access assigned learning materials',
      'View assigned projects and tasks',
      'Submit assignments',
      'Upload documents',
      'View mentor feedback',
      'Track learning progress',
      'Access certificates when authorized',
      'Manage personal profile',
    ],
  },
};

/**
 * Normalize any legacy or raw role string from Firestore into one of the 5 canonical roles.
 */
export function normalizeToCanonicalRole(rawRole?: string | null): CanonicalRole {
  const upper = (rawRole || '').trim().toUpperCase();
  switch (upper) {
    case 'ADMIN':
    case 'ADMINISTRATOR':
      return 'ADMIN';
    case 'CLIENT':
    case 'EMPLOYER':
      return 'CLIENT';
    case 'EMPLOYEE':
      return 'EMPLOYEE';
    case 'MENTOR':
      return 'MENTOR';
    case 'INTERN_STUDENT':
    case 'INTERN':
    case 'STUDENT':
    case 'CANDIDATE':
    default:
      return 'INTERN_STUDENT';
  }
}

/**
 * Convert a CanonicalRole back to the Firestore-compatible role string where needed.
 */
export function toFirestoreRoleString(role: CanonicalRole): CanonicalRole {
  return role;
}

/**
 * All 11 required Permission Actions.
 */
export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'upload',
  'download',
  'approve',
  'review',
  'assign',
  'export',
  'manage',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  upload: 'Upload',
  download: 'Download',
  approve: 'Approve',
  review: 'Review',
  assign: 'Assign',
  export: 'Export',
  manage: 'Manage',
};

export type RolePermissionsMap = Record<PermissionAction, boolean>;

/**
 * Data visibility scope for resource-level access control across the 5 roles.
 */
export type ResourceAccessScope = 'all' | 'assigned' | 'own' | 'none';

/**
 * Resource-level CRUD + extended action permissions for a single role on a specific resource.
 */
export interface ResourceCRUDPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  upload: boolean;
  download: boolean;
  approve: boolean;
  assign: boolean;
  export: boolean;
  scope: ResourceAccessScope;
}

export type ResourceCRUDAction = keyof Omit<ResourceCRUDPermissions, 'scope'>;

export const RESOURCE_CRUD_ACTIONS: ResourceCRUDAction[] = [
  'create',
  'read',
  'update',
  'delete',
  'upload',
  'download',
  'approve',
  'assign',
  'export',
];

export const RESOURCE_CRUD_LABELS: Record<ResourceCRUDAction, { label: string; short: string }> = {
  create: { label: 'Create', short: 'C' },
  read: { label: 'Read / View', short: 'R' },
  update: { label: 'Update / Edit', short: 'U' },
  delete: { label: 'Delete', short: 'D' },
  upload: { label: 'Upload', short: 'UP' },
  download: { label: 'Download', short: 'DL' },
  approve: { label: 'Approve', short: 'AP' },
  assign: { label: 'Assign', short: 'AS' },
  export: { label: 'Export', short: 'EX' },
};

export type ResourceCategory =
  | 'Core Operations'
  | 'Workforce & Mentorship'
  | 'Finance & Legal'
  | 'System & Security'
  | 'Custom';

/**
 * A configurable Resource-Level Permission Rule supporting full CRUD lifecycle.
 */
export interface ResourcePermissionEntry {
  id: string;
  resourceKey: string;
  resourceName: string;
  category: ResourceCategory;
  description: string;
  isSystem?: boolean;
  roleAccess: Record<CanonicalRole, ResourceCRUDPermissions>;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Dynamic Role & User Limits configurable by ADMIN.
 */
export interface RoleLimits {
  maxProjects: number;
  maxAssignedTasks: number;
  aiRequestsPerDay: number;
  fileStorageCapacityMB: number;
  maxFileUploadSizeMB: number;
  reportGenerationLimit: number;
  maxAssignedMentees: number;
  maxActiveClientProjects: number;
  accessExpirationDate: string | null;
}

export interface UserUsageMetrics {
  projectsCount: number;
  assignedTasksCount: number;
  aiRequestsToday: number;
  aiRequestsDate: string;
  storageUsedMB: number;
  reportsGeneratedCount: number;
  assignedMenteesCount: number;
  activeClientProjectsCount: number;
  lastUpdated?: any;
}

export interface RBACConfigDocument {
  rolePermissions: Record<CanonicalRole, RolePermissionsMap>;
  roleLimits: Record<CanonicalRole, RoleLimits>;
  resourcePermissions?: Record<string, ResourcePermissionEntry>;
  updatedAt?: any;
  updatedBy?: string;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<CanonicalRole, RolePermissionsMap> = {
  ADMIN: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    upload: true,
    download: true,
    approve: true,
    review: true,
    assign: true,
    export: true,
    manage: true,
  },
  CLIENT: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    upload: true,
    download: true,
    approve: true,
    review: true,
    assign: false,
    export: true,
    manage: false,
  },
  EMPLOYEE: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    upload: true,
    download: true,
    approve: false,
    review: true,
    assign: false,
    export: true,
    manage: false,
  },
  MENTOR: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    upload: true,
    download: true,
    approve: true,
    review: true,
    assign: true,
    export: true,
    manage: false,
  },
  INTERN_STUDENT: {
    view: true,
    create: true,
    edit: false,
    delete: false,
    upload: true,
    download: true,
    approve: false,
    review: false,
    assign: false,
    export: false,
    manage: false,
  },
};

export const DEFAULT_ROLE_LIMITS: Record<CanonicalRole, RoleLimits> = {
  ADMIN: {
    maxProjects: 9999,
    maxAssignedTasks: 9999,
    aiRequestsPerDay: 1000,
    fileStorageCapacityMB: 102400,
    maxFileUploadSizeMB: 500,
    reportGenerationLimit: 9999,
    maxAssignedMentees: 500,
    maxActiveClientProjects: 9999,
    accessExpirationDate: null,
  },
  CLIENT: {
    maxProjects: 15,
    maxAssignedTasks: 50,
    aiRequestsPerDay: 50,
    fileStorageCapacityMB: 5120,
    maxFileUploadSizeMB: 50,
    reportGenerationLimit: 30,
    maxAssignedMentees: 0,
    maxActiveClientProjects: 10,
    accessExpirationDate: null,
  },
  EMPLOYEE: {
    maxProjects: 25,
    maxAssignedTasks: 100,
    aiRequestsPerDay: 100,
    fileStorageCapacityMB: 10240,
    maxFileUploadSizeMB: 100,
    reportGenerationLimit: 60,
    maxAssignedMentees: 5,
    maxActiveClientProjects: 20,
    accessExpirationDate: null,
  },
  MENTOR: {
    maxProjects: 20,
    maxAssignedTasks: 80,
    aiRequestsPerDay: 80,
    fileStorageCapacityMB: 8192,
    maxFileUploadSizeMB: 100,
    reportGenerationLimit: 100,
    maxAssignedMentees: 25,
    maxActiveClientProjects: 10,
    accessExpirationDate: null,
  },
  INTERN_STUDENT: {
    maxProjects: 5,
    maxAssignedTasks: 25,
    aiRequestsPerDay: 25,
    fileStorageCapacityMB: 1024,
    maxFileUploadSizeMB: 25,
    reportGenerationLimit: 10,
    maxAssignedMentees: 0,
    maxActiveClientProjects: 0,
    accessExpirationDate: null,
  },
};

const FULL_ADMIN_RESOURCE_ACCESS: ResourceCRUDPermissions = {
  create: true,
  read: true,
  update: true,
  delete: true,
  upload: true,
  download: true,
  approve: true,
  assign: true,
  export: true,
  scope: 'all',
};

const NO_RESOURCE_ACCESS: ResourceCRUDPermissions = {
  create: false,
  read: false,
  update: false,
  delete: false,
  upload: false,
  download: false,
  approve: false,
  assign: false,
  export: false,
  scope: 'none',
};

/**
 * Default Resource-Level CRUD Permissions across all 5 canonical roles.
 */
export const DEFAULT_RESOURCE_PERMISSIONS: Record<string, ResourcePermissionEntry> = {
  projects: {
    id: 'projects',
    resourceKey: 'projects',
    resourceName: 'Projects & Milestones',
    category: 'Core Operations',
    description: 'Commercial, R&D, and hardware/software engineering project records and milestones.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: true,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      EMPLOYEE: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      MENTOR: {
        create: false,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: true,
        assign: true,
        export: true,
        scope: 'assigned',
      },
      INTERN_STUDENT: {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'assigned',
      },
    },
  },
  tasks: {
    id: 'tasks',
    resourceKey: 'tasks',
    resourceName: 'Tasks & Assignments',
    category: 'Core Operations',
    description: 'Engineering deliverables, sprint tasks, and intern learning assignments.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: true,
        approve: true,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      EMPLOYEE: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      MENTOR: {
        create: true,
        read: true,
        update: true,
        delete: true,
        upload: true,
        download: true,
        approve: true,
        assign: true,
        export: true,
        scope: 'assigned',
      },
      INTERN_STUDENT: {
        create: false,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
    },
  },
  documents: {
    id: 'documents',
    resourceKey: 'documents',
    resourceName: 'Technical Documents & Files',
    category: 'Core Operations',
    description: 'Project specifications, design artifacts, resumes, and deliverable attachments.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      EMPLOYEE: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      MENTOR: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: true,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      INTERN_STUDENT: {
        create: true,
        read: true,
        update: false,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
    },
  },
  reports: {
    id: 'reports',
    resourceKey: 'reports',
    resourceName: 'Reports & Analytics',
    category: 'Core Operations',
    description: 'Project progress reports, mentee performance summaries, and operational analytics.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      EMPLOYEE: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      MENTOR: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: true,
        assign: false,
        export: true,
        scope: 'assigned',
      },
      INTERN_STUDENT: {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
    },
  },
  users: {
    id: 'users',
    resourceKey: 'users',
    resourceName: 'Users & Role Accounts',
    category: 'Workforce & Mentorship',
    description: 'User directory, role assignments, account status, and personal profiles.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: {
        create: false,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: false,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
      EMPLOYEE: {
        create: false,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: false,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
      MENTOR: {
        create: false,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: true,
        export: true,
        scope: 'assigned',
      },
      INTERN_STUDENT: {
        create: false,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: false,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
    },
  },
  internships: {
    id: 'internships',
    resourceKey: 'internships',
    resourceName: 'Internships, Cohorts & Certificates',
    category: 'Workforce & Mentorship',
    description: 'Internship programs, student applications, mentor evaluations, and certificates.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: { ...NO_RESOURCE_ACCESS },
      EMPLOYEE: {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'assigned',
      },
      MENTOR: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: true,
        assign: true,
        export: true,
        scope: 'assigned',
      },
      INTERN_STUDENT: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
    },
  },
  enquiries: {
    id: 'enquiries',
    resourceKey: 'enquiries',
    resourceName: 'Client Enquiries & Service Requests',
    category: 'Finance & Legal',
    description: 'Project enquiries, commercial quotations, and technical support requests.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: 'own',
      },
      EMPLOYEE: {
        create: false,
        read: true,
        update: true,
        delete: false,
        upload: false,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'assigned',
      },
      MENTOR: { ...NO_RESOURCE_ACCESS },
      INTERN_STUDENT: { ...NO_RESOURCE_ACCESS },
    },
  },
  payments: {
    id: 'payments',
    resourceKey: 'payments',
    resourceName: 'Invoices & Payment Proofs',
    category: 'Finance & Legal',
    description: 'UPI QR payments, UTR verification records, and billing receipts.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: {
        create: true,
        read: true,
        update: false,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: 'own',
      },
      EMPLOYEE: {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'assigned',
      },
      MENTOR: { ...NO_RESOURCE_ACCESS },
      INTERN_STUDENT: {
        create: true,
        read: true,
        update: false,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
    },
  },
  settings: {
    id: 'settings',
    resourceKey: 'settings',
    resourceName: 'System & RBAC Configuration',
    category: 'System & Security',
    description: 'Global website settings, RBAC permission matrices, and dynamic quota limits.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: { ...NO_RESOURCE_ACCESS },
      EMPLOYEE: { ...NO_RESOURCE_ACCESS },
      MENTOR: { ...NO_RESOURCE_ACCESS },
      INTERN_STUDENT: { ...NO_RESOURCE_ACCESS },
    },
  },
  auditLogs: {
    id: 'auditLogs',
    resourceKey: 'auditLogs',
    resourceName: 'Security & Audit Telemetry',
    category: 'System & Security',
    description: 'Immutable security logs, role changes, quota consumption, and evaluation history.',
    isSystem: true,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: { ...NO_RESOURCE_ACCESS },
      EMPLOYEE: { ...NO_RESOURCE_ACCESS },
      MENTOR: {
        create: true,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: false,
        approve: false,
        assign: false,
        export: false,
        scope: 'assigned',
      },
      INTERN_STUDENT: {
        create: true,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: false,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
    },
  },
};

/**
 * Merge stored Firestore resource permissions with system defaults.
 */
export function resolveResourcePermissionsMap(
  stored?: Record<string, ResourcePermissionEntry>
): Record<string, ResourcePermissionEntry> {
  const merged: Record<string, ResourcePermissionEntry> = {};

  for (const [key, defEntry] of Object.entries(DEFAULT_RESOURCE_PERMISSIONS)) {
    const customEntry = stored?.[key];
    if (!customEntry) {
      merged[key] = defEntry;
    } else {
      merged[key] = {
        ...defEntry,
        ...customEntry,
        roleAccess: {
          ADMIN: {
            ...defEntry.roleAccess.ADMIN,
            ...(customEntry.roleAccess?.ADMIN || {}),
          },
          CLIENT: {
            ...defEntry.roleAccess.CLIENT,
            ...(customEntry.roleAccess?.CLIENT || {}),
          },
          EMPLOYEE: {
            ...defEntry.roleAccess.EMPLOYEE,
            ...(customEntry.roleAccess?.EMPLOYEE || {}),
          },
          MENTOR: {
            ...defEntry.roleAccess.MENTOR,
            ...(customEntry.roleAccess?.MENTOR || {}),
          },
          INTERN_STUDENT: {
            ...defEntry.roleAccess.INTERN_STUDENT,
            ...(customEntry.roleAccess?.INTERN_STUDENT || {}),
          },
        },
      };
    }
  }

  if (stored) {
    for (const [key, customEntry] of Object.entries(stored)) {
      if (!merged[key] && customEntry && customEntry.resourceKey) {
        merged[key] = customEntry;
      }
    }
  }

  return merged;
}

/**
 * Resolve effective CRUD permissions for a given role on a specific resource.
 */
export function resolveRoleResourceAccess(
  role: CanonicalRole,
  resourceKey: string,
  config: RBACConfigDocument
): ResourceCRUDPermissions {
  if (role === 'ADMIN') {
    return { ...FULL_ADMIN_RESOURCE_ACCESS };
  }
  const map = resolveResourcePermissionsMap(config.resourcePermissions);
  const entry = map[resourceKey];
  if (!entry) {
    return { ...NO_RESOURCE_ACCESS };
  }
  return entry.roleAccess?.[role] || { ...NO_RESOURCE_ACCESS };
}

/**
 * Create a blank/default ResourcePermissionEntry for a newly added custom resource.
 */
export function createBlankResourcePermissionEntry(params: {
  resourceKey: string;
  resourceName: string;
  category: ResourceCategory;
  description: string;
}): ResourcePermissionEntry {
  const cleanKey = params.resourceKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  return {
    id: cleanKey,
    resourceKey: cleanKey,
    resourceName: params.resourceName.trim(),
    category: params.category,
    description: params.description.trim(),
    isSystem: false,
    roleAccess: {
      ADMIN: { ...FULL_ADMIN_RESOURCE_ACCESS },
      CLIENT: {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'assigned',
      },
      EMPLOYEE: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'assigned',
      },
      MENTOR: {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: true,
        assign: true,
        export: false,
        scope: 'assigned',
      },
      INTERN_STUDENT: {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: 'own',
      },
    },
  };
}

/**
 * Compute effective permissions for a user, merging role defaults with per-user overrides.
 */
export function resolveEffectivePermissions(
  role: CanonicalRole,
  config: RBACConfigDocument,
  userPermissionOverrides?: Partial<RolePermissionsMap>
): RolePermissionsMap {
  if (role === 'ADMIN') {
    return { ...DEFAULT_ROLE_PERMISSIONS.ADMIN };
  }
  const base =
    config.rolePermissions?.[role] || DEFAULT_ROLE_PERMISSIONS[role];
  return {
    ...base,
    ...(userPermissionOverrides || {}),
  };
}

/**
 * Compute effective dynamic limits for a user, merging role defaults with per-user limit overrides.
 */
export function resolveEffectiveLimits(
  role: CanonicalRole,
  config: RBACConfigDocument,
  userLimitOverrides?: Partial<RoleLimits>
): RoleLimits {
  const base = config.roleLimits?.[role] || DEFAULT_ROLE_LIMITS[role];
  return {
    ...base,
    ...(userLimitOverrides || {}),
  };
}

/**
 * Check if a user's access has expired based on their effective accessExpirationDate.
 */
export function isAccessExpired(limits: RoleLimits): boolean {
  if (!limits.accessExpirationDate) return false;
  const expiry = new Date(limits.accessExpirationDate).getTime();
  if (Number.isNaN(expiry)) return false;
  return Date.now() > expiry;
}

export type QuotaMetricKey =
  | 'projectsCount'
  | 'assignedTasksCount'
  | 'aiRequestsToday'
  | 'storageUsedMB'
  | 'reportsGeneratedCount'
  | 'assignedMenteesCount'
  | 'activeClientProjectsCount';

const METRIC_TO_LIMIT_KEY: Record<QuotaMetricKey, keyof RoleLimits> = {
  projectsCount: 'maxProjects',
  assignedTasksCount: 'maxAssignedTasks',
  aiRequestsToday: 'aiRequestsPerDay',
  storageUsedMB: 'fileStorageCapacityMB',
  reportsGeneratedCount: 'reportGenerationLimit',
  assignedMenteesCount: 'maxAssignedMentees',
  activeClientProjectsCount: 'maxActiveClientProjects',
};

/**
 * Atomic quota check & consumption backed by both Backend API verification and Firestore transaction.
 */
export async function checkAndConsumeQuota(params: {
  userId: string;
  role: CanonicalRole;
  metric: QuotaMetricKey;
  incrementBy?: number;
  effectiveLimits: RoleLimits;
}): Promise<{ allowed: boolean; reason?: string; newCount?: number }> {
  const { userId, role, metric, incrementBy = 1, effectiveLimits } = params;

  if (isAccessExpired(effectiveLimits)) {
    return {
      allowed: false,
      reason: `Access expired on ${effectiveLimits.accessExpirationDate}. Please contact an Administrator.`,
    };
  }

  const limitKey = METRIC_TO_LIMIT_KEY[metric];
  const maxAllowed = Number(effectiveLimits[limitKey] ?? 0);

  // 1. Validate with trusted backend endpoint first
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) headers.Authorization = `Bearer ${idToken}`;
      } catch {}
    }
    const resp = await fetch('/api/rbac/validate-quota', {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        userId,
        role,
        metric,
        incrementBy,
        maxAllowed,
        accessExpirationDate: effectiveLimits.accessExpirationDate,
      }),
    });
    if (resp.ok) {
      const validation = await resp.json();
      if (validation && validation.allowed === false) {
        return {
          allowed: false,
          reason: validation.reason || 'Quota limit exceeded on server validation.',
        };
      }
    }
  } catch {
    // Proceed to atomic Firestore transaction if offline
  }

  // 2. Atomic Firestore Transaction on `quotas/{userId}`
  const quotaRef = doc(db, 'quotas', userId);
  const todayStr = new Date().toISOString().slice(0, 10);

  try {
    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(quotaRef);
      const currentData = (snap.exists() ? snap.data() : {}) as Partial<UserUsageMetrics>;

      let currentVal = Number(currentData[metric] || 0);
      if (metric === 'aiRequestsToday' && currentData.aiRequestsDate !== todayStr) {
        currentVal = 0;
      }

      const nextVal = currentVal + incrementBy;
      if (role !== 'ADMIN' && nextVal > maxAllowed) {
        return {
          allowed: false,
          reason: `Limit reached for ${metric}: ${currentVal}/${maxAllowed} used.`,
          newCount: currentVal,
        };
      }

      const updatePayload: Record<string, any> = {
        [metric]: nextVal,
        lastUpdated: serverTimestamp(),
      };
      if (metric === 'aiRequestsToday') {
        updatePayload.aiRequestsDate = todayStr;
      }

      tx.set(quotaRef, updatePayload, { merge: true });
      return {
        allowed: true,
        newCount: nextVal,
      };
    });

    if (result.allowed) {
      await logActivity(
        'QUOTA_CONSUMED',
        userId,
        userId,
        'user',
        `Consumed ${incrementBy} unit(s) of ${metric} (new total: ${result.newCount}/${maxAllowed})`
      );
    }

    return result;
  } catch (err: any) {
    return {
      allowed: false,
      reason: err?.message || 'Could not verify quota transaction.',
    };
  }
}

/**
 * Persist updated RBAC configuration to Firestore (`settings/rbac_config`).
 */
export async function saveRBACConfigToFirestore(
  config: RBACConfigDocument,
  adminUid: string
): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'rbac_config'),
    {
      ...config,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
    },
    { merge: true }
  );

  await logActivity(
    'RBAC_CONFIG_UPDATED',
    adminUid,
    'rbac_config',
    'system',
    'Updated centralized 5-role permissions and dynamic limits matrix'
  );
}
