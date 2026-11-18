import React from 'react';
import { CanonicalRole, ROLE_METADATA } from '../../lib/rbac';
import { cn } from '../../utils/cn';

export const ROLE_GREETINGS: Record<
  CanonicalRole,
  {
    title: string;
    subtitle: string;
  }
> = {
  ADMIN: {
    title: 'Welcome back, Admin',
    subtitle:
      'Workforce operations, project delivery pipelines, and organizational management.',
  },
  MENTOR: {
    title: 'Welcome back, Mentor',
    subtitle:
      'Supervise assigned interns, review project submissions, and guide cohort progress.',
  },
  EMPLOYEE: {
    title: 'Welcome back, Employee',
    subtitle:
      'Execute assigned engineering deliverables, update sprint tasks, and confirm daily attendance.',
  },
  CLIENT: {
    title: 'Welcome back, Client',
    subtitle:
      'Track project milestones, manage technical enquiries, share specifications, and review payments.',
  },
  INTERN_STUDENT: {
    title: 'Welcome back, Intern / Student',
    subtitle:
      'Stay on top of assignments, review mentor feedback, and track applications and certificates.',
  },
};

interface RoleGreetingHeaderProps {
  role: CanonicalRole;
  displayName?: string | null;
  logoUrl?: string;
  isSimulated?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function RoleGreetingHeader({
  role,
  displayName,
  logoUrl,
  isSimulated = false,
  rightSlot,
  className,
}: RoleGreetingHeaderProps) {
  const greeting = ROLE_GREETINGS[role] || ROLE_GREETINGS.CLIENT;
  const roleMeta = ROLE_METADATA[role] || ROLE_METADATA.CLIENT;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors',
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {logoUrl && (
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 hidden sm:block">
            <img
              src={logoUrl}
              alt="Sricore Solutions Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {greeting.title}
            </h1>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {roleMeta.shortLabel}
              {isSimulated ? ' · Role Preview' : ''}
            </span>
          </div>
          {displayName && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Signed in as <strong className="text-slate-700 dark:text-slate-200">{displayName}</strong>
            </p>
          )}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {greeting.subtitle}
          </p>
        </div>
      </div>

      {rightSlot && (
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

export default RoleGreetingHeader;
