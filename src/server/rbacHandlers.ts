import type { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import appletConfig from '../../firebase-applet-config.json';
import { applyApiSecurityHeaders } from './apiMiddleware';

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID || appletConfig.projectId || 'sri-core-solutions';
const FIRESTORE_DATABASE_ID =
  appletConfig.firestoreDatabaseId && appletConfig.firestoreDatabaseId !== '(default)'
    ? appletConfig.firestoreDatabaseId
    : '(default)';
const BOOTSTRAP_ADMIN_EMAILS = new Set(['saranramesh709@gmail.com']);
const PROTECTED_SYSTEM_RESOURCE_KEYS = new Set(['settings', 'users', 'auditLogs']);

const FIVE_ROLES = new Set([
  'ADMIN',
  'CLIENT',
  'EMPLOYEE',
  'MENTOR',
  'INTERN_STUDENT',
]);

const VALID_ACTIONS = new Set([
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
]);

const VALID_METRICS = new Set([
  'projectsCount',
  'assignedTasksCount',
  'aiRequestsToday',
  'storageUsedMB',
  'reportsGeneratedCount',
  'assignedMenteesCount',
  'activeClientProjectsCount',
]);

const ROLE_CRUD_SCHEMA = z
  .object({
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
    upload: z.boolean(),
    download: z.boolean(),
    approve: z.boolean(),
    assign: z.boolean(),
    export: z.boolean(),
    scope: z.enum(['all', 'assigned', 'own', 'none']),
  })
  .strict();

const FIVE_ROLE_ACCESS_SCHEMA = z
  .object({
    ADMIN: ROLE_CRUD_SCHEMA,
    CLIENT: ROLE_CRUD_SCHEMA,
    EMPLOYEE: ROLE_CRUD_SCHEMA,
    MENTOR: ROLE_CRUD_SCHEMA,
    INTERN_STUDENT: ROLE_CRUD_SCHEMA,
  })
  .strict();

const RESOURCE_CATEGORY_SCHEMA = z.enum([
  'Core Operations',
  'Workforce & Mentorship',
  'Finance & Legal',
  'System & Security',
  'Custom',
]);

const RESOURCE_KEY_SCHEMA = z
  .string()
  .trim()
  .min(2, 'Resource key must be at least 2 characters.')
  .max(64, 'Resource key must be 64 characters or fewer.')
  .regex(
    /^[a-z0-9_-]+$/,
    'Resource key may only contain lowercase letters, numbers, underscores, and hyphens.'
  );

const RESOURCE_ENTRY_SCHEMA = z.object({
  id: RESOURCE_KEY_SCHEMA.optional(),
  resourceKey: RESOURCE_KEY_SCHEMA,
  resourceName: z
    .string()
    .trim()
    .min(2, 'Resource display name must be at least 2 characters.')
    .max(120, 'Resource display name must be 120 characters or fewer.'),
  category: RESOURCE_CATEGORY_SCHEMA,
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or fewer.')
    .default(''),
  isSystem: z.boolean().optional(),
  roleAccess: FIVE_ROLE_ACCESS_SCHEMA,
});

const RESOURCE_PATCH_SCHEMA = z
  .object({
    resourceName: z
      .string()
      .trim()
      .min(2, 'Resource display name must be at least 2 characters.')
      .max(120, 'Resource display name must be 120 characters or fewer.')
      .optional(),
    category: RESOURCE_CATEGORY_SCHEMA.optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Description must be 500 characters or fewer.')
      .optional(),
    roleAccess: FIVE_ROLE_ACCESS_SCHEMA.optional(),
  })
  .strict();

const GLOBAL_ROLE_ACTIONS_SCHEMA = z
  .object({
    view: z.boolean(),
    create: z.boolean(),
    edit: z.boolean(),
    delete: z.boolean(),
    upload: z.boolean(),
    download: z.boolean(),
    approve: z.boolean(),
    review: z.boolean(),
    assign: z.boolean(),
    export: z.boolean(),
    manage: z.boolean(),
  })
  .strict();

const PERMISSION_MUTATION_REQUEST_SCHEMA = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('create'),
    resourceKey: RESOURCE_KEY_SCHEMA,
    entry: RESOURCE_ENTRY_SCHEMA,
  }),
  z.object({
    operation: z.literal('update'),
    resourceKey: RESOURCE_KEY_SCHEMA,
    updates: RESOURCE_PATCH_SCHEMA,
  }),
  z.object({
    operation: z.literal('delete'),
    resourceKey: RESOURCE_KEY_SCHEMA,
  }),
  z.object({
    operation: z.literal('batch_sync'),
    resourcePermissions: z.record(RESOURCE_KEY_SCHEMA, RESOURCE_ENTRY_SCHEMA),
    rolePermissions: z
      .object({
        ADMIN: GLOBAL_ROLE_ACTIONS_SCHEMA,
        CLIENT: GLOBAL_ROLE_ACTIONS_SCHEMA,
        EMPLOYEE: GLOBAL_ROLE_ACTIONS_SCHEMA,
        MENTOR: GLOBAL_ROLE_ACTIONS_SCHEMA,
        INTERN_STUDENT: GLOBAL_ROLE_ACTIONS_SCHEMA,
      })
      .strict()
      .optional(),
  }),
]);

