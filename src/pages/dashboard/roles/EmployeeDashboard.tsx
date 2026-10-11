import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Project, ProjectTask, Attendance, LeaveRequest, Employee } from '../../../types';
import { Briefcase, CheckSquare, Clock, Calendar, FileText, Send, UserCheck, Search } from 'lucide-react';
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
  formatTimeDisplay 
} from '../../../lib/attendanceService';
import { setDoc } from 'firebase/firestore';

export default function EmployeeDashboard() {
  const { userProfile } = useAuth();
  const employeeData = userProfile as Employee | null;
  const { data, isLoading: loading } = useEmployeeDashboard(userProfile?.uid);

  const projects = data?.projects || [];
  const tasks = data?.tasks || [];
  const leaveRequests = data?.leaveRequests || [];
  const attendances = data?.attendances || [];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'projects' | 'attendance' | 'reports'>('overview');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: newStatus
      });
      if (userProfile?.uid) {
        queryClient.invalidateQueries({ queryKey: ['employee-dashboard', userProfile.uid] });
      }
      
      if (userProfile?.uid) {
        await logActivity(
          'TASK_STATUS_UPDATED',
          userProfile.uid,
          taskId,
          'task',
          `Employee updated task to ${newStatus}`
        );
      }
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };
  
  const handleLeaveRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userProfile?.uid) return;
    setSubmittingLeave(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      userId: userProfile.uid,
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      reason: formData.get('reason') as string,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    
    try {
      await addDoc(collection(db, 'leaveRequests'), data);
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard', userProfile.uid] });
      setShowLeaveForm(false);
      
      await logActivity(
        'LEAVE_REQUESTED',
        userProfile.uid,
        userProfile.uid,
        'user',
        `Employee requested leave for ${data.startDate.toLocaleDateString()}`
      );
    } catch (err) {
      console.error("Failed to submit leave", err);
    } finally {
      setSubmittingLeave(false);
    }
  };

  const [autoAttendanceNotice, setAutoAttendanceNotice] = useState<string | null>(null);

  // Auto-mark attendance when employee visits dashboard between 9:00 AM and 4:00 PM
  useEffect(() => {
    if (userProfile?.uid && ['EMPLOYEE', 'MENTOR', 'INTERN'].includes(userProfile?.role || '')) {
      autoMarkEmployeeAttendance(userProfile).then((res) => {
        if (res.marked) {
          setAutoAttendanceNotice(res.message);
          queryClient.invalidateQueries({ queryKey: ['employee-dashboard', userProfile.uid] });
        }
      }).catch(err => {
        console.warn('Auto attendance failed:', err);
      });
    }
  }, [userProfile?.uid, userProfile?.role]);

  const handleCheckIn = async () => {
    if (!userProfile?.uid) return;
    try {
      const now = new Date();
      const todayStr = getLocalDateString(now);
      const attId = `${userProfile.uid}_${todayStr}`;
      const checkInTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      const attData: Attendance = {
        id: attId,
        userId: userProfile.uid,
        userName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || userProfile.email || 'Employee',
        userEmail: userProfile.email || '',
        userRole: userProfile.role,
        departmentId: employeeData?.departmentId || '',
        date: todayStr,
        checkIn: checkInTimeStr,
        status: 'present',
        autoMarked: false,
        notes: 'Manual check-in by employee',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'attendance', attId), attData, { merge: true });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard', userProfile.uid] });
      await logActivity('MANUAL_ATTENDANCE', userProfile.uid, attId, 'attendance' as any, `Employee marked attendance as present at ${checkInTimeStr}`);
    } catch (err) {
      console.error("Failed to check in", err);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl"></div>;
  
  const todayStr = getLocalDateString();
  const todayRecord = attendances.find(a => {
    if (!a.date) return false;
    if (typeof a.date === 'string') return a.date === todayStr;
    const d = a.date.toDate ? a.date.toDate() : new Date(a.date);
    return getLocalDateString(d) === todayStr;
  });
  const todayCheckedIn = !!todayRecord;

  return (
    <div className="space-y-6">
      {autoAttendanceNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{autoAttendanceNotice}</span>
          </div>
          <button 
            onClick={() => setAutoAttendanceNotice(null)} 
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto mb-6">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Overview</button>
        <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>My Tasks</button>
        <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'projects' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>My Projects</button>
        <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'attendance' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Attendance & Leave</button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{employeeData?.firstName} {employeeData?.lastName}</h3>
              <p className="text-sm text-slate-500">{employeeData?.position || 'Employee'} • Department: {employeeData?.departmentId || 'Unassigned'}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              {!todayCheckedIn ? (
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 hidden sm:block">
                    {isWithinAttendanceWindow() ? (
                      <span className="text-emerald-600 font-medium">● 9 AM – 4 PM window active</span>
                    ) : (
                      <span className="text-amber-600 font-medium">● Outside 9 AM – 4 PM window</span>
                    )}
                  </div>
                  <Button onClick={handleCheckIn} className="flex items-center gap-2 shadow-sm">
                    <UserCheck className="w-4 h-4" /> Check In Today
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-lg font-medium border border-emerald-200 text-sm">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Status: <strong className="capitalize">{todayRecord?.status?.replace('_', ' ')}</strong></span>
                    {todayRecord?.checkIn && (
                      <span className="text-emerald-700 text-xs font-normal ml-1">
                        ({formatTimeDisplay(todayRecord.checkIn)})
                      </span>
                    )}
                  </div>
                  {todayRecord?.autoMarked && (
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg font-medium">
                      ⚡ Auto-marked (9 AM - 4 PM)
                    </span>
                  )}
                  {todayRecord?.modifiedByAdmin && (
                    <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg font-medium">
                      🛡️ Admin Verified
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveTab('projects')}>
              <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Projects</p>
                <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab('tasks')}>
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">My Tasks</p>
                <p className="text-2xl font-bold text-slate-900">{tasks.filter(t => t.status !== 'COMPLETED').length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-4 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
                <p className="text-2xl font-bold text-slate-900">
                  {tasks.filter(t => t.status === 'REVIEW').length}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">My Tasks</h2>
          </div>
          <div className="p-0">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {tasks.map(task => (
                  <li key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">{task.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                      </div>
                      
                      <select 
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id!, e.target.value)}
                        className={`text-sm font-medium border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500
                          ${task.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                            task.status === 'IN_PROGRESS' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                            task.status === 'REVIEW' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                            task.status === 'BLOCKED' ? 'border-red-200 bg-red-50 text-red-700' :
                            'border-slate-200 bg-white text-slate-700'}`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks</h3>
                <p className="text-slate-500">You don't have any tasks assigned yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">My Projects</h2>
          </div>
          <div className="p-0">
            {projects.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {projects.map(project => (
                  <li key={project.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-slate-900">{project.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{project.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <p>Stage: <span className="font-medium text-slate-700 capitalize">{project.stage.replace(/_/g, ' ')}</span></p>
                      <p>Due: {project.endDate?.toDate ? new Date(project.endDate.toDate()).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No active projects</h3>
                <p className="text-slate-500">You haven't been assigned to any projects yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-semibold text-slate-800">Attendance Log</h2>
            </div>
            <div className="flex-1 overflow-auto max-h-96">
              {attendances.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {attendances.map((a, i) => {
                    const dateStr = typeof a.date === 'string' 
                      ? a.date 
                      : (a.date?.toDate ? a.date.toDate().toLocaleDateString() : String(a.date));
                    const checkInDisplay = formatTimeDisplay(a.checkIn);
                    return (
                      <li key={a.id || i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-900">{dateStr}</p>
                            {a.autoMarked && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                                Auto-logged (9 AM - 4 PM)
                              </span>
                            )}
                            {a.modifiedByAdmin && (
                              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
                                Admin Adjusted
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {checkInDisplay ? `Check-in: ${checkInDisplay}` : 'No check-in recorded'}
                            {a.checkOut ? ` • Check-out: ${formatTimeDisplay(a.checkOut)}` : ''}
                          </p>
                          {a.adminNotes && (
                            <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                              Admin Remark: {a.adminNotes}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md self-start sm:self-center capitalize ${
                          a.status === 'present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          a.status === 'late' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          a.status === 'half_day' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          a.status === 'remote' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {a.status?.replace('_', ' ')}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">No attendance records found.</div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Leave Requests</h2>
              <Button size="sm" onClick={() => setShowLeaveForm(!showLeaveForm)}>
                {showLeaveForm ? 'Cancel' : 'New Leave'}
              </Button>
            </div>
            <div className="flex-1 overflow-auto max-h-96">
              {showLeaveForm && (
                <form onSubmit={handleLeaveRequest} className="p-4 border-b border-slate-200 bg-slate-50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" name="startDate" label="Start Date" required />
                    <Input type="date" name="endDate" label="End Date" required />
                  </div>
                  <Textarea name="reason" label="Reason" required />
                  <Button type="submit" isLoading={submittingLeave}>Submit Request</Button>
                </form>
              )}
              
              {leaveRequests.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {leaveRequests.map((lr, i) => {
                    const s = lr.startDate?.toDate ? lr.startDate.toDate() : new Date(lr.startDate);
                    const e = lr.endDate?.toDate ? lr.endDate.toDate() : new Date(lr.endDate);
                    return (
                      <li key={lr.id || i} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-slate-900 text-sm">{s.toLocaleDateString()} to {e.toLocaleDateString()}</p>
                          <span className={`text-xs px-2 py-1 rounded font-medium capitalize
                            ${lr.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              lr.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'}`}
                          >
                            {lr.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{lr.reason}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">No leave requests found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

