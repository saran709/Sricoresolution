import React, { useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Search, 
  CheckCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle, 
  Clock, 
  Calendar, 
  CheckSquare, 
  AlertTriangle, 
  User as UserIcon, 
  FolderKanban,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  assignedTo?: string;
  assigneeId?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'BLOCKED' | 'COMPLETED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function AdminTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Available projects & users for assignment selection
  const [projectsList, setProjectsList] = useState<{ id: string; name: string }[]>([]);
  const [usersList, setUsersList] = useState<{ id: string; name: string; role: string }[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    assigneeId: '',
    status: 'TODO' as TaskItem['status'],
    priority: 'MEDIUM' as NonNullable<TaskItem['priority']>,
    dueDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<TaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tasks and options
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const itemsMap = new Map<string, TaskItem>();

      // 1. Fetch from projectTasks
      try {
        const snap = await getDocs(collection(db, 'projectTasks'));
        snap.forEach(d => {
          itemsMap.set(d.id, { id: d.id, ...d.data() } as TaskItem);
        });
      } catch (err) {
        console.warn("Could not read projectTasks collection:", err);
      }

      // 2. Fallback / supplement with tasks collection
      try {
        const fallbackSnap = await getDocs(collection(db, 'tasks'));
        fallbackSnap.forEach(d => {
          if (!itemsMap.has(d.id)) {
            itemsMap.set(d.id, { id: d.id, ...d.data() } as TaskItem);
          }
        });
      } catch (fallbackErr) {
        console.warn("Could not read fallback tasks collection:", fallbackErr);
      }

      // Sort by creation or title
      const sorted = Array.from(itemsMap.values()).sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      setTasks(sorted);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch supporting entities for selectors
  const fetchAuxiliaryData = useCallback(async () => {
    try {
      // Projects
      const projSnap = await getDocs(collection(db, 'projects'));
      const projs: { id: string; name: string }[] = [];
      projSnap.forEach(d => {
        const data = d.data();
        projs.push({
          id: d.id,
          name: data.projectTitle || data.name || data.title || d.id
        });
      });
      setProjectsList(projs);

      // Users
      const userSnap = await getDocs(collection(db, 'users'));
      const usrs: { id: string; name: string; role: string }[] = [];
      userSnap.forEach(d => {
        const data = d.data();
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || 'User';
        usrs.push({
          id: d.id,
          name: fullName,
          role: data.role || 'MEMBER'
        });
      });
      setUsersList(usrs);
    } catch (e) {
      console.warn("Could not fetch auxiliary projects/users for task selectors:", e);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchAuxiliaryData();
  }, [fetchTasks, fetchAuxiliaryData]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: projectsList[0]?.name || '',
      assignedTo: '',
      assigneeId: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      projectId: task.projectId || '',
      assignedTo: task.assignedTo || '',
      assigneeId: task.assigneeId || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      dueDate: task.dueDate || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle Form Submission
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Please enter a task title.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const taskPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId.trim() || 'General Operations',
        assignedTo: formData.assignedTo.trim() || 'Unassigned',
        assigneeId: formData.assigneeId.trim() || '',
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        updatedAt: serverTimestamp()
      };

      if (editingTask) {
        // Update existing task
        await updateDoc(doc(db, 'projectTasks', editingTask.id), taskPayload);
        // Also update mirror in tasks
        try {
          await setDoc(doc(db, 'tasks', editingTask.id), taskPayload, { merge: true });
        } catch {}

        if (currentUser?.uid) {
          await logActivity('TASK_UPDATED', currentUser.uid, editingTask.id, 'task', `Updated task "${taskPayload.title}"`);
        }

        setFeedback({ message: `Task "${taskPayload.title}" updated successfully!`, type: 'success' });
      } else {
        // Create new task
        const fullPayload = {
          ...taskPayload,
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'projectTasks'), fullPayload);
        // Also mirror to tasks
        try {
          await setDoc(doc(db, 'tasks', docRef.id), { id: docRef.id, ...fullPayload });
        } catch {}

        if (currentUser?.uid) {
          await logActivity('TASK_CREATED', currentUser.uid, docRef.id, 'task', `Created task "${taskPayload.title}"`);
        }

        setFeedback({ message: `New task "${taskPayload.title}" created successfully!`, type: 'success' });
      }

      setIsModalOpen(false);
      await fetchTasks();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Save task error:", err);
      setFormError(err?.message || 'Failed to save task to database.');
    } finally {
      setSaving(false);
    }
  };

  // Inline Quick Status Change
  const handleStatusChange = async (task: TaskItem, newStatus: TaskItem['status']) => {
    try {
      await updateDoc(doc(db, 'projectTasks', task.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      try {
        await updateDoc(doc(db, 'tasks', task.id), {
          status: newStatus,
          updatedAt: serverTimestamp()
        });
      } catch {}

      // Update local state immediately for responsive UI
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

      if (currentUser?.uid) {
        await logActivity('TASK_STATUS_UPDATED', currentUser.uid, task.id, 'task', `Changed status of "${task.title}" to ${newStatus}`);
      }
    } catch (err: any) {
      console.error("Status update error:", err);
      setFeedback({ message: `Failed to update status: ${err?.message}`, type: 'error' });
    }
  };

  // Execute Task Delete
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'projectTasks', deleteTarget.id));
      try {
        await deleteDoc(doc(db, 'tasks', deleteTarget.id));
      } catch {}

      if (currentUser?.uid) {
        await logActivity('TASK_DELETED', currentUser.uid, deleteTarget.id, 'task', `Deleted task "${deleteTarget.title}"`);
      }

      setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
      setFeedback({ message: `Task "${deleteTarget.title}" removed permanently.`, type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Delete task error:", err);
      setFeedback({ message: err?.message || 'Failed to delete task.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = `${t.title} ${t.assignedTo} ${t.projectId} ${t.description}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    review: tasks.filter(t => t.status === 'REVIEW').length,
    blocked: tasks.filter(t => t.status === 'BLOCKED').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-sm text-slate-500">Track and assign milestones, sprints, and engineering deliverables</p>
        </div>
        <Button 
          className="flex items-center gap-2 shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" />
          Create Task
        </Button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border shadow-sm transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ALL' 
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">All Tasks</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('TODO')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'TODO' 
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">To Do</p>
          <p className="text-xl font-bold text-slate-700 mt-1">{stats.todo}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'IN_PROGRESS' 
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-blue-600 uppercase">In Progress</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{stats.inProgress}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('REVIEW')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'REVIEW' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-amber-600 uppercase">Review</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{stats.review}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('BLOCKED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'BLOCKED' 
              ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-red-600 uppercase">Blocked</p>
          <p className="text-xl font-bold text-red-700 mt-1">{stats.blocked}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'COMPLETED' 
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-emerald-600 uppercase">Completed</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by task title, assignee, project..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="ALL">All Statuses ({tasks.length})</option>
              <option value="TODO">To Do ({stats.todo})</option>
              <option value="IN_PROGRESS">In Progress ({stats.inProgress})</option>
              <option value="REVIEW">Review ({stats.review})</option>
              <option value="BLOCKED">Blocked ({stats.blocked})</option>
              <option value="COMPLETED">Completed ({stats.completed})</option>
            </select>
          </div>
        </div>
        
        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Task & Project</th>
                <th className="px-6 py-3.5">Assigned To</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Loading project tasks...</span>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <FolderKanban className="w-12 h-12 text-slate-300 mb-3" />
                      <h3 className="font-bold text-slate-700 text-sm">No tasks found</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        {searchTerm ? `No tasks matching "${searchTerm}".` : 'No tasks recorded in this category.'}
                      </p>
                      <Button size="sm" onClick={openCreateModal} className="flex items-center gap-1.5 text-xs">
                        <Plus className="w-3.5 h-3.5" /> Create Task Now
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Task Title & Project */}
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-semibold text-slate-900 leading-snug">{task.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          <FolderKanban className="w-3 h-3" />
                          {task.projectId || 'General Operations'}
                        </span>
                        {task.description && (
                          <span className="text-xs text-slate-400 truncate max-w-xs" title={task.description}>
                            • {task.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned To */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                          {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-xs sm:text-sm">
                            {task.assignedTo || 'Unassigned'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        task.priority === 'URGENT' ? 'bg-red-100 text-red-800 border border-red-200' :
                        task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {task.priority || 'MEDIUM'}
                      </span>
                    </td>

                    {/* Inline Status Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskItem['status'])}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          task.status === 'TODO' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          task.status === 'REVIEW' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          task.status === 'BLOCKED' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {task.dueDate ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {task.dueDate}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No date</span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(task)}
                          title="Edit Task"
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(task)}
                          title="Delete Task"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                {editingTask ? 'Edit Task Details' : 'Create New Project Task'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs mb-4 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <Input
                  required
                  placeholder="e.g. Calibrate LoRaWAN 868MHz sensor node ping"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Project Selection / Custom Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Project *</label>
                <div className="space-y-2">
                  <select
                    value={formData.projectId}
                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Existing Project --</option>
                    {projectsList.map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="General Operations">General Operations</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Or type custom project name..."
                    value={formData.projectId}
                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Assignee Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
                <select
                  value={formData.assigneeId}
                  onChange={e => {
                    const selId = e.target.value;
                    const foundUser = usersList.find(u => u.id === selId);
                    setFormData({
                      ...formData,
                      assigneeId: selId,
                      assignedTo: foundUser ? foundUser.name : ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                >
                  <option value="">-- Select Team Member --</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom assignee name..."
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as TaskItem['status'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as NonNullable<TaskItem['priority']> })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Scope & Acceptance Notes</label>
                <Textarea
                  rows={3}
                  placeholder="Outline sprint requirements, sensor models, branch name or verification criteria..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to permanently delete task "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
