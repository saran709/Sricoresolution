import React from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { User as UserIcon, FolderOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { UserProfile } from '../../components/user/UserProfile';
import { MyProjects } from '../../components/dashboard/MyProjects';

// Import role dashboards
import EmployeeDashboard from './roles/EmployeeDashboard';
import MentorDashboard from './roles/MentorDashboard';
import InternDashboard from './roles/InternDashboard';
import ClientDashboard from './roles/ClientDashboard';
import CandidateDashboard from './roles/CandidateDashboard';

export default function Dashboard() {
  const { userProfile, currentUser, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (userProfile?.role === 'ADMINISTRATOR') {
    return <Navigate to="/admin" replace />;
  }

  const renderRoleDashboard = () => {
    switch (userProfile?.role) {
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      case 'MENTOR':
        return <MentorDashboard />;
      case 'INTERN':
        return <InternDashboard />;
      case 'CLIENT':
      case 'EMPLOYER':
        return <ClientDashboard />;
      case 'CANDIDATE':
        return <CandidateDashboard />;
      default:
        return (
          <div className="p-6 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
            <p className="font-semibold">Your account role is not fully configured or recognized.</p>
            <p className="text-sm mt-1">Please contact Sricore Solutions support for role assignment.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userProfile?.firstName || currentUser?.email}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">
            Manage your projects, tasks, documents, and account settings from your workspace portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(userProfile?.role === 'CLIENT' ||
            userProfile?.role === 'EMPLOYER' ||
            userProfile?.role === 'EMPLOYEE') && (
            <Link
              to="/dashboard?tab=portfolio"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Project Tracker</span>
            </Link>
          )}
          <Link
            to="/dashboard?tab=profile"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              activeTab === 'profile'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </Link>
        </div>
      </div>

      {/* Dedicated Sidebar Views: My Profile or Project Tracker */}
      {activeTab === 'profile' ? (
        <UserProfile />
      ) : activeTab === 'portfolio' ? (
        <MyProjects />
      ) : (
        <>
          {/* Role-Specific Workspace Module */}
          {renderRoleDashboard()}

          {/* Show Project Tracker summary on Overview for Clients & Employees */}
          {(!activeTab || activeTab === 'overview') &&
            (userProfile?.role === 'CLIENT' ||
              userProfile?.role === 'EMPLOYER' ||
              userProfile?.role === 'EMPLOYEE') && (
              <div className="pt-2">
                <MyProjects />
              </div>
            )}
        </>
      )}
    </div>
  );
}