const QUOTA_VALIDATION_SCHEMA = z.object({
  userId: z.string().trim().min(1).max(128).optional(),
  metric: z.string().trim().refine((m) => VALID_METRICS.has(m), 'Unsupported quota metric'),
  incrementBy: z.number().finite().min(0).max(10_000).default(1),
});

const ACTION_VALIDATION_SCHEMA = z.object({
  userId: z.string().trim().min(1).max(128).optional(),
  action: z.string().trim().refine((a) => VALID_ACTIONS.has(a), 'Unsupported permission action'),
  fileSizeMB: z.number().finite().nonnegative().optional(),
});

type CanonicalRole = 'ADMIN' | 'CLIENT' | 'EMPLOYEE' | 'MENTOR' | 'INTERN_STUDENT';

const SERVER_DEFAULT_ROLE_PERMISSIONS: Record<CanonicalRole, Record<string, boolean>> = {
  ADMIN: {
    view: true, create: true, edit: true, delete: true, upload: true,
    download: true, approve: true, review: true, assign: true, export: true, manage: true,
  },
  CLIENT: {
    view: true, create: true, edit: true, delete: false, upload: true,
    download: true, approve: true, review: true, assign: false, export: true, manage: false,
  },
  EMPLOYEE: {
    view: true, create: true, edit: true, delete: false, upload: true,
    download: true, approve: false, review: true, assign: false, export: true, manage: false,
  },
  MENTOR: {
    view: true, create: true, edit: true, delete: false, upload: true,
    download: true, approve: true, review: true, assign: true, export: true, manage: false,
  },
  INTERN_STUDENT: {
    view: true, create: true, edit: false, delete: false, upload: true,
    download: true, approve: false, review: false, assign: false, export: false, manage: false,
  },
};

const SERVER_DEFAULT_ROLE_LIMITS: Record<
  CanonicalRole,
  {
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
> = {
  ADMIN: {
    maxProjects: 9999, maxAssignedTasks: 9999, aiRequestsPerDay: 1000,
    fileStorageCapacityMB: 102400, maxFileUploadSizeMB: 500, reportGenerationLimit: 9999,
    maxAssignedMentees: 500, maxActiveClientProjects: 9999, accessExpirationDate: null,
  },
  CLIENT: {
    maxProjects: 15, maxAssignedTasks: 50, aiRequestsPerDay: 50,
    fileStorageCapacityMB: 5120, maxFileUploadSizeMB: 50, reportGenerationLimit: 30,
    maxAssignedMentees: 0, maxActiveClientProjects: 10, accessExpirationDate: null,
  },
  EMPLOYEE: {
    maxProjects: 25, maxAssignedTasks: 100, aiRequestsPerDay: 100,
    fileStorageCapacityMB: 10240, maxFileUploadSizeMB: 100, reportGenerationLimit: 60,
    maxAssignedMentees: 5, maxActiveClientProjects: 20, accessExpirationDate: null,
  },
  MENTOR: {
    maxProjects: 20, maxAssignedTasks: 80, aiRequestsPerDay: 80,
    fileStorageCapacityMB: 8192, maxFileUploadSizeMB: 100, reportGenerationLimit: 100,
    maxAssignedMentees: 25, maxActiveClientProjects: 10, accessExpirationDate: null,
  },
  INTERN_STUDENT: {
    maxProjects: 5, maxAssignedTasks: 25, aiRequestsPerDay: 25,
    fileStorageCapacityMB: 1024, maxFileUploadSizeMB: 25, reportGenerationLimit: 10,
    maxAssignedMentees: 0, maxActiveClientProjects: 0, accessExpirationDate: null,
  },
};

const SERVER_METRIC_TO_LIMIT_KEY: Record<string, keyof (typeof SERVER_DEFAULT_ROLE_LIMITS)['ADMIN']> = {
  projectsCount: 'maxProjects',
  assignedTasksCount: 'maxAssignedTasks',
  aiRequestsToday: 'aiRequestsPerDay',
  storageUsedMB: 'fileStorageCapacityMB',
  reportsGeneratedCount: 'reportGenerationLimit',
  assignedMenteesCount: 'maxAssignedMentees',
  activeClientProjectsCount: 'maxActiveClientProjects',
};

function normalizeServerRole(rawRole?: string | null): CanonicalRole {
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

interface FirestoreRestValue {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  nullValue?: null;
  mapValue?: { fields?: Record<string, FirestoreRestValue> };
}

function decodeFirestoreRestValue(val?: FirestoreRestValue): unknown {
  if (!val) return undefined;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.integerValue !== undefined) return Number(val.integerValue);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.nullValue !== undefined) return null;
  if (val.mapValue?.fields) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields)) {
      out[k] = decodeFirestoreRestValue(v);
    }
    return out;
  }
  return undefined;
}

