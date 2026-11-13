import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { RoleGreetingHeader } from '../../components/dashboard/RoleGreetingHeader';
import {
  DashboardModuleSkeleton,
  DashboardSuspense,
} from '../../components/ui/DashboardSuspense';

// Lazy-load role dashboards and workspace sub-modules so users only download their active chunk
const EmployeeDashboard = React.lazy(() => import('./roles/EmployeeDashboard'));
const MentorDashboard = React.lazy(() => import('./roles/MentorDashboard'));
const InternDashboard = React.lazy(() => import('./roles/InternDashboard'));
const ClientDashboard = React.lazy(() => import('./roles/ClientDashboard'));
const CandidateDashboard = React.lazy(() => import('./roles/CandidateDashboard'));
const UserProfile = React.lazy(() =>
  import('../../components/user/UserProfile').then((m) => ({ default: m.UserProfile }))
);
const MyProjects = React.lazy(() =>
  import('../../components/dashboard/MyProjects').then((m) => ({ default: m.MyProjects }))
);
const WorkspaceGuide = React.lazy(() =>
  import('../../components/dashboard/WorkspaceGuide').then((m) => ({ default: m.WorkspaceGuide }))
);

export default function Dashboard() {
  const { userProfile, currentUser, loading } = useAuth();
  const { activeRole, actualRole, simulatedRole } = useRBAC();
  const { settings } = useWebsiteSettings();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');

  if (loading) {
    return (
      <DashboardModuleSkeleton
        variant="page"
        label="Loading role dashboard..."
      />
    );
  }

  // Redirect true ADMIN to /admin only when not simulating another role
  if (actualRole === 'ADMIN' && !simulatedRole) {
    return <Navigate to="/admin" replace />;
  }

  const displayName =
    userProfile?.firstName || userProfile?.lastName
      ? `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim()
      : currentUser?.email || undefined;

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
      {/* Personalized Role Greeting Header */}
      <RoleGreetingHeader
        role={activeRole}
        displayName={displayName}
        logoUrl={settings?.logoUrl || '/logo.png'}
        isSimulated={Boolean(simulatedRole)}
      />

      {/* Role-Specific Dismissible Quick Start Guide (visible on overview & reopenable anytime) */}
      {(!activeTab || activeTab === 'overview') && (
        <DashboardSuspense variant="panel" moduleName="Quick Start Guide">
          <WorkspaceGuide role={activeRole} />
        </DashboardSuspense>
      )}

      {/* Dedicated Sidebar Views: My Profile or Project Tracker */}
      {activeTab === 'profile' ? (
        <DashboardSuspense variant="panel" moduleName="User Profile">
          <UserProfile />
        </DashboardSuspense>
      ) : activeTab === 'portfolio' ? (
        <DashboardSuspense variant="table" moduleName="Project Tracker">
          <MyProjects />
        </DashboardSuspense>
      ) : (
        <div className="space-y-6">
          <DashboardSuspense variant="page" moduleName="Role Workspace">
            {/* Role-Specific Workspace Module */}
            {renderRoleDashboard()}
          </DashboardSuspense>

          {/* Show Project Tracker summary on Overview for Clients & Employees */}
          {(!activeTab || activeTab === 'overview') &&
            (activeRole === 'CLIENT' || activeRole === 'EMPLOYEE') && (
              <div className="pt-2">
                <DashboardSuspense variant="table" moduleName="Project Tracker">
                  <MyProjects />
                </DashboardSuspense>
              </div>
            )}
        </div>
      )}
    </div>
  );
}