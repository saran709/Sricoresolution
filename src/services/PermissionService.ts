import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';
import {
  CanonicalRole,
  DEFAULT_RESOURCE_PERMISSIONS,
  DEFAULT_ROLE_LIMITS,
  DEFAULT_ROLE_PERMISSIONS,
  FIVE_ROLES,
  RBACConfigDocument,
  ResourceCategory,
  ResourceCRUDPermissions,
  ResourcePermissionEntry,
  RoleLimits,
  RolePermissionsMap,
  resolveResourcePermissionsMap,
} from '../lib/rbac';

const PERMISSIONS_COLLECTION = 'permissions';
const SETTINGS_COLLECTION = 'settings';
const RBAC_CONFIG_DOC_ID = 'rbac_config';
const AUDIT_LOGS_COLLECTION = 'auditLogs';
const SERVER_VALIDATION_ENDPOINT = '/api/rbac/permissions/validate';
const RESOURCE_KEY_REGEX = /^[a-z0-9_-]{2,64}$/;
export const PROTECTED_SYSTEM_RESOURCES = ['settings', 'users', 'auditLogs'] as const;

export interface PermissionMutationActor {
  uid?: string;
  email?: string | null;
}

export interface CreatePermissionInput {
  resourceKey: string;
  resourceName: string;
  category: ResourceCategory;
  description?: string;
  isSystem?: boolean;
  roleAccess?: Partial<Record<CanonicalRole, Partial<ResourceCRUDPermissions>>>;
}

export interface UpdatePermissionInput {
  resourceName?: string;
  category?: ResourceCategory;
  description?: string;
  roleAccess?: Partial<Record<CanonicalRole, Partial<ResourceCRUDPermissions>>>;
}

export interface PermissionMutationResult<T = ResourcePermissionEntry> {
  success: true;
  operation: 'create' | 'update' | 'delete' | 'batch_sync';
  resourceKey: string;
  data?: T;
  auditLogId: string;
  validatedAt: string;
  validationDigest: string;
}

interface ServerValidationResponse {
  valid: boolean;
  operation: 'create' | 'update' | 'delete' | 'batch_sync';
  actorUid: string;
  actorEmail: string | null;
  validatedAt: string;
  validationDigest: string;
  reason?: string;
}

const DEFAULT_ROLE_CRUD_TEMPLATE: Record<CanonicalRole, ResourceCRUDPermissions> = {
  ADMIN: {
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
  },
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
};

export function normalizeResourceKey(rawKey: string): string {
  const cleaned = rawKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  if (!RESOURCE_KEY_REGEX.test(cleaned)) {
    throw new Error(
      'Invalid resource key. Use 2–64 lowercase letters, numbers, underscores, or hyphens.'
    );
  }
  return cleaned;
}

function buildCanonicalRoleAccess(
  partialAccess?: Partial<Record<CanonicalRole, Partial<ResourceCRUDPermissions>>>,
  baseAccess?: Record<CanonicalRole, ResourceCRUDPermissions>
): Record<CanonicalRole, ResourceCRUDPermissions> {
  const result = {} as Record<CanonicalRole, ResourceCRUDPermissions>;
  for (const role of FIVE_ROLES) {
    const base = baseAccess?.[role] || DEFAULT_ROLE_CRUD_TEMPLATE[role];
    const override = partialAccess?.[role] || {};
    result[role] = {
      create: Boolean(override.create ?? base.create),
      read: Boolean(override.read ?? base.read),
      update: Boolean(override.update ?? base.update),
      delete: Boolean(override.delete ?? base.delete),
      upload: Boolean(override.upload ?? base.upload),
      download: Boolean(override.download ?? base.download),
      approve: Boolean(override.approve ?? base.approve),
      assign: Boolean(override.assign ?? base.assign),
      export: Boolean(override.export ?? base.export),
      scope: override.scope ?? base.scope,
    };
  }
  return result;
}

