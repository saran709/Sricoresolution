import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  FileText,
  CreditCard,
  FolderOpen,
  CheckSquare,
  Calendar,
  GraduationCap,
  ClipboardList,
  Target,
  FileBadge,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Send,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { queryClient } from '../../lib/queryClient';
import { useAuth } from '../../contexts/AuthContext';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { cn } from '../../utils/cn';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarItem {
  name: string;
  tab?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarCategory {
  title: string;
  items: SidebarItem[];
}

function getRolePortalTitle(role?: string): string {
  switch (role) {
    case 'EMPLOYEE':
      return 'Employee Portal';
    case 'MENTOR':
      return 'Mentor Portal';
    case 'INTERN':
      return 'Intern Portal';
    case 'CLIENT':
    case 'EMPLOYER':
      return 'Client Portal';
    case 'CANDIDATE':
      return 'Candidate Portal';
    default:
      return 'User Workspace';
  }
}

function getRoleSidebarCategories(role?: string): SidebarCategory[] {
  switch (role) {
    case 'EMPLOYEE':
      return [
        {
          title: 'Overview & Delivery',
          items: [
            { name: 'Dashboard', tab: 'overview', icon: LayoutDashboard },
            { name: 'My Tasks', tab: 'tasks', icon: CheckSquare },
            { name: 'Assigned Projects', tab: 'projects', icon: Briefcase },
            { name: 'Project Workspace', tab: 'portfolio', icon: FolderOpen },
          ],
        },
        {
          title: 'HR & Operations',
          items: [
            { name: 'Attendance & Leave', tab: 'attendance', icon: Calendar },
          ],
        },
        {
          title: 'Account',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserIcon },
          ],
        },
      ];

    case 'MENTOR':
      return [
        {
          title: 'Mentorship & Cohorts',
          items: [
            { name: 'Dashboard', tab: 'overview', icon: LayoutDashboard },
            { name: 'Intern Management', tab: 'interns', icon: GraduationCap },
            { name: 'Pending Evaluations', tab: 'evaluations', icon: ClipboardList },
          ],
        },
        {
          title: 'Account',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserIcon },
          ],
        },
      ];

    case 'INTERN':
      return [
        {
          title: 'Training & Deliverables',
          items: [
            { name: 'Dashboard', tab: 'overview', icon: LayoutDashboard },
            { name: 'My Assignments', tab: 'assignments', icon: Target },
            { name: 'Feedback & Evals', tab: 'feedback', icon: MessageSquare },
            { name: 'Certificates', tab: 'certificates', icon: FileBadge },
          ],
        },
        {
          title: 'Account',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserIcon },
          ],
        },
      ];

    case 'CANDIDATE':
      return [
        {
          title: 'Applications & Status',
          items: [
            { name: 'My Applications', tab: 'applications', icon: FileText },
            { name: 'Resume & Documents', tab: 'documents', icon: FolderOpen },
            { name: 'Notifications', tab: 'notifications', icon: Bell },
          ],
        },
        {
          title: 'Account & Programs',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserIcon },
            { name: 'Browse Internships', href: '/internships', icon: GraduationCap },
          ],
        },
      ];

    case 'CLIENT':
    case 'EMPLOYER':
    default:
      return [
        {
          title: 'Workspace Overview',
          items: [
            { name: 'Dashboard', tab: 'overview', icon: LayoutDashboard },
            { name: 'My Projects', tab: 'projects', icon: Briefcase },
            { name: 'Project Tracker', tab: 'portfolio', icon: FolderOpen },
          ],
        },
        {
          title: 'Operations & Billing',
          items: [
            { name: 'Enquiries & Quotes', tab: 'enquiries', icon: MessageSquare },
            { name: 'Payments & Proofs', tab: 'payments', icon: CreditCard },
            { name: 'Project Documents', tab: 'documents', icon: FileText },
          ],
        },
        {
          title: 'Account & Support',
          items: [
            { name: 'My Profile', tab: 'profile', icon: UserIcon },
            { name: 'New Project Enquiry', href: '/enquiry', icon: Send },
          ],
        },
      ];
  }
}

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userProfile, currentUser } = useAuth();
  const { settings } = useWebsiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mainRef = React.useRef<HTMLElement | null>(null);

  const role = userProfile?.role;
  const portalTitle = getRolePortalTitle(role);
  const navCategories = getRoleSidebarCategories(role);

  const defaultTab = role === 'CANDIDATE' ? 'applications' : 'overview';
  const currentTab = searchParams.get('tab') || defaultTab;

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setIsSidebarOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    try {
      queryClient.clear();
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const activeItemName =
    navCategories
      .flatMap((cat) => cat.items)
      .find((item) => item.tab === currentTab)?.name || 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (matching AdminLayout) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Link to="/" className="flex items-center gap-2.5 group">
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
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categorized Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navCategories.map((category) => (
              <div key={category.title}>
                <h3 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = item.tab ? currentTab === item.tab : false;
                    const targetHref = item.href
                      ? item.href
                      : `/dashboard?tab=${item.tab}`;

                    return (
                      <Link
                        key={item.name}
                        to={targetHref}
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
          </div>

          {/* Sidebar Footer: Theme Switcher, User Card & Sign Out */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Theme
              </span>
              <ThemeToggle variant="pill" />
            </div>

            <Link
              to="/dashboard?tab=profile"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {userProfile?.firstName?.charAt(0) ||
                  currentUser?.email?.charAt(0)?.toUpperCase() ||
                  'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {userProfile?.firstName || userProfile?.lastName
                    ? `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim()
                    : currentUser?.email || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {userProfile?.role || 'MEMBER'}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Workspace Header */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs z-10 transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar navigation"
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 rounded-md p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 lg:hidden">
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
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Link
                to="/dashboard"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {portalTitle}
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {activeItemName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              View Live Site
            </Link>
            <ThemeToggle />
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/50">
              {userProfile?.role || 'USER'}
            </span>
          </div>
        </header>

        {/* Scrollable Workspace Viewport */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/40 p-3 sm:p-4 lg:p-6 transition-colors"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
