import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  LogOut,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Search,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { queryClient } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../contexts/RBACContext';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { cn } from '../utils/cn';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile } from './user/UserProfile';
import { AdminGlobalSearch } from './AdminGlobalSearch';
import {
  FIVE_ROLES,
  CanonicalRole,
  ROLE_METADATA,
  normalizeToCanonicalRole,
  PermissionAction,
  ResourceCRUDAction,
} from '../lib/rbac';

const UnifiedUserDashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));

export interface AdminDashboardProps {
  children?: React.ReactNode;
}

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

export function UnifiedSidebarLayout({ children }: AdminDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [navFilter, setNavFilter] = useState('');

  const { userProfile, currentUser } = useAuth();
  const {
    activeRole,
    actualRole,
    simulatedRole,
    setSimulatedRole,
    can,
    canAccessResource,
  } = useRBAC();
  const { settings } = useWebsiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mainRef = useRef<HTMLElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminUser = actualRole === 'ADMIN';
  const effectiveRole: CanonicalRole =
    activeRole || normalizeToCanonicalRole(userProfile?.role);
  const isSimulatingNonAdmin = Boolean(
    isAdminRoute && simulatedRole && simulatedRole !== 'ADMIN'
  );

  const currentTab = searchParams.get('tab') || 'overview';
  const baseDashboardPath = isAdminRoute ? '/admin' : '/dashboard';

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setIsSidebarOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    queryClient.clear();
    await signOut(auth);
    navigate('/login');
  };

  const displayName =
    userProfile?.firstName || userProfile?.lastName
      ? `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim()
      : currentUser?.email || 'User';

  const avatarInitial =
    userProfile?.firstName?.charAt(0)?.toUpperCase() ||
    currentUser?.email?.charAt(0)?.toUpperCase() ||
    'U';

  const roleCategories = getRoleSidebarCategories(
    effectiveRole,
    can,
    canAccessResource
  );

  const filteredCategories = roleCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.name.toLowerCase().includes(navFilter.trim().toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  const portalTitle = getRolePortalTitle(effectiveRole);

  const activeBreadcrumb = (() => {
    if (effectiveRole === 'ADMIN' && isAdminRoute && !isSimulatingNonAdmin) {
      return (
        location.pathname
          .replace('/admin', '')
          .replace(/^\//, '')
          .replace(/-/g, ' ') || 'Dashboard'
      );
    }
    const matchedTabItem = roleCategories
      .flatMap((c) => c.items)
      .find((item) => item.tab === currentTab);
    return matchedTabItem?.name || 'Dashboard';
  })();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Persistent Unified Left Sidebar Navigation */}
      <aside
        aria-label="Unified Workspace Sidebar Navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shrink-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Link to={baseDashboardPath} className="flex items-center gap-2.5 group">
              <img
                src={settings?.logoUrl || '/logo.png'}
                alt="Sricore Solutions Logo"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  SRICORE
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                  {portalTitle}
                </span>
              </div>
            </Link>
            <button
              type="button"
              aria-label="Close sidebar"
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Module Filter Input */}
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={navFilter}
                onChange={(e) => setNavFilter(e.target.value)}
                placeholder="Filter menu items..."
                aria-label="Filter navigation modules"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Role-Based Categorized Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
            {filteredCategories.map((category) => (
              <div key={category.title}>
                <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const targetHref = item.href
                      ? item.href
                      : item.path
                      ? item.path
                      : `${baseDashboardPath}?tab=${item.tab || 'overview'}`;

                    const isActive = item.path
                      ? location.pathname === item.path ||
                        (item.path !== '/admin' && location.pathname.startsWith(item.path))
                      : item.tab
                      ? currentTab === item.tab
                      : false;

                    return (
                      <Link
                        key={item.name}
                        to={targetHref}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          'group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                          isActive
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors',
                            isActive
                              ? 'bg-amber-100/90 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100/80 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-700/80 group-hover:text-slate-900 dark:group-hover:text-white'
                          )}
                        >
                          <item.icon
                            className="w-4 h-4 shrink-0"
                            strokeWidth={isActive ? 2.1 : 1.75}
                          />
                        </span>
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <p className="px-3 py-4 text-xs text-slate-400 dark:text-slate-500 text-center">
                No accessible menu items match your filter.
              </p>
            )}
          </nav>

          {/* Sidebar Footer: Admin Role Simulator (if Admin), Theme Switch, User Profile & Sign Out */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {isAdminUser && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-indigo-500" />
                    Role View
                  </span>
                  {simulatedRole && (
                    <button
                      type="button"
                      onClick={() => setSimulatedRole(null)}
                      className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Reset
                    </button>
                  )}
                </div>
                <select
                  aria-label="Preview workspace as role"
                  value={effectiveRole}
                  onChange={(e) => {
                    const nextRole = e.target.value as CanonicalRole;
                    setSimulatedRole(nextRole === actualRole ? null : nextRole);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {FIVE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_METADATA[r].label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Theme
              </span>
              <ThemeToggle variant="pill" />
            </div>

            <button
              type="button"
              onClick={() => {
                if (effectiveRole === 'ADMIN' && isAdminRoute && !isSimulatingNonAdmin) {
                  setShowProfileDrawer((prev) => !prev);
                } else {
                  navigate(`${baseDashboardPath}?tab=profile`);
                }
              }}
              aria-expanded={showProfileDrawer}
              className="w-full flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400 transition-colors text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {ROLE_METADATA[effectiveRole].shortLabel}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-slate-400 transition-transform',
                  showProfileDrawer && 'rotate-180'
                )}
              />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Workspace Header Bar */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs z-20 transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar navigation"
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 rounded-md p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to={baseDashboardPath} className="flex items-center gap-2 lg:hidden">
              <img
                src={settings?.logoUrl || '/logo.png'}
                alt="Sricore Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                {portalTitle}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <Link
                to={baseDashboardPath}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {portalTitle}
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold capitalize">
                {activeBreadcrumb}
              </span>
            </div>
          </div>

          {/* Global Search across Users, Projects, and Inquiries (when in Admin mode) */}
          {effectiveRole === 'ADMIN' && (
            <div className="flex-1 flex justify-center px-2 sm:px-4 max-w-xl">
              <AdminGlobalSearch />
            </div>
          )}

          {/* Right Header Controls & User-Profile Toggle Dropdown */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <ThemeToggle />

            {/* User-Profile Toggle Button & Dropdown Menu */}
            <div ref={profileDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
                aria-label="Toggle user profile menu"
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:border-amber-400 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs">
                  {avatarInitial}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-900 dark:text-white max-w-[140px] truncate">
                  {displayName}
                </span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-slate-500 transition-transform',
                    isProfileMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {isProfileMenuOpen && (
                <div
                  role="menu"
                  aria-label="User profile options"
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {currentUser?.email}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      {ROLE_METADATA[effectiveRole].label}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (effectiveRole === 'ADMIN' && isAdminRoute && !isSimulatingNonAdmin) {
                          setShowProfileDrawer((prev) => !prev);
                        } else {
                          navigate(`${baseDashboardPath}?tab=profile`);
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                    >
                      <UserCog className="w-4 h-4 text-slate-400" />
                      <span>
                        {effectiveRole === 'ADMIN' && isAdminRoute && !isSimulatingNonAdmin
                          ? showProfileDrawer
                            ? 'Hide Profile Editor'
                            : 'Manage My Profile'
                          : 'My Profile'}
                      </span>
                    </button>

                    {effectiveRole === 'ADMIN' && (
                      <>
                        <Link
                          to="/admin/users"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                        >
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>User Management</span>
                        </Link>

                        <Link
                          to="/admin/settings"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                        >
                          <Settings2 className="w-4 h-4 text-slate-400" />
                          <span>System Settings</span>
                        </Link>

                        <Link
                          to="/admin/audit"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                        >
                          <ShieldAlert className="w-4 h-4 text-slate-400" />
                          <span>Security & Audit Logs</span>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Viewport */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/40 p-3 sm:p-4 lg:p-6 transition-colors"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Expandable Inline Profile Panel when toggled on Admin routes */}
            {showProfileDrawer && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/60 p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Profile & Account Settings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update your profile details or close this panel to return to your workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProfileDrawer(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    aria-label="Close profile panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <UserProfile />
              </div>
            )}

            {/* Route Content */}
            {isSimulatingNonAdmin ? (
              <Suspense
                fallback={
                  <div className="animate-pulse h-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />
                }
              >
                <UnifiedUserDashboard />
              </Suspense>
            ) : (
              children || <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export {
  UnifiedSidebarLayout as AdminDashboardLayout,
  UnifiedSidebarLayout as AdminDashboard,
  UnifiedSidebarLayout as AdminLayout,
  UnifiedSidebarLayout as DashboardLayout,
};
export default UnifiedSidebarLayout;
