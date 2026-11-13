import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../contexts/RBACContext';
import { UserRole } from '../types';
import { normalizeToCanonicalRole } from '../lib/rbac';
import { prefetchDashboardForRole } from '../hooks/useDashboardQueries';

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
  const { suspended, expired, limits } = useRBAC();
  const location = useLocation();

  const effectiveRoles: UserRole[] | undefined = requireAdmin
    ? ['ADMIN', 'ADMINISTRATOR']
    : allowedRoles;

  const userCanonical = normalizeToCanonicalRole(userProfile?.role);
  const canPrefetch = Boolean(
    currentUser?.uid && userProfile && (userCanonical === 'ADMIN' || (!suspended && !expired))
  );

  // Warm TanStack Query cache for RBAC, sidebar config, and role data while lazy child chunks resolve
  useEffect(() => {
    if (!canPrefetch) return;
    void prefetchDashboardForRole({
      role: userCanonical,
      actualRole: userCanonical,
      userProfile: userProfile as any,
    });
  }, [canPrefetch, userCanonical, userProfile]);

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

  // Block suspended accounts or expired access dates (except ADMIN)
  if (userCanonical !== 'ADMIN' && (suspended || expired)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/70 rounded-2xl p-6 shadow-xl text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            {suspended ? <ShieldAlert className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {suspended ? 'Account Suspended' : 'Workspace Access Expired'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {suspended
              ? 'Your account has been suspended by a Sricore Solutions Administrator. Any open sessions are restricted.'
              : `Your workspace access period expired on ${limits.accessExpirationDate}. Please contact an Administrator to renew access.`}
          </p>
        </div>
      </div>
    );
  }

  if (effectiveRoles && effectiveRoles.length > 0) {
    const allowedCanonicalSet = new Set(
      effectiveRoles.map((r) => normalizeToCanonicalRole(r))
    );
    if (!userProfile || !allowedCanonicalSet.has(userCanonical)) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export const AdminPrivateRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PrivateRoute requireAdmin allowedRoles={['ADMIN', 'ADMINISTRATOR']}>
      {children}
    </PrivateRoute>
  );
};

export { PrivateRoute as ProtectedRoute };
export default PrivateRoute;
