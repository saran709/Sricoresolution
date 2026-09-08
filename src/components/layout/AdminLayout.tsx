import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, MessageSquare, 
  Settings, LogOut, Menu, X, FileText, Shield, 
  GraduationCap, Building2, UserPlus, BookOpen, 
  CheckSquare, CreditCard, Receipt, Clock, CalendarDays, 
  ShoppingCart, Bell, LayoutTemplate, Activity, FolderKanban, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../../utils/cn';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navCategories = [
    {
      title: 'Dashboard',
      items: [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Organization',
      items: [
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Departments', path: '/admin/departments', icon: Building2 },
        { name: 'Mentors', path: '/admin/mentors', icon: BookOpen },
        { name: 'Interns', path: '/admin/interns', icon: GraduationCap },
        { name: 'Candidates', path: '/admin/candidates', icon: UserPlus },
        { name: 'Clients', path: '/admin/clients', icon: Building2 },
      ]
    },
    {
      title: 'Projects & Work',
      items: [
        { name: 'Projects', path: '/admin/projects', icon: Briefcase },
        { name: 'Internships', path: '/admin/internships', icon: BookOpen },
        { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
        { name: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Payments', path: '/admin/finance/payments', icon: CreditCard },
        { name: 'Invoices', path: '/admin/finance/invoices', icon: Receipt },
        { name: 'Receipts', path: '/admin/finance/receipts', icon: FileText },
        { name: 'Refunds', path: '/admin/finance/refunds', icon: CreditCard },
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Documents', path: '/admin/documents', icon: FolderKanban },
        { name: 'Attendance', path: '/admin/attendance', icon: Clock },
        { name: 'Leave', path: '/admin/leave', icon: CalendarDays },
        { name: 'Vendors', path: '/admin/vendors', icon: ShoppingCart },
      ]
    },
    {
      title: 'Communication',
      items: [
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
        { name: 'Newsletters', path: '/admin/newsletters', icon: MessageSquare },
        { name: 'Website Content', path: '/admin/website', icon: LayoutTemplate },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: Activity },
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
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white rotate-45"></div>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">ADMIN</span>
            </Link>
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-900"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navCategories.map((category) => (
              <div key={category.title}>
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                            ? "bg-amber-50 text-amber-700" 
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", isActive ? "text-amber-700" : "text-slate-400")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                {userProfile?.firstName?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {userProfile?.firstName} {userProfile?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{userProfile?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white shadow-sm z-10 lg:hidden shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 rounded-md p-2 -ml-2"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 ml-4 flex justify-end">
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