function resolveActorUid(actor?: PermissionMutationActor): string {
  const uid = actor?.uid || auth.currentUser?.uid;
  if (!uid) {
    throw new Error(
      'Authentication required: You must be signed in as an ADMIN to modify permissions.'
    );
  }
  return uid;
}

async function validatePermissionMutationWithServer(
  body: Record<string, unknown>
): Promise<ServerValidationResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error(
      'Authentication required: No active Firebase Auth session found for server-side validation.'
    );
  }

  let idToken: string;
  try {
    idToken = await currentUser.getIdToken();
  } catch (err: unknown) {
    throw new Error(
      err instanceof Error
        ? `Failed to acquire Firebase Auth token: ${err.message}`
        : 'Failed to acquire Firebase Auth token.'
    );
  }

  let response: Response;
  try {
    response = await fetch(SERVER_VALIDATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });
  } catch (networkErr: unknown) {
    throw new Error(
      networkErr instanceof Error
        ? `Server-side permission validation unreachable: ${networkErr.message}`
        : 'Server-side permission validation service is unreachable.'
    );
  }

  const parsed = (await response.json().catch(() => ({}))) as Partial<ServerValidationResponse>;
  if (!response.ok || parsed.valid !== true) {
    throw new Error(
      parsed.reason ||
        `Server-side security validation failed with HTTP ${response.status}.`
    );
  }

  return parsed as ServerValidationResponse;
}

/**
 * CREATE: Server-validated atomic creation of a resource-level permission rule
 * across `/permissions/{resourceKey}`, `/settings/rbac_config`, and `/auditLogs`.
 */
export async function createPermission(
  input: CreatePermissionInput,
  actor?: PermissionMutationActor
): Promise<PermissionMutationResult<ResourcePermissionEntry>> {
  const actorUid = resolveActorUid(actor);
  const cleanKey = normalizeResourceKey(input.resourceKey);
  const resourceName = input.resourceName.trim();

  if (resourceName.length < 2 || resourceName.length > 120) {
    throw new Error('Resource name must be between 2 and 120 characters.');
  }

  const normalizedEntry: ResourcePermissionEntry = {
    id: cleanKey,
    resourceKey: cleanKey,
    resourceName,
    category: input.category,
    description: (input.description || '').trim(),
    isSystem: Boolean(input.isSystem),
    roleAccess: buildCanonicalRoleAccess(input.roleAccess),
  };

  // 1. Mandatory server-side security & schema validation (fail-closed)
  const serverValidation = await validatePermissionMutationWithServer({
    operation: 'create',
    resourceKey: cleanKey,
    entry: normalizedEntry,
  });

  // 2. Atomic Firestore transaction across permissions + settings/rbac_config + auditLogs
  const permRef = doc(db, PERMISSIONS_COLLECTION, cleanKey);
  const configRef = doc(db, SETTINGS_COLLECTION, RBAC_CONFIG_DOC_ID);
  const auditRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  try {
    await runTransaction(db, async (tx) => {
      // Read before write (Firestore transaction invariant)
      const [permSnap, configSnap] = await Promise.all([
        tx.get(permRef),
        tx.get(configRef),
      ]);

      const configData = (configSnap.exists()
        ? configSnap.data()
        : {}) as Partial<RBACConfigDocument>;
      const existingResourceMap = configSnap.exists() && configData.resourcePermissions
        ? { ...configData.resourcePermissions }
        : { ...DEFAULT_RESOURCE_PERMISSIONS };

      if (permSnap.exists() || Boolean(existingResourceMap[cleanKey])) {
        throw new Error(
          `already-exists: A permission rule for resource "${cleanKey}" already exists.`
        );
      }

      const isoNow = serverValidation.validatedAt;
      const clientConfigEntry: ResourcePermissionEntry = {
        ...normalizedEntry,
        updatedAt: isoNow,
        updatedBy: actorUid,
      };

      const nextResourceMap: Record<string, ResourcePermissionEntry> = {
        ...existingResourceMap,
        [cleanKey]: clientConfigEntry,
      };

      // Write 1: Normalized `/permissions/{resourceKey}` document
      tx.set(permRef, {
        ...normalizedEntry,
        createdAt: serverTimestamp(),
        createdBy: actorUid,
        updatedAt: serverTimestamp(),
        updatedBy: actorUid,
      });

      // Write 2: Centralized `/settings/rbac_config` document for real-time listeners
      tx.set(
        configRef,
        {
          rolePermissions: configData.rolePermissions || DEFAULT_ROLE_PERMISSIONS,
          roleLimits: configData.roleLimits || DEFAULT_ROLE_LIMITS,
          resourcePermissions: nextResourceMap,
          updatedAt: serverTimestamp(),
          updatedBy: actorUid,
        },
        { merge: true }
      );

      // Write 3: Immutable `/auditLogs` entry
      tx.set(auditRef, {
        action: 'PERMISSION_CREATED',
        performedBy: actorUid,
        resourceId: cleanKey,
        resourceType: 'system',
        details: `Created resource permission rule "${resourceName}" (${cleanKey}) [digest:${serverValidation.validationDigest.slice(
          0,
          12
        )}]`,
        timestamp: serverTimestamp(),
      });
    });
  } catch (err: unknown) {
    handleFirestoreError(
      err,
      OperationType.CREATE,
      `${PERMISSIONS_COLLECTION}/${cleanKey}`,
      auth
    );
  }

  return {
    success: true,
    operation: 'create',
    resourceKey: cleanKey,
    data: {
      ...normalizedEntry,
      updatedAt: serverValidation.validatedAt,
      updatedBy: actorUid,
    },
    auditLogId: auditRef.id,
    validatedAt: serverValidation.validatedAt,
    validationDigest: serverValidation.validationDigest,
  };
}

