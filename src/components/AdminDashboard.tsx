import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  Settings2,
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
import { DashboardSuspense } from './ui/DashboardSuspense';
import {
  FIVE_ROLES,
  CanonicalRole,
  ROLE_METADATA,
  normalizeToCanonicalRole,
  RoleLimits,
  RolePermissionsMap,
} from '../lib/rbac';
import {
  ADMIN_NAV_CATEGORIES,
  getRolePortalTitle,
  getRoleSidebarCategories,
  SidebarCategory,
  SidebarItem,
} from '../lib/sidebarConfig';
import {
  prefetchDashboardForRole,
  prefetchSidebarNavigation,
  prefetchSidebarTarget,
  useSidebarNavigationQuery,
} from '../hooks/useDashboardQueries';

export {
  ADMIN_NAV_CATEGORIES,
  getRolePortalTitle,
  getRoleSidebarCategories,
  type SidebarCategory,
  type SidebarItem,
};

const UnifiedUserDashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const UserProfile = React.lazy(() =>
  import('./user/UserProfile').then((m) => ({ default: m.UserProfile }))
);
const AdminGlobalSearch = React.lazy(() =>
  import('./AdminGlobalSearch').then((m) => ({ default: m.AdminGlobalSearch }))
);

export interface AdminDashboardProps {
  children?: React.ReactNode;
}

