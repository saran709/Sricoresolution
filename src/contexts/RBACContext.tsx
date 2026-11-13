import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  CanonicalRole,
  FIVE_ROLES,
  PermissionAction,
  RolePermissionsMap,
  RoleLimits,
  UserUsageMetrics,
  RBACConfigDocument,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLE_LIMITS,
  DEFAULT_RESOURCE_PERMISSIONS,
  ResourcePermissionEntry,
  ResourceCRUDAction,
  ResourceAccessScope,
  resolveResourcePermissionsMap,
  resolveRoleResourceAccess,
  normalizeToCanonicalRole,
  resolveEffectivePermissions,
  resolveEffectiveLimits,
  isAccessExpired,
  checkAndConsumeQuota,
  QuotaMetricKey,
  saveRBACConfigToFirestore,
} from '../lib/rbac';
import {
  createPermission,
  updatePermission,
  deletePermission,
  syncPermissionMatrix,
  CreatePermissionInput,
  UpdatePermissionInput,
} from '../services/PermissionService';

interface RBACContextValue {
  /** The authenticated user's true canonical role (1 of 5) */
  actualRole: CanonicalRole;
  /** The active canonical role (supports Admin Role Simulation / Testing preview) */
  activeRole: CanonicalRole;
  /** Admin-only role preview override for testing all 5 roles independently */
  simulatedRole: CanonicalRole | null;
  setSimulatedRole: (role: CanonicalRole | null) => void;
  /** Global 5-role configuration streamed in real-time from Firestore `settings/rbac_config` */
  rbacConfig: RBACConfigDocument;
  /** Effective 11 permissions for the current user / active role */
  permissions: RolePermissionsMap;
  /** Effective 9 dynamic limits for the current user / active role */
  limits: RoleLimits;
  /** Resource-level CRUD permission rules across all 5 roles */
  resourcePermissions: Record<string, ResourcePermissionEntry>;
  /** Real-time quota & resource consumption metrics for the current user */
  usage: UserUsageMetrics;
  /** Whether the user's access expiration date has passed */
  expired: boolean;
  /** Whether the user account is suspended (`isActive === false`) */
  suspended: boolean;
  /** Helper to check a specific permission action */
  can: (action: PermissionAction) => boolean;
  /** Helper to check a resource-level CRUD or extended permission for the active role */
  canAccessResource: (resourceKey: string, action: ResourceCRUDAction) => boolean;
  /** Helper to get the data visibility scope ('all' | 'assigned' | 'own' | 'none') on a resource */
  getResourceScope: (resourceKey: string) => ResourceAccessScope;
  /** Validate action against server + RBAC engine */
  verifyActionWithServer: (
    action: PermissionAction,
    options?: { fileSizeMB?: number }
  ) => Promise<{ allowed: boolean; reason?: string }>;
  /** Atomically check and consume a dynamic quota metric */
  consumeQuota: (
    metric: QuotaMetricKey,
    incrementBy?: number
  ) => Promise<{ allowed: boolean; reason?: string; newCount?: number }>;
  /** Admin helper: update permissions for one of the 5 roles */
  updateRolePermissions: (
    targetRole: CanonicalRole,
    updatedMap: RolePermissionsMap
  ) => Promise<void>;
  /** Admin helper: update limits for one of the 5 roles */
  updateRoleLimits: (
    targetRole: CanonicalRole,
    updatedLimits: RoleLimits
  ) => Promise<void>;
  /** Admin helper: create a resource-level CRUD permission rule via PermissionService */
  createResourcePermission: (input: CreatePermissionInput) => Promise<void>;
  /** Admin helper: update an existing resource-level CRUD permission rule via PermissionService */
  updateResourcePermission: (
    resourceKey: string,
    updates: UpdatePermissionInput
  ) => Promise<void>;
  /** Admin helper: create or update a resource-level CRUD permission rule */
  upsertResourcePermission: (entry: ResourcePermissionEntry) => Promise<void>;
  /** Admin helper: delete a resource-level CRUD permission rule */
  deleteResourcePermission: (resourceKey: string) => Promise<void>;
  /** Admin helper: atomically batch save all resource-level CRUD permission rules */
  saveAllResourcePermissions: (
    nextResourceMap: Record<string, ResourcePermissionEntry>,
    nextRolePermissions?: Record<CanonicalRole, RolePermissionsMap>
  ) => Promise<void>;
  /** Admin helper: update per-user permission & limit overrides in real time */
  updateUserOverrides: (
    userId: string,
    overrides: {
      permissionOverrides?: Partial<RolePermissionsMap>;
      limitOverrides?: Partial<RoleLimits>;
    }
  ) => Promise<void>;
  loading: boolean;
}

