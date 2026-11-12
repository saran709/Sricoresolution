import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  Mail,
  Phone,
  Building2,
  KeyRound,
  Filter,
  RefreshCw,
  AlertCircle,
  Users as UsersIcon,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  initializeApp,
  deleteApp,
  getApps,
} from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, UserRole } from '../types';
import { logActivity } from '../lib/activityLogger';
import { useAuth } from '../contexts/AuthContext';

export interface UserManagementProps {
  /** Compact mode when embedded inside the main AdminDashboard overview */
  compact?: boolean;
  /** Maximum rows to show before pagination/view-all in compact mode */
  maxRows?: number;
}

type ExtendedUser = User & {
  fullName?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
};

const ALL_ROLES: UserRole[] = [
  'ADMINISTRATOR',
  'EMPLOYEE',
  'MENTOR',
  'INTERN',
  'CLIENT',
  'EMPLOYER',
  'CANDIDATE',
];

const getDisplayName = (user: ExtendedUser): string => {
  const combined = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  if (combined) return combined;
  if (user.fullName) return user.fullName;
  return user.email?.split('@')[0] || 'Unnamed User';
};

export const UserManagement: React.FC<UserManagementProps> = ({
  compact = false,
  maxRows = 10,
}) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // Feedback banner state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'INTERN' as UserRole,
    phone: '',
    department: '',
    isActive: true,
  });

  // Delete confirmation state
  const [userToDelete, setUserToDelete] = useState<ExtendedUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auto-dismiss feedback banner
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Real-time Firestore subscription to `users` collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ExtendedUser[];

        usersList.sort((a, b) => {
          const getMs = (val: any) => {
            if (!val) return 0;
            if (typeof val.toMillis === 'function') return val.toMillis();
            const parsed = new Date(val).getTime();
            return Number.isNaN(parsed) ? 0 : parsed;
          };
          return getMs(b.createdAt) - getMs(a.createdAt);
        });

        setUsers(usersList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching registered users:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    const queryStr = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const displayName = getDisplayName(user).toLowerCase();
      const phoneStr = (user.phone || user.phoneNumber || '').toLowerCase();
      const deptStr = (user.department || '').toLowerCase();

      const matchesSearch =
        !queryStr ||
        displayName.includes(queryStr) ||
        (user.email || '').toLowerCase().includes(queryStr) ||
        (user.role || '').toLowerCase().includes(queryStr) ||
        phoneStr.includes(queryStr) ||
        deptStr.includes(queryStr);

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      const isUserActive = user.isActive !== false;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && isUserActive) ||
        (statusFilter === 'INACTIVE' && !isUserActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const displayedUsers = useMemo(() => {
    if (compact && maxRows > 0) {
      return filteredUsers.slice(0, maxRows);
    }
    return filteredUsers;
  }, [filteredUsers, compact, maxRows]);

  // Summary counts
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive !== false).length;
    const inactive = total - active;
    const admins = users.filter((u) => u.role === 'ADMINISTRATOR').length;
    return { total, active, inactive, admins };
  }, [users]);

  // Toggle Account Status (Active <-> Inactive)
  const handleToggleAccountStatus = async (user: ExtendedUser) => {
    if (!user.id) return;
    const currentlyActive = user.isActive !== false;
    const nextStatus = !currentlyActive;
    setTogglingUserId(user.id);

    try {
      await updateDoc(doc(db, 'users', user.id), {
        isActive: nextStatus,
        updatedAt: serverTimestamp(),
      });

      await logActivity(
        nextStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        currentUser?.uid || 'admin',
        user.id,
        'user',
        `Set account status for ${user.email} (${getDisplayName(user)}) to ${
          nextStatus ? 'ACTIVE' : 'INACTIVE'
        }`
      );

      setFeedback({
        type: 'success',
        message: `${getDisplayName(user)} is now ${
          nextStatus ? 'Active' : 'Inactive'
        }.`,
      });
    } catch (error) {
      console.error('Error toggling account status:', error);
      setFeedback({
        type: 'error',
        message: `Failed to update status for ${user.email}.`,
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  // Inline Role Change
  const handleRoleChange = async (user: ExtendedUser, newRole: UserRole) => {
    if (!user.id || user.role === newRole) return;
    setUpdatingRoleId(user.id);

    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });

      await logActivity(
        'USER_ROLE_UPDATED',
        currentUser?.uid || 'admin',
        user.id,
        'user',
        `Updated role for ${user.email} from ${user.role} to ${newRole}`
      );

      setFeedback({
        type: 'success',
        message: `Updated ${getDisplayName(user)}'s role to ${newRole}.`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      setFeedback({
        type: 'error',
        message: `Failed to update role for ${user.email}.`,
      });
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Open Add User Modal
  const openAddModal = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'INTERN',
      phone: '',
      department: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit User Modal
  const openEditModal = (user: ExtendedUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    const fallbackFirst =
      user.firstName || (user.fullName ? user.fullName.split(' ')[0] : '');
    const fallbackLast =
      user.lastName ||
      (user.fullName ? user.fullName.split(' ').slice(1).join(' ') : '');

    setFormData({
      firstName: fallbackFirst,
      lastName: fallbackLast,
      email: user.email || '',
      password: '',
      role: (user.role as UserRole) || 'INTERN',
      phone: user.phone || user.phoneNumber || '',
      department: user.department || '',
      isActive: user.isActive !== false,
    });
    setIsModalOpen(true);
  };

  // Submit Add or Edit User
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (modalMode === 'add') {
        const appName = `SecondaryCreateApp_${Date.now()}`;
        const existingApps = getApps();
        let secondaryApp = existingApps.find((a) => a.name === appName);
        if (!secondaryApp) {
          secondaryApp = initializeApp(firebaseConfig, appName);
        }
        const secondaryAuth = getAuth(secondaryApp);

        const credential = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.email.trim(),
          formData.password
        );
        const newUid = credential.user.uid;
        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

        await setDoc(doc(db, 'users', newUid), {
          id: newUid,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fullName,
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          phone: formData.phone.trim(),
          department: formData.department.trim(),
          isActive: formData.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await signOut(secondaryAuth);
        await deleteApp(secondaryApp);

        await logActivity(
          'USER_CREATED',
          currentUser?.uid || 'admin',
          newUid,
          'user',
          `Admin created user account ${formData.email} (${formData.role})`
        );

        setFeedback({
          type: 'success',
          message: `Registered user ${fullName || formData.email}.`,
        });
      } else if (modalMode === 'edit' && selectedUser?.id) {
        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
        await updateDoc(doc(db, 'users', selectedUser.id), {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fullName,
          role: formData.role,
          phone: formData.phone.trim(),
          department: formData.department.trim(),
          isActive: formData.isActive,
          updatedAt: serverTimestamp(),
        });

        await logActivity(
          'USER_UPDATED',
          currentUser?.uid || 'admin',
          selectedUser.id,
          'user',
          `Admin updated user profile for ${selectedUser.email}`
        );

        setFeedback({
          type: 'success',
          message: `Saved changes for ${fullName || selectedUser.email}.`,
        });
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to save user changes.',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Send Password Reset
  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      await logActivity(
        'PASSWORD_RESET_SENT',
        currentUser?.uid || 'admin',
        email,
        'user',
        `Sent password reset email to ${email}`
      );
      setFeedback({
        type: 'success',
        message: `Password reset link sent to ${email}.`,
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      setFeedback({
        type: 'error',
        message: error?.message || `Failed to send reset link to ${email}.`,
      });
    }
  };

  // Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!userToDelete?.id) return;
    setDeleting(true);

    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      await logActivity(
        'USER_DELETED',
        currentUser?.uid || 'admin',
        userToDelete.id,
        'user',
        `Deleted user record for ${userToDelete.email}`
      );
      setFeedback({
        type: 'success',
        message: `Removed user ${getDisplayName(userToDelete)}.`,
      });
      setUserToDelete(null);
    } catch (error) {
      console.error('Delete user error:', error);
      setFeedback({
        type: 'error',
        message: `Failed to delete user ${userToDelete.email}.`,
      });
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <section
      aria-label="User Management Interface"
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
    >
      {/* Top Header & Summary Bar */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UsersIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  User Management
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  View, search, assign roles, and toggle account status for registered users
                </p>
              </div>
            </div>
          </div>

          {/* Live Status Counters + Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-lg px-3 py-1.5 tabular-nums">
              <span className="text-slate-500 dark:text-slate-400">Total:</span>
              <span className="font-bold text-slate-900 dark:text-white">{stats.total}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active: {stats.active}
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Inactive: {stats.inactive}
              </span>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>

            {compact && (
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span>Full Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Feedback Toast / Banner */}
        {feedback && (
          <div
            role="status"
            className={`mt-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-xs font-medium border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, role, phone, or department..."
              aria-label="Search registered users"
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative w-full">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label="Filter by role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Roles</option>
                {ALL_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <select
              aria-label="Filter by account status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive / Suspended</option>
            </select>

            {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={resetFilters}
                title="Reset filters"
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Loading registered users...</p>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No matching users found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or role/status filters.
            </p>
            {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Contact & Dept</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {displayedUsers.map((user) => {
                const isActive = user.isActive !== false;
                const isToggling = togglingUserId === user.id;
                const isUpdatingRole = updatingRoleId === user.id;
                const displayName = getDisplayName(user);
                const phoneVal = user.phone || user.phoneNumber;

                return (
                  <tr
                    key={user.id || user.email}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User Identity */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {displayName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Selector */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <select
                          aria-label={`Change role for ${displayName}`}
                          value={user.role}
                          disabled={isUpdatingRole}
                          onChange={(e) =>
                            handleRoleChange(user, e.target.value as UserRole)
                          }
                          className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {ALL_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Contact & Department */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      <div className="space-y-0.5">
                        {phoneVal ? (
                          <div className="flex items-center gap-1.5 tabular-nums">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{phoneVal}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">
                            No phone
                          </span>
                        )}
                        {user.department && (
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{user.department}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Account Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleAccountStatus(user)}
                        aria-pressed={isActive}
                        aria-label={`Toggle account status for ${displayName}. Currently ${
                          isActive ? 'Active' : 'Inactive'
                        }`}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isActive ? (
                          <ToggleRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        )}
                        <span>{isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          title="Edit user details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendPasswordReset(user.email)}
                          title="Send password reset email"
                          className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          title="Delete user"
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
        <span>
          Showing <strong>{displayedUsers.length}</strong> of{' '}
          <strong>{filteredUsers.length}</strong> filtered users ({stats.total}{' '}
          total registered)
        </span>
        {compact && filteredUsers.length > maxRows && (
          <Link
            to="/admin/users"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all {filteredUsers.length} users &rarr;
          </Link>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3
                id="user-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {modalMode === 'add' ? 'Register New User' : 'Edit User Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Priya"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sharma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={modalMode === 'edit'}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@sricoresolutions.com"
                />
              </div>

              {modalMode === 'add' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ALL_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      formData.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {formData.isActive ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Engineering / AI"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {modalMode === 'add' ? 'Create Account' : 'Save Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Remove Registered User?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {getDisplayName(userToDelete)}
              </strong>
              ? This removes their user record from the platform directory.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserManagement;
