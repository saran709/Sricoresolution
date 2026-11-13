import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sliders,
  Users,
  Check,
  X,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Activity,
  UserCheck,
  UserX,
  Calendar,
  HardDrive,
  Cpu,
  FolderKanban,
  FileSpreadsheet,
  Search,
  Sparkles,
  Link2,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import {
  FIVE_ROLES,
  CanonicalRole,
  ROLE_METADATA,
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  PermissionAction,
  RolePermissionsMap,
  RoleLimits,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLE_LIMITS,
  normalizeToCanonicalRole,
  resolveEffectiveLimits,
  resolveEffectivePermissions,
  UserUsageMetrics,
  saveRBACConfigToFirestore,
} from '../../lib/rbac';
import { logActivity } from '../../lib/activityLogger';
import { PermissionConfiguration } from '../PermissionConfiguration';

interface ManagedUserDoc {
  id: string;
  uid?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: 'active' | 'suspended' | 'inactive';
  isActive?: boolean;
  assignedMentorId?: string;
  assignedClientId?: string;
  assignedEmployeeIds?: string[];
  permissionOverrides?: Partial<RolePermissionsMap>;
  limitOverrides?: Partial<RoleLimits>;
}

const getDisplayUserName = (u: ManagedUserDoc): string => {
  const combined = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  if (combined) return combined;
  if (u.fullName) return u.fullName;
  if (u.name) return u.name;
  return u.email?.split('@')[0] || 'Unnamed User';
};