async function fetchFirestoreDocWithToken(
  docPath: string,
  idToken: string
): Promise<Record<string, unknown> | null> {
  try {
    const docUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      FIREBASE_PROJECT_ID
    )}/databases/${encodeURIComponent(FIRESTORE_DATABASE_ID)}/documents/${docPath}`;
    const fsRes = await fetch(docUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
      signal: AbortSignal.timeout(4500),
    });
    if (!fsRes.ok) return null;
    const fsJson = (await fsRes.json()) as {
      fields?: Record<string, FirestoreRestValue>;
    };
    if (!fsJson.fields) return null;
    const decoded: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fsJson.fields)) {
      decoded[k] = decodeFirestoreRestValue(v);
    }
    return decoded;
  } catch {
    return null;
  }
}

function getFirebaseAdminApp() {
  return getApps().length > 0
    ? getApp()
    : initializeApp({ projectId: FIREBASE_PROJECT_ID });
}

interface VerifiedAdminActor {
  uid: string;
  email: string | null;
  verifiedBy: 'custom_claim' | 'firestore_profile' | 'bootstrap_admin';
}

const ADMIN_CACHE_TTL_MS = 30_000;
const MAX_ADMIN_CACHE_SIZE = 500;
const adminVerificationCache = new Map<
  string,
  { actor: VerifiedAdminActor; expiresAt: number }
>();

function getCachedAdmin(uid: string): VerifiedAdminActor | null {
  const entry = adminVerificationCache.get(uid);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    adminVerificationCache.delete(uid);
    return null;
  }
  return entry.actor;
}

function setCachedAdmin(uid: string, actor: VerifiedAdminActor, tokenExpSeconds?: number) {
  if (adminVerificationCache.size >= MAX_ADMIN_CACHE_SIZE) {
    const oldest = adminVerificationCache.keys().next().value;
    if (oldest) adminVerificationCache.delete(oldest);
  }
  const tokenExpMs = tokenExpSeconds ? tokenExpSeconds * 1000 : Date.now() + ADMIN_CACHE_TTL_MS;
  adminVerificationCache.set(uid, {
    actor,
    expiresAt: Math.min(Date.now() + ADMIN_CACHE_TTL_MS, tokenExpMs),
  });
}

async function requireVerifiedBearerToken(
  req: Request
): Promise<
  | { ok: true; decoded: DecodedIdToken; idToken: string }
  | { ok: false; status: number; reason: string }
> {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      reason: 'Missing Bearer Firebase ID token in Authorization header.',
    };
  }
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    return {
      ok: false,
      status: 401,
      reason: 'Empty Firebase ID token provided.',
    };
  }

  try {
    const decoded = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken);
    if (decoded.firebase?.sign_in_provider === 'anonymous') {
      return {
        ok: false,
        status: 403,
        reason: 'Anonymous authentication is not permitted for protected workspace actions.',
      };
    }
    return { ok: true, decoded, idToken };
  } catch (verifyErr: unknown) {
    return {
      ok: false,
      status: 401,
      reason:
        verifyErr instanceof Error
          ? `Invalid or expired Firebase Auth token: ${verifyErr.message}`
          : 'Invalid or expired Firebase Auth token.',
    };
  }
}

async function resolveAuthoritativeUserContext(
  decoded: DecodedIdToken,
  idToken: string
): Promise<{
  uid: string;
  role: CanonicalRole;
  isActive: boolean;
  effectivePermissions: Record<string, boolean>;
  effectiveLimits: (typeof SERVER_DEFAULT_ROLE_LIMITS)['ADMIN'];
  quotaDoc: Record<string, unknown> | null;
}> {
  const uid = decoded.uid;
  const email = typeof decoded.email === 'string' ? decoded.email : null;
  const emailVerified = Boolean(decoded.email_verified);
  const tokenRole = typeof decoded.role === 'string' ? decoded.role.toUpperCase() : '';
  const tokenAdminClaim = decoded.admin === true;
  const isBootstrapAdmin = Boolean(
    email && emailVerified && BOOTSTRAP_ADMIN_EMAILS.has(email.toLowerCase())
  );

  const [userDoc, rbacConfigDoc, quotaDoc] = await Promise.all([
    fetchFirestoreDocWithToken(`users/${encodeURIComponent(uid)}`, idToken),
    fetchFirestoreDocWithToken('settings/rbac_config', idToken),
    fetchFirestoreDocWithToken(`quotas/${encodeURIComponent(uid)}`, idToken),
  ]);

  const rawProfileRole =
    typeof userDoc?.canonicalRole === 'string'
      ? userDoc.canonicalRole
      : typeof userDoc?.role === 'string'
        ? userDoc.role
        : undefined;

  let role: CanonicalRole;
  if (tokenAdminClaim || tokenRole === 'ADMIN' || tokenRole === 'ADMINISTRATOR' || isBootstrapAdmin) {
    role = 'ADMIN';
  } else if (rawProfileRole) {
    role = normalizeServerRole(rawProfileRole);
  } else if (FIVE_ROLES.has(tokenRole)) {
    role = normalizeServerRole(tokenRole);
  } else {
    role = 'INTERN_STUDENT';
  }

  const isActive =
    userDoc?.isActive !== false &&
    String(userDoc?.status || 'active').toLowerCase() !== 'suspended';

  const configRolePerms = (
    (rbacConfigDoc?.rolePermissions as Record<string, Record<string, boolean>> | undefined)?.[
      role
    ] || {}
  );
  const userPermOverrides =
    userDoc?.permissionOverrides && typeof userDoc.permissionOverrides === 'object'
      ? (userDoc.permissionOverrides as Record<string, boolean>)
      : {};

  const effectivePermissions =
    role === 'ADMIN'
      ? { ...SERVER_DEFAULT_ROLE_PERMISSIONS.ADMIN }
      : {
          ...SERVER_DEFAULT_ROLE_PERMISSIONS[role],
          ...configRolePerms,
          ...userPermOverrides,
        };

  const configRoleLimits = (
    (rbacConfigDoc?.roleLimits as Record<string, Record<string, unknown>> | undefined)?.[
      role
    ] || {}
  );
  const userLimitOverrides =
    userDoc?.limitOverrides && typeof userDoc.limitOverrides === 'object'
      ? (userDoc.limitOverrides as Record<string, unknown>)
      : {};

  const effectiveLimits = {
    ...SERVER_DEFAULT_ROLE_LIMITS[role],
    ...(configRoleLimits as Partial<(typeof SERVER_DEFAULT_ROLE_LIMITS)['ADMIN']>),
    ...(userLimitOverrides as Partial<(typeof SERVER_DEFAULT_ROLE_LIMITS)['ADMIN']>),
  };

  return {
    uid,
    role,
    isActive,
    effectivePermissions,
    effectiveLimits,
    quotaDoc,
  };
}

async function verifyAdminBearerToken(
  req: Request
): Promise<{ ok: true; actor: VerifiedAdminActor } | { ok: false; status: number; reason: string }> {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      reason: 'Missing Bearer Firebase ID token in Authorization header.',
    };
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    return {
      ok: false,
      status: 401,
      reason: 'Empty Firebase ID token provided.',
    };
  }

  let decoded: DecodedIdToken;
  try {
    decoded = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken);
  } catch (verifyErr: unknown) {
    return {
      ok: false,
      status: 401,
      reason:
        verifyErr instanceof Error
          ? `Invalid or expired Firebase Auth token: ${verifyErr.message}`
          : 'Invalid or expired Firebase Auth token.',
    };
  }

  const uid = decoded.uid;
  const email = typeof decoded.email === 'string' ? decoded.email : null;
  const emailVerified = Boolean(decoded.email_verified);
  const tokenRole = typeof decoded.role === 'string' ? decoded.role.toUpperCase() : '';
  const tokenAdminClaim = decoded.admin === true;

  if (tokenAdminClaim || tokenRole === 'ADMIN' || tokenRole === 'ADMINISTRATOR') {
    return {
      ok: true,
      actor: { uid, email, verifiedBy: 'custom_claim' },
    };
  }

  if (email && emailVerified && BOOTSTRAP_ADMIN_EMAILS.has(email.toLowerCase())) {
    return {
      ok: true,
      actor: { uid, email, verifiedBy: 'bootstrap_admin' },
    };
  }

  // Short-lived cached admin role verification (avoids redundant REST round-trips on rapid batch edits)
  const cachedActor = getCachedAdmin(uid);
  if (cachedActor) {
    return { ok: true, actor: cachedActor };
  }

  // Fallback check via Firestore REST API using the caller's verified ID token
  try {
    const docUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      FIREBASE_PROJECT_ID
    )}/databases/${encodeURIComponent(FIRESTORE_DATABASE_ID)}/documents/users/${encodeURIComponent(
      uid
    )}`;
    const fsRes = await fetch(docUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
      signal: AbortSignal.timeout(4500),
    });
    if (fsRes.ok) {
      const fsJson = (await fsRes.json()) as {
        fields?: Record<string, { stringValue?: string; booleanValue?: boolean }>;
      };
      const fields = fsJson.fields || {};
      const profileRole = (
        fields.canonicalRole?.stringValue ||
        fields.role?.stringValue ||
        ''
      ).toUpperCase();
      const isActive = fields.isActive?.booleanValue !== false;
      const status = (fields.status?.stringValue || 'active').toLowerCase();

      if (!isActive || status === 'suspended') {
        adminVerificationCache.delete(uid);
        return {
          ok: false,
          status: 403,
          reason: 'Account is suspended and cannot perform permission mutations.',
        };
      }

      if (profileRole === 'ADMIN' || profileRole === 'ADMINISTRATOR') {
        const actor: VerifiedAdminActor = {
          uid,
          email,
          verifiedBy: 'firestore_profile',
        };
        setCachedAdmin(uid, actor, decoded.exp);
        return { ok: true, actor };
      }
    }
  } catch {
    // Fall through to unauthorized response
  }

  return {
    ok: false,
    status: 403,
    reason: 'Forbidden: Only active ADMIN accounts may mutate RBAC permission policies.',
  };
}

