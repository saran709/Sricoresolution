import React, { Suspense } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { UserProfile } from '../../components/user/UserProfile';
import { MyProjects } from '../../components/dashboard/MyProjects';
import { ROLE_METADATA } from '../../lib/rbac';

// Lazy-load role dashboards so users only download their active role chunk
const EmployeeDashboard = React.lazy(() => import('./roles/EmployeeDashboard'));
const MentorDashboard = React.lazy(() => import('./roles/MentorDashboard'));
const InternDashboard = React.lazy(() => import('./roles/InternDashboard'));
const ClientDashboard = React.lazy(() => import('./roles/ClientDashboard'));
const CandidateDashboard = React.lazy(() => import('./roles/CandidateDashboard'));

export default function Dashboard() {
  const { userProfile, currentUser, loading } = useAuth();
  const { activeRole, actualRole, simulatedRole } = useRBAC();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect true ADMIN to /admin only when not simulating another role
  if (actualRole === 'ADMIN' && !simulatedRole) {
    return <Navigate to="/admin" replace />;
  }

  const renderRoleDashboard = () => {
    switch (activeRole) {
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      case 'MENTOR':
        return <MentorDashboard />;
      case 'INTERN_STUDENT':
        if (
          activeTab === 'applications' ||
          activeTab === 'documents' ||
          activeTab === 'notifications'
        ) {
          return <CandidateDashboard />;
        }
        return <InternDashboard />;
      case 'CLIENT':
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userProfile?.firstName || currentUser?.email}
          </h1>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {ROLE_METADATA[activeRole].label}
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
          {ROLE_METADATA[activeRole].description}
        </p>
      </div>

      {/* Dedicated Sidebar Views: My Profile or Project Tracker */}
      {activeTab === 'profile' ? (
        <UserProfile />
      ) : activeTab === 'portfolio' ? (
        <MyProjects />
      ) : (
        <Suspense
          fallback={
            <div className="animate-pulse h-40 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />
          }
        >
          {/* Role-Specific Workspace Module */}
          {renderRoleDashboard()}

          {/* Show Project Tracker summary on Overview for Clients & Employees */}
          {(!activeTab || activeTab === 'overview') &&
            (activeRole === 'CLIENT' || activeRole === 'EMPLOYEE') && (
              <div className="pt-2">
                <MyProjects />
              </div>
            )}
        </Suspense>
      )}
    </div>
  );
}