/**
 * UPDATE: Server-validated atomic update of an existing resource permission rule
 * across `/permissions/{resourceKey}`, `/settings/rbac_config`, and `/auditLogs`.
 */
export async function updatePermission(
  resourceKey: string,
  updates: UpdatePermissionInput,
  actor?: PermissionMutationActor
): Promise<PermissionMutationResult<ResourcePermissionEntry>> {
  const actorUid = resolveActorUid(actor);
  const cleanKey = normalizeResourceKey(resourceKey);

  if (
    updates.resourceName !== undefined &&
    (updates.resourceName.trim().length < 2 || updates.resourceName.trim().length > 120)
  ) {
    throw new Error('Resource name must be between 2 and 120 characters.');
  }

  const permRef = doc(db, PERMISSIONS_COLLECTION, cleanKey);
  const configRef = doc(db, SETTINGS_COLLECTION, RBAC_CONFIG_DOC_ID);
  const auditRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  // Pre-build normalized partial roleAccess if provided so server validates full 5-role policy
  let preMergedRoleAccess: Record<CanonicalRole, ResourceCRUDPermissions> | undefined;
  if (updates.roleAccess) {
    let existingBase: Record<CanonicalRole, ResourceCRUDPermissions> | undefined;
    try {
      const [permSnap, configSnap] = await Promise.all([
        getDoc(permRef),
        getDoc(configRef),
      ]);
      if (permSnap.exists()) {
        existingBase = (permSnap.data() as ResourcePermissionEntry).roleAccess;
      } else if (configSnap.exists()) {
        const cfg = configSnap.data() as Partial<RBACConfigDocument>;
        existingBase =
          cfg.resourcePermissions?.[cleanKey]?.roleAccess ||
          DEFAULT_RESOURCE_PERMISSIONS[cleanKey]?.roleAccess;
      } else {
        existingBase = DEFAULT_RESOURCE_PERMISSIONS[cleanKey]?.roleAccess;
      }
    } catch {
      existingBase = DEFAULT_RESOURCE_PERMISSIONS[cleanKey]?.roleAccess;
    }
    preMergedRoleAccess = buildCanonicalRoleAccess(updates.roleAccess, existingBase);
  }

  const serverUpdatesPayload: Record<string, unknown> = {};
  if (updates.resourceName !== undefined) {
    serverUpdatesPayload.resourceName = updates.resourceName.trim();
  }
  if (updates.category !== undefined) {
    serverUpdatesPayload.category = updates.category;
  }
  if (updates.description !== undefined) {
    serverUpdatesPayload.description = updates.description.trim();
  }
  if (preMergedRoleAccess !== undefined) {
    serverUpdatesPayload.roleAccess = preMergedRoleAccess;
  }

  // 1. Mandatory server-side security validation (fail-closed)
  const serverValidation = await validatePermissionMutationWithServer({
    operation: 'update',
    resourceKey: cleanKey,
    updates: serverUpdatesPayload,
  });

  // 2. Atomic Firestore transaction across permissions + settings/rbac_config + auditLogs
  let finalEntry: ResourcePermissionEntry | undefined;

  try {
    await runTransaction(db, async (tx) => {
      const [permSnap, configSnap] = await Promise.all([
        tx.get(permRef),
        tx.get(configRef),
      ]);

      const configData = (configSnap.exists()
        ? configSnap.data()
        : {}) as Partial<RBACConfigDocument>;
      const existingResourceMap = configSnap.exists() && configData.resourcePermissions
        ? { ...configData.resourcePermissions }
        : { ...DEFAULT_RESOURCE_PERMISSIONS };

      const currentEntry: ResourcePermissionEntry | undefined = permSnap.exists()
        ? (permSnap.data() as ResourcePermissionEntry)
        : existingResourceMap[cleanKey];

      if (!currentEntry) {
        throw new Error(
          `not-found: Permission rule "${cleanKey}" does not exist and cannot be updated.`
        );
      }

      const mergedRoleAccess = updates.roleAccess
        ? buildCanonicalRoleAccess(updates.roleAccess, currentEntry.roleAccess)
        : buildCanonicalRoleAccess(undefined, currentEntry.roleAccess);

      const mergedEntry: ResourcePermissionEntry = {
        id: cleanKey,
        resourceKey: cleanKey,
        resourceName:
          updates.resourceName !== undefined
            ? updates.resourceName.trim()
            : currentEntry.resourceName,
        category:
          updates.category !== undefined ? updates.category : currentEntry.category,
        description:
          updates.description !== undefined
            ? updates.description.trim()
            : currentEntry.description,
        isSystem: Boolean(currentEntry.isSystem),
        roleAccess: mergedRoleAccess,
      };

      const existingCreatedAt = permSnap.exists()
        ? permSnap.data().createdAt || serverTimestamp()
        : serverTimestamp();
      const existingCreatedBy = permSnap.exists()
        ? permSnap.data().createdBy || actorUid
        : actorUid;

      finalEntry = {
        ...mergedEntry,
        updatedAt: serverValidation.validatedAt,
        updatedBy: actorUid,
      };

      const nextResourceMap: Record<string, ResourcePermissionEntry> = {
        ...existingResourceMap,
        [cleanKey]: finalEntry,
      };

      // Write 1: Normalized `/permissions/{resourceKey}`
      tx.set(permRef, {
        ...mergedEntry,
        createdAt: existingCreatedAt,
        createdBy: existingCreatedBy,
        updatedAt: serverTimestamp(),
        updatedBy: actorUid,
      });

      // Write 2: Centralized `/settings/rbac_config`
      tx.set(
        configRef,
        {
          rolePermissions: configData.rolePermissions || DEFAULT_ROLE_PERMISSIONS,
          roleLimits: configData.roleLimits || DEFAULT_ROLE_LIMITS,
          resourcePermissions: nextResourceMap,
          updatedAt: serverTimestamp(),
          updatedBy: actorUid,
        },
        { merge: true }
      );

      // Write 3: Immutable `/auditLogs` entry
      tx.set(auditRef, {
        action: 'PERMISSION_UPDATED',
        performedBy: actorUid,
        resourceId: cleanKey,
        resourceType: 'system',
        details: `Updated resource permission rule "${mergedEntry.resourceName}" (${cleanKey}) [digest:${serverValidation.validationDigest.slice(
          0,
          12
        )}]`,
        timestamp: serverTimestamp(),
      });
    });
  } catch (err: unknown) {
    handleFirestoreError(
      err,
      OperationType.UPDATE,
      `${PERMISSIONS_COLLECTION}/${cleanKey}`,
      auth
    );
  }

  return {
    success: true,
    operation: 'update',
    resourceKey: cleanKey,
    data: finalEntry,
    auditLogId: auditRef.id,
    validatedAt: serverValidation.validatedAt,
    validationDigest: serverValidation.validationDigest,
  };
}