function validateProtectedAdminLockout(
  resourceKey: string,
  roleAccess?: z.infer<typeof FIVE_ROLE_ACCESS_SCHEMA>
): string | null {
  if (!roleAccess) return null;
  if (PROTECTED_SYSTEM_RESOURCE_KEYS.has(resourceKey)) {
    const adminPerms = roleAccess.ADMIN;
    if (
      !adminPerms.read ||
      !adminPerms.create ||
      !adminPerms.update ||
      adminPerms.scope !== 'all'
    ) {
      return `Security policy violation: ADMIN read/create/update access with "all" scope cannot be revoked on protected resource "${resourceKey}".`;
    }
  }
  return null;
}

export async function validatePermissionMutationHandler(req: Request, res: Response) {
  applyApiSecurityHeaders(res);
  try {
    const authResult = await verifyAdminBearerToken(req);
    if (authResult.ok === false) {
      return res.status(authResult.status).json({
        valid: false,
        reason: authResult.reason,
      });
    }

    const parsed = PERMISSION_MUTATION_REQUEST_SCHEMA.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return res.status(400).json({
        valid: false,
        reason: firstIssue
          ? `${firstIssue.path.join('.') || 'payload'}: ${firstIssue.message}`
          : 'Invalid permission mutation payload.',
      });
    }

    const data = parsed.data;

    if (data.operation === 'create') {
      if (data.entry.resourceKey !== data.resourceKey) {
        return res.status(400).json({
          valid: false,
          reason: 'Payload resourceKey mismatch between top-level key and entry.resourceKey.',
        });
      }
      const lockoutError = validateProtectedAdminLockout(
        data.resourceKey,
        data.entry.roleAccess
      );
      if (lockoutError) {
        return res.status(403).json({ valid: false, reason: lockoutError });
      }
    } else if (data.operation === 'update') {
      const lockoutError = validateProtectedAdminLockout(
        data.resourceKey,
        data.updates.roleAccess
      );
      if (lockoutError) {
        return res.status(403).json({ valid: false, reason: lockoutError });
      }
    } else if (data.operation === 'delete') {
      if (PROTECTED_SYSTEM_RESOURCE_KEYS.has(data.resourceKey)) {
        return res.status(403).json({
          valid: false,
          reason: `Protected system security resource "${data.resourceKey}" cannot be deleted.`,
        });
      }
    } else if (data.operation === 'batch_sync') {
      for (const [key, entry] of Object.entries(data.resourcePermissions)) {
        if (entry.resourceKey !== key) {
          return res.status(400).json({
            valid: false,
            reason: `Batch sync key mismatch for "${key}".`,
          });
        }
        const lockoutError = validateProtectedAdminLockout(key, entry.roleAccess);
        if (lockoutError) {
          return res.status(403).json({ valid: false, reason: lockoutError });
        }
      }
      if (data.rolePermissions && !data.rolePermissions.ADMIN.manage) {
        return res.status(403).json({
          valid: false,
          reason: 'Security policy violation: ADMIN global "manage" permission cannot be disabled.',
        });
      }
    }

    const validatedAt = new Date().toISOString();
    const digestSecret = process.env.RBAC_VALIDATION_SECRET || FIREBASE_PROJECT_ID;
    const validationDigest = crypto
      .createHmac('sha256', digestSecret)
      .update(
        `${data.operation}:${'resourceKey' in data ? data.resourceKey : 'batch_sync'}:${
          authResult.actor.uid
        }:${validatedAt}`
      )
      .digest('hex');

    return res.status(200).json({
      valid: true,
      operation: data.operation,
      actorUid: authResult.actor.uid,
      actorEmail: authResult.actor.email,
      verifiedBy: authResult.actor.verifiedBy,
      validatedAt,
      validationDigest,
      payload: data,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      valid: false,
      reason:
        error instanceof Error
          ? error.message
          : 'Server-side permission validation failed.',
    });
  }
}

