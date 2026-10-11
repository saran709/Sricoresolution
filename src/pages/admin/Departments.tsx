import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Department, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Building2, Edit2, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function Departments() {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);

    // 1. Live real-time listener for departments
    const unsubDept = onSnapshot(collection(db, 'departments'), (snapshot) => {
      const depts: Department[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Department));
      setDepartments(depts);
      setLoading(false);
    }, (err) => {
      console.error("Realtime departments listener error:", err);
      setLoading(false);
    });

    // 2. Fetch active staff for manager dropdown
    const fetchStaff = async () => {
      try {
        const empSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['EMPLOYEE', 'ADMINISTRATOR', 'MENTOR'])));
        setEmployees(empSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      } catch (e) {
        console.warn("Could not fetch staff for manager dropdown:", e);
      }
    };
    fetchStaff();

    return () => unsubDept();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setManagerId('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setManagerId(dept.managerId || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a department name.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingDept && editingDept.id) {
        await updateDoc(doc(db, 'departments', editingDept.id), {
          name: name.trim(),
          managerId,
          updatedAt: serverTimestamp()
        });
        if (currentUser) {
          await logActivity('UPDATE_DEPARTMENT', currentUser.uid, editingDept.id, 'user', `Updated department: ${name.trim()}`);
        }
      } else {
        const docRef = await addDoc(collection(db, 'departments'), {
          name: name.trim(),
          managerId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        if (currentUser) {
          await logActivity('CREATE_DEPARTMENT', currentUser.uid, docRef.id, 'user', `Created department: ${name.trim()}`);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving department:", err);
      setError(err?.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!dept.id) return;
    if (!confirm(`Are you sure you want to delete "${dept.name}"?`)) return;

    try {
      await deleteDoc(doc(db, 'departments', dept.id));
      if (currentUser) {
        await logActivity('DELETE_DEPARTMENT', currentUser.uid, dept.id, 'user', `Deleted department: ${dept.name}`);
      }
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("Failed to delete department.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Management</h1>
          <p className="text-sm text-slate-500">Organize teams, assign department managers and oversee units</p>
        </div>
        <Button className="flex items-center gap-2" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500 p-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No departments added yet</p>
            <p className="text-sm text-slate-500 mt-1">Get started by creating your company's first departmental unit.</p>
            <Button size="sm" className="mt-4" onClick={openAddModal}>Create Department</Button>
          </div>
        ) : (
          departments.map(dept => {
            const manager = employees.find(e => e.id === dept.managerId);
            return (
              <div key={dept.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openEditModal(dept)} 
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-50 transition-colors"
                        title="Edit Department"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept)} 
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{dept.name}</h3>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>Manager: <strong className="text-slate-700">{manager ? `${manager.firstName} ${manager.lastName}` : 'Not assigned'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingDept ? 'Edit Department' : 'Add New Department'}
            </h2>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Embedded Systems & IoT"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Manager
                </label>
                <select
                  value={managerId}
                  onChange={e => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Manager (Optional) --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
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
    </div>
  );
}
