import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { User, ProjectTask, InternshipProgram, ActivityHistory } from '../../../types';
import { BookOpen, Target, Calendar, CheckCircle, FileText, FileBadge, MessageSquare } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { logActivity } from '../../../lib/activityLogger';

export default function InternDashboard() {
  const { userProfile } = useAuth();
  const [mentor, setMentor] = useState<User | null>(null);
  const [program, setProgram] = useState<InternshipProgram | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [feedback, setFeedback] = useState<ActivityHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'feedback' | 'certificates'>('overview');
  
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');

  useEffect(() => {
    if (!userProfile?.uid) return;

    const fetchData = async () => {
      try {
        if (userProfile.mentorId) {
          try {
            const mDoc = await getDoc(doc(db, 'users', userProfile.mentorId));
            if (mDoc.exists()) {
              setMentor({ id: mDoc.id, ...mDoc.data() } as User);
            }
          } catch(e: any) { console.warn('Ignored transient getDoc error:', e.message); }
        }
        
        if (userProfile.programId) {
          try {
            const pDoc = await getDoc(doc(db, 'internship_programs', userProfile.programId));
            if (pDoc.exists()) {
              setProgram({ id: pDoc.id, ...pDoc.data() } as InternshipProgram);
            }
          } catch(e: any) { console.warn('Ignored transient getDoc error:', e.message); }
        }

        const taskQuery = query(
          collection(db, 'projectTasks'),
          where('assignedTo', '==', userProfile.uid)
        );
        const taskSnap = await getDocs(taskQuery);
        setTasks(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTask)));
        
        const fbQuery = query(
          collection(db, 'auditLogs'),
          where('resourceId', '==', userProfile.uid),
          where('action', 'in', ['INTERN_FEEDBACK', 'INTERN_EVALUATION'])
        );
        const fbSnap = await getDocs(fbQuery);
        setFeedback(fbSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityHistory)));

      } catch (error) {
        console.error("Error fetching intern data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  const handleSubmitAssignment = async (taskId: string) => {
    try {
      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: 'REVIEW',
        submissionNote: submissionNote,
        submittedAt: serverTimestamp()
      });
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'REVIEW', submissionNote } : t));
      
      if (userProfile?.uid) {
        await logActivity(
          'TASK_SUBMITTED',
          userProfile.uid,
          taskId,
          'task',
          `Intern submitted task for review: ${taskId}`
        );
      }
      
      setSubmittingTaskId(null);
      setSubmissionNote('');
    } catch (error) {
      console.error("Failed to submit task", error);
      alert("Failed to submit assignment");
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto mb-6">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Overview</button>
        <button onClick={() => setActiveTab('assignments')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'assignments' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>My Assignments</button>
        <button onClick={() => setActiveTab('feedback')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'feedback' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Feedback & Evals</button>
        <button onClick={() => setActiveTab('certificates')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'certificates' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Certificates</button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-800">My Mentor</h3>
              </div>
              {mentor ? (
                <div>
                  <p className="font-medium text-slate-900">{mentor.firstName} {mentor.lastName}</p>
                  <p className="text-sm text-slate-500">{mentor.email}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Not assigned yet</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800">Program</h3>
              </div>
              {program ? (
                <div>
                  <p className="font-medium text-slate-900">{program.title}</p>
                  <p className="text-sm text-slate-500">{program.mode} - {program.durationMonths} months</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No program details found</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab('assignments')}>
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Assignments</p>
                <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">My Assignments</h2>
          </div>
          <div className="p-0">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {tasks.map(task => (
                  <li key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-slate-900 text-lg">{task.title}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium 
                        ${task.status === 'TODO' ? 'bg-slate-100 text-slate-800' : ''}
                        ${task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : ''}
                        ${task.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : ''}
                        ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ''}
                      `}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{task.description}</p>
                    
                    {(task.status === 'TODO' || task.status === 'IN_PROGRESS') && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
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
              <div className="p-12 text-center text-slate-500 text-sm">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                No assignments given yet.
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Feedback & Evaluations</h2>
          </div>
          <div className="p-0">
            {feedback.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {feedback.map(fb => (
                  <li key={fb.id} className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-slate-900 text-sm">{fb.action.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {fb.timestamp?.toDate ? new Date(fb.timestamp.toDate()).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap pl-6">{fb.details}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">
                No feedback received yet.
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'certificates' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-12 text-center">
          <FileBadge className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Certificates Available</h3>
          <p className="text-slate-500">Your internship certificate will appear here upon successful completion of your program and mentor authorization.</p>
        </div>
      )}
    </div>
  );
}
