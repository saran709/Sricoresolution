import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Search,
  Download,
  Plus,
  Radio,
  Filter,
  Layers,
  LayoutList,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebaseError';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { normalizeToCanonicalRole, CanonicalRole } from '../../lib/rbac';
import { Project, ProjectTask } from '../../types';
import { DashboardModuleSkeleton } from '../ui/DashboardSuspense';
import { Button } from '../ui/Button';

export interface ProjectTrackerProps {
  compact?: boolean;
  maxProjects?: number;
  className?: string;
}

const LIFECYCLE_GATES = [
  { key: 'discovery', label: '01. Discovery & Spec' },
  { key: 'architecture', label: '02. Architecture' },
  { key: 'development', label: '03. Sprint Build' },
  { key: 'testing', label: '04. QA & Testing' },
  { key: 'delivery', label: '05. Handover' },
] as const;

function parseDateValue(raw: any): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
  if (typeof raw?.toDate === 'function') {
    const d = raw.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }
  if (typeof raw?.seconds === 'number') {
    return new Date(raw.seconds * 1000);
  }
  if (typeof raw === 'string' || typeof raw === 'number') {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDateLabel(raw: any): string {
  const date = parseDateValue(raw);
  if (!date) return 'TBD';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function computeDeadlineMeta(
  rawDate: any,
  isCompleted: boolean
): {
  label: string;
  tone: 'emerald' | 'amber' | 'rose' | 'slate';
  daysRemaining: number | null;
} {
  if (isCompleted) {
    return { label: 'Completed', tone: 'emerald', daysRemaining: null };
  }
  const target = parseDateValue(rawDate);
  if (!target) {
    return { label: 'Schedule TBD', tone: 'slate', daysRemaining: null };
  }
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      label: `Overdue by ${Math.abs(days)}d`,
      tone: 'rose',
      daysRemaining: days,
    };
  }
  if (days === 0) {
    return { label: 'Due Today', tone: 'amber', daysRemaining: 0 };
  }
  if (days <= 7) {
    return { label: `${days}d remaining`, tone: 'amber', daysRemaining: days };
  }
  return { label: `${days}d remaining`, tone: 'emerald', daysRemaining: days };
}

function resolveStageGateIndex(project: Project, computedProgress: number): number {
  const rawStage = String(project.stage || project.projectStage || '').toLowerCase();
  const rawStatus = String(project.status || project.projectStatus || '').toLowerCase();

  if (rawStatus === 'completed' || computedProgress >= 100) return 4;
  if (rawStage.includes('deliver') || rawStage.includes('support') || rawStage.includes('final')) {
    return 4;
  }
  if (rawStage.includes('test') || rawStage.includes('demo') || rawStage.includes('review')) {
    return 3;
  }
  if (rawStage.includes('dev') || rawStage.includes('model') || computedProgress >= 45) {
    return 2;
  }
  if (rawStage.includes('arch') || rawStage.includes('team') || rawStage.includes('feasibility') || computedProgress >= 20) {
    return 1;
  }
  return 0;
}