/**
 * DELETE: Server-validated atomic deletion of a resource permission rule
 * across `/permissions/{resourceKey}`, `/settings/rbac_config`, and `/auditLogs`.
 */
export async function deletePermission(
  resourceKey: string,
  actor?: PermissionMutationActor
): Promise<PermissionMutationResult<void>> {
  const actorUid = resolveActorUid(actor);
  const cleanKey = normalizeResourceKey(resourceKey);

  if ((PROTECTED_SYSTEM_RESOURCES as readonly string[]).includes(cleanKey)) {
    throw new Error(
      `Protected system security resource "${cleanKey}" cannot be deleted.`
    );
  }

  // 1. Mandatory server-side security validation (fail-closed)
  const serverValidation = await validatePermissionMutationWithServer({
    operation: 'delete',
    resourceKey: cleanKey,
  });

  // 2. Atomic Firestore transaction deleting /permissions/{key}, updating /settings/rbac_config, and writing /auditLogs
  const permRef = doc(db, PERMISSIONS_COLLECTION, cleanKey);
  const configRef = doc(db, SETTINGS_COLLECTION, RBAC_CONFIG_DOC_ID);
  const auditRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  try {
    await runTransaction(db, async (tx) => {
      const [permSnap, configSnap] = await Promise.all([
        tx.get(permRef),
        tx.get(configRef),
      ]);

      const configData = (configSnap.exists()
        ? configSnap.data()
        : {}) as Partial<RBACConfigDocument>;
      const existingResourceMap = configSnap.exists() && configData.resourcePermissions
        ? { ...configData.resourcePermissions }
        : { ...DEFAULT_RESOURCE_PERMISSIONS };

      if (!permSnap.exists() && !existingResourceMap[cleanKey]) {
        throw new Error(
          `not-found: Permission rule "${cleanKey}" was not found.`
        );
      }

      const deletedName =
        (permSnap.exists()
          ? (permSnap.data() as ResourcePermissionEntry).resourceName
          : existingResourceMap[cleanKey]?.resourceName) || cleanKey;

      delete existingResourceMap[cleanKey];

      if (permSnap.exists()) {
        tx.delete(permRef);
      }

      // Full `set` without merge so the deleted key is removed from `resourcePermissions` map
      tx.set(configRef, {
        rolePermissions: configData.rolePermissions || DEFAULT_ROLE_PERMISSIONS,
        roleLimits: configData.roleLimits || DEFAULT_ROLE_LIMITS,
        resourcePermissions: existingResourceMap,
        updatedAt: serverTimestamp(),
        updatedBy: actorUid,
      });

      tx.set(auditRef, {
        action: 'PERMISSION_DELETED',
        performedBy: actorUid,
        resourceId: cleanKey,
        resourceType: 'system',
        details: `Deleted resource permission rule "${deletedName}" (${cleanKey}) [digest:${serverValidation.validationDigest.slice(
          0,
          12
        )}]`,
        timestamp: serverTimestamp(),
      });
    });
  } catch (err: unknown) {
    handleFirestoreError(
      err,
      OperationType.DELETE,
      `${PERMISSIONS_COLLECTION}/${cleanKey}`,
      auth
    );
  }

  return {
    success: true,
    operation: 'delete',
    resourceKey: cleanKey,
    auditLogId: auditRef.id,
    validatedAt: serverValidation.validatedAt,
    validationDigest: serverValidation.validationDigest,
  };
}

