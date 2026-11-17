import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Code2,
  Users,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Layers,
  Zap,
  ClipboardCheck,
  Lock,
} from 'lucide-react';
import { Container } from './ui/Container';
import { useAuth } from '../contexts/AuthContext';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { prefetchDashboardForRole } from '../hooks/useDashboardQueries';
import { CanonicalRole } from '../lib/rbac';

interface CorporateSOPStage {
  stage: string;
  code: string;
  title: string;
  summary: string;
  deliverable: string;
}

const CORPORATE_SOP_STAGES: CorporateSOPStage[] = [
  {
    stage: '01',
    code: 'SOP-DISCOVERY',
    title: 'Requirement Intake & Feasibility Triage',
    summary:
      'Every client inquiry or R&D brief is logged with a unique CSRI reference ID and triaged by a lead systems architect within 24 hours.',
    deliverable: 'Feasibility Matrix & Mutual NDA',
  },
  {
    stage: '02',
    code: 'SOP-ARCH',
    title: 'System Architecture & Resource Allocation',
    summary:
      'Cross-functional software, PCB/IoT, and AI engineers define the technical blueprint, milestone schedule, and RBAC workspace scope.',
    deliverable: 'Architecture Spec & Sprint Roadmap',
  },
  {
    stage: '03',
    code: 'SOP-EXECUTION',
    title: 'Agile Sprint & Hardware Lab Execution',
    summary:
      'Engineers execute tracked sprint tasks across code repositories, STM32/ESP32 test benches, and GPU training clusters with real-time telemetry.',
    deliverable: 'Versioned Builds & Lab Prototypes',
  },
  {
    stage: '04',
    code: 'SOP-VERIFY',
    title: 'Automated QA, Benchmarking & Peer Review',
    summary:
      'Deliverables undergo automated CI/CD regression suites, RF/thermal validation, or IEEE/Scopus ablation benchmarking prior to sign-off.',
    deliverable: 'QA Verification & Test Report',
  },
  {
    stage: '05',
    code: 'SOP-HANDOVER',
    title: 'IP Transfer, Deployment & SLA Support',
    summary:
      '100% of custom source code, Gerber schematics, and trained model weights are handed over with production monitoring and SLA support.',
    deliverable: 'Full IP Handover & SLA Portal',
  },
];

interface MemberRoleCard {
  role: CanonicalRole;
  badge: string;
  title: string;
  responsibilities: string[];
  primaryHref: string;
  actionLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MEMBER_ROLE_CARDS: MemberRoleCard[] = [
  {
    role: 'ADMIN',
    badge: 'Executive Governance',
    title: 'Administrator Console',
    responsibilities: [
      'Convert client RFPs into tracked engineering projects',
      'Manage 5-role RBAC permissions, quotas & audit trails',
      'Oversee departments, payroll invoices & cohort admissions',
    ],
    primaryHref: '/admin',
    actionLabel: 'Open Admin Console',
    icon: ShieldCheck,
  },
  {
    role: 'EMPLOYEE',
    badge: 'Engineering Delivery',
    title: 'Staff Engineer Workspace',
    responsibilities: [
      'One-click daily attendance & shift readiness logging',
      'Real-time Kanban task transitions (To Do → Review → Done)',
      'Update commercial & R&D project milestone deliverables',
    ],
    primaryHref: '/dashboard?tab=tasks',
    actionLabel: 'Open Engineer Portal',
    icon: Code2,
  },
  {
    role: 'MENTOR',
    badge: 'Technical Mentorship',
    title: 'Senior Mentor Desk',
    responsibilities: [
      'Supervise assigned Software, IoT & AI internship cohorts',
      'Dispatch weekly practical engineering milestones',
      'Review code submissions & issue evaluation feedback',
    ],
    primaryHref: '/dashboard?tab=interns',
    actionLabel: 'Open Mentor Desk',
    icon: Users,
  },
  {
    role: 'INTERN_STUDENT',
    badge: 'Industrial Training',
    title: 'Intern & Cohort Portal',
    responsibilities: [
      'Access structured syllabus modules & mentor guidance',
      'Submit GitHub repositories, PCB layouts & lab reports',
      'Track mentor evaluations & ISO certificate verification',
    ],
    primaryHref: '/dashboard?tab=assignments',
    actionLabel: 'Open Intern Workspace',
    icon: GraduationCap,
  },
  {
    role: 'CLIENT',
    badge: 'Commercial & R&D',
    title: 'Client Delivery Portal',
    responsibilities: [
      'Track live project stages, sprint velocity & milestones',
      'Exchange NDAs, technical specs & release artifacts',
      'Complete verified milestone billing & instant receipts',
    ],
    primaryHref: '/dashboard?tab=projects',
    actionLabel: 'Open Client Portal',
    icon: Briefcase,
  },
];

export function EnterpriseOperationsSection() {
  const { currentUser, userProfile } = useAuth();
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';
  const brandName = settings?.brandName || 'Sricore Solutions';

  return (
    <section
      id="enterprise-operations"
      aria-labelledby="enterprise-operations-heading"
      className="content-visibility-auto py-12 md:py-16 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2.5">
              <span
                className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30"
                style={{ color: primaryColor }}
              >
                ISO 9001:2015 Structured Operations
              </span>
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-3.5 h-3.5" /> Zero-Lag Organizational Portal
              </span>
            </div>
            <h2
              id="enterprise-operations-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              Structured Engineering & Organizational Operations
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              {brandName} operates on a unified, role-governed workflow engine. Every client engagement, R&amp;D simulation, and industrial cohort follows a five-stage Standard Operating Procedure (SOP) with real-time state synchronization across all organizational members.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to={currentUser ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Launch My Workspace' : 'Member Workspace Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/enquiry"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Initiate Client RFP</span>
            </Link>
          </div>
        </div>

        {/* Part 1: 5-Stage Corporate Standard Operating Procedure (SOP) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>End-to-End Corporate Execution Lifecycle (SOP-01 to SOP-05)</span>
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Audited Milestone Gates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CORPORATE_SOP_STAGES.map((item) => (
              <div
                key={item.code}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between hover:border-amber-400/70 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800"
                      style={{ color: primaryColor }}
                    >
                      Stage {item.stage}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {item.code}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                    Gate Deliverable
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{item.deliverable}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2: Organizational Member Operations Portals (5 Canonical Roles) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Organizational Member Workspaces &amp; Role Operations</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Pre-warmed TanStack Query caches &amp; instant chunk loading
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {MEMBER_ROLE_CARDS.map((card) => {
              const Icon = card.icon;
              const targetUrl = currentUser ? card.primaryHref : '/login';

              return (
                <div
                  key={card.role}
                  onMouseEnter={() => {
                    if (currentUser) {
                      void prefetchDashboardForRole({
                        role: card.role,
                        actualRole: card.role,
                        userProfile: userProfile as any,
                      });
                    }
                  }}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {card.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      {card.title}
                    </h4>

                    <ul className="space-y-1.5 mb-4">
                      {card.responsibilities.map((line, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5 leading-snug"
                        >
                          <CheckCircle2
                            className="w-3.5 h-3.5 shrink-0 mt-0.5"
                            style={{ color: primaryColor }}
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={targetUrl}
                    className="w-full py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <span>{card.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default EnterpriseOperationsSection;
