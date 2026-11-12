import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Shield,
  GraduationCap,
  ChevronDown,
  User as UserIcon,
  ExternalLink,
  Search,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { queryClient } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { cn } from '../utils/cn';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile } from './user/UserProfile';
import { UserManagement } from './UserManagement';

export interface AdminDashboardProps {
  children?: React.ReactNode;
}

const ADMIN_NAV_CATEGORIES = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Reports', path: '/admin/reports', icon: FileText },
      { name: 'Audit Logs', path: '/admin/audit', icon: Shield },
    ],
  },
  {
    title: 'Organization',
    items: [
      { name: 'Departments', path: '/admin/departments', icon: Briefcase },
      { name: 'Employees', path: '/admin/employees', icon: Users },
      { name: 'Mentors', path: '/admin/mentors', icon: GraduationCap },
    ],
  },
  {
    title: 'Business Operations',
    items: [
      { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
      { name: 'Clients', path: '/admin/clients', icon: Users },
      { name: 'Projects', path: '/admin/projects', icon: Briefcase },
      { name: 'Payments', path: '/admin/payments', icon: Briefcase },
    ],
  },
  {
    title: 'Internship Program',
    items: [
      { name: 'Programs', path: '/admin/internships', icon: GraduationCap },
      { name: 'Candidates', path: '/admin/candidates', icon: Users },
      { name: 'Interns', path: '/admin/interns', icon: GraduationCap },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Attendance', path: '/admin/attendance', icon: Users },
      { name: 'Leave Requests', path: '/admin/leaves', icon: FileText },
      { name: 'Documents', path: '/admin/documents', icon: FileText },
      { name: 'Vendors', path: '/admin/vendors', icon: Briefcase },
    ],
  },
  {
    title: 'Communication',
    items: [
      { name: 'Announcements', path: '/admin/announcements', icon: MessageSquare },
      { name: 'Notifications', path: '/admin/notifications', icon: MessageSquare },
      { name: 'Website Content', path: '/admin/content', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [{ name: 'Settings', path: '/admin/settings', icon: Settings }],
  },
];

export function AdminDashboardLayout({ children }: AdminDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showUserManagerDrawer, setShowUserManagerDrawer] = useState(false);
  const [navFilter, setNavFilter] = useState('');

  const { userProfile, currentUser } = useAuth();
  const { settings } = useWebsiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

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
      : currentUser?.email || 'Administrator';

  const avatarInitial =
    userProfile?.firstName?.charAt(0)?.toUpperCase() ||
    currentUser?.email?.charAt(0)?.toUpperCase() ||
    'A';

  const filteredCategories = ADMIN_NAV_CATEGORIES.map((category) => ({
    ...category,
    items: category.items.filter((item) =>
      item.name.toLowerCase().includes(navFilter.trim().toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  const currentBreadcrumb =
    location.pathname.replace('/admin', '').replace(/^\//, '').replace(/-/g, ' ') ||
    'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar Navigation */}
      <aside
        aria-label="Administrative Sidebar Navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shrink-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Link to="/admin" className="flex items-center gap-2.5 group">
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
                  Admin Console
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
                placeholder="Filter admin modules..."
                aria-label="Filter administrative navigation modules"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
            {filteredCategories.map((category) => (
              <div key={category.title}>
                <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'w-4 h-4 shrink-0',
                            isActive
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-400 dark:text-slate-500'
                          )}
                        />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer: Theme Switch & User Profile Toggle */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Theme
              </span>
              <ThemeToggle variant="pill" />
            </div>

            <button
              type="button"
              onClick={() => setShowProfileDrawer((prev) => !prev)}
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
                  {userProfile?.role || 'ADMINISTRATOR'}
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

      {/* Main Content Area for Administrative Tasks */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Administrative Header Bar with User-Profile Toggle */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs z-20 transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open administrative sidebar"
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 rounded-md p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/admin" className="flex items-center gap-2 lg:hidden">
              <img
                src={settings?.logoUrl || '/logo.png'}
                alt="Sricore Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                ADMIN
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Link
                to="/admin"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Admin Console
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold capitalize">
                {currentBreadcrumb}
              </span>
            </div>
          </div>

          {/* Right Header Controls & User-Profile Toggle Dropdown */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowUserManagerDrawer((prev) => !prev)}
              aria-expanded={showUserManagerDrawer}
              className={cn(
                'hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer',
                showUserManagerDrawer
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Users</span>
            </button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
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
                aria-label="Toggle administrator profile menu"
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
                  aria-label="Administrator profile options"
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {currentUser?.email}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      {userProfile?.role || 'ADMINISTRATOR'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setShowProfileDrawer((prev) => !prev);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>{showProfileDrawer ? 'Hide Profile Editor' : 'Manage My Profile'}</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setShowUserManagerDrawer((prev) => !prev);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{showUserManagerDrawer ? 'Hide User Management' : 'User Management Panel'}</span>
                    </button>

                    <Link
                      to="/admin/settings"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>System Settings</span>
                    </Link>

                    <Link
                      to="/admin/audit"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Security & Audit Logs</span>
                    </Link>
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
            {/* Expandable Inline Administrator Profile Panel when toggled */}
            {showProfileDrawer && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/60 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Administrator Profile & Account Settings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update your administrator profile details or close this panel to return to your workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProfileDrawer(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    aria-label="Close administrator profile panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <UserProfile />
              </div>
            )}

            {/* Quick-Access User Management Panel when toggled */}
            {showUserManagerDrawer && (
              <div className="space-y-2">
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowUserManagerDrawer(false)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close User Management Panel</span>
                  </button>
                </div>
                <UserManagement />
              </div>
            )}

            {/* Administrative Route Content */}
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

export { AdminDashboardLayout as AdminDashboard, AdminDashboardLayout as AdminLayout };
export default AdminDashboardLayout;
