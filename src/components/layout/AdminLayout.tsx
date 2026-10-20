import React, { useState } from 'react';
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
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../../utils/cn';
import { ThemeToggle } from '../ui/ThemeToggle';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userProfile } = useAuth();
  const { settings } = useWebsiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = React.useRef<HTMLElement | null>(null);

  // Scroll to top of main container whenever admin route changes or redirects
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setIsSidebarOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navCategories = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Reports', path: '/admin/reports', icon: FileText },
        { name: 'Audit Logs', path: '/admin/audit', icon: Shield },
      ]
    },
    {
      title: 'Organization',
      items: [
        { name: 'Departments', path: '/admin/departments', icon: Briefcase },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Mentors', path: '/admin/mentors', icon: GraduationCap },
      ]
    },
    {
      title: 'Business Operations',
      items: [
        { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
        { name: 'Clients', path: '/admin/clients', icon: Users },
        { name: 'Projects', path: '/admin/projects', icon: Briefcase },
        { name: 'Support Tickets', path: '/admin/support', icon: MessageSquare },
        { name: 'Payments', path: '/admin/payments', icon: Briefcase },
        { name: 'Invoices', path: '/admin/invoices', icon: FileText },
      ]
    },
    {
      title: 'Internship Program',
      items: [
        { name: 'Programs', path: '/admin/internships', icon: GraduationCap },
        { name: 'Candidates', path: '/admin/candidates', icon: Users },
        { name: 'Interns', path: '/admin/interns', icon: GraduationCap },
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Attendance', path: '/admin/attendance', icon: Users },
        { name: 'Leave Requests', path: '/admin/leaves', icon: FileText },
        { name: 'Documents', path: '/admin/documents', icon: FileText },
        { name: 'Vendors', path: '/admin/vendors', icon: Briefcase },
      ]
    },
    {
      title: 'Communication',
      items: [
        { name: 'Announcements', path: '/admin/announcements', icon: MessageSquare },
        { name: 'Notifications', path: '/admin/notifications', icon: MessageSquare },
        { name: 'Website Content', path: '/admin/content', icon: FileText },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img 
                src={settings?.logoUrl || "/logo.png"} 
                alt="CSRi Sricore Solutions Logo" 
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105" 
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">SRICORE</span>
                <span className="text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">Admin Portal</span>
              </div>
            </Link>
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navCategories.map((category) => (
              <div key={category.title}>
                <h3 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            {/* Theme Toggle row in sidebar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
              <ThemeToggle variant="pill" />
            </div>

            <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                {userProfile?.firstName?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {userProfile?.firstName} {userProfile?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs z-10 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 rounded-md p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <img 
                src={settings?.logoUrl || "/logo.png"} 
                alt="CSRi Logo" 
                className="h-8 w-auto object-contain" 
              />
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">ADMIN</span>
            </Link>
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Link to="/admin" className="hover:text-slate-900 dark:hover:text-white transition-colors">Admin</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold capitalize">
                {location.pathname.replace('/admin', '').replace('/', '') || 'Dashboard'}
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800/50">
              {userProfile?.role || 'Admin'}
            </span>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/40 p-3 sm:p-4 lg:p-6 transition-colors">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
