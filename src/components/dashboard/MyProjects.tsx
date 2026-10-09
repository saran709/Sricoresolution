import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project, ProjectTask } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function MyProjects() {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const fetchProjectsAndTasks = async () => {
      try {
        // Fetch projects
        const projQuery = query(collection(db, 'projects'), where('clientId', '==', userProfile.uid));
        const projSnap = await getDocs(projQuery);
        const projectsData = projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(projectsData);

        if (projectsData.length > 0) {
          // Fetch tasks (as milestones)
          const projectIds = projectsData.map(p => p.id as string);
          // Firestore 'in' query limit is 10. For simplicity, we just fetch for all.
          // In a real app with many projects, we'd need pagination or a different query.
          const taskQuery = query(collection(db, 'projectTasks'), where('projectId', 'in', projectIds));
          const taskSnap = await getDocs(taskQuery);
          setTasks(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTask)));
        }
      } catch (error) {
        console.error("Error fetching projects/tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndTasks();
  }, [userProfile]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">My Projects</h2>
      {projects.length === 0 ? (
        <p className="text-slate-500">No active projects found.</p>
      ) : (
        <div className="space-y-6">
          {projects.map(project => (
            <div key={project.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase font-bold">{project.status}</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">{project.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Milestones</h4>
                {tasks.filter(t => t.projectId === project.id && t.status !== 'COMPLETED').length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No upcoming milestones.</p>
                ) : (
                  tasks.filter(t => t.projectId === project.id && t.status !== 'COMPLETED').map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {task.title} - Due: {task.dueDate?.toDate ? new Date(task.dueDate.toDate()).toLocaleDateString() : 'TBD'}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