/**
 * BATCH SYNC: Atomically syncs the entire 5-role permission matrix & resource CRUD map
 * across `/permissions/*`, `/settings/rbac_config`, and `/auditLogs`.
 */
export async function syncPermissionMatrix(
  params: {
    resourcePermissions: Record<string, ResourcePermissionEntry>;
    rolePermissions?: Record<CanonicalRole, RolePermissionsMap>;
    roleLimits?: Record<CanonicalRole, RoleLimits>;
  },
  actor?: PermissionMutationActor
): Promise<PermissionMutationResult<Record<string, ResourcePermissionEntry>>> {
  const actorUid = resolveActorUid(actor);

  const normalizedMap: Record<string, ResourcePermissionEntry> = {};
  const serverEntriesPayload: Record<string, Record<string, unknown>> = {};

  for (const [rawKey, entry] of Object.entries(params.resourcePermissions)) {
    const cleanKey = normalizeResourceKey(entry.resourceKey || rawKey);
    const normalizedEntry: ResourcePermissionEntry = {
      id: cleanKey,
      resourceKey: cleanKey,
      resourceName: entry.resourceName.trim(),
      category: entry.category,
      description: (entry.description || '').trim(),
      isSystem: Boolean(entry.isSystem),
      roleAccess: buildCanonicalRoleAccess(entry.roleAccess),
    };
    normalizedMap[cleanKey] = normalizedEntry;
    serverEntriesPayload[cleanKey] = {
      id: cleanKey,
      resourceKey: cleanKey,
      resourceName: normalizedEntry.resourceName,
      category: normalizedEntry.category,
      description: normalizedEntry.description,
      isSystem: normalizedEntry.isSystem,
      roleAccess: normalizedEntry.roleAccess,
    };
  }

  // 1. Server-side validation
  const serverValidation = await validatePermissionMutationWithServer({
    operation: 'batch_sync',
    resourcePermissions: serverEntriesPayload,
    ...(params.rolePermissions ? { rolePermissions: params.rolePermissions } : {}),
  });

  // 2. Atomic Firestore transaction across all `/permissions/{key}` docs + `settings/rbac_config` + `auditLogs`
  const configRef = doc(db, SETTINGS_COLLECTION, RBAC_CONFIG_DOC_ID);
  const auditRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
  const resourceKeys = Object.keys(normalizedMap);

  try {
    await runTransaction(db, async (tx) => {
      // Read phase: config doc + every target permission doc
      const configSnap = await tx.get(configRef);
      const permSnaps = await Promise.all(
        resourceKeys.map((key) => tx.get(doc(db, PERMISSIONS_COLLECTION, key)))
      );

      const configData = (configSnap.exists()
        ? configSnap.data()
        : {}) as Partial<RBACConfigDocument>;

      const clientConfigMap: Record<string, ResourcePermissionEntry> = {};

      resourceKeys.forEach((key, index) => {
        const snap = permSnaps[index];
        const entry = normalizedMap[key];
        const existingCreatedAt = snap.exists()
          ? snap.data().createdAt || serverTimestamp()
          : serverTimestamp();
        const existingCreatedBy = snap.exists()
          ? snap.data().createdBy || actorUid
          : actorUid;

        tx.set(doc(db, PERMISSIONS_COLLECTION, key), {
          ...entry,
          createdAt: existingCreatedAt,
          createdBy: existingCreatedBy,
          updatedAt: serverTimestamp(),
          updatedBy: actorUid,
        });

        clientConfigMap[key] = {
          ...entry,
          updatedAt: serverValidation.validatedAt,
          updatedBy: actorUid,
        };
      });

      tx.set(configRef, {
        rolePermissions:
          params.rolePermissions ||
          configData.rolePermissions ||
          DEFAULT_ROLE_PERMISSIONS,
        roleLimits:
          params.roleLimits || configData.roleLimits || DEFAULT_ROLE_LIMITS,
        resourcePermissions: clientConfigMap,
        updatedAt: serverTimestamp(),
        updatedBy: actorUid,
      });

      tx.set(auditRef, {
        action: 'RESOURCE_PERMISSIONS_SAVED',
        performedBy: actorUid,
        resourceId: 'rbac_config',
        resourceType: 'system',
        details: `Atomically synced 5-role permissions across ${resourceKeys.length} resources [digest:${serverValidation.validationDigest.slice(
          0,
          12
        )}]`,
        timestamp: serverTimestamp(),
      });
    });
  } catch (err: unknown) {
    handleFirestoreError(
      err,
      OperationType.WRITE,
      `${SETTINGS_COLLECTION}/${RBAC_CONFIG_DOC_ID}`,
      auth
    );
  }

  return {
    success: true,
    operation: 'batch_sync',
    resourceKey: 'rbac_config',
    data: normalizedMap,
    auditLogId: auditRef.id,
    validatedAt: serverValidation.validatedAt,
    validationDigest: serverValidation.validationDigest,
  };
}

