import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export interface PrivateRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles,
  requireAdmin = false,
  redirectTo = '/login',
}) => {
  const { currentUser, userProfile, loading, profileLoading } = useAuth();
  const location = useLocation();

  const effectiveRoles: UserRole[] | undefined = requireAdmin
    ? ['ADMINISTRATOR']
    : allowedRoles;

  if (loading || (effectiveRoles && effectiveRoles.length > 0 && profileLoading)) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-600 border-t-transparent" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Verifying Workspace Credentials...
        </span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (effectiveRoles && effectiveRoles.length > 0) {
    if (!userProfile || !effectiveRoles.includes(userProfile.role)) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export const AdminPrivateRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PrivateRoute requireAdmin allowedRoles={['ADMINISTRATOR']}>
      {children}
    </PrivateRoute>
  );
};

export { PrivateRoute as ProtectedRoute };
export default PrivateRoute;
