import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { queryClient } from '../lib/queryClient';
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
import {
  createDefaultUsageMetrics,
  dashboardQueryKeys,
  DEFAULT_RBAC_CONFIG,
  prefetchSidebarNavigation,
  useRbacConfigQuery,
  useUserQuotaQuery,
} from '../hooks/useDashboardQueries';

interface RBACContextValue {
  /** The authenticated user's true canonical role (1 of 5) */
  actualRole: CanonicalRole;
  /** The active canonical role (supports Admin Role Simulation / Testing preview) */
  activeRole: CanonicalRole;
  /** Admin-only role preview override for testing all 5 roles independently */
  simulatedRole: CanonicalRole | null;
  setSimulatedRole: (role: CanonicalRole | null) => void;
  /** Global 5-role configuration cached via TanStack Query from Firestore `settings/rbac_config` */
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
  /** Force revalidate cached RBAC and sidebar queries from Firestore */
  refreshRBAC: () => Promise<void>;
  loading: boolean;
}

const DEFAULT_USAGE: UserUsageMetrics = createDefaultUsageMetrics();
const DEFAULT_CONFIG: RBACConfigDocument = DEFAULT_RBAC_CONFIG;

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
  refreshRBAC: async () => {},
  loading: true,
});

export const useRBAC = () => useContext(RBACContext);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [simulatedRole, setSimulatedRoleState] =
    useState<CanonicalRole | null>(null);

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

  // 1. TanStack Query cached `settings/rbac_config` (only runs when authenticated)
  const isAuthenticated = Boolean(currentUser?.uid);
  const {
    data: cachedRbacConfig,
    isLoading: rbacQueryLoading,
    refetch: refetchRbacConfig,
  } = useRbacConfigQuery(isAuthenticated);

  const rbacConfig = isAuthenticated
    ? cachedRbacConfig || DEFAULT_CONFIG
    : DEFAULT_CONFIG;
  const loading = isAuthenticated ? rbacQueryLoading : false;

  // 2. TanStack Query cached `quotas/{uid}`
  const { data: cachedUsage } = useUserQuotaQuery(currentUser?.uid);
  const usage = isAuthenticated ? cachedUsage || DEFAULT_USAGE : DEFAULT_USAGE;

  const suspended = useMemo(
    () => userProfile?.isActive === false,
    [userProfile?.isActive]
  );

  // 3. Proactively warm cached sidebar navigation configs in TanStack Query
  useEffect(() => {
    if (!currentUser?.uid || !cachedRbacConfig) return;
    const rolesToPrefetch: CanonicalRole[] =
      actualRole === 'ADMIN' ? [...FIVE_ROLES] : [activeRole];

    void prefetchSidebarNavigation({
      roles: rolesToPrefetch,
      rbacConfig: cachedRbacConfig,
      permissionOverrides:
        simulatedRole && actualRole === 'ADMIN'
          ? undefined
          : (userProfile?.permissionOverrides as Partial<RolePermissionsMap> | undefined),
      limitOverrides:
        simulatedRole && actualRole === 'ADMIN'
          ? undefined
          : (userProfile?.limitOverrides as Partial<RoleLimits> | undefined),
      suspended,
    });
  }, [
    currentUser?.uid,
    cachedRbacConfig,
    actualRole,
    activeRole,
    simulatedRole,
    userProfile?.permissionOverrides,
    userProfile?.limitOverrides,
    suspended,
  ]);

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

  const syncRbacCache = useCallback(
    (updater: RBACConfigDocument | ((prev: RBACConfigDocument) => RBACConfigDocument)) => {
      queryClient.setQueryData<RBACConfigDocument>(
        dashboardQueryKeys.rbacConfig,
        (prev) => {
          const base = prev || rbacConfig || DEFAULT_CONFIG;
          return typeof updater === 'function' ? updater(base) : updater;
        }
      );
      void queryClient.invalidateQueries({ queryKey: ['sidebar-config'] });
    },
    [rbacConfig]
  );

  const refreshRBAC = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.rbacConfig });
    await refetchRbacConfig();
    void queryClient.invalidateQueries({ queryKey: ['sidebar-config'] });
  }, [refetchRbacConfig]);

  const can = useCallback(
    (action: PermissionAction): boolean => {
      if (!currentUser?.uid || userProfile?.uid !== currentUser.uid) return false;
      if (suspended || expired) return false;
      if (activeRole === 'ADMIN') return true;
      return Boolean(permissions[action]);
    },
    [currentUser?.uid, userProfile?.uid, activeRole, permissions, suspended, expired]
  );

  const canAccessResource = useCallback(
    (resourceKey: string, action: ResourceCRUDAction): boolean => {
      if (!currentUser?.uid || userProfile?.uid !== currentUser.uid) return false;
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
    [currentUser?.uid, userProfile?.uid, activeRole, expired, rbacConfig, resourcePermissions, suspended]
  );

  const getResourceScope = useCallback(
    (resourceKey: string): ResourceAccessScope => {
      if (!currentUser?.uid || userProfile?.uid !== currentUser.uid) return 'none';
      if (suspended || expired) return 'none';
      if (activeRole === 'ADMIN') return 'all';
      const entry = resourcePermissions[resourceKey];
      return entry?.roleAccess?.[activeRole]?.scope || 'none';
    },
    [currentUser?.uid, userProfile?.uid, activeRole, expired, resourcePermissions, suspended]
  );

  const verifyActionWithServer = useCallback(
    async (
      action: PermissionAction,
      options?: { fileSizeMB?: number }
    ): Promise<{ allowed: boolean; reason?: string }> => {
      if (!currentUser?.uid) {
        return {
          allowed: false,
          reason: 'Authentication required to verify this operation.',
        };
      }
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
        const idToken = await currentUser.getIdToken();
        if (!idToken) {
          return {
            allowed: false,
            reason: 'Missing Firebase Authentication token.',
          };
        }
        const res = await fetch('/api/rbac/validate-action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            userId: currentUser.uid,
            action,
            fileSizeMB: options?.fileSizeMB,
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
        return {
          allowed: false,
          reason: 'Security validation service could not be reached. Request denied (fail-closed).',
        };
      }
    },
    [
      activeRole,
      can,
      currentUser,
      expired,
      limits.accessExpirationDate,
      suspended,
    ]
  );

  const consumeQuota = useCallback(
    async (metric: QuotaMetricKey, incrementBy = 1) => {
      if (!currentUser?.uid) {
        return { allowed: false, reason: 'Not authenticated' };
      }
      const res = await checkAndConsumeQuota({
        userId: currentUser.uid,
        role: activeRole,
        metric,
        incrementBy,
        effectiveLimits: limits,
      });
      if (res.allowed) {
        void queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.userQuota(currentUser.uid),
        });
      }
      return res;
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
        updatedAt: Date.now(),
        updatedBy: currentUser.uid,
      };
      syncRbacCache(nextConfig);
      await saveRBACConfigToFirestore(nextConfig, currentUser.uid);
    },
    [actualRole, currentUser?.uid, rbacConfig, syncRbacCache]
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
        updatedAt: Date.now(),
        updatedBy: currentUser.uid,
      };
      syncRbacCache(nextConfig);
      await saveRBACConfigToFirestore(nextConfig, currentUser.uid);
    },
    [actualRole, currentUser?.uid, rbacConfig, syncRbacCache]
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
        syncRbacCache((prev) => ({
          ...prev,
          updatedAt: Date.now(),
          updatedBy: currentUser.uid,
          resourcePermissions: {
            ...(prev.resourcePermissions || resourcePermissions),
            [result.resourceKey]: result.data!,
          },
        }));
      }
    },
    [actualRole, currentUser?.email, currentUser?.uid, resourcePermissions, syncRbacCache]
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
        syncRbacCache((prev) => ({
          ...prev,
          updatedAt: Date.now(),
          updatedBy: currentUser.uid,
          resourcePermissions: {
            ...(prev.resourcePermissions || resourcePermissions),
            [result.resourceKey]: result.data!,
          },
        }));
      }
    },
    [actualRole, currentUser?.email, currentUser?.uid, resourcePermissions, syncRbacCache]
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

      syncRbacCache((prev) => {
        const nextResourceMap = { ...(prev.resourcePermissions || resourcePermissions) };
        delete nextResourceMap[resourceKey];
        return {
          ...prev,
          updatedAt: Date.now(),
          updatedBy: currentUser.uid,
          resourcePermissions: nextResourceMap,
        };
      });
    },
    [actualRole, currentUser?.email, currentUser?.uid, resourcePermissions, syncRbacCache]
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

      syncRbacCache((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        updatedBy: currentUser.uid,
        rolePermissions: nextRolePermissions || prev.rolePermissions,
        resourcePermissions: result.data || nextResourceMap,
      }));
    },
    [
      actualRole,
      currentUser?.email,
      currentUser?.uid,
      rbacConfig.roleLimits,
      rbacConfig.rolePermissions,
      syncRbacCache,
    ]
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
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.adminUsers });
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
      refreshRBAC,
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
      refreshRBAC,
      loading,
    ]
  );

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};