/**
 * READ (Single): Fetch a resource permission rule by key from `/permissions/{resourceKey}`,
 * falling back cleanly to `settings/rbac_config` or system defaults.
 */
export async function getPermission(
  resourceKey: string
): Promise<ResourcePermissionEntry | null> {
  const cleanKey = normalizeResourceKey(resourceKey);
  try {
    const permSnap = await getDoc(doc(db, PERMISSIONS_COLLECTION, cleanKey));
    if (permSnap.exists()) {
      return permSnap.data() as ResourcePermissionEntry;
    }

    const configSnap = await getDoc(doc(db, SETTINGS_COLLECTION, RBAC_CONFIG_DOC_ID));
    if (configSnap.exists()) {
      const data = configSnap.data() as Partial<RBACConfigDocument>;
      const resolved = resolveResourcePermissionsMap(data.resourcePermissions);
      return resolved[cleanKey] || null;
    }

    return DEFAULT_RESOURCE_PERMISSIONS[cleanKey] || null;
  } catch (err: unknown) {
    handleFirestoreError(
      err,
      OperationType.GET,
      `${PERMISSIONS_COLLECTION}/${cleanKey}`,
      auth
    );
  }
}

/**
 * READ (List): List all configured resource permission rules from `/permissions`,
 * merged with `settings/rbac_config` and system defaults.
 */