// Bounded LRU rate & quota ledger backing trusted server-side enforcement
const MAX_LEDGER_USERS = 5_000;
const serverQuotaLedger = new Map<string, Record<string, number>>();

function setLedgerEntry(userId: string, entry: Record<string, number>) {
  if (serverQuotaLedger.has(userId)) {
    serverQuotaLedger.delete(userId);
  } else if (serverQuotaLedger.size >= MAX_LEDGER_USERS) {
    const oldestKey = serverQuotaLedger.keys().next().value;
    if (oldestKey) serverQuotaLedger.delete(oldestKey);
  }
  serverQuotaLedger.set(userId, entry);
}

export async function validateQuotaHandler(req: Request, res: Response) {
  applyApiSecurityHeaders(res);
  try {
    const tokenCheck = await requireVerifiedBearerToken(req);
    if (tokenCheck.ok === false) {
      return res.status(tokenCheck.status).json({
        allowed: false,
        reason: tokenCheck.reason,
      });
    }

    const parsed = QUOTA_VALIDATION_SCHEMA.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        allowed: false,
        reason: parsed.error.issues[0]?.message || 'Invalid quota validation payload',
      });
    }

    const { metric, incrementBy } = parsed.data;
    const requestedUserId = parsed.data.userId || tokenCheck.decoded.uid;

    const actor = await resolveAuthoritativeUserContext(
      tokenCheck.decoded,
      tokenCheck.idToken
    );

    if (!actor.isActive) {
      return res.status(403).json({
        allowed: false,
        reason: 'Account is suspended and cannot consume resources.',
      });
    }

    if (requestedUserId !== actor.uid && actor.role !== 'ADMIN') {
      return res.status(403).json({
        allowed: false,
        reason: 'Forbidden: Token UID mismatch for quota check.',
      });
    }

    const targetUid = actor.role === 'ADMIN' ? requestedUserId : actor.uid;

    if (actor.effectiveLimits.accessExpirationDate) {
      const expiryMs = new Date(actor.effectiveLimits.accessExpirationDate).getTime();
      if (!Number.isNaN(expiryMs) && Date.now() > expiryMs && actor.role !== 'ADMIN') {
        return res.status(403).json({
          allowed: false,
          reason: `Account access expired on ${actor.effectiveLimits.accessExpirationDate}.`,
        });
      }
    }

    if (actor.role === 'ADMIN') {
      return res.status(200).json({ allowed: true, role: actor.role, metric });
    }

    const limitKey = SERVER_METRIC_TO_LIMIT_KEY[metric];
    const authoritativeMaxAllowed = Number(actor.effectiveLimits[limitKey] ?? 0);

    const todayStr = new Date().toISOString().slice(0, 10);
    const ledgerKey = metric === 'aiRequestsToday' ? `${metric}:${todayStr}` : metric;

    let persistedUsage = Number(actor.quotaDoc?.[metric] || 0);
    if (metric === 'aiRequestsToday' && actor.quotaDoc?.aiRequestsDate !== todayStr) {
      persistedUsage = 0;
    }

    const userLedger = serverQuotaLedger.get(targetUid) || {};
    const trackedValue = Math.max(persistedUsage, Number(userLedger[ledgerKey] || 0));
    const nextValue = trackedValue + Number(incrementBy || 1);

    if (nextValue > authoritativeMaxAllowed) {
      return res.status(403).json({
        allowed: false,
        reason: `Quota limit exceeded for ${metric}: ${trackedValue}/${authoritativeMaxAllowed} used.`,
      });
    }

    userLedger[ledgerKey] = nextValue;
    setLedgerEntry(targetUid, userLedger);

    return res.status(200).json({
      allowed: true,
      metric,
      newCount: nextValue,
      maxAllowed: authoritativeMaxAllowed,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      allowed: false,
      reason: error instanceof Error ? error.message : 'Server quota validation failed',
    });
  }
}

