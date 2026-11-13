import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ArrowRight, LifeBuoy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { ROLE_METADATA } from '../../lib/rbac';

export default function Unauthorized() {
  const { currentUser } = useAuth();
  const { activeRole, actualRole } = useRBAC();
  const primaryPortalPath = actualRole === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
      <Container>
        <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-5">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              This Page Requires Different Permissions
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your current workspace role does not include access to that section. You can return
              to your own dashboard below or ask an Administrator to adjust your role access.
            </p>
          </div>

          {currentUser && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1">
              <p className="text-slate-500 dark:text-slate-400">
                Signed in as:{' '}
                <strong className="text-slate-900 dark:text-white">{currentUser.email}</strong>
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Current Active Role:{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {ROLE_METADATA[activeRole].label}
                </strong>
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to={currentUser ? primaryPortalPath : '/login'}>
              <Button className="inline-flex items-center gap-2">
                <span>{currentUser ? 'Go to My Workspace' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="inline-flex items-center gap-2">
                <LifeBuoy className="w-4 h-4" />
                <span>Contact Support</span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
