import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  ShieldCheck,
  Briefcase,
  Users,
  FileCheck2,
  ClipboardCheck,
  GraduationCap,
  Layers,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CanonicalRole, ROLE_METADATA } from '../../lib/rbac';
import {
  useAdminOverview,
  useClientDashboard,
  useEmployeeDashboard,
  useMentorDashboard,
  useInternDashboard,
  prefetchSidebarTarget,
  invalidateAdminCaches,
} from '../../hooks/useDashboardQueries';
import { queryClient } from '../../lib/queryClient';

export interface ProcessStage {
  stageNumber: string;
  title: string;
  sopCode: string;
  description: string;
  metricLabel: string;
  metricValue: number | string;
  status: 'completed' | 'active' | 'pending';
  actionLabel: string;
  href: string;
  preloadPath?: string;
  preloadTab?: string;
}

interface StructuredOperationsPipelineProps {
  role: CanonicalRole;
  className?: string;
}

export function StructuredOperationsPipeline({
  role,
  className = '',
}: StructuredOperationsPipelineProps) {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const uid = userProfile?.uid || currentUser?.uid;

  // Read from cached queries (enabled only for the matching active role so zero extra network requests occur)
  const { data: adminData } = useAdminOverview(role === 'ADMIN' && Boolean(uid));
  const { data: employeeData } = useEmployeeDashboard(
    role === 'EMPLOYEE' ? uid : undefined
  );
  const { data: mentorData } = useMentorDashboard(
    role === 'MENTOR' ? uid : undefined
  );
  const { data: internData } = useInternDashboard(
    role === 'INTERN_STUDENT' ? (userProfile as any) : null
  );
  const { data: clientData } = useClientDashboard(
    role === 'CLIENT' ? uid : undefined
  );

  const stages = useMemo<ProcessStage[]>(() => {
    switch (role) {
      case 'ADMIN': {
        const stats = adminData?.stats;
        const pendingEnq = stats?.pendingEnquiries ?? 0;
        const activeProj = stats?.activeProjects ?? 0;
        const activeStaff = stats?.activeEmployees ?? 0;
        const internApps = stats?.internApplications ?? 0;
        const pendingPay = stats?.pendingPayments ?? 0;

        return [
          {
            stageNumber: '01',
            title: 'Intake & Enquiry Triage',
            sopCode: 'SOP-OPS-01',
            description:
              'Review incoming client RFPs and technical inquiries, verify scope feasibility, and convert into active projects.',
            metricLabel: 'Pending Enquiries',
            metricValue: pendingEnq,
            status: pendingEnq > 0 ? 'active' : 'completed',
            actionLabel: 'Triage Enquiries',
            href: '/admin/enquiries',
            preloadPath: '/admin/enquiries',
          },
          {
            stageNumber: '02',
            title: 'Workforce & Role Allocation',
            sopCode: 'SOP-HR-02',
            description:
              'Assign verified engineers and mentors across departments with granular 5-role RBAC permissions.',
            metricLabel: 'Active Engineers',
            metricValue: activeStaff,
            status: activeStaff > 0 ? 'completed' : 'active',
            actionLabel: 'Manage Staff',
            href: '/admin/employees',
            preloadPath: '/admin/employees',
          },
          {
            stageNumber: '03',
            title: 'Project & Sprint Execution',
            sopCode: 'SOP-ENG-03',
            description:
              'Track software, hardware/IoT, and AI project milestones, sprint velocity, and task deliverables.',
            metricLabel: 'Active Projects',
            metricValue: activeProj,
            status: activeProj > 0 ? 'active' : 'pending',
            actionLabel: 'Open Projects',
            href: '/admin/projects',
            preloadPath: '/admin/projects',
          },
          {
            stageNumber: '04',
            title: 'Cohort & Talent Pipeline',
            sopCode: 'SOP-ACA-04',
            description:
              'Evaluate candidate applications, assign technical mentors, and monitor industrial internship cohorts.',
            metricLabel: 'Open Applications',
            metricValue: internApps,
            status: internApps > 0 ? 'active' : 'completed',
            actionLabel: 'Review Cohorts',
            href: '/admin/internships',
            preloadPath: '/admin/internships',
          },
          {
            stageNumber: '05',
            title: 'Finance & Audit Governance',
            sopCode: 'SOP-FIN-05',
            description:
              'Verify milestone invoices, reconcile Razorpay settlements, and inspect immutable system audit logs.',
            metricLabel: 'Pending Invoices',
            metricValue: pendingPay,
            status: pendingPay > 0 ? 'active' : 'completed',
            actionLabel: 'Verify Payments',
            href: '/admin/payments',
            preloadPath: '/admin/payments',
          },
        ];
      }

      case 'EMPLOYEE': {
        const todayStr = new Date().toISOString().slice(0, 10);
        const checkedInToday = (employeeData?.attendances || []).some((a) => {
          const d =
            typeof a.date === 'string'
              ? a.date.slice(0, 10)
              : a.date?.toDate
                ? a.date.toDate().toISOString().slice(0, 10)
                : '';
          return d === todayStr;
        });
        const tasks = employeeData?.tasks || [];
        const inProgressCount = tasks.filter(
          (t) => t.status === 'IN_PROGRESS' || t.status === 'TODO'
        ).length;
        const reviewCount = tasks.filter((t) => t.status === 'REVIEW').length;
        const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
        const activeProjectsCount = (employeeData?.projects || []).length;

        return [
          {
            stageNumber: '01',
            title: 'Daily Attendance & Readiness',
            sopCode: 'SOP-EMP-01',
            description:
              'Log daily shift check-in and review department announcements before starting sprint tasks.',
            metricLabel: 'Today Status',
            metricValue: checkedInToday ? 'Checked In' : 'Pending',
            status: checkedInToday ? 'completed' : 'active',
            actionLabel: 'Attendance Log',
            href: '/dashboard?tab=attendance',
            preloadTab: 'attendance',
          },
          {
            stageNumber: '02',
            title: 'Project Architecture Alignment',
            sopCode: 'SOP-EMP-02',
            description:
              'Inspect assigned commercial and R&D projects, technical specifications, and target milestone dates.',
            metricLabel: 'Assigned Projects',
            metricValue: activeProjectsCount,
            status: activeProjectsCount > 0 ? 'completed' : 'pending',
            actionLabel: 'View Projects',
            href: '/dashboard?tab=projects',
            preloadTab: 'projects',
          },
          {
            stageNumber: '03',
            title: 'Active Sprint Development',
            sopCode: 'SOP-EMP-03',
            description:
              'Execute assigned software, PCB/firmware, or AI tasks and transition status from To Do to In Progress.',
            metricLabel: 'Active Tasks',
            metricValue: inProgressCount,
            status: inProgressCount > 0 ? 'active' : 'completed',
            actionLabel: 'Open Sprint Board',
            href: '/dashboard?tab=tasks',
            preloadTab: 'tasks',
          },
          {
            stageNumber: '04',
            title: 'Peer QA & Code Review',
            sopCode: 'SOP-EMP-04',
            description:
              'Submit completed modules for quality assurance, hardware bench verification, and lead review.',
            metricLabel: 'In Review',
            metricValue: reviewCount,
            status: reviewCount > 0 ? 'active' : 'completed',
            actionLabel: 'Review Queue',
            href: '/dashboard?tab=tasks',
            preloadTab: 'tasks',
          },
          {
            stageNumber: '05',
            title: 'Milestone Handover & Closure',
            sopCode: 'SOP-EMP-05',
            description:
              'Archive verified engineering artifacts and track completed sprint deliverables across your portfolio.',
            metricLabel: 'Completed Tasks',
            metricValue: completedCount,
            status: completedCount > 0 ? 'completed' : 'pending',
            actionLabel: 'Project Tracker',
            href: '/dashboard?tab=portfolio',
            preloadTab: 'portfolio',
          },
        ];
      }

      case 'MENTOR': {
        const interns = mentorData?.interns || [];
        const tasks = mentorData?.tasks || [];
        const reviewTasks = tasks.filter((t) => t.status === 'REVIEW').length;
        const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

        return [
          {
            stageNumber: '01',
            title: 'Cohort Roster Verification',
            sopCode: 'SOP-MEN-01',
            description:
              'Verify assigned interns across Software, Embedded IoT, and AI tracks and inspect their onboarding status.',
            metricLabel: 'Assigned Interns',
            metricValue: interns.length,
            status: interns.length > 0 ? 'completed' : 'active',
            actionLabel: 'View Cohort',
            href: '/dashboard?tab=interns',
            preloadTab: 'interns',
          },
          {
            stageNumber: '02',
            title: 'Technical Milestone Assignment',
            sopCode: 'SOP-MEN-02',
            description:
              'Dispatch structured weekly engineering tasks with clear acceptance criteria and repository templates.',
            metricLabel: 'Total Assigned',
            metricValue: tasks.length,
            status: tasks.length > 0 ? 'active' : 'pending',
            actionLabel: 'Assign Tasks',
            href: '/dashboard?tab=interns',
            preloadTab: 'interns',
          },
          {
            stageNumber: '03',
            title: 'Deliverable & Code Evaluation',
            sopCode: 'SOP-MEN-03',
            description:
              'Inspect submitted code, schematics, or model notebooks and approve or request targeted revisions.',
            metricLabel: 'Pending Review',
            metricValue: reviewTasks,
            status: reviewTasks > 0 ? 'active' : 'completed',
            actionLabel: 'Evaluate Work',
            href: '/dashboard?tab=evaluations',
            preloadTab: 'evaluations',
          },
          {
            stageNumber: '04',
            title: 'Capstone Sign-Off & Certification',
            sopCode: 'SOP-MEN-04',
            description:
              'Record structured technical feedback and approve interns for ISO-aligned completion certificates.',
            metricLabel: 'Approved Tasks',
            metricValue: completedTasks,
            status: completedTasks > 0 ? 'completed' : 'pending',
            actionLabel: 'Feedback Log',
            href: '/dashboard?tab=evaluations',
            preloadTab: 'evaluations',
          },
        ];
      }

      case 'INTERN_STUDENT': {
        const hasMentor = Boolean(internData?.mentor);
        const tasks = internData?.tasks || [];
        const openTasks = tasks.filter(
          (t) => t.status === 'TODO' || t.status === 'IN_PROGRESS'
        ).length;
        const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
        const feedbackCount = (internData?.feedback || []).length;

        return [
          {
            stageNumber: '01',
            title: 'Track Onboarding & Mentor Sync',
            sopCode: 'SOP-INT-01',
            description:
              'Confirm your enrolled industrial training track, syllabus modules, and assigned senior mentor.',
            metricLabel: 'Mentor Status',
            metricValue: hasMentor ? 'Assigned' : 'Pending',
            status: hasMentor ? 'completed' : 'active',
            actionLabel: 'Track Overview',
            href: '/dashboard?tab=overview',
            preloadTab: 'overview',
          },
          {
            stageNumber: '02',
            title: 'Practical Module Execution',
            sopCode: 'SOP-INT-02',
            description:
              'Build assigned software, embedded firmware, or AI modules according to engineering specifications.',
            metricLabel: 'Open Assignments',
            metricValue: openTasks,
            status: openTasks > 0 ? 'active' : 'completed',
            actionLabel: 'My Assignments',
            href: '/dashboard?tab=assignments',
            preloadTab: 'assignments',
          },
          {
            stageNumber: '03',
            title: 'Deliverable Submission',
            sopCode: 'SOP-INT-03',
            description:
              'Submit GitHub pull requests, simulation reports, or hardware test logs for mentor inspection.',
            metricLabel: 'Completed',
            metricValue: completedTasks,
            status: completedTasks > 0 ? 'completed' : 'pending',
            actionLabel: 'Submit Work',
            href: '/dashboard?tab=assignments',
            preloadTab: 'assignments',
          },
          {
            stageNumber: '04',
            title: 'Mentor Evaluation & Portfolio',
            sopCode: 'SOP-INT-04',
            description:
              'Review mentor grading notes and finalize your capstone portfolio for certification.',
            metricLabel: 'Evaluations',
            metricValue: feedbackCount,
            status: feedbackCount > 0 ? 'completed' : 'pending',
            actionLabel: 'View Feedback',
            href: '/dashboard?tab=feedback',
            preloadTab: 'feedback',
          },
        ];
      }

      case 'CLIENT':
      default: {
        const enquiriesCount = (clientData?.enquiries || []).length;
        const projectsCount = (clientData?.projects || []).length;
        const docsCount = (clientData?.documents || []).length;
        const paymentsCount = (clientData?.payments || []).length;

        return [
          {
            stageNumber: '01',
            title: 'Requirement & RFP Submission',
            sopCode: 'SOP-CLI-01',
            description:
              'Submit software, hardware/IoT, or AI project requirements for feasibility and architecture review.',
            metricLabel: 'Submitted RFPs',
            metricValue: enquiriesCount,
            status: enquiriesCount > 0 ? 'completed' : 'active',
            actionLabel: 'My Enquiries',
            href: '/dashboard?tab=enquiries',
            preloadTab: 'enquiries',
          },
          {
            stageNumber: '02',
            title: 'Active Engineering Delivery',
            sopCode: 'SOP-CLI-02',
            description:
              'Monitor real-time sprint milestones, architecture progress, and assigned delivery engineers.',
            metricLabel: 'Active Projects',
            metricValue: projectsCount,
            status: projectsCount > 0 ? 'active' : 'pending',
            actionLabel: 'Track Projects',
            href: '/dashboard?tab=projects',
            preloadTab: 'projects',
          },
          {
            stageNumber: '03',
            title: 'Specification & Artifact Exchange',
            sopCode: 'SOP-CLI-03',
            description:
              'Access NDAs, architecture diagrams, technical reports, and release deliverables securely.',
            metricLabel: 'Shared Docs',
            metricValue: docsCount,
            status: docsCount > 0 ? 'completed' : 'pending',
            actionLabel: 'Open Documents',
            href: '/dashboard?tab=documents',
            preloadTab: 'documents',
          },
          {
            stageNumber: '04',
            title: 'Milestone Billing & Handover',
            sopCode: 'SOP-CLI-04',
            description:
              'Complete verified milestone payments and receive full source code / hardware IP handover.',
            metricLabel: 'Payment Records',
            metricValue: paymentsCount,
            status: paymentsCount > 0 ? 'completed' : 'pending',
            actionLabel: 'Billing & Receipts',
            href: '/dashboard?tab=payments',
            preloadTab: 'payments',
          },
        ];
      }
    }
  }, [role, adminData, employeeData, mentorData, internData, clientData]);

  const handleInstantSync = async () => {
    setIsSyncing(true);
    try {
      if (role === 'ADMIN') {
        invalidateAdminCaches(['overview', 'users', 'projects', 'enquiries', 'tasks']);
      } else {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const first = String(query.queryKey[0] || '');
            return (
              first.includes('dashboard') ||
              first === 'my-projects' ||
              first === 'rbac'
            );
          },
        });
      }
    } finally {
      window.setTimeout(() => setIsSyncing(false), 250);
    }
  };

  const roleMeta = ROLE_METADATA[role];

  return (
    <section
      aria-label="Structured Operational Workflow Pipeline"
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors ${className}`}
    >
      {/* Top Command Header */}
      <div className="px-4 sm:px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ISO 9001:2015 Standard Operating Procedure
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <Zap className="w-3 h-3" /> Zero-Lag Cached Pipeline
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mt-1">
              {roleMeta.label} · Structured Operations Pipeline
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleInstantSync}
            disabled={isSyncing}
            title="Refresh operational state from cache"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync State'}</span>
          </button>
        </div>
      </div>

      {/* Structured Stage Cards */}
      <div className="p-4 sm:p-6">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            stages.length === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
          } gap-3.5`}
        >
          {stages.map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';

            return (
              <div
                key={stage.sopCode}
                onMouseEnter={() =>
                  prefetchSidebarTarget({
                    path: stage.preloadPath,
                    tab: stage.preloadTab,
                    effectiveRole: role,
                    userProfile: userProfile as any,
                  })
                }
                className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  isActive
                    ? 'border-amber-400/80 dark:border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs'
                    : isCompleted
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  {/* Stage Header & SOP Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="inline-flex items-center gap-1.5">
                      <span
                        className={`w-6 h-6 rounded-md text-xs font-mono font-bold flex items-center justify-center ${
                          isActive
                            ? 'bg-amber-500 text-white'
                            : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {stage.stageNumber}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {stage.sopCode}
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Queued
                      </span>
                    )}
                  </div>

                  {/* Stage Title & Description */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {stage.description}
                  </p>
                </div>

                <div>
                  {/* Live Metric Pill */}
                  <div className="pt-2.5 pb-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {stage.metricLabel}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {stage.metricValue}
                    </span>
                  </div>

                  {/* Instant Action Button */}
                  <button
                    type="button"
                    onClick={() => navigate(stage.href)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold inline-flex items-center justify-between gap-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{stage.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>

                {/* Desktop Connector Arrow */}
                {index < stages.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden xl:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 shadow-2xs pointer-events-none"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Governance & SLA Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Role-Based Access Control (RBAC) Enforced
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              All state transitions logged to Audit Trail
            </span>
          </div>

          <div className="flex items-center gap-3">
            {role === 'ADMIN' ? (
              <Link
                to="/admin/permissions"
                className="font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Configure Role SOP Permissions</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <Link
                to="/dashboard?tab=profile"
                className="font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View Role Quotas & Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StructuredOperationsPipeline;
