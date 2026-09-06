import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, CheckCircle, FileText, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'projectTasks'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setTasks(items);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    `${t.title} ${t.assignedTo} ${t.projectId}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-sm text-slate-500">Manage organizational project tasks</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Task
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                      <div className="text-xs">Loading tasks...</div>
                    </div>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{task.title}</div>
                      <div className="text-slate-500 text-xs mt-1">Project: {task.projectId}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{task.assignedTo || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium 
                        ${task.status === 'TODO' ? 'bg-slate-100 text-slate-800' : ''}
                        ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : ''}
                        ${task.status === 'BLOCKED' ? 'bg-red-100 text-red-800' : ''}
                        ${task.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : ''}
                        ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ''}
                      `}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
