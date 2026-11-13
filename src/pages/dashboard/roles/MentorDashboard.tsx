import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProjectTask } from '../../../types';
import { Users, GraduationCap, ClipboardList, Target, CheckSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { logActivity } from '../../../lib/activityLogger';
import { useMentorDashboard } from '../../../hooks/useDashboardQueries';

const UserActivity = React.lazy(() =>
  import('../../../components/UserActivity').then((m) => ({ default: m.UserActivity }))
);

type MentorTab = 'overview' | 'interns' | 'evaluations';
const VALID_MENTOR_TABS: MentorTab[] = ['overview', 'interns', 'evaluations'];

export default function MentorDashboard() {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading: loading } = useMentorDashboard(userProfile?.uid);
  const interns = data?.interns || [];
  const [localTasks, setLocalTasks] = useState<ProjectTask[] | null>(null);
  const tasks = localTasks ?? (data?.tasks || []);

  const queryTab = searchParams.get('tab') as MentorTab | null;
  const [activeTab, setActiveTabState] = useState<MentorTab>(
    queryTab && VALID_MENTOR_TABS.includes(queryTab) ? queryTab : 'overview'
  );
  
  const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  
  const [evaluatingTaskId, setEvaluatingTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (data?.tasks) {
      setLocalTasks(data.tasks);
    }
  }, [data?.tasks]);

  useEffect(() => {
    if (queryTab && VALID_MENTOR_TABS.includes(queryTab)) {
      setActiveTabState(queryTab);
    } else if (!queryTab) {
      setActiveTabState('overview');
    }
  }, [queryTab]);

  const setActiveTab = (tab: MentorTab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };
  
  const handleAssignTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userProfile?.uid || !selectedInternId) return;
    setAssigningTask(true);
    setStatusBanner(null);
    
    const formData = new FormData(e.currentTarget);
    const taskPayload = {
      projectId: 'internship_program',
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assignedTo: selectedInternId,
      status: 'TODO',
      createdAt: serverTimestamp()
    };
    
    try {
      const docRef = await addDoc(collection(db, 'projectTasks'), taskPayload);
      setLocalTasks([...tasks, { id: docRef.id, ...taskPayload } as ProjectTask]);
      setShowAssignForm(false);
      setStatusBanner({ type: 'success', message: 'Task assigned to intern.' });
      queryClient.invalidateQueries({ queryKey: ['mentor-dashboard', userProfile.uid] });
      
      await logActivity('TASK_ASSIGNED', userProfile.uid, docRef.id, 'task', `Mentor assigned task to Intern ${selectedInternId}`);
    } catch (err) {
      console.error(err);
      setStatusBanner({ type: 'error', message: 'Failed to assign task. Please try again.' });
    } finally {
      setAssigningTask(false);
    }
  };
  
  const handleSubmitEvaluation = async (taskId: string, internId: string) => {
    setStatusBanner(null);
    try {
      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: 'COMPLETED',
        mentorFeedback: feedback,
        evaluatedAt: serverTimestamp()
      });
      
      setLocalTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'COMPLETED', mentorFeedback: feedback } as any : t));
      
      if (userProfile?.uid) {
        await logActivity('INTERN_EVALUATION', userProfile.uid, internId, 'user', feedback);
        queryClient.invalidateQueries({ queryKey: ['mentor-dashboard', userProfile.uid] });
      }
      
      setEvaluatingTaskId(null);
      setFeedback('');
      setStatusBanner({ type: 'success', message: 'Evaluation submitted and task marked complete.' });
    } catch (error) {
      console.error(error);
      setStatusBanner({ type: 'error', message: 'Failed to submit evaluation. Please try again.' });
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />;
  
  const pendingEvals = tasks.filter(t => t.status === 'REVIEW');

  return (
    <div className="space-y-6">
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-purple-300 transition-colors" onClick={() => setActiveTab('interns')}>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">My Interns</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{interns.length}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab('evaluations')}>
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Evaluations</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{pendingEvals.length}</p>
              </div>
            </div>
          </div>

          <Suspense fallback={<div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />}>
            <UserActivity compact />
          </Suspense>
        </div>
      )}

      {activeTab === 'interns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-slate-500" />
                Assigned Interns
              </h2>
            </div>
            <div className="flex-1 overflow-auto">
              {interns.length > 0 ? (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {interns.map(intern => (
                    <li 
                      key={intern.id} 
                      className={`p-4 cursor-pointer transition-colors ${selectedInternId === intern.id ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-transparent'}`}
                      onClick={() => { setSelectedInternId(intern.id!); setShowAssignForm(false); }}
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{intern.firstName} {intern.lastName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{intern.email}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No interns assigned currently.
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[600px] flex flex-col">
            {selectedInternId ? (
              <>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-800 dark:text-white">Intern Progress</h2>
                  <Button size="sm" onClick={() => setShowAssignForm(!showAssignForm)}>
                    {showAssignForm ? 'Cancel' : 'Assign Task'}
                  </Button>
                </div>
                
                <div className="flex-1 overflow-auto p-0 relative">
                  {showAssignForm && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 z-10 p-6 overflow-auto border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Assign New Task</h3>
                      <form onSubmit={handleAssignTask} className="space-y-4 max-w-lg">
                        <Input name="title" label="Task Title" required />
                        <Textarea name="description" label="Detailed Instructions" required />
                        <Button type="submit" isLoading={assigningTask}>Assign Task</Button>
                      </form>
                    </div>
                  )}
                  
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tasks.filter(t => t.assignedTo === selectedInternId).length > 0 ? (
                      tasks.filter(t => t.assignedTo === selectedInternId).map(task => (
                        <li key={task.id} className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium 
                              ${task.status === 'TODO' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : ''}
                              ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' : ''}
                              ${task.status === 'REVIEW' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : ''}
                              ${task.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : ''}
                            `}>
                              {task.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{task.description}</p>
                        </li>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <Target className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        No tasks assigned to this intern yet.
                      </div>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 p-6 flex-col">
                <Users className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
                <p>Select an intern from the list to view progress and assign tasks.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'evaluations' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-slate-800 dark:text-white">Pending Evaluations</h2>
          </div>
          <div className="p-0">
            {pendingEvals.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingEvals.map(task => {
                  const intern = interns.find(i => i.id === task.assignedTo);
                  return (
                    <li key={task.id} className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-lg">{task.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Submitted by: {intern?.firstName} {intern?.lastName}</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          Awaiting Review
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg my-4 border border-slate-100 dark:border-slate-700">
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">Intern's Submission Note:</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{task.submissionNote || 'No notes provided.'}</p>
                      </div>
                      
                      {evaluatingTaskId === task.id ? (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <Textarea 
                            label="Evaluation & Feedback"
                            placeholder="Provide constructive feedback for the intern..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSubmitEvaluation(task.id!, task.assignedTo)}>Approve & Complete Task</Button>
                            <Button size="sm" variant="outline" onClick={() => setEvaluatingTaskId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setEvaluatingTaskId(task.id!)}>Evaluate Submission</Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">All caught up</h3>
                <p className="text-slate-500 dark:text-slate-400">There are no intern submissions waiting for your review.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