export const RBACManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { actualRole, rbacConfig, updateUserOverrides } = useRBAC();
  const isAdminUser = actualRole === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'permissions' | 'resource-crud' | 'limits' | 'overrides'>('permissions');
  const [selectedRoleForLimits, setSelectedRoleForLimits] = useState<CanonicalRole>('CLIENT');

  // Local editable state synced with live Firestore config
  const [rolePermissions, setRolePermissions] = useState<
    Record<CanonicalRole, RolePermissionsMap>
  >(rbacConfig.rolePermissions);
  const [roleLimits, setRoleLimits] = useState<Record<CanonicalRole, RoleLimits>>(
    rbacConfig.roleLimits
  );

  // Users and Quotas state for Tab 3
  const [users, setUsers] = useState<ManagedUserDoc[]>([]);
  const [quotasMap, setQuotasMap] = useState<Record<string, UserUsageMetrics>>({});
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<ManagedUserDoc | null>(null);

  // Per-user override modal state
  const [userLimitDraft, setUserLimitDraft] = useState<Partial<RoleLimits>>({});
  const [userPermDraft, setUserPermDraft] = useState<Partial<RolePermissionsMap>>({});
  const [assignedMentorDraft, setAssignedMentorDraft] = useState<string>('');
  const [assignedClientDraft, setAssignedClientDraft] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setRolePermissions(rbacConfig.rolePermissions);
    setRoleLimits(rbacConfig.roleLimits);
  }, [rbacConfig]);

  useEffect(() => {
    const usersUnsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ManagedUserDoc, 'id'>),
        }));
        setUsers(list);
      },
      (err) => {
        console.warn('Users snapshot in RBACManagement:', err.message);
      }
    );

    const quotasUnsub = onSnapshot(
      collection(db, 'quotas'),
      (snap) => {
        const map: Record<string, UserUsageMetrics> = {};
        snap.docs.forEach((d) => {
          map[d.id] = d.data() as UserUsageMetrics;
        });
        setQuotasMap(map);
      },
      () => {}
    );

    return () => {
      usersUnsub();
      quotasUnsub();
    };
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (!isAdminUser) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 flex items-center gap-3">
        <Lock className="w-5 h-5 shrink-0" />
        <span>
          Only authorized ADMIN accounts can access the centralized RBAC & Dynamic Limits Engine.
        </span>
      </div>
    );
  }

  const handleTogglePermission = (role: CanonicalRole, action: PermissionAction) => {
    if (role === 'ADMIN' && action === 'manage') return;
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [action]: !prev[role]?.[action],
      },
    }));
  };

  const handleSavePermissions = async () => {
    if (!currentUser?.uid) return;
    setSaving(true);
    try {
      await saveRBACConfigToFirestore(
        {
          rolePermissions,
          roleLimits,
        },
        currentUser.uid
      );
      showNotice(
        'success',
        '5-Role Permission Matrix saved and pushed to all active dashboards in real time.'
      );
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to save permission matrix.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaultPermissions = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    showNotice('success', 'Reset draft to default 5-role permissions. Click Save to apply.');
  };

  const handleLimitFieldChange = (
    role: CanonicalRole,
    field: keyof RoleLimits,
    value: string | number | null
  ) => {
    setRoleLimits((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }));
  };

  const handleSaveLimits = async () => {
    if (!currentUser?.uid) return;
    setSaving(true);
    try {
      await saveRBACConfigToFirestore(
        {
          rolePermissions,
          roleLimits,
        },
        currentUser.uid
      );
      showNotice(
        'success',
        'Dynamic role limits saved and enforced across backend & active sessions.'
      );
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to save dynamic role limits.');
    } finally {
      setSaving(false);
    }
  };

  const handleUserRoleChange = async (targetUser: ManagedUserDoc, newRole: CanonicalRole) => {
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        role: newRole,
        canonicalRole: newRole,
        updatedAt: serverTimestamp(),
      });
      await logActivity(
        'USER_ROLE_ASSIGNED',
        currentUser?.uid || 'admin',
        targetUser.id,
        'user',
        `Assigned canonical role ${newRole} to ${targetUser.email || getDisplayUserName(targetUser)}`
      );
      showNotice('success', `Updated ${getDisplayUserName(targetUser)} to ${newRole}.`);
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to update user role.');
    }
  };

  const handleToggleUserStatus = async (targetUser: ManagedUserDoc) => {
    const currentlyActive = targetUser.status !== 'suspended' && targetUser.isActive !== false;
    const nextStatus = currentlyActive ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        status: nextStatus,
        isActive: !currentlyActive,
        updatedAt: serverTimestamp(),
      });
      await logActivity(
        currentlyActive ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
        currentUser?.uid || 'admin',
        targetUser.id,
        'user',
        `${currentlyActive ? 'Suspended' : 'Reactivated'} account for ${
          targetUser.email || getDisplayUserName(targetUser)
        }`
      );
      showNotice(
        'success',
        `Account ${currentlyActive ? 'suspended' : 'reactivated'} for ${getDisplayUserName(
          targetUser
        )}.`
      );
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to update account status.');
    }
  };

  const openUserOverrideModal = (targetUser: ManagedUserDoc) => {
    setEditingUser(targetUser);
    setUserLimitDraft({ ...(targetUser.limitOverrides || {}) });
    setUserPermDraft({ ...(targetUser.permissionOverrides || {}) });
    setAssignedMentorDraft(targetUser.assignedMentorId || '');
    setAssignedClientDraft(targetUser.assignedClientId || '');
  };

  const handleSaveUserOverrides = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await updateUserOverrides(editingUser.id, {
        limitOverrides: userLimitDraft,
        permissionOverrides: userPermDraft,
      });
      await updateDoc(doc(db, 'users', editingUser.id), {
        assignedMentorId: assignedMentorDraft || null,
        assignedClientId: assignedClientDraft || null,
        updatedAt: serverTimestamp(),
      });
      await logActivity(
        'USER_RBAC_OVERRIDE_SAVED',
        currentUser?.uid || 'admin',
        editingUser.id,
        'user',
        `Saved custom permission/limit overrides and relationship assignments for ${
          editingUser.email || getDisplayUserName(editingUser)
        }`
      );
      showNotice('success', `Saved custom overrides for ${getDisplayUserName(editingUser)}.`);
      setEditingUser(null);
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to save user overrides.');
    } finally {
      setSaving(false);
    }
  };

  const mentorsList = users.filter((u) => normalizeToCanonicalRole(u.role) === 'MENTOR');
  const clientsList = users.filter((u) => normalizeToCanonicalRole(u.role) === 'CLIENT');

  const filteredUsers = users.filter((u) => {
    const canonical = normalizeToCanonicalRole(u.role);
    const matchesRole = roleFilter === 'ALL' || canonical === roleFilter;
    const q = userSearch.trim().toLowerCase();
    const display = getDisplayUserName(u).toLowerCase();
    const matchesSearch =
      !q ||
      display.includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      canonical.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <section
      aria-label="Centralized Five-Role RBAC Management"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 transition-colors"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            Centralized Five-Role RBAC & Dynamic Quota Engine
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Role Permissions, Dynamic Limits & Resource Governance
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure real-time permissions (11 actions), dynamic limits (9 quotas), mentor/client relationships, and per-user overrides across all 5 canonical roles.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Permission Matrix (11)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resource-crud')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'resource-crud'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Resource CRUD Config
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('limits')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'limits'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Dynamic Role Limits (9)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overrides')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overrides'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            User Overrides & Quotas ({users.length})
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs md:text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: PERMISSION MATRIX */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Five Roles Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {FIVE_ROLES.map((roleKey) => {
              const meta = ROLE_METADATA[roleKey];
              const enabledCount = PERMISSION_ACTIONS.filter(
                (act) => rolePermissions[roleKey]?.[act]
              ).length;
              return (
                <div
                  key={roleKey}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${meta.badgeColor}`}
                      >
                        {meta.shortLabel}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {enabledCount}/11
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {meta.description}
                    </p>
                  </div>
                  <ul className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/60 space-y-1">
                    {meta.capabilities.slice(0, 3).map((cap, i) => (
                      <li
                        key={i}
                        className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="truncate">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Interactive Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Permission Action
                  </th>
                  {FIVE_ROLES.map((roleKey) => (
                    <th
                      key={roleKey}
                      className="py-3.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"
                    >
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
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      {PERMISSION_ACTION_LABELS[action]}
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        ({action})
                      </span>
                    </td>
                    {FIVE_ROLES.map((roleKey) => {
                      const isAllowed = !!rolePermissions[roleKey]?.[action];
                      return (
                        <td key={roleKey} className="py-2.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(roleKey, action)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer ${
                              isAllowed
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                            }`}
                            title={`Toggle ${PERMISSION_ACTION_LABELS[action]} for ${roleKey}`}
                          >
                            {isAllowed ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleResetDefaultPermissions}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default 5-Role Matrix
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSavePermissions}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Propagating...' : 'Save & Broadcast Permissions'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 1B: RESOURCE-LEVEL CRUD PERMISSION CONFIGURATION */}
      {activeTab === 'resource-crud' && <PermissionConfiguration compact />}

      {/* TAB 2: DYNAMIC ROLE LIMITS */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          {/* Role Selector Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {FIVE_ROLES.map((roleKey) => {
              const active = selectedRoleForLimits === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setSelectedRoleForLimits(roleKey)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {ROLE_METADATA[roleKey].label}
                </button>
              );
            })}
          </div>

          {/* 9 Configurable Limits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <FolderKanban className="w-4 h-4 text-indigo-500" />
                Maximum Projects
              </label>
              <input
                type="number"
                min={0}
                value={roleLimits[selectedRoleForLimits]?.maxProjects ?? 0}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'maxProjects',
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Maximum total projects accessible or created.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Activity className="w-4 h-4 text-emerald-500" />
                Maximum Assigned Tasks
              </label>
              <input
                type="number"
                min={0}
                value={roleLimits[selectedRoleForLimits]?.maxAssignedTasks ?? 0}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'maxAssignedTasks',
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Maximum concurrent tasks assigned or created.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Requests Per Day
              </label>
              <input
                type="number"
                min={0}
                value={roleLimits[selectedRoleForLimits]?.aiRequestsPerDay ?? 0}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'aiRequestsPerDay',
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Daily quota for automated/AI assistant operations.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <HardDrive className="w-4 h-4 text-cyan-500" />
                File Storage Capacity (MB)
              </label>
              <input
                type="number"
                min={0}
                value={roleLimits[selectedRoleForLimits]?.fileStorageCapacityMB ?? 0}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'fileStorageCapacityMB',
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Cumulative document & artifact storage cap in MB.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Cpu className="w-4 h-4 text-purple-500" />
                Max File Upload Size (MB)
              </label>
              <input
                type="number"
                min={1}
                value={roleLimits[selectedRoleForLimits]?.maxFileUploadSizeMB ?? 10}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'maxFileUploadSizeMB',
                    Math.max(1, Number(e.target.value))
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Single file upload size limit in megabytes.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <FileSpreadsheet className="w-4 h-4 text-pink-500" />
                Report Generation Limit
              </label>
              <input
                type="number"
                min={0}
                value={roleLimits[selectedRoleForLimits]?.reportGenerationLimit ?? 0}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'reportGenerationLimit',
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Max analytical or progress reports generated.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Users className="w-4 h-4 text-amber-500" />
                Number of Assigned Mentees
              </label>
              <input
                type="number"
                min={0}
                value={roleLimits[selectedRoleForLimits]?.maxAssignedMentees ?? 0}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'maxAssignedMentees',
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Max interns/students assigned to a Mentor.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <FolderKanban className="w-4 h-4 text-blue-500" />
                Active Client Projects Limit
              </label>
              <input
                type="number"
                min={0}
                value={roleLimits[selectedRoleForLimits]?.maxActiveClientProjects ?? 0}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'maxActiveClientProjects',
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Max concurrent active client engagements.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-rose-500" />
                Role Access Expiration Date
              </label>
              <input
                type="date"
                value={roleLimits[selectedRoleForLimits]?.accessExpirationDate || ''}
                onChange={(e) =>
                  handleLimitFieldChange(
                    selectedRoleForLimits,
                    'accessExpirationDate',
                    e.target.value ? e.target.value : null
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-500">Optional default expiration date for this role.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setRoleLimits(DEFAULT_ROLE_LIMITS);
                showNotice('success', 'Reset draft to default role limits. Click Save to apply.');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Default Limits
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveLimits}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Limits...' : 'Save & Enforce Dynamic Limits'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: INDIVIDUAL USER OVERRIDES, ROLE ASSIGNMENT & QUOTA MONITOR */}
      {activeTab === 'overrides' && (
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, or canonical role..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  roleFilter === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                All 5 Roles ({users.length})
              </button>
              {FIVE_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    roleFilter === r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {ROLE_METADATA[r].shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Canonical Role (5 Roles)</th>
                  <th className="py-3.5 px-4">Resource Consumption (Quota)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Overrides & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {filteredUsers.map((u) => {
                  const canonical = normalizeToCanonicalRole(u.role);
                  const effectiveLimits = resolveEffectiveLimits(
                    canonical,
                    rbacConfig,
                    u.limitOverrides
                  );
                  const usage = quotasMap[u.id];
                  const isActive = u.status !== 'suspended' && u.isActive !== false;
                  const hasCustomOverrides =
                    (u.limitOverrides && Object.keys(u.limitOverrides).length > 0) ||
                    (u.permissionOverrides && Object.keys(u.permissionOverrides).length > 0);
                  const displayName = getDisplayUserName(u);

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {displayName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                        {hasCustomOverrides && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                            Custom Override Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={canonical}
                          onChange={(e) =>
                            handleUserRoleChange(u, e.target.value as CanonicalRole)
                          }
                          aria-label={`Assign role for ${displayName}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          {FIVE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_METADATA[r].label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-slate-500 dark:text-slate-400">
                            Projects:{' '}
                            <strong className="text-slate-900 dark:text-white">
                              {usage?.projectsCount ?? 0}/{effectiveLimits.maxProjects}
                            </strong>
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            Tasks:{' '}
                            <strong className="text-slate-900 dark:text-white">
                              {usage?.assignedTasksCount ?? 0}/{effectiveLimits.maxAssignedTasks}
                            </strong>
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            AI/Day:{' '}
                            <strong className="text-slate-900 dark:text-white">
                              {usage?.aiRequestsToday ?? 0}/{effectiveLimits.aiRequestsPerDay}
                            </strong>
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            Storage:{' '}
                            <strong className="text-slate-900 dark:text-white">
                              {(usage?.storageUsedMB ?? 0).toFixed(1)}/
                              {effectiveLimits.fileStorageCapacityMB} MB
                            </strong>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openUserOverrideModal(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Overrides
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                      No matching users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PER-USER OVERRIDE & RELATIONSHIP MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Individual Overrides & Relationships: {getDisplayUserName(editingUser)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Canonical Role:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {normalizeToCanonicalRole(editingUser.role)}
                  </strong>{' '}
                  — Override specific limits, permissions, or mentor/client links for this user.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Relationship Assignments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <Link2 className="w-3.5 h-3.5 text-amber-500" />
                  Assigned Mentor (for Intern/Student or Employee)
                </label>
                <select
                  value={assignedMentorDraft}
                  onChange={(e) => setAssignedMentorDraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">-- No Mentor Assigned --</option>
                  {mentorsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {getDisplayUserName(m)} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-500" />
                  Assigned Client Account (for Employee)
                </label>
                <select
                  value={assignedClientDraft}
                  onChange={(e) => setAssignedClientDraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">-- No Client Assigned --</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getDisplayUserName(c)} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Limit Overrides */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Custom Limit Overrides (Leave blank to inherit role defaults)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400">Max Projects</label>
                  <input
                    type="number"
                    placeholder="Inherit role limit"
                    value={userLimitDraft.maxProjects ?? ''}
                    onChange={(e) =>
                      setUserLimitDraft((p) => ({
                        ...p,
                        maxProjects: e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Max Assigned Tasks
                  </label>
                  <input
                    type="number"
                    placeholder="Inherit role limit"
                    value={userLimitDraft.maxAssignedTasks ?? ''}
                    onChange={(e) =>
                      setUserLimitDraft((p) => ({
                        ...p,
                        maxAssignedTasks:
                          e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    AI Requests / Day
                  </label>
                  <input
                    type="number"
                    placeholder="Inherit role limit"
                    value={userLimitDraft.aiRequestsPerDay ?? ''}
                    onChange={(e) =>
                      setUserLimitDraft((p) => ({
                        ...p,
                        aiRequestsPerDay:
                          e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Storage Capacity (MB)
                  </label>
                  <input
                    type="number"
                    placeholder="Inherit role limit"
                    value={userLimitDraft.fileStorageCapacityMB ?? ''}
                    onChange={(e) =>
                      setUserLimitDraft((p) => ({
                        ...p,
                        fileStorageCapacityMB:
                          e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400">Report Limit</label>
                  <input
                    type="number"
                    placeholder="Inherit role limit"
                    value={userLimitDraft.reportGenerationLimit ?? ''}
                    onChange={(e) =>
                      setUserLimitDraft((p) => ({
                        ...p,
                        reportGenerationLimit:
                          e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Access Expiration Date
                  </label>
                  <input
                    type="date"
                    value={userLimitDraft.accessExpirationDate || ''}
                    onChange={(e) =>
                      setUserLimitDraft((p) => ({
                        ...p,
                        accessExpirationDate: e.target.value || null,
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Permission Overrides */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Individual Permission Overrides
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PERMISSION_ACTIONS.map((action) => {
                  const basePerm = resolveEffectivePermissions(
                    normalizeToCanonicalRole(editingUser.role),
                    rbacConfig
                  )[action];
                  const currentVal =
                    userPermDraft[action] !== undefined ? userPermDraft[action] : basePerm;

                  return (
                    <button
                      key={action}
                      type="button"
                      onClick={() =>
                        setUserPermDraft((p) => ({
                          ...p,
                          [action]: !currentVal,
                        }))
                      }
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        currentVal
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <span>{PERMISSION_ACTION_LABELS[action]}</span>
                      {currentVal ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setUserLimitDraft({});
                  setUserPermDraft({});
                }}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
              >
                Clear All Individual Overrides
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveUserOverrides}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save User Overrides'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