export function UnifiedSidebarLayout({ children }: AdminDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [navFilter, setNavFilter] = useState('');

  const { userProfile, currentUser } = useAuth();
  const {
    activeRole,
    actualRole,
    simulatedRole,
    setSimulatedRole,
    rbacConfig,
    suspended,
  } = useRBAC();
  const { settings } = useWebsiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mainRef = useRef<HTMLElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerTouchStartXRef = useRef<number | null>(null);
  const drawerTouchStartYRef = useRef<number | null>(null);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminUser = actualRole === 'ADMIN';
  const effectiveRole: CanonicalRole =
    activeRole || normalizeToCanonicalRole(userProfile?.role);
  const isSimulatingNonAdmin = Boolean(
    isAdminRoute && simulatedRole && simulatedRole !== 'ADMIN'
  );

  const currentTab = searchParams.get('tab') || 'overview';
  const baseDashboardPath = isAdminRoute ? '/admin' : '/dashboard';

  // Prefetch dashboard data, RBAC configuration, and role-based sidebar menus proactively
  useEffect(() => {
    if (!currentUser?.uid) return;
    void prefetchDashboardForRole({
      role: effectiveRole,
      actualRole,
      userProfile: userProfile as any,
    });
  }, [currentUser?.uid, effectiveRole, actualRole, userProfile]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setIsSidebarOpen(false);
    setIsMobileSearchOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
        mobileMenuTriggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isSidebarOpen && window.innerWidth < 1024) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isSidebarOpen]);

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

  const handleDrawerTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    drawerTouchStartXRef.current = e.touches[0]?.clientX ?? null;
    drawerTouchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (drawerTouchStartXRef.current === null || drawerTouchStartYRef.current === null) {
      return;
    }
    const endX = e.changedTouches[0]?.clientX ?? drawerTouchStartXRef.current;
    const endY = e.changedTouches[0]?.clientY ?? drawerTouchStartYRef.current;
    const deltaX = endX - drawerTouchStartXRef.current;
    const deltaY = Math.abs(endY - drawerTouchStartYRef.current);

    if (deltaX < -56 && deltaY < 48) {
      setIsSidebarOpen(false);
    }
    drawerTouchStartXRef.current = null;
    drawerTouchStartYRef.current = null;
  };

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

  const { data: cachedSidebar } = useSidebarNavigationQuery({
    role: effectiveRole,
    rbacConfig,
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

  const roleCategories = cachedSidebar?.categories || getRoleSidebarCategories(effectiveRole);

  const filteredCategories = roleCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.name.toLowerCase().includes(navFilter.trim().toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  const portalTitle = cachedSidebar?.portalTitle || getRolePortalTitle(effectiveRole);

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
    <div className="flex h-dvh lg:h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile Slide-Out Drawer Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden',
          isSidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Responsive Slide-Out Drawer (Mobile) & Persistent Sidebar (Desktop) */}
      <aside
        id="workspace-sidebar-drawer"
        aria-label="Unified Workspace Sidebar Navigation"
        onTouchStart={handleDrawerTouchStart}
        onTouchEnd={handleDrawerTouchEnd}
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:z-auto w-[min(85vw,18rem)] lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 shrink-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between h-16 px-4 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <Link
              to={baseDashboardPath}
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2.5 group min-w-0"
            >
              <img
                src={settings?.logoUrl || '/logo.png'}
                alt="Sricore Solutions Logo"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                  SRICORE
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase truncate">
                  {portalTitle}
                </span>
              </div>
            </Link>
            <button
              type="button"
              aria-label="Close navigation drawer"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => {
                setIsSidebarOpen(false);
                mobileMenuTriggerRef.current?.focus();
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Module Filter Input */}
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={navFilter}
                onChange={(e) => setNavFilter(e.target.value)}
                placeholder="Filter menu items..."
                aria-label="Filter navigation modules"
                className="w-full pl-8 pr-3 py-2 lg:py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Role-Based Categorized Navigation Links */}
          <nav className="flex-1 overflow-y-auto overscroll-contain py-3 px-3 space-y-5">
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
                        onMouseEnter={() =>
                          prefetchSidebarTarget({
                            path: item.path,
                            tab: item.tab,
                            effectiveRole,
                            userProfile: userProfile as any,
                          })
                        }
                        onFocus={() =>
                          prefetchSidebarTarget({
                            path: item.path,
                            tab: item.tab,
                            effectiveRole,
                            userProfile: userProfile as any,
                          })
                        }
                        className={cn(
                          'group flex items-center gap-2.5 px-2.5 py-2 lg:py-1.5 min-h-[42px] lg:min-h-0 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
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

          {/* Sidebar Footer: Admin Role Simulator (if Admin), Quick Site Link, Theme Switch, User Profile & Sign Out */}
          <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
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
                  onMouseEnter={() =>
                    void prefetchSidebarNavigation({
                      roles: [...FIVE_ROLES],
                      rbacConfig,
                      suspended,
                    })
                  }
                  onFocus={() =>
                    void prefetchSidebarNavigation({
                      roles: [...FIVE_ROLES],
                      rbacConfig,
                      suspended,
                    })
                  }
                  onChange={(e) => {
                    const nextRole = e.target.value as CanonicalRole;
                    setSimulatedRole(nextRole === actualRole ? null : nextRole);
                    void prefetchDashboardForRole({
                      role: nextRole,
                      actualRole,
                      userProfile: userProfile as any,
                    });
                  }}
                  className="w-full px-2.5 py-2 lg:py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
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

            <Link
              to="/"
              onClick={() => setIsSidebarOpen(false)}
              className="sm:hidden flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400 transition-colors"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
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
              className="flex w-full items-center gap-3 px-3 py-2 min-h-[40px] text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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
        <header className="flex items-center justify-between gap-2 h-14 px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs z-20 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              ref={mobileMenuTriggerRef}
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation drawer"
              aria-expanded={isSidebarOpen}
              aria-controls="workspace-sidebar-drawer"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 transition-colors cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to={baseDashboardPath}
              className="flex items-center gap-2 lg:hidden min-w-0"
            >
              <img
                src={settings?.logoUrl || '/logo.png'}
                alt="Sricore Logo"
                className="h-7 w-auto object-contain shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase truncate">
                  {portalTitle}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize truncate">
                  {activeBreadcrumb}
                </span>
              </div>
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

          {/* Desktop Global Search (when in Admin mode) */}
          {effectiveRole === 'ADMIN' && (
            <div className="hidden md:flex flex-1 justify-center px-4 max-w-xl">
              <Suspense
                fallback={<div className="w-full h-9 rounded-lg skeleton-shimmer" />}
              >
                <AdminGlobalSearch />
              </Suspense>
            </div>
          )}

          {/* Right Header Controls & User-Profile Toggle Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {effectiveRole === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                aria-label={isMobileSearchOpen ? 'Close search bar' : 'Search workspace'}
                aria-expanded={isMobileSearchOpen}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-amber-400 transition-colors cursor-pointer"
              >
                {isMobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            )}

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* User-Profile Toggle Button & Dropdown Menu */}
            <div ref={profileDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
                aria-label="Toggle user profile menu"
                className="inline-flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:border-amber-400 transition-colors cursor-pointer"
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

        {/* Expandable Mobile Global Search Bar (Admin only, keeps 56px header clutter-free) */}
        {effectiveRole === 'ADMIN' && isMobileSearchOpen && (
          <div className="md:hidden px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center">
            <Suspense
              fallback={<div className="w-full h-9 rounded-lg skeleton-shimmer" />}
            >
              <AdminGlobalSearch />
            </Suspense>
          </div>
        )}

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
                <DashboardSuspense variant="panel" moduleName="Profile Editor">
                  <UserProfile />
                </DashboardSuspense>
              </div>
            )}

            {/* Route Content with localized Suspense so the unified sidebar & header stay persistent */}
            {isSimulatingNonAdmin ? (
              <DashboardSuspense variant="page" moduleName="Simulated Role Workspace">
                <UnifiedUserDashboard />
              </DashboardSuspense>
            ) : (
              <DashboardSuspense variant="page" moduleName="Dashboard View">
                {children || <Outlet />}
              </DashboardSuspense>
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
