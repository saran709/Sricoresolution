import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Department, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Building2, Edit2, Trash2, Users, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function Departments() {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);

    // 1. Live real-time listener for departments
    const unsubDept = onSnapshot(collection(db, 'departments'), (snapshot) => {
      const depts: Department[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Department));
      setDepartments(depts);
      setLoading(false);
    }, (err) => {
      console.error("Realtime departments listener error:", err);
      setError("Failed to stream departments: " + (err?.message || "Permission issue"));
      setLoading(false);
    });

    // 2. Live real-time listener for employees
    const qStaff = query(collection(db, 'users'));
    const unsubStaff = onSnapshot(qStaff, (snapshot) => {
      const allUsers: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setEmployees(allUsers);
    }, (err) => {
      console.warn("Realtime staff listener error in departments:", err);
    });

    return () => {
      unsubDept();
      unsubStaff();
    };
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setManagerId('');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setManagerId(dept.managerId || '');
    setDescription((dept as any).description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide a department name.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingDept && editingDept.id) {
        await updateDoc(doc(db, 'departments', editingDept.id), {
          name: cleanName,
          managerId: managerId || '',
          description: description.trim(),
          updatedAt: serverTimestamp()
        });
        if (currentUser) {
          await logActivity('UPDATE_DEPARTMENT', currentUser.uid, editingDept.id, 'user', `Updated department: ${cleanName}`);
        }
        setFeedback({ message: `Department "${cleanName}" updated successfully in Firestore.`, type: 'success' });
      } else {
        const docRef = await addDoc(collection(db, 'departments'), {
          name: cleanName,
          managerId: managerId || '',
          description: description.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        if (currentUser) {
          await logActivity('CREATE_DEPARTMENT', currentUser.uid, docRef.id, 'user', `Created department: ${cleanName}`);
        }
        setFeedback({ message: `Department "${cleanName}" created successfully and saved to Firestore!`, type: 'success' });
      }
      setIsModalOpen(false);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error saving department:", err);
      setError(err?.message || 'Failed to save department to database.');
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmTarget || !deleteConfirmTarget.id) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'departments', deleteConfirmTarget.id));
      if (currentUser) {
        await logActivity('DELETE_DEPARTMENT', currentUser.uid, deleteConfirmTarget.id, 'user', `Deleted department: ${deleteConfirmTarget.name}`);
      }
      setFeedback({ message: `Department "${deleteConfirmTarget.name}" deleted successfully.`, type: 'success' });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error deleting department:", err);
      setFeedback({ message: err?.message || "Failed to delete department.", type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  const getMemberCount = (deptId?: string, deptName?: string) => {
    if (!deptId) return 0;
    return employees.filter(e => {
      const d = (e as any).departmentId;
      return d === deptId || d === deptName;
    }).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Management</h1>
          <p className="text-sm text-slate-500">Organize teams, assign department managers, and oversee company divisions</p>
        </div>
        <Button className="flex items-center gap-2 shadow-sm" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Department
        </Button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 text-sm font-medium border transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="overflow-x-auto bg-white border border-slate-200">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <div className="text-xs font-medium">Streaming departments from Firestore...</div>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-300 text-center text-slate-500 p-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No departments added yet</p>
            <p className="text-sm text-slate-500 mt-1">Get started by creating your company's first departmental unit.</p>
            <Button size="sm" className="mt-4" onClick={openAddModal}>Create Department</Button>
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Description</th>
                <th className="px-5 py-3 font-semibold">Manager</th>
                <th className="px-5 py-3 font-semibold">Staff</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map(dept => {
                const manager = employees.find(e => e.id === dept.managerId);
                return (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 font-semibold text-slate-900">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        {dept.name}
                      </div>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-xs text-slate-500">
                      {(dept as any).description || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {manager ? `${manager.firstName} ${manager.lastName}` : 'Not designated'}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {getMemberCount(dept.id, dept.name)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditModal(dept)} className="p-1.5 text-slate-400 hover:text-blue-600" title="Edit Department">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmTarget(dept)} className="p-1.5 text-slate-400 hover:text-red-600" title="Delete Department">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs mb-4 border border-red-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Software Development"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brief Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloud architectures, AI integration & full-stack development"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Head / Manager
                </label>
                <select
                  value={managerId}
                  onChange={e => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Manager (Optional) --</option>
                  {employees
                    .filter(emp => ['EMPLOYEE', 'ADMINISTRATOR', 'MENTOR'].includes((emp.role || '').toUpperCase()))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" disabled={saving} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmTarget}
        title="Delete Department"
        message={`Are you sure you want to delete the department "${deleteConfirmTarget?.name}"? Staff currently assigned will not be deleted, but will become unassigned.`}
        confirmLabel="Delete Department"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}
