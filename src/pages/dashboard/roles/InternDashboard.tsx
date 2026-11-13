import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProjectTask } from '../../../types';
import { BookOpen, Target, Calendar, FileBadge, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { logActivity } from '../../../lib/activityLogger';
import { useInternDashboard } from '../../../hooks/useDashboardQueries';

type InternTab = 'overview' | 'assignments' | 'feedback' | 'certificates';
const VALID_INTERN_TABS: InternTab[] = ['overview', 'assignments', 'feedback', 'certificates'];

export default function InternDashboard() {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading: loading } = useInternDashboard(userProfile);
  const mentor = data?.mentor || null;
  const program = data?.program || null;
  const feedback = data?.feedback || [];
  const [localTasks, setLocalTasks] = useState<ProjectTask[] | null>(null);
  const tasks = localTasks ?? (data?.tasks || []);

  const queryTab = searchParams.get('tab') as InternTab | null;
  const [activeTab, setActiveTabState] = useState<InternTab>(
    queryTab && VALID_INTERN_TABS.includes(queryTab) ? queryTab : 'overview'
  );
  
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (data?.tasks) {
      setLocalTasks(data.tasks);
    }
  }, [data?.tasks]);

  useEffect(() => {
    if (queryTab && VALID_INTERN_TABS.includes(queryTab)) {
      setActiveTabState(queryTab);
    } else if (!queryTab) {
      setActiveTabState('overview');
    }
  }, [queryTab]);

  const setActiveTab = (tab: InternTab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  const handleSubmitAssignment = async (taskId: string) => {
    setStatusBanner(null);
    try {
      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: 'REVIEW',
        submissionNote: submissionNote,
        submittedAt: serverTimestamp()
      });
      
      setLocalTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'REVIEW', submissionNote } : t));
      
      if (userProfile?.uid) {
        await logActivity(
          'TASK_SUBMITTED',
          userProfile.uid,
          taskId,
          'task',
          `Intern submitted task for review: ${taskId}`
        );
        queryClient.invalidateQueries({ queryKey: ['intern-dashboard', userProfile.uid] });
      }
      
      setSubmittingTaskId(null);
      setSubmissionNote('');
      setStatusBanner({ type: 'success', message: 'Assignment submitted for mentor review.' });
    } catch (error) {
      console.error("Failed to submit task", error);
      setStatusBanner({ type: 'error', message: 'Failed to submit assignment. Please try again.' });
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-800 dark:text-white">My Mentor</h3>
            </div>
            {mentor ? (
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{mentor.firstName} {mentor.lastName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{mentor.email}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Not assigned yet</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 dark:text-white">Program</h3>
            </div>
            {program ? (
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{program.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{program.mode} - {program.durationMonths} months</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No program details found</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab('assignments')}>
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Assignments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{tasks.length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-slate-800 dark:text-white">My Assignments</h2>
          </div>
          <div className="p-0">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map(task => (
                  <li key={task.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-slate-900 dark:text-white text-lg">{task.title}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium 
                        ${task.status === 'TODO' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : ''}
                        ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' : ''}
                        ${task.status === 'REVIEW' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : ''}
                        ${task.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : ''}
                      `}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{task.description}</p>
                    
                    {(task.status === 'TODO' || task.status === 'IN_PROGRESS') && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {submittingTaskId === task.id ? (
                          <div className="space-y-3">
                            <Textarea 
                              placeholder="Add submission notes or links to your work..."
                              value={submissionNote}
                              onChange={(e) => setSubmissionNote(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSubmitAssignment(task.id!)}>Submit Work</Button>
                              <Button size="sm" variant="outline" onClick={() => setSubmittingTaskId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setSubmittingTaskId(task.id!)}>
                            Submit Assignment
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                No assignments given yet.
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-slate-800 dark:text-white">Feedback & Evaluations</h2>
          </div>
          <div className="p-0">
            {feedback.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {feedback.map(fb => (
                  <li key={fb.id} className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{fb.action.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {fb.timestamp?.toDate ? new Date(fb.timestamp.toDate()).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap pl-6">{fb.details}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                No feedback received yet.
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'certificates' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-12 text-center">
          <FileBadge className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Certificates Available</h3>
          <p className="text-slate-500 dark:text-slate-400">Your internship certificate will appear here upon successful completion of your program and mentor authorization.</p>
        </div>
      )}
    </div>
  );
}