export async function listPermissions(): Promise<ResourcePermissionEntry[]> {
  try {
    const [permSnapshot, configSnap] = await Promise.all([
      getDocs(collection(db, PERMISSIONS_COLLECTION)),
      getDoc(doc(db, SETTINGS_COLLECTION, RBAC_CONFIG_DOC_ID)),
    ]);

    const storedFromCollection: Record<string, ResourcePermissionEntry> = {};
    permSnapshot.docs.forEach((d) => {
      const data = d.data() as ResourcePermissionEntry;
      storedFromCollection[data.resourceKey || d.id] = {
        ...data,
        id: data.id || d.id,
        resourceKey: data.resourceKey || d.id,
      };
    });

    const configMap = configSnap.exists()
      ? (configSnap.data() as Partial<RBACConfigDocument>).resourcePermissions
      : undefined;

    const merged = resolveResourcePermissionsMap({
      ...(configMap || {}),
      ...storedFromCollection,
    });

    return Object.values(merged).sort((a, b) =>
      a.resourceName.localeCompare(b.resourceName)
    );
  } catch (err: unknown) {
    handleFirestoreError(err, OperationType.LIST, PERMISSIONS_COLLECTION, auth);
  }
}

export const PermissionService = {
  createPermission,
  updatePermission,
  deletePermission,
  syncPermissionMatrix,
  getPermission,
  listPermissions,
  normalizeResourceKey,
  PROTECTED_SYSTEM_RESOURCES,
};

export default PermissionService;
