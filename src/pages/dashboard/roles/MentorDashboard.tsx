import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { User, ProjectTask } from '../../../types';
import { Users, GraduationCap, ClipboardList, Target, Send, CheckSquare } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { logActivity } from '../../../lib/activityLogger';

export default function MentorDashboard() {
  const { userProfile } = useAuth();
  const [interns, setInterns] = useState<User[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'interns' | 'evaluations'>('overview');
  
  const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  
  const [evaluatingTaskId, setEvaluatingTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!userProfile?.uid) return;

    const fetchData = async () => {
      try {
        const internQuery = query(
          collection(db, 'users'),
          where('role', '==', 'INTERN'),
          where('mentorId', '==', userProfile.uid)
        );
        const snap = await getDocs(internQuery);
        const fetchedInterns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setInterns(fetchedInterns);
        
        if (fetchedInterns.length > 0) {
          const internIds = fetchedInterns.map(i => i.id!);
          const tasksRef = collection(db, 'projectTasks');
          
          // Note: query arrays max 10
          const tasksList: ProjectTask[] = [];
          for (let i = 0; i < internIds.length; i += 10) {
            const batch = internIds.slice(i, i + 10);
            const taskQuery = query(tasksRef, where('assignedTo', 'in', batch));
            const tSnap = await getDocs(taskQuery);
            tSnap.docs.forEach(d => tasksList.push({ id: d.id, ...d.data() } as ProjectTask));
          }
          setTasks(tasksList);
        }
      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);
  
  const handleAssignTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userProfile?.uid || !selectedInternId) return;
    setAssigningTask(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      projectId: 'internship_program', // dummy ID for internship tasks
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assignedTo: selectedInternId,
      status: 'TODO',
      createdAt: serverTimestamp()
    };
    
    try {
      const docRef = await addDoc(collection(db, 'projectTasks'), data);
      setTasks([...tasks, { id: docRef.id, ...data } as ProjectTask]);
      setShowAssignForm(false);
      
      await logActivity('TASK_ASSIGNED', userProfile.uid, docRef.id, 'task', `Mentor assigned task to Intern ${selectedInternId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to assign task');
    } finally {
      setAssigningTask(false);
    }
  };
  
  const handleSubmitEvaluation = async (taskId: string, internId: string) => {
    try {
      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: 'COMPLETED',
        mentorFeedback: feedback,
        evaluatedAt: serverTimestamp()
      });
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'COMPLETED', mentorFeedback: feedback } as any : t));
      
      if (userProfile?.uid) {
        await logActivity('INTERN_EVALUATION', userProfile.uid, internId, 'user', feedback);
      }
      
      setEvaluatingTaskId(null);
      setFeedback('');
    } catch (error) {
      console.error(error);
      alert('Failed to submit evaluation');
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl"></div>;
  
  const pendingEvals = tasks.filter(t => t.status === 'REVIEW');

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto mb-6">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Overview</button>
        <button onClick={() => setActiveTab('interns')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'interns' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Intern Management</button>
        <button onClick={() => setActiveTab('evaluations')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'evaluations' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Pending Evaluations {pendingEvals.length > 0 && <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">{pendingEvals.length}</span>}</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-purple-300 transition-colors" onClick={() => setActiveTab('interns')}>
            <div className="p-4 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">My Interns</p>
              <p className="text-2xl font-bold text-slate-900">{interns.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab('evaluations')}>
            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Evaluations</p>
              <p className="text-2xl font-bold text-slate-900">{pendingEvals.length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-slate-500" />
                Assigned Interns
              </h2>
            </div>
            <div className="flex-1 overflow-auto">
              {interns.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {interns.map(intern => (
                    <li 
                      key={intern.id} 
                      className={`p-4 cursor-pointer transition-colors ${selectedInternId === intern.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                      onClick={() => { setSelectedInternId(intern.id!); setShowAssignForm(false); }}
                    >
                      <p className="font-medium text-slate-900">{intern.firstName} {intern.lastName}</p>
                      <p className="text-xs text-slate-500">{intern.email}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No interns assigned currently.
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
            {selectedInternId ? (
              <>
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-800">Intern Progress</h2>
                  <Button size="sm" onClick={() => setShowAssignForm(!showAssignForm)}>
                    {showAssignForm ? 'Cancel' : 'Assign Task'}
                  </Button>
                </div>
                
                <div className="flex-1 overflow-auto p-0 relative">
                  {showAssignForm && (
                    <div className="absolute inset-0 bg-white z-10 p-6 overflow-auto border-b border-slate-200">
                      <h3 className="text-lg font-medium mb-4">Assign New Task</h3>
                      <form onSubmit={handleAssignTask} className="space-y-4 max-w-lg">
                        <Input name="title" label="Task Title" required />
                        <Textarea name="description" label="Detailed Instructions" required />
                        <Button type="submit" isLoading={assigningTask}>Assign Task</Button>
                      </form>
                    </div>
                  )}
                  
                  <ul className="divide-y divide-slate-100">
                    {tasks.filter(t => t.assignedTo === selectedInternId).length > 0 ? (
                      tasks.filter(t => t.assignedTo === selectedInternId).map(task => (
                        <li key={task.id} className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-slate-900">{task.title}</p>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium 
                              ${task.status === 'TODO' ? 'bg-slate-100 text-slate-800' : ''}
                              ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : ''}
                              ${task.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : ''}
                              ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ''}
                            `}>
                              {task.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        </li>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-500">
                        <Target className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        No tasks assigned to this intern yet.
                      </div>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 p-6 flex-col">
                <Users className="w-12 h-12 mb-4 text-slate-300" />
                <p>Select an intern from the list to view progress and assign tasks.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Pending Evaluations</h2>
          </div>
          <div className="p-0">
            {pendingEvals.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {pendingEvals.map(task => {
                  const intern = interns.find(i => i.id === task.assignedTo);
                  return (
                    <li key={task.id} className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-slate-900 text-lg">{task.title}</p>
                          <p className="text-sm text-slate-500">Submitted by: {intern?.firstName} {intern?.lastName}</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-800">
                          Awaiting Review
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-lg my-4 border border-slate-100">
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Intern's Submission Note:</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.submissionNote || 'No notes provided.'}</p>
                      </div>
                      
                      {evaluatingTaskId === task.id ? (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
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
                  )
                })}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up</h3>
                <p className="text-slate-500">There are no intern submissions waiting for your review.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

