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

export default function EmployeeDashboard() {
  const { userProfile } = useAuth();
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'projects' | 'attendance' | 'reports'>('overview');
  
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const fetchData = async () => {
      try {
        setEmployeeData(userProfile as Employee);
      
        const projQuery = query(
          collection(db, 'projects'),
          where('assignedEmployees', 'array-contains', userProfile.uid)
        );
        const projSnap = await getDocs(projQuery);
        setProjects(projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));

        const taskQuery = query(
          collection(db, 'projectTasks'),
          where('assignedTo', '==', userProfile.uid)
        );
        const taskSnap = await getDocs(taskQuery);
        setTasks(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTask)));
        
        const leaveQuery = query(
          collection(db, 'leaveRequests'),
          where('userId', '==', userProfile.uid),
        );
        const leaveSnap = await getDocs(leaveQuery);
        setLeaveRequests(leaveSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest)));
        
        const attQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', userProfile.uid)
        );
        const attSnap = await getDocs(attQuery);
        setAttendances(attSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance)).sort((a,b) => b.date - a.date));
        
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: newStatus
      });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
      
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
      const docRef = await addDoc(collection(db, 'leaveRequests'), data);
      setLeaveRequests([...leaveRequests, { id: docRef.id, ...data } as LeaveRequest]);
      setShowLeaveForm(false);
      
      await logActivity(
        'LEAVE_REQUESTED',
        userProfile.uid,
        docRef.id,
        'user',
        `Employee requested leave for ${data.startDate.toLocaleDateString()}`
      );
    } catch (err) {
      console.error("Failed to submit leave", err);
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleCheckIn = async () => {
    if (!userProfile?.uid) return;
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const attData = {
        userId: userProfile.uid,
        date: today,
        checkIn: now,
        status: 'present'
      };
      
      const docRef = await addDoc(collection(db, 'attendance'), attData);
      setAttendances([{ id: docRef.id, ...attData } as Attendance, ...attendances]);
    } catch (err) {
      console.error("Failed to check in", err);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl"></div>;
  
  const todayCheckedIn = attendances.some(a => {
    if (!a.date) return false;
    const d = a.date.toDate ? a.date.toDate() : new Date(a.date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto mb-6">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Overview</button>
        <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>My Tasks</button>
        <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'projects' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>My Projects</button>
        <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'attendance' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Attendance & Leave</button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{employeeData?.firstName} {employeeData?.lastName}</h3>
              <p className="text-sm text-slate-500">{employeeData?.position || 'Employee'} • Department: {employeeData?.departmentId || 'Unassigned'}</p>
            </div>
            {!todayCheckedIn ? (
              <Button onClick={handleCheckIn} className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> Check In Today
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-medium border border-emerald-100">
                <CheckSquare className="w-5 h-5" /> Checked In
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setActiveTab('projects')}>
              <div className="p-4 rounded-lg bg-amber-50 text-amber-600">
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
                        className={`text-sm font-medium border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500
                          ${task.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                            task.status === 'IN_PROGRESS' ? 'border-amber-200 bg-amber-50 text-amber-700' :
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
                      <span className={`text-xs px-3 py-1 rounded-full font-medium bg-amber-100 text-amber-700`}>
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
                    const dateObj = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                    const checkInObj = a.checkIn?.toDate ? a.checkIn.toDate() : new Date(a.checkIn);
                    return (
                      <li key={a.id || i} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900">{dateObj.toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">In: {checkInObj.toLocaleTimeString()}</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 capitalize">
                          {a.status.replace('_', ' ')}
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