const DEFAULT_USAGE: UserUsageMetrics = {
  projectsCount: 0,
  assignedTasksCount: 0,
  aiRequestsToday: 0,
  aiRequestsDate: new Date().toISOString().slice(0, 10),
  storageUsedMB: 0,
  reportsGeneratedCount: 0,
  assignedMenteesCount: 0,
  activeClientProjectsCount: 0,
};

const DEFAULT_CONFIG: RBACConfigDocument = {
  rolePermissions: DEFAULT_ROLE_PERMISSIONS,
  roleLimits: DEFAULT_ROLE_LIMITS,
  resourcePermissions: DEFAULT_RESOURCE_PERMISSIONS,
};

const RBACContext = createContext<RBACContextValue>({
  actualRole: 'INTERN_STUDENT',
  activeRole: 'INTERN_STUDENT',
  simulatedRole: null,
  setSimulatedRole: () => {},
  rbacConfig: DEFAULT_CONFIG,
  permissions: DEFAULT_ROLE_PERMISSIONS.INTERN_STUDENT,
  limits: DEFAULT_ROLE_LIMITS.INTERN_STUDENT,
  resourcePermissions: DEFAULT_RESOURCE_PERMISSIONS,
  usage: DEFAULT_USAGE,
  expired: false,
  suspended: false,
  can: () => false,
  canAccessResource: () => false,
  getResourceScope: () => 'none',
  verifyActionWithServer: async () => ({ allowed: false }),
  consumeQuota: async () => ({ allowed: false }),
  updateRolePermissions: async () => {},
  updateRoleLimits: async () => {},
  createResourcePermission: async () => {},
  updateResourcePermission: async () => {},
  upsertResourcePermission: async () => {},
  deleteResourcePermission: async () => {},
  saveAllResourcePermissions: async () => {},
  updateUserOverrides: async () => {},
  loading: true,
});

