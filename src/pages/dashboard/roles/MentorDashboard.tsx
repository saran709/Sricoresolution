import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProjectTask } from '../../../types';
import {
  Users,
  GraduationCap,
  ClipboardList,
  Target,
  CheckSquare,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { logActivity } from '../../../lib/activityLogger';
import { useMentorDashboard } from '../../../hooks/useDashboardQueries';
import {
  DashboardModuleSkeleton,
  DashboardSuspense,
} from '../../../components/ui/DashboardSuspense';

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
  const [submittingEval, setSubmittingEval] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
      title: (formData.get('title') as string).trim(),
      description: (formData.get('description') as string).trim(),
      assignedTo: selectedInternId,
      status: 'TODO',
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'projectTasks'), taskPayload);
      setLocalTasks([...tasks, { id: docRef.id, ...taskPayload } as ProjectTask]);
      setShowAssignForm(false);
      setStatusBanner({ type: 'success', message: 'Task assigned to intern.' });
      queryClient.invalidateQueries({ queryKey: ['mentor-dashboard', userProfile.uid] });

      await logActivity(
        'TASK_ASSIGNED',
        userProfile.uid,
        docRef.id,
        'task',
        `Mentor assigned task "${taskPayload.title}" to Intern ${selectedInternId}`
      );
    } catch (err) {
      console.error(err);
      setStatusBanner({
        type: 'error',
        message: 'Failed to assign task. Please try again.',
      });
    } finally {
      setAssigningTask(false);
    }
  };

  const handleSubmitEvaluation = async (
    taskId: string,
    internId: string,
    outcome: 'COMPLETED' | 'IN_PROGRESS'
  ) => {
    setStatusBanner(null);
    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback) {
      setStatusBanner({
        type: 'error',
        message: 'Please enter constructive feedback before submitting your evaluation.',
      });
      return;
    }

    setSubmittingEval(true);
    try {
      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: outcome,
        mentorFeedback: trimmedFeedback,
        evaluatedAt: serverTimestamp(),
      });

      setLocalTasks(
        tasks.map((t) =>
          t.id === taskId ? ({ ...t, status: outcome, mentorFeedback: trimmedFeedback } as any) : t
        )
      );

      if (userProfile?.uid) {
        await logActivity('INTERN_EVALUATION', userProfile.uid, internId, 'user', trimmedFeedback);
        queryClient.invalidateQueries({ queryKey: ['mentor-dashboard', userProfile.uid] });
      }

      setEvaluatingTaskId(null);
      setFeedback('');
      setStatusBanner({
        type: 'success',
        message:
          outcome === 'COMPLETED'
            ? 'Evaluation approved and task marked Complete.'
            : 'Revision feedback sent back to intern (status set to In Progress).',
      });
    } catch (error) {
      console.error(error);
      setStatusBanner({
        type: 'error',
        message: 'Failed to submit evaluation. Please try again.',
      });
    } finally {
      setSubmittingEval(false);
    }
  };

  if (loading) {
    return (
      <DashboardModuleSkeleton
        variant="page"
        label="Loading mentor workspace..."
      />
    );
  }

  const pendingEvals = tasks.filter((t) => t.status === 'REVIEW');

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
            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => setActiveTab('interns')}
            >
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">My Interns</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {interns.length}
                </p>
              </div>
            </div>

            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-400 transition-colors"
              onClick={() => setActiveTab('evaluations')}
            >
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Evaluations
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {pendingEvals.length}
                </p>
              </div>
            </div>

            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setActiveTab('interns')}
            >
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Completed Tasks
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {tasks.filter((t) => t.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>

          <DashboardSuspense variant="chart" moduleName="User Activity Analytics">
            <UserActivity compact />
          </DashboardSuspense>
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
            <div className="flex-1 overflow-auto p-2">
              {interns.length > 0 ? (
                <ul className="space-y-1">
                  {interns.map((intern) => {
                    const isSelected = selectedInternId === intern.id;
                    return (
                      <li
                        key={intern.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-300 dark:ring-amber-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                        onClick={() => {
                          setSelectedInternId(intern.id!);
                          setShowAssignForm(false);
                        }}
                      >
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                          {intern.firstName} {intern.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{intern.email}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    No interns assigned currently
                  </p>
                  <p className="text-xs">
                    Contact your Administrator to map cohort interns to your mentor account.
                  </p>
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
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                        Assign New Task
                      </h3>
                      <form onSubmit={handleAssignTask} className="space-y-4 max-w-lg">
                        <Input name="title" label="Task Title" required />
                        <Textarea
                          name="description"
                          label="Detailed Instructions"
                          placeholder="Outline deliverables, learning goals, and submission format..."
                          required
                        />
                        <Button type="submit" isLoading={assigningTask}>
                          Assign Task
                        </Button>
                      </form>
                    </div>
                  )}

                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tasks.filter((t) => t.assignedTo === selectedInternId).length > 0 ? (
                      tasks
                        .filter((t) => t.assignedTo === selectedInternId)
                        .map((task) => (
                          <li key={task.id} className="p-6">
                            <div className="flex justify-between items-start mb-2 gap-3">
                              <p className="font-medium text-slate-900 dark:text-white">
                                {task.title}
                              </p>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-md font-semibold shrink-0 ${
                                  task.status === 'TODO'
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                    : task.status === 'IN_PROGRESS'
                                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                    : task.status === 'REVIEW'
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                }`}
                              >
                                {task.status?.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                              {task.description}
                            </p>
                          </li>
                        ))
                    ) : (
                      <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <Target className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="mb-3">No tasks assigned to this intern yet.</p>
                        <Button size="sm" onClick={() => setShowAssignForm(true)}>
                          Assign First Task
                        </Button>
                      </div>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 p-6 flex-col text-center">
                <Users className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select an intern from the left list
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  View their current deliverables and assign new practical milestones.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-slate-800 dark:text-white">Pending Evaluations</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review submitted assignments, leave feedback, and either approve completion or send
              back for revision.
            </p>
          </div>
          <div className="p-0">
            {pendingEvals.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingEvals.map((task) => {
                  const intern = interns.find((i) => i.id === task.assignedTo);
                  return (
                    <li key={task.id} className="p-6">
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-lg">
                            {task.title}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Submitted by: {intern?.firstName} {intern?.lastName}
                          </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                          Awaiting Review
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg my-4 border border-slate-100 dark:border-slate-700">
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Intern&apos;s Submission Note:
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                          {task.submissionNote || 'No notes provided.'}
                        </p>
                      </div>

                      {evaluatingTaskId === task.id ? (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <Textarea
                            label="Evaluation & Constructive Feedback (required)"
                            placeholder="Share what was done well and any next steps..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              isLoading={submittingEval}
                              onClick={() =>
                                handleSubmitEvaluation(task.id!, task.assignedTo, 'COMPLETED')
                              }
                            >
                              Approve & Complete Task
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              isLoading={submittingEval}
                              onClick={() =>
                                handleSubmitEvaluation(task.id!, task.assignedTo, 'IN_PROGRESS')
                              }
                              className="inline-flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Request Revision
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEvaluatingTaskId(null);
                                setFeedback('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setEvaluatingTaskId(task.id!)}>
                          Evaluate Submission
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  All caught up
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  There are no intern submissions waiting for your review right now.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('interns')}>
                  View Assigned Interns
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
