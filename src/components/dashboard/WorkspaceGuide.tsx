import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  X,
  ArrowRight,
  LifeBuoy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CanonicalRole, ROLE_METADATA } from '../../lib/rbac';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { cn } from '../../utils/cn';

interface WorkflowStep {
  step: string;
  title: string;
  summary: string;
  actionLabel: string;
  href: string;
}

const ROLE_WORKFLOW_STEPS: Record<CanonicalRole, WorkflowStep[]> = {
  ADMIN: [
    {
      step: '01',
      title: 'Manage Users & Role Access',
      summary:
        'Activate staff or mentor accounts, assign departments, and verify 5-role permissions before onboarding team members.',
      actionLabel: 'Open Users',
      href: '/admin/users',
    },
    {
      step: '02',
      title: 'Configure Permissions & Limits',
      summary:
        'Control create, edit, upload, download, and approval rules dynamically per role or resource.',
      actionLabel: 'Configure RBAC',
      href: '/admin/permissions',
    },
    {
      step: '03',
      title: 'Track Projects, Enquiries & Interns',
      summary:
        'Convert incoming client quotes into projects, verify payments, and review internship applications.',
      actionLabel: 'View Enquiries',
      href: '/admin/enquiries',
    },
  ],
  CLIENT: [
    {
      step: '01',
      title: 'Submit or Track Enquiries',
      summary:
        'Start a new software, hardware/IoT, or AI quote request and monitor status from review to proposal.',
      actionLabel: 'Open Enquiries',
      href: '/dashboard?tab=enquiries',
    },
    {
      step: '02',
      title: 'Monitor Active Projects',
      summary:
        'Check your project stage, milestones, assigned timeline, and delivery updates in one place.',
      actionLabel: 'View Projects',
      href: '/dashboard?tab=projects',
    },
    {
      step: '03',
      title: 'Share Documents & Payments',
      summary:
        'Upload requirement specs or download deliverables, and submit milestone payment proofs securely.',
      actionLabel: 'Open Documents',
      href: '/dashboard?tab=documents',
    },
  ],
  EMPLOYEE: [
    {
      step: '01',
      title: 'Confirm Daily Attendance',
      summary:
        'Dashboard visits between 9:00 AM and 4:00 PM auto-check-in once daily; outside that window use Check In Today.',
      actionLabel: 'Attendance & Leave',
      href: '/dashboard?tab=attendance',
    },
    {
      step: '02',
      title: 'Update Assigned Tasks',
      summary:
        'Move tasks across To Do, In Progress, Review, Blocked, and Completed so project leads see real-time progress.',
      actionLabel: 'Open My Tasks',
      href: '/dashboard?tab=tasks',
    },
    {
      step: '03',
      title: 'Check Project Deliverables',
      summary:
        'Review assigned commercial or R&D projects, deadlines, and current delivery stages.',
      actionLabel: 'View Projects',
      href: '/dashboard?tab=projects',
    },
  ],
  MENTOR: [
    {
      step: '01',
      title: 'Review Assigned Interns',
      summary:
        'Select any intern assigned to your mentorship cohort to inspect their active tasks and progress.',
      actionLabel: 'Manage Interns',
      href: '/dashboard?tab=interns',
    },
    {
      step: '02',
      title: 'Assign Practical Tasks',
      summary:
        'Create structured learning milestones with clear instructions so interns know what to build and submit.',
      actionLabel: 'Assign Tasks',
      href: '/dashboard?tab=interns',
    },
    {
      step: '03',
      title: 'Evaluate & Give Feedback',
      summary:
        'Approve completed work or send tasks back for revision with actionable technical feedback.',
      actionLabel: 'Pending Reviews',
      href: '/dashboard?tab=evaluations',
    },
  ],
  INTERN_STUDENT: [
    {
      step: '01',
      title: 'Check Mentor & Program Details',
      summary:
        'Confirm your assigned technical mentor, active internship track, and program schedule on Overview.',
      actionLabel: 'Open Assignments',
      href: '/dashboard?tab=assignments',
    },
    {
      step: '02',
      title: 'Submit Work for Review',
      summary:
        'Open any assigned task and click Submit Assignment with your summary notes, repository, or report links.',
      actionLabel: 'View Feedback',
      href: '/dashboard?tab=feedback',
    },
    {
      step: '03',
      title: 'Track Applications & Resume',
      summary:
        'Upload your resume/documents, check notifications, or apply for open industrial cohorts.',
      actionLabel: 'My Applications',
      href: '/dashboard?tab=applications',
    },
  ],
};

interface WorkspaceGuideProps {
  role: CanonicalRole;
  className?: string;
  compactHeaderAction?: boolean;
}

export function WorkspaceGuide({
  role,
  className,
}: WorkspaceGuideProps) {
  const { settings } = useWebsiteSettings();
  const storageKey = `sricore_guide_dismissed_${role}`;

  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(storageKey) === 'true');
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {}
  };

  const handleReopen = () => {
    setDismissed(false);
    setExpanded(true);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  const supportEmail = settings?.contact?.primaryEmail || 'contact@sricoresolutions.com';
  const steps = ROLE_WORKFLOW_STEPS[role] || ROLE_WORKFLOW_STEPS.CLIENT;
  const meta = ROLE_METADATA[role];

  if (dismissed) {
    return (
      <div className={cn('flex items-center justify-end', className)}>
        <button
          type="button"
          onClick={handleReopen}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Show Workspace Guide</span>
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label={`${meta.shortLabel} Quick Start Guide`}
      className={cn(
        'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors',
        className
      )}
    >
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Quick Start Guide · {meta.shortLabel} Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Follow these three steps or use the left sidebar anytime to switch sections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            aria-expanded={expanded}
          >
            <span>{expanded ? 'Minimize' : 'Expand'}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Hide workspace guide"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-2 py-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hide</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div>
                  <Link
                    to={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Need role adjustments or technical help? Email{' '}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-semibold text-slate-700 dark:text-slate-200 hover:underline"
                >
                  {supportEmail}
                </a>{' '}
                or use{' '}
                <Link
                  to="/contact"
                  className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Contact Support
                </Link>
                .
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              You can reopen this guide anytime.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default WorkspaceGuide;