export function ProjectTracker({
  compact = false,
  maxProjects,
  className = '',
}: ProjectTrackerProps) {
  const { currentUser, userProfile } = useAuth();
  const { activeRole } = useRBAC();

  const uid = userProfile?.uid || currentUser?.uid || '';
  const effectiveRole: CanonicalRole =
    activeRole || normalizeToCanonicalRole(userProfile?.role);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Interactive Filters & UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'AT_RISK'
  >('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'ASSIGNED'>(
    effectiveRole === 'CLIENT' ? 'ASSIGNED' : 'ALL'
  );
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [expandedProjectIds, setExpandedProjectIds] = useState<Record<string, boolean>>({});
  const [exportingProjectId, setExportingProjectId] = useState<string | null>(null);

  // Add Milestone Inline Form State
  const [addingMilestoneForProject, setAddingMilestoneForProject] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newMilestoneAssignee, setNewMilestoneAssignee] = useState('');
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const canMutateMilestones =
    effectiveRole === 'ADMIN' ||
    effectiveRole === 'EMPLOYEE' ||
    effectiveRole === 'MENTOR';

  const canUpdateTaskStatus =
    canMutateMilestones || effectiveRole === 'INTERN_STUDENT';

  // Real-time Firestore subscriptions for Projects & ProjectTasks
  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Clients are scoped to their own projects per firestore.rules;
    // internal organizational members (ADMIN, EMPLOYEE, MENTOR, INTERN_STUDENT) can observe internal projects.
    const projectsRef = collection(db, 'projects');
    const projectsQuery =
      effectiveRole === 'CLIENT'
        ? query(projectsRef, where('clientId', '==', uid))
        : projectsRef;

    const unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const nextProjects: Project[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, any>;
          return {
            id: docSnap.id,
            ...data,
            name: data.name || data.projectTitle || 'Untitled Engineering Project',
            description:
              data.description ||
              data.projectDescription ||
              'Engineering specification and milestone tracking.',
            status: data.status || data.projectStatus || 'active',
            projectType: data.projectType || 'software',
          } as Project;
        });

        // Sort active/in_progress projects first, then by updatedAt/createdAt
        nextProjects.sort((a, b) => {
          const aActive = ['active', 'in_progress'].includes(
            String(a.status || a.projectStatus || '').toLowerCase()
          )
            ? 0
            : 1;
          const bActive = ['active', 'in_progress'].includes(
            String(b.status || b.projectStatus || '').toLowerCase()
          )
            ? 0
            : 1;
          if (aActive !== bActive) return aActive - bActive;
          const aTime = parseDateValue(a.updatedAt || a.createdAt)?.getTime() || 0;
          const bTime = parseDateValue(b.updatedAt || b.createdAt)?.getTime() || 0;
          return bTime - aTime;
        });

        setProjects(nextProjects);
        setLastSyncedAt(new Date());
        setIsLoading(false);
      },
      (error) => {
        const msg = String(error?.message || '').toLowerCase();
        if (msg.includes('permission-denied') || msg.includes('insufficient permissions')) {
          try {
            handleFirestoreError(error, OperationType.LIST, 'projects', auth);
          } catch (e) {
            console.warn('ProjectTracker projects snapshot warning:', e);
          }
        }
        setIsLoading(false);
      }
    );

    const tasksRef = collection(db, 'projectTasks');
    const unsubscribeTasks = onSnapshot(
      tasksRef,
      (snapshot) => {
        const nextTasks: ProjectTask[] = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            }) as ProjectTask
        );
        setTasks(nextTasks);
        setLastSyncedAt(new Date());
      },
      (error) => {
        console.debug('ProjectTracker tasks snapshot note:', error);
      }
    );

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, [uid, effectiveRole]);

  // Group milestones by projectId and compute rich health & progress telemetry
  const enrichedProjects = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks
        .filter((t) => t.projectId === project.id || t.projectId === project.projectId)
        .sort((a, b) => {
          const dateA = parseDateValue(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
          const dateB = parseDateValue(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
          return dateA - dateB;
        });

      const totalMilestones = projectTasks.length;
      const completedMilestones = projectTasks.filter(
        (t) => t.status === 'COMPLETED'
      ).length;
      const inProgressMilestones = projectTasks.filter(
        (t) => t.status === 'IN_PROGRESS' || t.status === 'REVIEW'
      ).length;
      const blockedMilestones = projectTasks.filter((t) => t.status === 'BLOCKED').length;

      const rawStatus = String(project.status || project.projectStatus || 'active').toLowerCase();
      const isCompleted = rawStatus === 'completed';

      const computedProgress =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : typeof project.progressPercentage === 'number'
            ? Math.min(100, Math.max(0, project.progressPercentage))
            : isCompleted
              ? 100
              : rawStatus === 'in_progress' || rawStatus === 'active'
                ? 45
                : 15;

      const deadlineRaw =
        project.expectedEndDate || project.endDate || project.actualEndDate;
      const deadlineMeta = computeDeadlineMeta(deadlineRaw, isCompleted);

      const overdueMilestones = projectTasks.filter((t) => {
        if (t.status === 'COMPLETED') return false;
        const d = parseDateValue(t.dueDate);
        return d ? d.getTime() < Date.now() : false;
      }).length;

      const isAtRisk =
        !isCompleted &&
        (deadlineMeta.tone === 'rose' || blockedMilestones > 0 || overdueMilestones > 0);

      const isAssignedToUser =
        project.clientId === uid ||
        project.projectManagerId === uid ||
        (Array.isArray(project.assignedEmployees) &&
          project.assignedEmployees.includes(uid)) ||
        (Array.isArray(project.teamMemberIds) && project.teamMemberIds.includes(uid)) ||
        (Array.isArray(project.assignedInterns) &&
          project.assignedInterns.includes(uid)) ||
        projectTasks.some(
          (t) =>
            t.assignedTo === uid ||
            (currentUser?.email && t.assignedTo === currentUser.email)
        );

      const stageGateIndex = resolveStageGateIndex(project, computedProgress);

      return {
        project,
        projectTasks,
        totalMilestones,
        completedMilestones,
        inProgressMilestones,
        blockedMilestones,
        overdueMilestones,
        computedProgress,
        deadlineRaw,
        deadlineMeta,
        isCompleted,
        isAtRisk,
        isAssignedToUser,
        stageGateIndex,
      };
    });
  }, [projects, tasks, uid, currentUser?.email]);

  const filteredProjects = useMemo(() => {
    const queryText = searchTerm.trim().toLowerCase();

    const list = enrichedProjects.filter((item) => {
      if (scopeFilter === 'ASSIGNED' && !item.isAssignedToUser) {
        return false;
      }

      const rawStatus = String(
        item.project.status || item.project.projectStatus || 'active'
      ).toLowerCase();

      if (statusFilter === 'ACTIVE' && !['active', 'in_progress', 'proposed'].includes(rawStatus)) {
        return false;
      }
      if (statusFilter === 'COMPLETED' && rawStatus !== 'completed') {
        return false;
      }
      if (statusFilter === 'ON_HOLD' && rawStatus !== 'on_hold') {
        return false;
      }
      if (statusFilter === 'AT_RISK' && !item.isAtRisk) {
        return false;
      }

      if (!queryText) return true;

      const haystack = [
        item.project.name,
        item.project.projectCode,
        item.project.description,
        item.project.clientNameSnapshot,
        item.project.departmentNameSnapshot,
        item.project.projectType,
        ...(item.project.technologyStack || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(queryText);
    });

    return maxProjects ? list.slice(0, maxProjects) : list;
  }, [enrichedProjects, scopeFilter, statusFilter, searchTerm, maxProjects]);

  // Aggregate KPI Metrics
  const kpiStats = useMemo(() => {
    const total = enrichedProjects.length;
    const active = enrichedProjects.filter((p) =>
      ['active', 'in_progress'].includes(
        String(p.project.status || p.project.projectStatus || '').toLowerCase()
      )
    ).length;
    const completed = enrichedProjects.filter((p) => p.isCompleted).length;
    const atRisk = enrichedProjects.filter((p) => p.isAtRisk).length;
    const totalTasks = enrichedProjects.reduce((acc, p) => acc + p.totalMilestones, 0);
    const doneTasks = enrichedProjects.reduce((acc, p) => acc + p.completedMilestones, 0);
    const avgProgress =
      total > 0
        ? Math.round(
            enrichedProjects.reduce((acc, p) => acc + p.computedProgress, 0) / total
          )
        : 0;

    return { total, active, completed, atRisk, totalTasks, doneTasks, avgProgress };
  }, [enrichedProjects]);

  const handleToggleExpand = (projectId: string) => {
    setExpandedProjectIds((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleCycleTaskStatus = async (
    task: ProjectTask,
    projectItem: (typeof enrichedProjects)[number]
  ) => {
    if (!task.id || !canUpdateTaskStatus) return;

    const statusOrder: ProjectTask['status'][] = [
      'TODO',
      'IN_PROGRESS',
      'REVIEW',
      'COMPLETED',
    ];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    setUpdatingTaskId(task.id);
    try {
      const taskRef = doc(db, 'projectTasks', task.id);
      await updateDoc(taskRef, {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      // Recalculate and sync parent project progressPercentage if authorized
      if (canMutateMilestones && projectItem.project.id) {
        const updatedCompletedCount = projectItem.projectTasks.filter((t) =>
          t.id === task.id ? nextStatus === 'COMPLETED' : t.status === 'COMPLETED'
        ).length;
        const nextProgress =
          projectItem.totalMilestones > 0
            ? Math.round((updatedCompletedCount / projectItem.totalMilestones) * 100)
            : projectItem.computedProgress;

        const projRef = doc(db, 'projects', projectItem.project.id);
        await updateDoc(projRef, {
          progressPercentage: nextProgress,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to update milestone status:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCreateMilestone = async (
    e: React.FormEvent,
    projectItem: (typeof enrichedProjects)[number]
  ) => {
    e.preventDefault();
    const projectId = projectItem.project.id;
    if (!projectId || !newMilestoneTitle.trim() || !canMutateMilestones) return;

    setIsSavingMilestone(true);
    try {
      const parsedDue = newMilestoneDueDate
        ? Timestamp.fromDate(new Date(`${newMilestoneDueDate}T17:00:00`))
        : null;

      await addDoc(collection(db, 'projectTasks'), {
        projectId,
        title: newMilestoneTitle.trim(),
        description: `Milestone deliverable for ${projectItem.project.name}`,
        assignedTo:
          newMilestoneAssignee.trim() ||
          userProfile?.email ||
          currentUser?.email ||
          uid,
        status: 'TODO',
        dueDate: parsedDue,
        createdAt: serverTimestamp(),
      });

      setNewMilestoneTitle('');
      setNewMilestoneDueDate('');
      setNewMilestoneAssignee('');
      setAddingMilestoneForProject(null);
      setExpandedProjectIds((prev) => ({ ...prev, [projectId]: true }));
    } catch (error) {
      console.error('Error creating milestone:', error);
    } finally {
      setIsSavingMilestone(false);
    }
  };

  const generatePDF = async (projectItem: (typeof enrichedProjects)[number]) => {
    const { project, projectTasks, computedProgress, deadlineRaw } = projectItem;
    const key = project.id || project.name;
    setExportingProjectId(key);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const pdf = new jsPDF();

      pdf.setFontSize(16);
      pdf.text(`Project Tracker Report: ${project.name}`, 14, 16);
      pdf.setFontSize(10);
      pdf.text(
        `Status: ${String(project.status || 'active').toUpperCase()} | Completion: ${computedProgress}% | Target Deadline: ${formatDateLabel(deadlineRaw)}`,
        14,
        24
      );
      pdf.text(`Summary: ${(project.description || '').slice(0, 110)}`, 14, 31);

      autoTable(pdf, {
        startY: 38,
        head: [['Milestone / Task', 'Assignee', 'Status', 'Target Due Date']],
        body:
          projectTasks.length > 0
            ? projectTasks.map((task) => [
                task.title,
                task.assignedTo || 'Engineering Team',
                task.status,
                formatDateLabel(task.dueDate),
              ])
            : [['No milestones logged yet', '-', '-', '-']],
      });

      pdf.save(`${project.name.replace(/\s+/g, '_')}_Tracker_Report.pdf`);
    } finally {
      setExportingProjectId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardModuleSkeleton
        variant="table"
        label="Synchronizing real-time project tracker..."
      />
    );
  }

  return (
    <section
      aria-label="Real-Time Organizational Project Tracker"
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors ${className}`}
    >
      {/* Top Header Bar with Live Firestore Sync Indicator */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Real-Time Project &amp; Milestone Tracker
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
                Live Firestore Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track internal engineering project stages, milestone velocity, and upcoming delivery deadlines in real time.
              {lastSyncedAt && (
                <span className="ml-1.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  · Synced {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* View Mode & Scope Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {effectiveRole !== 'CLIENT' && (
            <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setScopeFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  scopeFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Org Projects ({enrichedProjects.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('ASSIGNED')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  scopeFilter === 'ASSIGNED'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                My Assigned ({enrichedProjects.filter((p) => p.isAssignedToUser).length})
              </button>
            </div>
          )}

          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              aria-label="Detailed Milestone Cards View"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Milestones</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              aria-label="Deadline Matrix View"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Deadline Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Active Delivery
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {kpiStats.active}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {kpiStats.total} projects
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Milestone Velocity
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {kpiStats.doneTasks}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {kpiStats.totalTasks} completed
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Mean Completion
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              {kpiStats.avgProgress}%
            </span>
            <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${kpiStats.avgProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Deadline Health
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-extrabold tabular-nums ${
                kpiStats.atRisk > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {kpiStats.atRisk}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {kpiStats.atRisk === 1 ? 'project needs attention' : 'projects at risk / overdue'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            placeholder="Search projects, code, tech stack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search tracked projects"
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
          {(
            [
              { key: 'ALL', label: 'All Statuses' },
              { key: 'ACTIVE', label: 'Active / In Progress' },
              { key: 'AT_RISK', label: 'At Risk / Overdue' },
              { key: 'ON_HOLD', label: 'On Hold' },
              { key: 'COMPLETED', label: 'Completed' },
            ] as const
          ).map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setStatusFilter(pill.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === pill.key
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6">
        {filteredProjects.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <FolderKanban className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              No matching projects in tracker
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
              {scopeFilter === 'ASSIGNED'
                ? 'No projects are currently assigned to your account, or your active filters excluded them.'
                : 'Try clearing your search query or switching the status filter above.'}
            </p>
            {(searchTerm || statusFilter !== 'ALL' || scopeFilter === 'ASSIGNED') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  if (effectiveRole !== 'CLIENT') setScopeFilter('ALL');
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
              >
                Reset Tracker Filters
              </button>
            )}
          </div>
        ) : viewMode === 'timeline' ? (
          /* Deadline & Milestone Matrix Table View */
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Project &amp; Code</th>
                  <th className="py-3 px-4">Lifecycle Stage</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Milestones</th>
                  <th className="py-3 px-4">Target Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {filteredProjects.map((item) => {
                  const {
                    project,
                    computedProgress,
                    totalMilestones,
                    completedMilestones,
                    deadlineRaw,
                    deadlineMeta,
                    stageGateIndex,
                  } = item;
                  const stageGate = LIFECYCLE_GATES[stageGateIndex];

                  return (
                    <tr
                      key={project.id || project.name}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {project.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          {project.projectCode && (
                            <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                              {project.projectCode}
                            </span>
                          )}
                          <span className="uppercase">{project.projectType}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          {stageGate.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            {computedProgress}%
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-slate-500">
                            {String(project.status || 'active').replace('_', ' ')}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              computedProgress >= 100
                                ? 'bg-emerald-500'
                                : item.isAtRisk
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                            }`}
                            style={{ width: `${computedProgress}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {completedMilestones}
                        </span>{' '}
                        / {totalMilestones} done
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDateLabel(deadlineRaw)}
                        </div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-bold uppercase ${
                            deadlineMeta.tone === 'rose'
                              ? 'text-rose-600 dark:text-rose-400'
                              : deadlineMeta.tone === 'amber'
                                ? 'text-amber-600 dark:text-amber-400'
                                : deadlineMeta.tone === 'emerald'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-400'
                          }`}
                        >
                          {deadlineMeta.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDF(item)}
                          disabled={exportingProjectId === (project.id || project.name)}
                          className="inline-flex items-center gap-1 text-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Detailed Milestone Cards View */
          <div className="space-y-4">
            {filteredProjects.map((item) => {
              const {
                project,
                projectTasks,
                totalMilestones,
                completedMilestones,
                blockedMilestones,
                computedProgress,
                deadlineRaw,
                deadlineMeta,
                isAtRisk,
                stageGateIndex,
              } = item;
              const projId = project.id || project.name;
              const isExpanded =
                expandedProjectIds[projId] !== undefined
                  ? expandedProjectIds[projId]
                  : !compact;

              return (
                <div
                  key={projId}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isAtRisk
                      ? 'border-rose-300 dark:border-rose-900/70 bg-white dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  {/* Card Top Summary */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {project.projectCode && (
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {project.projectCode}
                            </span>
                          )}
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800">
                            {project.projectType || 'Engineering'}
                          </span>
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              item.isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                : isAtRisk
                                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                                  : 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                            }`}
                          >
                            {String(project.status || 'active').replace('_', ' ')}
                          </span>
                          {isAtRisk && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Attention Needed
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                          {project.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Right Deadline Badge & Actions */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                        <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Target:</span>
                            <strong className="text-slate-900 dark:text-white">
                              {formatDateLabel(deadlineRaw)}
                            </strong>
                          </div>
                          <div
                            className={`text-[10px] font-bold uppercase mt-0.5 ${
                              deadlineMeta.tone === 'rose'
                                ? 'text-rose-600 dark:text-rose-400'
                                : deadlineMeta.tone === 'amber'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : deadlineMeta.tone === 'emerald'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-400'
                            }`}
                          >
                            {deadlineMeta.label}
                          </div>
                        </div>

                        {canMutateMilestones && project.id && (
                          <button
                            type="button"
                            onClick={() =>
                              setAddingMilestoneForProject((prev) =>
                                prev === project.id ? null : project.id!
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Milestone</span>
                          </button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDF(item)}
                          disabled={exportingProjectId === projId}
                          className="inline-flex items-center gap-1 text-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{exportingProjectId === projId ? 'Exporting...' : 'PDF'}</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleToggleExpand(projId)}
                          aria-expanded={isExpanded}
                          aria-label="Toggle project milestones"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & 5-Gate Stage Stepper */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Overall Milestone Completion:{' '}
                          <strong className="font-mono text-slate-900 dark:text-white">
                            {computedProgress}%
                          </strong>
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">
                          {completedMilestones}/{totalMilestones} milestones completed
                          {blockedMilestones > 0 && (
                            <span className="ml-2 text-rose-600 dark:text-rose-400 font-bold">
                              · {blockedMilestones} blocked
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            computedProgress >= 100
                              ? 'bg-emerald-500'
                              : isAtRisk
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                          }`}
                          style={{ width: `${computedProgress}%` }}
                        />
                      </div>

                      {/* 5-Stage Gate Stepper */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {LIFECYCLE_GATES.map((gate, idx) => {
                          const isDoneGate = idx < stageGateIndex || item.isCompleted;
                          const isCurrentGate = idx === stageGateIndex && !item.isCompleted;
                          return (
                            <div
                              key={gate.key}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-between border ${
                                isCurrentGate
                                  ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
                                  : isDoneGate
                                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                                    : 'border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              <span className="truncate">{gate.label}</span>
                              {isDoneGate && <Check className="w-3 h-3 shrink-0 text-emerald-600" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Inline Add Milestone Form */}
                  {addingMilestoneForProject === project.id && (
                    <form
                      onSubmit={(e) => handleCreateMilestone(e, item)}
                      className="px-4 sm:px-5 py-3.5 bg-amber-50/60 dark:bg-amber-950/20 border-t border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
                    >
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          New Milestone Deliverable Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newMilestoneTitle}
                          onChange={(e) => setNewMilestoneTitle(e.target.value)}
                          placeholder="e.g., Complete STM32 CAN Bus Telemetry Driver & Bench Test"
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="w-full sm:w-44">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Target Due Date
                        </label>
                        <input
                          type="date"
                          value={newMilestoneDueDate}
                          onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="w-full sm:w-48">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Assignee (Email or UID)
                        </label>
                        <input
                          type="text"
                          value={newMilestoneAssignee}
                          onChange={(e) => setNewMilestoneAssignee(e.target.value)}
                          placeholder={userProfile?.email || 'Engineer email/UID'}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSavingMilestone}
                          className="h-9 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {isSavingMilestone ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingMilestoneForProject(null)}
                          className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Collapsible Milestones & Deadlines List */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Project Milestones &amp; Task Deadlines ({projectTasks.length})
                        </h4>
                        {canUpdateTaskStatus && projectTasks.length > 0 && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            Click any status badge to advance milestone stage
                          </span>
                        )}
                      </div>

                      {projectTasks.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                          No milestones logged for this project yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                          {projectTasks.map((task) => {
                            const isTaskDone = task.status === 'COMPLETED';
                            const taskDeadline = computeDeadlineMeta(
                              task.dueDate,
                              isTaskDone
                            );

                            return (
                              <div
                                key={task.id || task.title}
                                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  {isTaskDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                  )}
                                  <div className="min-w-0">
                                    <p
                                      className={`font-semibold truncate ${
                                        isTaskDone
                                          ? 'line-through text-slate-400 dark:text-slate-500'
                                          : 'text-slate-900 dark:text-white'
                                      }`}
                                    >
                                      {task.title}
                                    </p>
                                    {task.assignedTo && (
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        Assignee: {task.assignedTo}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                                  <span
                                    className={`text-[11px] font-mono ${
                                      taskDeadline.tone === 'rose'
                                        ? 'text-rose-600 dark:text-rose-400 font-bold'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}
                                  >
                                    Due: {formatDateLabel(task.dueDate)}
                                  </span>

                                  <button
                                    type="button"
                                    disabled={!canUpdateTaskStatus || updatingTaskId === task.id}
                                    onClick={() => handleCycleTaskStatus(task, item)}
                                    title={
                                      canUpdateTaskStatus
                                        ? 'Click to advance milestone status'
                                        : 'Milestone status'
                                    }
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-opacity ${
                                      canUpdateTaskStatus ? 'cursor-pointer hover:opacity-85' : ''
                                    } ${
                                      task.status === 'COMPLETED'
                                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                        : task.status === 'REVIEW'
                                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                                          : task.status === 'IN_PROGRESS'
                                            ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                                            : task.status === 'BLOCKED'
                                              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {updatingTaskId === task.id
                                      ? 'Syncing...'
                                      : task.status?.replace('_', ' ') || 'TODO'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectTracker;
