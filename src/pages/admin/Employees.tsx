import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserRole, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Edit2, Trash2, ShieldAlert, X, Mail } from 'lucide-react';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';

export default function Employees() {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE' as UserRole,
    departmentId: '',
    position: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['EMPLOYEE', 'MENTOR', 'ADMINISTRATOR'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emps: User[] = [];
      snapshot.forEach(doc => {
        emps.push({ id: doc.id, ...doc.data() } as User);
      });
      setEmployees(emps);
      setLoading(false);
    }, (err) => {
      console.error("Realtime employee listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'EMPLOYEE',
      departmentId: '',
      position: '',
      isActive: true
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: User) => {
    setEditingEmployee(emp);
    setFormData({
      email: emp.email || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      role: emp.role,
      departmentId: (emp as any).departmentId || '',
      position: (emp as any).position || '',
      isActive: emp.isActive ?? true
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingEmployee && editingEmployee.id) {
        // Update
        const userRef = doc(db, 'users', editingEmployee.id);
        
        // Prevent accidental lockout
        if (editingEmployee.role === 'ADMINISTRATOR' && formData.role !== 'ADMINISTRATOR') {
          throw new Error("Cannot demote an administrator directly here for security reasons.");
        }

        await updateDoc(userRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          departmentId: formData.departmentId,
          position: formData.position,
          isActive: formData.isActive,
          updatedAt: serverTimestamp()
        });

        if (currentUser) {
          await logActivity(
            'UPDATED_EMPLOYEE',
            currentUser.uid,
            editingEmployee.id,
            'user',
            `Updated employee profile for ${formData.email}`
          );
        }
      } else {
        const userRef = doc(collection(db, 'users'));
        await setDoc(userRef, {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          departmentId: formData.departmentId,
          position: formData.position,
          isActive: formData.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        if (currentUser) {
          await logActivity(
            'CREATED_EMPLOYEE',
            currentUser.uid,
            userRef.id,
            'user',
            `Created employee record for ${formData.email}`
          );
        }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save employee error:", err);
      setError(err?.message || 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emp: User) => {
    if (!emp.id) return;
    if (emp.role === 'ADMINISTRATOR') {
      alert("Administrator accounts cannot be deleted directly from employee list.");
      return;
    }
    if (!confirm(`Are you sure you want to delete employee "${emp.firstName} ${emp.lastName}"?`)) return;

    try {
      await deleteDoc(doc(db, 'users', emp.id));
      if (currentUser) {
        await logActivity('DELETE_EMPLOYEE', currentUser.uid, emp.id, 'user', `Deleted employee record for ${emp.email}`);
      }
    } catch (err: any) {
      console.error("Error deleting employee:", err);
      alert(err?.message || "Failed to delete employee.");
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-sm text-slate-500">Manage organizational staff and roles</p>
        </div>
        <Button className="flex items-center gap-2" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employees..." 
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
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                      <div className="text-xs">Loading employees...</div>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No employees found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {emp.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{(emp as any).position || 'Unassigned'}</div>
                      <div className="text-xs text-slate-500">{(emp as any).departmentId || 'No Department'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${emp.role === 'ADMINISTRATOR' ? 'bg-purple-100 text-purple-800' : 
                          emp.role === 'MENTOR' ? 'bg-blue-100 text-blue-800' : 
                          'bg-emerald-100 text-emerald-800'}`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${emp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(emp)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-xs inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(emp)}
                          className="text-red-600 hover:text-red-900 font-medium text-xs inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="First Name" 
                  required 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
                <Input 
                  label="Last Name" 
                  required 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>

              <Input 
                label="Email Address" 
                type="email" 
                required 
                value={formData.email}
                disabled={!!editingEmployee}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                helperText={!editingEmployee ? "An invitation email will be sent to this address." : undefined}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </div>
                
                <Input 
                  label="Position/Title" 
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select 
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department...</option>
                  <option value="Software">Software Development</option>
                  <option value="Hardware">Hardware & IoT</option>
                  <option value="AI_ML">AI / ML</option>
                  <option value="Research">Research & Documentation</option>
                  <option value="Admin">Administration</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance & Accounts</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Account is Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Add Employee')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