export async function validateActionPermissionHandler(req: Request, res: Response) {
  applyApiSecurityHeaders(res);
  try {
    const tokenCheck = await requireVerifiedBearerToken(req);
    if (tokenCheck.ok === false) {
      return res.status(tokenCheck.status).json({
        allowed: false,
        reason: tokenCheck.reason,
      });
    }

    const parsed = ACTION_VALIDATION_SCHEMA.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        allowed: false,
        reason: parsed.error.issues[0]?.message || 'Invalid action validation payload.',
      });
    }

    const { action, fileSizeMB } = parsed.data;
    const requestedUserId = parsed.data.userId || tokenCheck.decoded.uid;

    const actor = await resolveAuthoritativeUserContext(
      tokenCheck.decoded,
      tokenCheck.idToken
    );

    if (!actor.isActive) {
      return res.status(403).json({
        allowed: false,
        reason: 'Your account is currently suspended.',
      });
    }

    if (requestedUserId !== actor.uid && actor.role !== 'ADMIN') {
      return res.status(403).json({
        allowed: false,
        reason: 'Forbidden: Token UID mismatch for action verification.',
      });
    }

    if (actor.effectiveLimits.accessExpirationDate && actor.role !== 'ADMIN') {
      const expiryMs = new Date(actor.effectiveLimits.accessExpirationDate).getTime();
      if (!Number.isNaN(expiryMs) && Date.now() > expiryMs) {
        return res.status(403).json({
          allowed: false,
          reason: `Access expired on ${actor.effectiveLimits.accessExpirationDate}.`,
        });
      }
    }

    if (
      action === 'upload' &&
      typeof fileSizeMB === 'number' &&
      actor.role !== 'ADMIN' &&
      fileSizeMB > actor.effectiveLimits.maxFileUploadSizeMB
    ) {
      return res.status(403).json({
        allowed: false,
        reason: `File size (${fileSizeMB.toFixed(2)} MB) exceeds your maximum upload limit of ${actor.effectiveLimits.maxFileUploadSizeMB} MB.`,
      });
    }

    if (actor.role === 'ADMIN') {
      return res.status(200).json({ allowed: true, role: actor.role, action });
    }

    const isAllowed = Boolean(actor.effectivePermissions[action]);
    if (!isAllowed) {
      return res.status(403).json({
        allowed: false,
        reason: `Role ${actor.role} does not have "${action.toUpperCase()}" permission.`,
      });
    }

    return res.status(200).json({ allowed: true, role: actor.role, action });
  } catch (error: unknown) {
    return res.status(500).json({
      allowed: false,
      reason: error instanceof Error ? error.message : 'Permission verification error',
    });
  }
}
