import React from 'react';
import {
  Shield,
  CheckCircle2,
  Eye,
  FolderKanban,
  ListChecks,
  Sparkles,
  HardDrive,
  FileSpreadsheet,
  Users,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useRBAC } from '../../contexts/RBACContext';
import {
  FIVE_ROLES,
  ROLE_METADATA,
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  CanonicalRole,
} from '../../lib/rbac';

export const QuotaAndPermissionsBar: React.FC = () => {
  const {
    actualRole,
    activeRole,
    simulatedRole,
    setSimulatedRole,
    permissions,
    limits,
    usage,
  } = useRBAC();

  const isAdminUser = actualRole === 'ADMIN';
  const roleMeta = ROLE_METADATA[activeRole];
  const grantedActions = PERMISSION_ACTIONS.filter((a) => permissions[a]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 space-y-4 shadow-xs transition-colors">
      {/* Top Row: Role Identity, Active Permissions & Admin 5-Role Unified Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${roleMeta.badgeColor}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Unified Role: {roleMeta.label}</span>
          </div>

          {limits.accessExpirationDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Expires: {limits.accessExpirationDate}
            </span>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {roleMeta.description}
          </span>
        </div>

        {/* Admin Live 5-Role Verification Switcher */}
        {isAdminUser && (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
            <span className="flex items-center gap-1 px-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Eye className="w-3.5 h-3.5" />
              Test Role View:
            </span>
            {FIVE_ROLES.map((r: CanonicalRole) => {
              const active = activeRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSimulatedRole(r === actualRole ? null : r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700'
                  }`}
                >
                  {ROLE_METADATA[r].shortLabel}
                </button>
              );
            })}
            {simulatedRole && (
              <button
                type="button"
                onClick={() => setSimulatedRole(null)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-200 cursor-pointer"
                title="Exit role preview and return to ADMIN"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Middle Row: Real-Time Dynamic Limits & Resource Quota Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
              Projects
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {usage.projectsCount}/{limits.maxProjects}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ListChecks className="w-3.5 h-3.5 text-emerald-500" />
              Tasks
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {usage.assignedTasksCount}/{limits.maxAssignedTasks}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI / Day
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {usage.aiRequestsToday}/{limits.aiRequestsPerDay}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-cyan-500" />
              Storage
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {usage.storageUsedMB.toFixed(0)}/{limits.fileStorageCapacityMB}MB
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-pink-500" />
              Reports
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {usage.reportsGeneratedCount}/{limits.reportGenerationLimit}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              {activeRole === 'MENTOR' ? 'Mentees' : 'Upload Max'}
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {activeRole === 'MENTOR'
                ? `${usage.assignedMenteesCount}/${limits.maxAssignedMentees}`
                : `${limits.maxFileUploadSizeMB}MB`}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Permission Engine Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
          Authorized Actions ({grantedActions.length}/11):
        </span>
        {grantedActions.map((action) => (
          <span
            key={action}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {PERMISSION_ACTION_LABELS[action]}
          </span>
        ))}
      </div>
    </div>
  );
};
