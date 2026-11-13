import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Search,
  Check,
  X,
  Lock,
  Layers,
  Grid,
  CheckCircle2,
  AlertCircle,
  Play,
  Database,
  Eye,
  FolderPlus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../contexts/RBACContext';
import {
  FIVE_ROLES,
  CanonicalRole,
  ROLE_METADATA,
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  PermissionAction,
  RolePermissionsMap,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_RESOURCE_PERMISSIONS,
  RESOURCE_CRUD_ACTIONS,
  RESOURCE_CRUD_LABELS,
  ResourceCRUDAction,
  ResourceAccessScope,
  ResourceCategory,
  ResourcePermissionEntry,
  ResourceCRUDPermissions,
  createBlankResourcePermissionEntry,
} from '../lib/rbac';
import { PROTECTED_SYSTEM_RESOURCES } from '../services/PermissionService';

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Core Operations',
  'Workforce & Mentorship',
  'Finance & Legal',
  'System & Security',
  'Custom',
];

const SCOPE_OPTIONS: { value: ResourceAccessScope; label: string; badgeClass: string }[] = [
  {
    value: 'all',
    label: 'All Records',
    badgeClass:
      'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  {
    value: 'assigned',
    label: 'Assigned Only',
    badgeClass:
      'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  },
  {
    value: 'own',
    label: 'Own Records',
    badgeClass:
      'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
  {
    value: 'none',
    label: 'No Access',
    badgeClass:
      'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
];

export interface PermissionConfigurationProps {
  compact?: boolean;
}

export const PermissionConfiguration: React.FC<PermissionConfigurationProps> = ({
  compact = false,
}) => {
  const { currentUser } = useAuth();
  const {
    actualRole,
    rbacConfig,
    resourcePermissions,
    createResourcePermission,
    updateResourcePermission,
    deleteResourcePermission,
    saveAllResourcePermissions,
  } = useRBAC();

  const isAdmin = actualRole === 'ADMIN';

  // View Mode: 'resource-crud' (Resource-Level CRUD by Role), 'cross-role' (5-Role Resource Matrix), 'global-actions' (11 Global Actions)
  const [viewMode, setViewMode] = useState<'resource-crud' | 'cross-role' | 'global-actions'>(
    'resource-crud'
  );
  const [selectedRole, setSelectedRole] = useState<CanonicalRole>('CLIENT');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Editable draft state synced with real-time RBACContext
  const [draftResources, setDraftResources] =
    useState<Record<string, ResourcePermissionEntry>>(resourcePermissions);
  const [draftRolePermissions, setDraftRolePermissions] = useState<
    Record<CanonicalRole, RolePermissionsMap>
  >(rbacConfig.rolePermissions);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create / Edit Resource Modal state (CRUD on Resource Definitions)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResourceKey, setEditingResourceKey] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState<{
    resourceKey: string;
    resourceName: string;
    category: ResourceCategory;
    description: string;
  }>({
    resourceKey: '',
    resourceName: '',
    category: 'Core Operations',
    description: '',
  });

  // Delete confirmation state
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  // Policy Simulator state
  const [simRole, setSimRole] = useState<CanonicalRole>('CLIENT');
  const [simResource, setSimResource] = useState<string>('projects');
  const [simAction, setSimAction] = useState<ResourceCRUDAction>('create');

  // Feedback banner
  const [notice, setNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setDraftResources(resourcePermissions);
    setHasUnsavedChanges(false);
  }, [resourcePermissions]);

  useEffect(() => {
    setDraftRolePermissions(rbacConfig.rolePermissions);
  }, [rbacConfig.rolePermissions]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4500);
  };

  const resourceList = useMemo(() => {
    const entries = Object.values(draftResources) as ResourcePermissionEntry[];
    return entries
      .filter((entry) => {
        const matchesCat = categoryFilter === 'ALL' || entry.category === categoryFilter;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          entry.resourceName.toLowerCase().includes(q) ||
          entry.resourceKey.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.category.toLowerCase().includes(q);
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => a.resourceName.localeCompare(b.resourceName));
  }, [draftResources, categoryFilter, searchQuery]);

  if (!isAdmin) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 flex items-center gap-3 text-sm">
        <Lock className="w-5 h-5 shrink-0" />
        <span>
          Only authorized Administrator (ADMIN) accounts can configure role and resource-level
          access controls.
        </span>
      </div>
    );
  }

  // Toggle a single CRUD or extended action for a role on a resource
  const handleToggleResourceAction = (
    resourceKey: string,
    role: CanonicalRole,
    action: ResourceCRUDAction
  ) => {
    if (
      role === 'ADMIN' &&
      (PROTECTED_SYSTEM_RESOURCES as readonly string[]).includes(resourceKey) &&
      (action === 'read' || action === 'create' || action === 'update')
    ) {
      showNotice(
        'error',
        `ADMIN ${action.toUpperCase()} access on protected security resource "${resourceKey}" cannot be revoked.`
      );
      return;
    }

    setDraftResources((prev) => {
      const target = prev[resourceKey];
      if (!target) return prev;
      const currentRoleAccess = target.roleAccess[role];
      const nextVal = !currentRoleAccess[action];

      // If enabling an action while scope is 'none', automatically promote scope to 'assigned' (or 'all' for ADMIN)
      const nextScope: ResourceAccessScope =
        nextVal && currentRoleAccess.scope === 'none'
          ? role === 'ADMIN'
            ? 'all'
            : role === 'INTERN_STUDENT'
            ? 'own'
            : 'assigned'
          : currentRoleAccess.scope;

      return {
        ...prev,
        [resourceKey]: {
          ...target,
          roleAccess: {
            ...target.roleAccess,
            [role]: {
              ...currentRoleAccess,
              [action]: nextVal,
              scope: nextScope,
            },
          },
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Change the data visibility scope ('all' | 'assigned' | 'own' | 'none') for a role on a resource
  const handleChangeResourceScope = (
    resourceKey: string,
    role: CanonicalRole,
    nextScope: ResourceAccessScope
  ) => {
    if (
      role === 'ADMIN' &&
      (PROTECTED_SYSTEM_RESOURCES as readonly string[]).includes(resourceKey) &&
      nextScope !== 'all'
    ) {
      showNotice(
        'error',
        `ADMIN scope on protected security resource "${resourceKey}" must remain "All Records".`
      );
      return;
    }

    setDraftResources((prev) => {
      const target = prev[resourceKey];
      if (!target) return prev;
      const currentRoleAccess = target.roleAccess[role];

      const updatedPerms: ResourceCRUDPermissions =
        nextScope === 'none'
          ? {
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
            }
          : {
              ...currentRoleAccess,
              read: true,
              scope: nextScope,
            };

      return {
        ...prev,
        [resourceKey]: {
          ...target,
          roleAccess: {
            ...target.roleAccess,
            [role]: updatedPerms,
          },
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Apply quick preset (Full CRUD, Read + Write, Read Only, No Access) to a resource for a role
  const handleApplyResourcePreset = (
    resourceKey: string,
    role: CanonicalRole,
    preset: 'full' | 'read-write' | 'read-only' | 'none'
  ) => {
    if (
      role === 'ADMIN' &&
      (PROTECTED_SYSTEM_RESOURCES as readonly string[]).includes(resourceKey) &&
      preset !== 'full'
    ) {
      showNotice(
        'error',
        `Protected security resource "${resourceKey}" requires Full CRUD access for ADMIN.`
      );
      return;
    }

    const presets: Record<typeof preset, ResourceCRUDPermissions> = {
      full: {
        create: true,
        read: true,
        update: true,
        delete: true,
        upload: true,
        download: true,
        approve: true,
        assign: true,
        export: true,
        scope: role === 'ADMIN' ? 'all' : 'assigned',
      },
      'read-write': {
        create: true,
        read: true,
        update: true,
        delete: false,
        upload: true,
        download: true,
        approve: false,
        assign: false,
        export: true,
        scope: role === 'INTERN_STUDENT' ? 'own' : 'assigned',
      },
      'read-only': {
        create: false,
        read: true,
        update: false,
        delete: false,
        upload: false,
        download: true,
        approve: false,
        assign: false,
        export: false,
        scope: role === 'INTERN_STUDENT' ? 'own' : 'assigned',
      },
      none: {
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
      },
    };

    setDraftResources((prev) => {
      const target = prev[resourceKey];
      if (!target) return prev;
      return {
        ...prev,
        [resourceKey]: {
          ...target,
          roleAccess: {
            ...target.roleAccess,
            [role]: presets[preset],
          },
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Toggle global 11-action permission
  const handleToggleGlobalAction = (role: CanonicalRole, action: PermissionAction) => {
    if (role === 'ADMIN' && action === 'manage') return;
    setDraftRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [action]: !prev[role]?.[action],
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Save all changes (Resource CRUD permissions & Role Global Permissions) atomically via PermissionService
  const handleSaveAllChanges = async () => {
    if (!currentUser?.uid) return;
    setSaving(true);
    try {
      await saveAllResourcePermissions(draftResources, draftRolePermissions);
      setHasUnsavedChanges(false);
      showNotice(
        'success',
        'Dynamic 5-role permissions and resource-level CRUD policies atomically validated, saved, and synced.'
      );
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to save permission configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Open modal to CREATE a new resource permission rule
  const openCreateResourceModal = () => {
    setEditingResourceKey(null);
    setResourceForm({
      resourceKey: '',
      resourceName: '',
      category: 'Custom',
      description: '',
    });
    setIsResourceModalOpen(true);
  };

  // Open modal to UPDATE an existing resource's metadata
  const openEditResourceModal = (entry: ResourcePermissionEntry) => {
    setEditingResourceKey(entry.resourceKey);
    setResourceForm({
      resourceKey: entry.resourceKey,
      resourceName: entry.resourceName,
      category: entry.category,
      description: entry.description,
    });
    setIsResourceModalOpen(true);
  };

  // Submit Create / Update Resource Modal via PermissionService
  const handleResourceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = (editingResourceKey || resourceForm.resourceKey)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    if (!cleanKey || !resourceForm.resourceName.trim()) {
      showNotice('error', 'Please provide both a valid Resource Key and Resource Name.');
      return;
    }

    setSaving(true);
    try {
      if (editingResourceKey && draftResources[editingResourceKey]) {
        const updatedFields = {
          resourceName: resourceForm.resourceName.trim(),
          category: resourceForm.category,
          description: resourceForm.description.trim(),
        };
        await updateResourcePermission(editingResourceKey, updatedFields);
        setDraftResources((prev) => ({
          ...prev,
          [editingResourceKey]: {
            ...prev[editingResourceKey],
            ...updatedFields,
          },
        }));
        setSimResource(editingResourceKey);
        setIsResourceModalOpen(false);
        showNotice(
          'success',
          `Updated resource "${updatedFields.resourceName}" (${editingResourceKey}) atomically.`
        );
      } else {
        const newEntry = createBlankResourcePermissionEntry({
          resourceKey: cleanKey,
          resourceName: resourceForm.resourceName,
          category: resourceForm.category,
          description: resourceForm.description,
        });
        await createResourcePermission({
          resourceKey: newEntry.resourceKey,
          resourceName: newEntry.resourceName,
          category: newEntry.category,
          description: newEntry.description,
          isSystem: false,
          roleAccess: newEntry.roleAccess,
        });
        setDraftResources((prev) => ({
          ...prev,
          [newEntry.resourceKey]: newEntry,
        }));
        setSimResource(newEntry.resourceKey);
        setIsResourceModalOpen(false);
        showNotice(
          'success',
          `Created new resource "${newEntry.resourceName}" (${newEntry.resourceKey}) with 5-role CRUD rules.`
        );
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to save resource rule.');
    } finally {
      setSaving(false);
    }
  };

  // Confirm DELETE of a resource permission rule
  const handleConfirmDeleteResource = async (resourceKey: string) => {
    setSaving(true);
    try {
      const targetName = draftResources[resourceKey]?.resourceName || resourceKey;
      await deleteResourcePermission(resourceKey);
      setDraftResources((prev) => {
        const next = { ...prev };
        delete next[resourceKey];
        return next;
      });
      setDeletingKey(null);
      showNotice('success', `Deleted resource permission rule "${targetName}".`);
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to delete resource rule.');
    } finally {
      setSaving(false);
    }
  };

  // Restore all system default resource permissions & global actions
  const handleRestoreDefaults = async () => {
    setDraftResources(DEFAULT_RESOURCE_PERMISSIONS);
    setDraftRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setHasUnsavedChanges(true);
    showNotice(
      'success',
      'Restored default 5-role resource CRUD rules in draft. Click "Save & Sync Policies" to persist.'
    );
  };

  // Compute simulated policy outcome
  const simulatedOutcome = useMemo(() => {
    const resEntry = draftResources[simResource];
    if (!resEntry) {
      return {
        allowed: false,
        scope: 'none' as ResourceAccessScope,
        reason: 'Resource rule not found.',
      };
    }
    const roleAccess = resEntry.roleAccess?.[simRole];
    if (!roleAccess || roleAccess.scope === 'none') {
      return {
        allowed: false,
        scope: 'none' as ResourceAccessScope,
        reason: `${ROLE_METADATA[simRole].shortLabel} has 'No Access' scope on ${resEntry.resourceName}.`,
      };
    }
    const actionAllowed = Boolean(roleAccess[simAction]);
    return {
      allowed: actionAllowed,
      scope: roleAccess.scope,
      reason: actionAllowed
        ? `${ROLE_METADATA[simRole].shortLabel} is permitted to ${RESOURCE_CRUD_LABELS[simAction].label.toUpperCase()} on ${resEntry.resourceName} (${roleAccess.scope.toUpperCase()} records).`
        : `${ROLE_METADATA[simRole].shortLabel} is denied ${RESOURCE_CRUD_LABELS[simAction].label.toUpperCase()} on ${resEntry.resourceName}.`,
    };
  }, [draftResources, simRole, simResource, simAction]);

  return (
    <section
      aria-label="Dynamic Five-Role Permission Configuration Module"
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ${
        compact ? 'p-5' : 'p-6 md:p-8'
      } shadow-xs space-y-6 transition-colors`}
    >
      {/* Top Header & Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            Dynamic Access Control & Resource CRUD Engine
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Permission Configuration (Five Canonical Roles)
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, inspect, update, and delete resource-level CRUD permissions and data visibility
            scopes across{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              ADMIN, CLIENT, EMPLOYEE, MENTOR, and INTERN_STUDENT
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openCreateResourceModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Add Resource Rule
          </button>

          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAllChanges}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            {saving
              ? 'Syncing...'
              : hasUnsavedChanges
              ? 'Save & Sync Changes*'
              : 'Save & Sync Policies'}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs md:text-sm font-medium ${
            notice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mode Switcher + Search & Category Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('resource-crud')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'resource-crud'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Role-by-Resource CRUD ({Object.keys(draftResources).length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cross-role')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cross-role'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            5-Role Comparison Matrix
          </button>
          <button
            type="button"
            onClick={() => setViewMode('global-actions')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'global-actions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Global 11-Action Matrix
          </button>
        </div>

        {viewMode !== 'global-actions' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[210px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                aria-label="Search resources"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              aria-label="Filter resources by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Categories ({Object.keys(draftResources).length})</option>
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: ROLE-FOCUSED RESOURCE-LEVEL CRUD EDITOR */}
      {viewMode === 'resource-crud' && (
        <div className="space-y-5">
          {/* Five Canonical Role Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {FIVE_ROLES.map((roleKey) => {
              const isSelected = selectedRole === roleKey;
              const meta = ROLE_METADATA[roleKey];
              const accessibleResourcesCount = (
                Object.values(draftResources) as ResourcePermissionEntry[]
              ).filter((r) => r.roleAccess?.[roleKey]?.scope !== 'none' && r.roleAccess?.[roleKey]?.read).length;

              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setSelectedRole(roleKey)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500/40 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${meta.badgeColor}`}
                    >
                      {meta.shortLabel}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {accessibleResourcesCount}/{Object.keys(draftResources).length}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-1">
                    {meta.label.split(' (')[0]}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Role Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Configuring Role:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {ROLE_METADATA[selectedRole].label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {ROLE_METADATA[selectedRole].description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>Showing {resourceList.length} resource rules</span>
            </div>
          </div>

          {/* Resource CRUD Table for Selected Role */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 min-w-[220px]">Resource & Key</th>
                  <th className="py-3.5 px-3 min-w-[145px]">Visibility Scope</th>
                  <th className="py-3.5 px-2 text-center" title="Create (C)">
                    Create (C)
                  </th>
                  <th className="py-3.5 px-2 text-center" title="Read / View (R)">
                    Read (R)
                  </th>
                  <th className="py-3.5 px-2 text-center" title="Update / Edit (U)">
                    Update (U)
                  </th>
                  <th className="py-3.5 px-2 text-center" title="Delete (D)">
                    Delete (D)
                  </th>
                  <th className="py-3.5 px-3 min-w-[210px]">Extended Operations</th>
                  <th className="py-3.5 px-4 text-right min-w-[170px]">Presets & CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {resourceList.map((entry) => {
                  const rolePerms = entry.roleAccess[selectedRole] || {
                    create: false,
                    read: false,
                    update: false,
                    delete: false,
                    upload: false,
                    download: false,
                    approve: false,
                    assign: false,
                    export: false,
                    scope: 'none' as ResourceAccessScope,
                  };

                  const extendedActions: ResourceCRUDAction[] = [
                    'upload',
                    'download',
                    'approve',
                    'assign',
                    'export',
                  ];

                  return (
                    <tr
                      key={entry.resourceKey}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Resource Name & Key */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {entry.resourceName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                            {entry.resourceKey}
                          </span>
                          {!entry.isSystem && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {entry.description}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                          {entry.category}
                        </span>
                      </td>

                      {/* Scope Selector */}
                      <td className="py-3.5 px-3">
                        <select
                          aria-label={`Data visibility scope for ${entry.resourceName}`}
                          value={rolePerms.scope}
                          onChange={(e) =>
                            handleChangeResourceScope(
                              entry.resourceKey,
                              selectedRole,
                              e.target.value as ResourceAccessScope
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        >
                          {SCOPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Core CRUD Toggles: Create, Read, Update, Delete */}
                      {(['create', 'read', 'update', 'delete'] as ResourceCRUDAction[]).map(
                        (crudAction) => {
                          const enabled = Boolean(rolePerms[crudAction]);
                          return (
                            <td key={crudAction} className="py-3.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleResourceAction(
                                    entry.resourceKey,
                                    selectedRole,
                                    crudAction
                                  )
                                }
                                title={`Toggle ${RESOURCE_CRUD_LABELS[crudAction].label} for ${selectedRole} on ${entry.resourceName}`}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-bold transition-all cursor-pointer ${
                                  enabled
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}
                              >
                                {enabled ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          );
                        }
                      )}

                      {/* Extended Operations Chips */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {extendedActions.map((extAction) => {
                            const active = Boolean(rolePerms[extAction]);
                            return (
                              <button
                                key={extAction}
                                type="button"
                                onClick={() =>
                                  handleToggleResourceAction(
                                    entry.resourceKey,
                                    selectedRole,
                                    extAction
                                  )
                                }
                                className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                  active
                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}
                              >
                                {RESOURCE_CRUD_LABELS[extAction].label}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Quick Presets & Resource Metadata Edit/Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            aria-label={`Quick preset for ${entry.resourceName}`}
                            value=""
                            onChange={(e) => {
                              const val = e.target.value as
                                | 'full'
                                | 'read-write'
                                | 'read-only'
                                | 'none';
                              if (val) {
                                handleApplyResourcePreset(entry.resourceKey, selectedRole, val);
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                          >
                            <option value="">Preset...</option>
                            <option value="full">Full CRUD</option>
                            <option value="read-write">Read + Write</option>
                            <option value="read-only">Read Only</option>
                            <option value="none">No Access</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => openEditResourceModal(entry)}
                            title={`Edit ${entry.resourceName} metadata`}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {(PROTECTED_SYSTEM_RESOURCES as readonly string[]).includes(
                            entry.resourceKey
                          ) ? (
                            <span
                              title="Core protected system security resource cannot be deleted"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 text-slate-400 cursor-not-allowed"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          ) : deletingKey === entry.resourceKey ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleConfirmDeleteResource(entry.resourceKey)}
                                className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingKey(null)}
                                className="px-1.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingKey(entry.resourceKey)}
                              title={`Delete ${entry.resourceName} rule`}
                              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {resourceList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500 dark:text-slate-400">
                      No matching resource rules found. Click "Add Resource Rule" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: 5-ROLE CROSS-RESOURCE COMPARISON MATRIX */}
      {viewMode === 'cross-role' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 min-w-[200px]">Resource</th>
                {FIVE_ROLES.map((roleKey) => (
                  <th key={roleKey} className="py-3.5 px-3 text-center min-w-[155px]">
                    {ROLE_METADATA[roleKey].shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {resourceList.map((entry) => (
                <tr
                  key={entry.resourceKey}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{entry.resourceName}</p>
                    <p className="text-[11px] font-mono text-slate-400">{entry.resourceKey}</p>
                  </td>
                  {FIVE_ROLES.map((roleKey) => {
                    const access = entry.roleAccess[roleKey];
                    const scopeMeta =
                      SCOPE_OPTIONS.find((s) => s.value === access?.scope) || SCOPE_OPTIONS[3];
                    return (
                      <td key={roleKey} className="py-3.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${scopeMeta.badgeClass}`}
                          >
                            {scopeMeta.label}
                          </span>
                          <div className="inline-flex items-center gap-1">
                            {(['create', 'read', 'update', 'delete'] as ResourceCRUDAction[]).map(
                              (act) => {
                                const on = Boolean(access?.[act]);
                                return (
                                  <button
                                    key={act}
                                    type="button"
                                    onClick={() =>
                                      handleToggleResourceAction(entry.resourceKey, roleKey, act)
                                    }
                                    title={`${ROLE_METADATA[roleKey].shortLabel}: Toggle ${RESOURCE_CRUD_LABELS[act].label} on ${entry.resourceName}`}
                                    className={`w-6 h-6 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                      on
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    {RESOURCE_CRUD_LABELS[act].short}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: GLOBAL 11-ACTION ROLE PERMISSION MATRIX */}
      {viewMode === 'global-actions' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Global Permission Action (11)</th>
                {FIVE_ROLES.map((roleKey) => (
                  <th key={roleKey} className="py-3.5 px-4 text-center">
                    {ROLE_METADATA[roleKey].shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {PERMISSION_ACTIONS.map((action) => (
                <tr
                  key={action}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {PERMISSION_ACTION_LABELS[action]}{' '}
                    <span className="text-xs font-mono text-slate-400 uppercase">({action})</span>
                  </td>
                  {FIVE_ROLES.map((roleKey) => {
                    const allowed = Boolean(draftRolePermissions[roleKey]?.[action]);
                    return (
                      <td key={roleKey} className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleGlobalAction(roleKey, action)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer ${
                            allowed
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          {allowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Live Access Policy Simulator */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          <Play className="w-3.5 h-3.5 text-amber-500" />
          Live Resource Access Policy Simulator
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Test Role
            </label>
            <select
              aria-label="Simulator role"
              value={simRole}
              onChange={(e) => setSimRole(e.target.value as CanonicalRole)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {FIVE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_METADATA[r].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Target Resource
            </label>
            <select
              aria-label="Simulator resource"
              value={simResource}
              onChange={(e) => setSimResource(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {(Object.values(draftResources) as ResourcePermissionEntry[]).map((r) => (
                <option key={r.resourceKey} value={r.resourceKey}>
                  {r.resourceName} ({r.resourceKey})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              CRUD / Action Operation
            </label>
            <select
              aria-label="Simulator operation"
              value={simAction}
              onChange={(e) => setSimAction(e.target.value as ResourceCRUDAction)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {RESOURCE_CRUD_ACTIONS.map((act) => (
                <option key={act} value={act}>
                  {RESOURCE_CRUD_LABELS[act].label} ({act.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              simulatedOutcome.allowed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}
          >
            {simulatedOutcome.allowed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase">
                {simulatedOutcome.allowed ? 'Access Allowed' : 'Access Denied'} • Scope:{' '}
                {simulatedOutcome.scope.toUpperCase()}
              </div>
              <p className="text-[11px] truncate" title={simulatedOutcome.reason}>
                {simulatedOutcome.reason}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Resource Rule Modal */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingResourceKey
                    ? `Edit Resource: ${editingResourceKey}`
                    : 'Create New Resource Permission Rule'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResourceModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResourceFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Key (Slug Identifier) *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingResourceKey)}
                  placeholder="e.g. certificates, leaves, milestones"
                  value={resourceForm.resourceKey}
                  onChange={(e) =>
                    setResourceForm((prev) => ({ ...prev, resourceKey: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Internship Certificates & Credentials"
                  value={resourceForm.resourceName}
                  onChange={(e) =>
                    setResourceForm((prev) => ({ ...prev, resourceName: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Module Category
                </label>
                <select
                  value={resourceForm.category}
                  onChange={(e) =>
                    setResourceForm((prev) => ({
                      ...prev,
                      category: e.target.value as ResourceCategory,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {RESOURCE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Governance Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what records or actions this resource governs..."
                  value={resourceForm.description}
                  onChange={(e) =>
                    setResourceForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {saving
                    ? 'Saving...'
                    : editingResourceKey
                    ? 'Update Resource'
                    : 'Create Resource Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default PermissionConfiguration;