export const useRBAC = () => useContext(RBACContext);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [rbacConfig, setRbacConfig] =
    useState<RBACConfigDocument>(DEFAULT_CONFIG);
  const [usage, setUsage] = useState<UserUsageMetrics>(DEFAULT_USAGE);
  const [simulatedRole, setSimulatedRoleState] =
    useState<CanonicalRole | null>(null);
  const [loading, setLoading] = useState(true);

  const actualRole = useMemo<CanonicalRole>(() => {
    return normalizeToCanonicalRole(userProfile?.role);
  }, [userProfile?.role]);

  // Only true ADMIN can simulate other roles for verification
  const activeRole = useMemo<CanonicalRole>(() => {
    if (actualRole === 'ADMIN' && simulatedRole && FIVE_ROLES.includes(simulatedRole)) {
      return simulatedRole;
    }
    return actualRole;
  }, [actualRole, simulatedRole]);

  const setSimulatedRole = useCallback(
    (role: CanonicalRole | null) => {
      if (actualRole !== 'ADMIN') {
        setSimulatedRoleState(null);
        return;
      }
      setSimulatedRoleState(role);
    },
    [actualRole]
  );

  // 1. Real-time listener on `settings/rbac_config` only for authenticated users so public visitors open 0 RBAC streams
  useEffect(() => {
    if (!currentUser?.uid) {
      setRbacConfig(DEFAULT_CONFIG);
      setLoading(false);
      return;
    }

    setLoading(true);
    const configRef = doc(db, 'settings', 'rbac_config');
    const unsubscribe = onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<RBACConfigDocument>;
          const mergedPerms: Record<CanonicalRole, RolePermissionsMap> = {
            ADMIN: {
              ...DEFAULT_ROLE_PERMISSIONS.ADMIN,
              ...(data.rolePermissions?.ADMIN || {}),
            },
            CLIENT: {
              ...DEFAULT_ROLE_PERMISSIONS.CLIENT,
              ...(data.rolePermissions?.CLIENT || {}),
            },
            EMPLOYEE: {
              ...DEFAULT_ROLE_PERMISSIONS.EMPLOYEE,
              ...(data.rolePermissions?.EMPLOYEE || {}),
            },
            MENTOR: {
              ...DEFAULT_ROLE_PERMISSIONS.MENTOR,
              ...(data.rolePermissions?.MENTOR || {}),
            },
            INTERN_STUDENT: {
              ...DEFAULT_ROLE_PERMISSIONS.INTERN_STUDENT,
              ...(data.rolePermissions?.INTERN_STUDENT || {}),
            },
          };

          const mergedLimits: Record<CanonicalRole, RoleLimits> = {
            ADMIN: {
              ...DEFAULT_ROLE_LIMITS.ADMIN,
              ...(data.roleLimits?.ADMIN || {}),
            },
            CLIENT: {
              ...DEFAULT_ROLE_LIMITS.CLIENT,
              ...(data.roleLimits?.CLIENT || {}),
            },
            EMPLOYEE: {
              ...DEFAULT_ROLE_LIMITS.EMPLOYEE,
              ...(data.roleLimits?.EMPLOYEE || {}),
            },
            MENTOR: {
              ...DEFAULT_ROLE_LIMITS.MENTOR,
              ...(data.roleLimits?.MENTOR || {}),
            },
            INTERN_STUDENT: {
              ...DEFAULT_ROLE_LIMITS.INTERN_STUDENT,
              ...(data.rolePermissions ? data.roleLimits?.INTERN_STUDENT || {} : data.roleLimits?.INTERN_STUDENT || {}),
            },
          };

          const mergedResources = data.resourcePermissions
            ? data.resourcePermissions
            : resolveResourcePermissionsMap(undefined);

          setRbacConfig({
            rolePermissions: mergedPerms,
            roleLimits: mergedLimits,
            resourcePermissions: mergedResources,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          });
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // 2. Real-time listener on `quotas/{uid}` for live resource consumption tracking
  useEffect(() => {
    if (!currentUser?.uid) {
      setUsage(DEFAULT_USAGE);
      return;
    }

    const quotaRef = doc(db, 'quotas', currentUser.uid);
    const unsubscribe = onSnapshot(
      quotaRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<UserUsageMetrics>;
          const todayStr = new Date().toISOString().slice(0, 10);
          setUsage({
            projectsCount: Number(data.projectsCount || 0),
            assignedTasksCount: Number(data.assignedTasksCount || 0),
            aiRequestsToday:
              data.aiRequestsDate === todayStr
                ? Number(data.aiRequestsToday || 0)
                : 0,
            aiRequestsDate: todayStr,
            storageUsedMB: Number(data.storageUsedMB || 0),
            reportsGeneratedCount: Number(data.reportsGeneratedCount || 0),
            assignedMenteesCount: Number(data.assignedMenteesCount || 0),
            activeClientProjectsCount: Number(
              data.activeClientProjectsCount || 0
            ),
            lastUpdated: data.lastUpdated,
          });
        } else {
          setUsage(DEFAULT_USAGE);
        }
      },
      () => {}
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const resourcePermissions = useMemo<Record<string, ResourcePermissionEntry>>(() => {
    if (
      rbacConfig.resourcePermissions &&
      Object.keys(rbacConfig.resourcePermissions).length > 0
    ) {
      return rbacConfig.resourcePermissions;
    }
    return DEFAULT_RESOURCE_PERMISSIONS;
  }, [rbacConfig.resourcePermissions]);

  // Compute effective permissions & limits in real time
  const permissions = useMemo<RolePermissionsMap>(() => {
    const overrides =
      simulatedRole && actualRole === 'ADMIN'
        ? undefined
        : (userProfile?.permissionOverrides as Partial<RolePermissionsMap> | undefined);
    return resolveEffectivePermissions(activeRole, rbacConfig, overrides);
  }, [activeRole, actualRole, simulatedRole, rbacConfig, userProfile?.permissionOverrides]);

  const limits = useMemo<RoleLimits>(() => {
    const overrides =
      simulatedRole && actualRole === 'ADMIN'
        ? undefined
        : (userProfile?.limitOverrides as Partial<RoleLimits> | undefined);
    return resolveEffectiveLimits(activeRole, rbacConfig, overrides);
  }, [activeRole, actualRole, simulatedRole, rbacConfig, userProfile?.limitOverrides]);

  const expired = useMemo(() => isAccessExpired(limits), [limits]);
  const suspended = useMemo(
    () => userProfile?.isActive === false,
    [userProfile?.isActive]
  );

  const can = useCallback(
    (action: PermissionAction): boolean => {
      if (suspended || expired) return false;
      if (activeRole === 'ADMIN') return true;
      return Boolean(permissions[action]);
    },
    [activeRole, permissions, suspended, expired]
  );

  const canAccessResource = useCallback(
    (resourceKey: string, action: ResourceCRUDAction): boolean => {
      if (suspended || expired) return false;
      if (activeRole === 'ADMIN') return true;
      const entry = resourcePermissions[resourceKey];
      if (!entry) {
        const resolved = resolveRoleResourceAccess(activeRole, resourceKey, rbacConfig);
        return resolved.scope !== 'none' && Boolean(resolved[action]);
      }
      const roleEntry = entry.roleAccess?.[activeRole];
      if (!roleEntry || roleEntry.scope === 'none') return false;
      return Boolean(roleEntry[action]);
    },
    [activeRole, expired, rbacConfig, resourcePermissions, suspended]
  );

  const getResourceScope = useCallback(
    (resourceKey: string): ResourceAccessScope => {
      if (suspended || expired) return 'none';
      if (activeRole === 'ADMIN') return 'all';
      const entry = resourcePermissions[resourceKey];
      return entry?.roleAccess?.[activeRole]?.scope || 'none';
    },
    [activeRole, expired, resourcePermissions, suspended]
  );

  const verifyActionWithServer = useCallback(
    async (
      action: PermissionAction,
      options?: { fileSizeMB?: number }
    ): Promise<{ allowed: boolean; reason?: string }> => {
      if (suspended) {
        return {
          allowed: false,
          reason: 'Your account is currently suspended by an Administrator.',
        };
      }
      if (expired) {
        return {
          allowed: false,
          reason: `Your workspace access expired on ${limits.accessExpirationDate}.`,
        };
      }
      if (!can(action)) {
        return {
          allowed: false,
          reason: `Role ${activeRole} does not have "${action.toUpperCase()}" permission.`,
        };
      }

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            if (idToken) headers.Authorization = `Bearer ${idToken}`;
          } catch {}
        }
        const res = await fetch('/api/rbac/validate-action', {
          method: 'POST',
          headers,
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            userId: currentUser?.uid || 'anonymous',
            role: activeRole,
            action,
            effectivePermissions: permissions,
            fileSizeMB: options?.fileSizeMB,
            maxFileUploadSizeMB: limits.maxFileUploadSizeMB,
            accessExpirationDate: limits.accessExpirationDate,
          }),
        });
        if (res.ok) {
          return await res.json();
        }
        const errData = await res.json().catch(() => ({}));
        return {
          allowed: false,
          reason: errData.reason || 'Action denied by server policy.',
        };
      } catch {
        return { allowed: can(action) };
      }
    },
    [
      activeRole,
      can,
      currentUser,
      expired,
      limits.accessExpirationDate,
      limits.maxFileUploadSizeMB,
      permissions,
      suspended,
    ]
  );

  const consumeQuota = useCallback(
    async (metric: QuotaMetricKey, incrementBy = 1) => {
      if (!currentUser?.uid) {
        return { allowed: false, reason: 'Not authenticated' };
      }
      return checkAndConsumeQuota({
        userId: currentUser.uid,
        role: activeRole,
        metric,
        incrementBy,
        effectiveLimits: limits,
      });
    },
    [currentUser?.uid, activeRole, limits]
  );

  const updateRolePermissions = useCallback(
    async (targetRole: CanonicalRole, updatedMap: RolePermissionsMap) => {
      if (actualRole !== 'ADMIN' || !currentUser?.uid) {
        throw new Error('Only ADMIN can modify role permissions.');
      }
      const nextConfig: RBACConfigDocument = {
        ...rbacConfig,
        rolePermissions: {
          ...rbacConfig.rolePermissions,
          [targetRole]: updatedMap,
        },
      };
      setRbacConfig(nextConfig);
      await saveRBACConfigToFirestore(nextConfig, currentUser.uid);
    },
    [actualRole, currentUser?.uid, rbacConfig]
  );

  const updateRoleLimits = useCallback(
    async (targetRole: CanonicalRole, updatedLimits: RoleLimits) => {
      if (actualRole !== 'ADMIN' || !currentUser?.uid) {
        throw new Error('Only ADMIN can modify role limits.');
      }
      const nextConfig: RBACConfigDocument = {
        ...rbacConfig,
        roleLimits: {
          ...rbacConfig.roleLimits,
          [targetRole]: updatedLimits,
        },
      };
      setRbacConfig(nextConfig);
      await saveRBACConfigToFirestore(nextConfig, currentUser.uid);
    },
    [actualRole, currentUser?.uid, rbacConfig]
  );

  const createResourcePermission = useCallback(
    async (input: CreatePermissionInput) => {
      if (actualRole !== 'ADMIN' || !currentUser?.uid) {
        throw new Error('Only ADMIN can create resource permissions.');
      }
      const result = await createPermission(input, {
        uid: currentUser.uid,
        email: currentUser.email,
      });
      if (result.data) {
        setRbacConfig((prev) => ({
          ...prev,
          resourcePermissions: {
            ...(prev.resourcePermissions || resourcePermissions),
            [result.resourceKey]: result.data!,
          },
        }));
      }
    },
    [actualRole, currentUser?.email, currentUser?.uid, resourcePermissions]
  );

  const updateResourcePermission = useCallback(
    async (resourceKey: string, updates: UpdatePermissionInput) => {
      if (actualRole !== 'ADMIN' || !currentUser?.uid) {
        throw new Error('Only ADMIN can update resource permissions.');
      }
      const result = await updatePermission(resourceKey, updates, {
        uid: currentUser.uid,
        email: currentUser.email,
      });
      if (result.data) {
        setRbacConfig((prev) => ({
          ...prev,
          resourcePermissions: {
            ...(prev.resourcePermissions || resourcePermissions),
            [result.resourceKey]: result.data!,
          },
        }));
      }
    },
    [actualRole, currentUser?.email, currentUser?.uid, resourcePermissions]
  );

  const upsertResourcePermission = useCallback(
    async (entry: ResourcePermissionEntry) => {
      if (actualRole !== 'ADMIN' || !currentUser?.uid) {
        throw new Error('Only ADMIN can create or update resource permissions.');
      }
      const exists = Boolean(resourcePermissions[entry.resourceKey]);
      if (exists) {
        await updateResourcePermission(entry.resourceKey, {
          resourceName: entry.resourceName,
          category: entry.category,
          description: entry.description,
          roleAccess: entry.roleAccess,
        });
      } else {
        await createResourcePermission({
          resourceKey: entry.resourceKey,
          resourceName: entry.resourceName,
          category: entry.category,
          description: entry.description,
          isSystem: entry.isSystem,
          roleAccess: entry.roleAccess,
        });
      }
    },
    [actualRole, createResourcePermission, currentUser?.uid, resourcePermissions, updateResourcePermission]
  );

  const deleteResourcePermission = useCallback(
    async (resourceKey: string) => {
      if (actualRole !== 'ADMIN' || !currentUser?.uid) {
        throw new Error('Only ADMIN can delete resource permissions.');
      }
      await deletePermission(resourceKey, {
        uid: currentUser.uid,
        email: currentUser.email,
      });

      setRbacConfig((prev) => {
        const nextResourceMap = { ...(prev.resourcePermissions || resourcePermissions) };
        delete nextResourceMap[resourceKey];
        return {
          ...prev,
          resourcePermissions: nextResourceMap,
        };
      });
    },
    [actualRole, currentUser?.email, currentUser?.uid, resourcePermissions]
  );

  const saveAllResourcePermissions = useCallback(
    async (
      nextResourceMap: Record<string, ResourcePermissionEntry>,
      nextRolePermissions?: Record<CanonicalRole, RolePermissionsMap>
    ) => {
      if (actualRole !== 'ADMIN' || !currentUser?.uid) {
        throw new Error('Only ADMIN can save resource permissions.');
      }
      const result = await syncPermissionMatrix(
        {
          resourcePermissions: nextResourceMap,
          rolePermissions: nextRolePermissions || rbacConfig.rolePermissions,
          roleLimits: rbacConfig.roleLimits,
        },
        {
          uid: currentUser.uid,
          email: currentUser.email,
        }
      );

      setRbacConfig((prev) => ({
        ...prev,
        rolePermissions: nextRolePermissions || prev.rolePermissions,
        resourcePermissions: result.data || nextResourceMap,
      }));
    },
    [actualRole, currentUser?.email, currentUser?.uid, rbacConfig.roleLimits, rbacConfig.rolePermissions]
  );

  const updateUserOverrides = useCallback(
    async (
      userId: string,
      overrides: {
        permissionOverrides?: Partial<RolePermissionsMap>;
        limitOverrides?: Partial<RoleLimits>;
      }
    ) => {
      if (actualRole !== 'ADMIN' || !currentUser?.uid) {
        throw new Error('Only ADMIN can override user permissions or limits.');
      }
      await setDoc(
        doc(db, 'users', userId),
        {
          ...(overrides.permissionOverrides !== undefined
            ? { permissionOverrides: overrides.permissionOverrides }
            : {}),
          ...(overrides.limitOverrides !== undefined
            ? { limitOverrides: overrides.limitOverrides }
            : {}),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [actualRole, currentUser?.uid]
  );

  const value = useMemo<RBACContextValue>(
    () => ({
      actualRole,
      activeRole,
      simulatedRole,
      setSimulatedRole,
      rbacConfig,
      permissions,
      limits,
      resourcePermissions,
      usage,
      expired,
      suspended,
      can,
      canAccessResource,
      getResourceScope,
      verifyActionWithServer,
      consumeQuota,
      updateRolePermissions,
      updateRoleLimits,
      createResourcePermission,
      updateResourcePermission,
      upsertResourcePermission,
      deleteResourcePermission,
      saveAllResourcePermissions,
      updateUserOverrides,
      loading,
    }),
    [
      actualRole,
      activeRole,
      simulatedRole,
      setSimulatedRole,
      rbacConfig,
      permissions,
      limits,
      resourcePermissions,
      usage,
      expired,
      suspended,
      can,
      canAccessResource,
      getResourceScope,
      verifyActionWithServer,
      consumeQuota,
      updateRolePermissions,
      updateRoleLimits,
      createResourcePermission,
      updateResourcePermission,
      upsertResourcePermission,
      deleteResourcePermission,
      saveAllResourcePermissions,
      updateUserOverrides,
      loading,
    ]
  );

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};
