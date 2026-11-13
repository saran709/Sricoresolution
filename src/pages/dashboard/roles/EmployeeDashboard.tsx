import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Attendance, Employee } from '../../../types';
import {
  Briefcase,
  CheckSquare,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { logActivity } from '../../../lib/activityLogger';
import { useEmployeeDashboard } from '../../../hooks/useDashboardQueries';
import { queryClient } from '../../../lib/queryClient';
import {
  autoMarkEmployeeAttendance,
  isWithinAttendanceWindow,
  getLocalDateString,
  formatTimeDisplay,
} from '../../../lib/attendanceService';
import { DashboardModuleSkeleton } from '../../../components/ui/DashboardSuspense';

type EmployeeTab = 'overview' | 'tasks' | 'projects' | 'attendance' | 'reports';
const VALID_EMPLOYEE_TABS: EmployeeTab[] = [
  'overview',
  'tasks',
  'projects',
  'attendance',
  'reports',
];

export default function EmployeeDashboard() {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeData = userProfile as Employee | null;
  const { data, isLoading: loading } = useEmployeeDashboard(userProfile?.uid);

  const projects = data?.projects || [];
  const tasks = data?.tasks || [];
  const leaveRequests = data?.leaveRequests || [];
  const attendances = data?.attendances || [];

  const queryTab = searchParams.get('tab') as EmployeeTab | null;
  const [activeTab, setActiveTabState] = useState<EmployeeTab>(
    queryTab && VALID_EMPLOYEE_TABS.includes(queryTab) ? queryTab : 'overview'
  );
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [autoAttendanceNotice, setAutoAttendanceNotice] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (queryTab && VALID_EMPLOYEE_TABS.includes(queryTab)) {
      setActiveTabState(queryTab);
    } else if (!queryTab) {
      setActiveTabState('overview');
    }
  }, [queryTab]);

  const setActiveTab = (tab: EmployeeTab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setStatusBanner(null);
    try {
      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: newStatus,
      });
      if (userProfile?.uid) {
        queryClient.invalidateQueries({ queryKey: ['employee-dashboard', userProfile.uid] });
        await logActivity(
          'TASK_STATUS_UPDATED',
          userProfile.uid,
          taskId,
          'task',
          `Employee updated task to ${newStatus}`
        );
      }
      setStatusBanner({
        type: 'success',
        message: `Task status updated to ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error('Failed to update task', error);
      setStatusBanner({
        type: 'error',
        message: 'Could not save task status change. Please try again.',
      });
    }
  };

  const handleLeaveRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userProfile?.uid) return;
    setStatusBanner(null);
    setSubmittingLeave(true);

    const formData = new FormData(e.currentTarget);
    const startRaw = formData.get('startDate') as string;
    const endRaw = formData.get('endDate') as string;
    const startDate = new Date(startRaw);
    const endDate = new Date(endRaw);

    if (endDate < startDate) {
      setStatusBanner({
        type: 'error',
        message: 'End date must be on or after the start date.',
      });
      setSubmittingLeave(false);
      return;
    }

    const leavePayload = {
      userId: userProfile.uid,
      startDate,
      endDate,
      reason: formData.get('reason') as string,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'leaveRequests'), leavePayload);
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard', userProfile.uid] });
      setShowLeaveForm(false);
      setStatusBanner({
        type: 'success',
        message: 'Leave request submitted for administrator approval.',
      });

      await logActivity(
        'LEAVE_REQUESTED',
        userProfile.uid,
        userProfile.uid,
        'user',
        `Employee requested leave starting ${leavePayload.startDate.toLocaleDateString()}`
      );
    } catch (err) {
      console.error('Failed to submit leave', err);
      setStatusBanner({
        type: 'error',
        message: 'Failed to submit leave request. Please try again.',
      });
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Auto-mark attendance when employee visits dashboard between 9:00 AM and 4:00 PM
  useEffect(() => {
    if (userProfile?.uid && ['EMPLOYEE', 'MENTOR', 'INTERN'].includes(userProfile?.role || '')) {
      autoMarkEmployeeAttendance(userProfile)
        .then((res) => {
          if (res.marked) {
            setAutoAttendanceNotice(res.message);
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard', userProfile.uid] });
          }
        })
        .catch((err) => {
          console.warn('Auto attendance failed:', err);
        });
    }
  }, [userProfile?.uid, userProfile?.role]);

  const handleCheckIn = async () => {
    if (!userProfile?.uid) return;
    setCheckingIn(true);
    setStatusBanner(null);
    try {
      const now = new Date();
      const todayStr = getLocalDateString(now);
      const attId = `${userProfile.uid}_${todayStr}`;
      const checkInTimeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const attData: Attendance = {
        id: attId,
        userId: userProfile.uid,
        userName:
          `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() ||
          userProfile.email ||
          'Employee',
        userEmail: userProfile.email || '',
        userRole: userProfile.role,
        departmentId: employeeData?.departmentId || '',
        date: todayStr,
        checkIn: checkInTimeStr,
        status: 'present',
        autoMarked: false,
        notes: 'Manual check-in by employee',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'attendance', attId), attData, { merge: true });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard', userProfile.uid] });
      await logActivity(
        'MANUAL_ATTENDANCE',
        userProfile.uid,
        attId,
        'attendance' as any,
        `Employee marked attendance as present at ${checkInTimeStr}`
      );
      setStatusBanner({
        type: 'success',
        message: `Checked in for today at ${checkInTimeStr}.`,
      });
    } catch (err) {
      console.error('Failed to check in', err);
      setStatusBanner({
        type: 'error',
        message: 'Could not record check-in. Please try again.',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <DashboardModuleSkeleton
        variant="page"
        label="Loading employee workspace..."
      />
    );
  }

  const todayStr = getLocalDateString();
  const todayRecord = attendances.find((a) => {
    if (!a.date) return false;
    if (typeof a.date === 'string') return a.date === todayStr;
    const d = a.date.toDate ? a.date.toDate() : new Date(a.date);
    return getLocalDateString(d) === todayStr;
  });
  const todayCheckedIn = !!todayRecord;

  return (
    <div className="space-y-6">
      {autoAttendanceNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{autoAttendanceNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoAttendanceNotice(null)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {statusBanner && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {employeeData?.firstName} {employeeData?.lastName}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {employeeData?.position || 'Staff Engineer'} · Department:{' '}
                {employeeData?.departmentId || 'Unassigned'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!todayCheckedIn ? (
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    {isWithinAttendanceWindow() ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        9 AM – 4 PM attendance window active
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        Outside 9 AM – 4 PM window (manual check-in enabled)
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleCheckIn}
                    isLoading={checkingIn}
                    className="flex items-center gap-2 shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    Check In Today
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 rounded-lg font-medium border border-emerald-200 dark:border-emerald-800/60 text-sm">
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Status:{' '}
                      <strong className="capitalize">
                        {todayRecord?.status?.replace('_', ' ')}
                      </strong>
                    </span>
                    {todayRecord?.checkIn && (
                      <span className="text-emerald-700 dark:text-emerald-300 text-xs font-normal ml-1">
                        ({formatTimeDisplay(todayRecord.checkIn)})
                      </span>
                    )}
                  </div>
                  {todayRecord?.autoMarked && (
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      · Auto-marked (9 AM – 4 PM)
                    </span>
                  )}
                  {todayRecord?.modifiedByAdmin && (
                    <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      · Admin Verified
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setActiveTab('projects')}
            >
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {projects.length}
                </p>
              </div>
            </div>

            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-400 transition-colors"
              onClick={() => setActiveTab('tasks')}
            >
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Open Tasks
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {tasks.filter((t) => t.status !== 'COMPLETED').length}
                </p>
              </div>
            </div>

            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-400 transition-colors"
              onClick={() => setActiveTab('tasks')}
            >
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Reviews
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {tasks.filter((t) => t.status === 'REVIEW').length}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">My Tasks</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use the dropdown on any task to update your live progress immediately.
              </p>
            </div>
          </div>
          <div className="p-0">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                          {task.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {task.description}
                        </p>
                      </div>

                      <select
                        aria-label={`Update status for ${task.title}`}
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id!, e.target.value)}
                        className={`text-sm font-medium border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0 ${
                          task.status === 'COMPLETED'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : task.status === 'IN_PROGRESS'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : task.status === 'REVIEW'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : task.status === 'BLOCKED'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Ready for Review</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No tasks assigned yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  Tasks created by your project lead or administrator will appear here.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('projects')}>
                  View Assigned Projects
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h2 className="font-semibold text-slate-800 dark:text-white">Assigned Projects</h2>
          </div>
          <div className="p-0">
            {projects.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <p>
                        Stage:{' '}
                        <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                          {project.stage?.replace(/_/g, ' ') || 'N/A'}
                        </span>
                      </p>
                      <p>
                        Due:{' '}
                        {project.endDate?.toDate
                          ? new Date(project.endDate.toDate()).toLocaleDateString()
                          : 'TBD'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No active projects assigned
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  When an Administrator assigns you to a commercial or R&D project, it appears here.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('attendance')}>
                  Check Attendance & Leave
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              Daily attendance records automatically when you open your workspace between 9:00 AM
              and 4:00 PM. Need time off? Use <strong>New Leave</strong> on the right to submit
              dates and a reason for admin review.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <h2 className="font-semibold text-slate-800 dark:text-white">Attendance Log</h2>
              </div>
              <div className="flex-1 overflow-auto max-h-96">
                {attendances.length > 0 ? (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {attendances.map((a, i) => {
                      const dateStr =
                        typeof a.date === 'string'
                          ? a.date
                          : a.date?.toDate
                          ? a.date.toDate().toLocaleDateString()
                          : String(a.date);
                      const checkInDisplay = formatTimeDisplay(a.checkIn);
                      return (
                        <li
                          key={a.id || i}
                          className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {dateStr}
                              </p>
                              {a.autoMarked && (
                                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                                  · Auto-logged
                                </span>
                              )}
                              {a.modifiedByAdmin && (
                                <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                                  · Admin Adjusted
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {checkInDisplay ? `Check-in: ${checkInDisplay}` : 'No check-in recorded'}
                              {a.checkOut ? ` · Check-out: ${formatTimeDisplay(a.checkOut)}` : ''}
                            </p>
                            {a.adminNotes && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                                Admin Remark: {a.adminNotes}
                              </p>
                            )}
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md self-start sm:self-center capitalize ${
                              a.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : a.status === 'late'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : a.status === 'half_day'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : a.status === 'remote'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {a.status?.replace('_', ' ')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No attendance records found yet. Click <strong>Check In Today</strong> on
                    Overview to log your first entry.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                <h2 className="font-semibold text-slate-800 dark:text-white">Leave Requests</h2>
                <Button size="sm" onClick={() => setShowLeaveForm(!showLeaveForm)}>
                  {showLeaveForm ? 'Cancel' : 'New Leave'}
                </Button>
              </div>
              <div className="flex-1 overflow-auto max-h-96">
                {showLeaveForm && (
                  <form
                    onSubmit={handleLeaveRequest}
                    className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" name="startDate" label="Start Date" required />
                      <Input type="date" name="endDate" label="End Date" required />
                    </div>
                    <Textarea
                      name="reason"
                      label="Reason"
                      placeholder="Briefly describe your leave reason..."
                      required
                    />
                    <Button type="submit" isLoading={submittingLeave}>
                      Submit Request
                    </Button>
                  </form>
                )}

                {leaveRequests.length > 0 ? (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {leaveRequests.map((lr, i) => {
                      const s = lr.startDate?.toDate
                        ? lr.startDate.toDate()
                        : new Date(lr.startDate);
                      const e = lr.endDate?.toDate ? lr.endDate.toDate() : new Date(lr.endDate);
                      return (
                        <li key={lr.id || i} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-slate-900 dark:text-white text-sm">
                              {s.toLocaleDateString()} to {e.toLocaleDateString()}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded font-medium capitalize ${
                                lr.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : lr.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {lr.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{lr.reason}</p>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No leave requests submitted yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
