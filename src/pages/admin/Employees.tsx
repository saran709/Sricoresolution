import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserRole, User, Department } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Edit2, Trash2, ShieldAlert, X, Mail, CheckCircle2, Building2, GraduationCap, Phone } from 'lucide-react';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface EmployeeRecord extends User {
  departmentId?: string;
  position?: string;
  mentorId?: string;
  phone?: string;
}

export default function Employees() {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'EMPLOYEE' as UserRole,
    departmentId: '',
    mentorId: '',
    position: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<EmployeeRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 1. Real-time employees listener
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['EMPLOYEE', 'MENTOR', 'ADMINISTRATOR'])
    );

    const unsubscribeEmps = onSnapshot(q, (snapshot) => {
      const emps: EmployeeRecord[] = [];
      snapshot.forEach(docSnap => {
        emps.push({ id: docSnap.id, ...docSnap.data() } as EmployeeRecord);
      });
      setEmployees(emps);
      setLoading(false);
    }, (err) => {
      console.error("Realtime employee listener error:", err);
      setError("Failed to stream employees: " + (err?.message || "Permission issue"));
      setLoading(false);
    });

    // 2. Real-time departments listener
    const unsubscribeDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      const depts: Department[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Department));
      setDepartments(depts);
    }, (err) => {
      console.warn("Realtime departments listener error:", err);
    });

    // 3. Real-time mentors listener
    const qMentors = query(collection(db, 'users'), where('role', '==', 'MENTOR'));
    const unsubscribeMentors = onSnapshot(qMentors, (snapshot) => {
      const mentorList: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setMentors(mentorList);
    }, (err) => {
      console.warn("Realtime mentors listener error:", err);
    });

    return () => {
      unsubscribeEmps();
      unsubscribeDepts();
      unsubscribeMentors();
    };
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'EMPLOYEE',
      departmentId: departments[0]?.id || '',
      mentorId: '',
      position: '',
      isActive: true
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: EmployeeRecord) => {
    setEditingEmployee(emp);
    setFormData({
      email: emp.email || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      phone: emp.phone || '',
      role: emp.role || 'EMPLOYEE',
      departmentId: emp.departmentId || '',
      mentorId: emp.mentorId || '',
      position: emp.position || '',
      isActive: emp.isActive ?? true
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanFirst = formData.firstName.trim();
    const cleanLast = formData.lastName.trim();

    if (!cleanFirst || !cleanLast) {
      setError('Please provide both first and last name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingEmployee && editingEmployee.id) {
        // Update existing employee
        const userRef = doc(db, 'users', editingEmployee.id);
        
        if (editingEmployee.role === 'ADMINISTRATOR' && formData.role !== 'ADMINISTRATOR') {
          throw new Error("Cannot demote an administrator directly for security reasons.");
        }

        const updatePayload: any = {
          firstName: cleanFirst,
          lastName: cleanLast,
          phone: formData.phone.trim(),
          role: formData.role,
          departmentId: formData.departmentId,
          mentorId: formData.mentorId || '',
          position: formData.position.trim(),
          isActive: formData.isActive,
          updatedAt: serverTimestamp()
        };

        await updateDoc(userRef, updatePayload);

        if (currentUser) {
          await logActivity(
            'UPDATED_EMPLOYEE',
            currentUser.uid,
            editingEmployee.id,
            'user',
            `Updated employee profile for ${cleanEmail}`
          );
        }

        setFeedback({ 
          message: `Successfully updated employee "${cleanFirst} ${cleanLast}". Data stored and synced to Firestore.`, 
          type: 'success' 
        });
      } else {
        // Create new employee
        const userRef = doc(collection(db, 'users'));
        const newPayload = {
          email: cleanEmail,
          firstName: cleanFirst,
          lastName: cleanLast,
          phone: formData.phone.trim(),
          role: formData.role,
          departmentId: formData.departmentId,
          mentorId: formData.mentorId || '',
          position: formData.position.trim(),
          isActive: formData.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(userRef, newPayload);

        if (currentUser) {
          await logActivity(
            'CREATED_EMPLOYEE',
            currentUser.uid,
            userRef.id,
            'user',
            `Created employee record for ${cleanEmail}`
          );
        }

        setFeedback({ 
          message: `Employee "${cleanFirst} ${cleanLast}" successfully added and saved to Firestore!`, 
          type: 'success' 
        });
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Save employee error:", err);
      setError(err?.message || 'Failed to save employee to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmTarget || !deleteConfirmTarget.id) return;

    if (deleteConfirmTarget.role === 'ADMINISTRATOR') {
      setFeedback({ message: "Administrator accounts cannot be deleted from the employee list.", type: 'error' });
      setDeleteConfirmTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', deleteConfirmTarget.id));
      if (currentUser) {
        await logActivity(
          'DELETE_EMPLOYEE', 
          currentUser.uid, 
          deleteConfirmTarget.id, 
          'user', 
          `Deleted employee record for ${deleteConfirmTarget.email}`
        );
      }
      setFeedback({ 
        message: `Employee "${deleteConfirmTarget.firstName} ${deleteConfirmTarget.lastName}" deleted from Firestore.`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error deleting employee:", err);
      setFeedback({ 
        message: err?.message || "Failed to delete employee from database.", 
        type: 'error' 
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return 'No Department';
    const dept = departments.find(d => d.id === deptId || d.name === deptId);
    return dept ? dept.name : deptId;
  };

  const getMentorName = (mentorId?: string) => {
    if (!mentorId) return null;
    const mentor = mentors.find(m => m.id === mentorId);
    return mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Assigned Mentor';
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.position || ''} ${getDepartmentName(emp.departmentId)}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-sm text-slate-500">Manage organizational staff, roles, departments, and assigned mentors</p>
        </div>
        <Button className="flex items-center gap-2 shadow-sm" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Employee
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, department, or title..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium self-end sm:self-auto">
            <span>Total Staff: <strong>{employees.length}</strong></span>
            <span>•</span>
            <span>Departments: <strong>{departments.length}</strong></span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department & Title</th>
                <th className="px-6 py-4">Assigned Mentor</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <div className="text-xs font-medium">Streaming staff records from Firestore...</div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {searchTerm ? `No employees found matching "${searchTerm}"` : 'No employees added yet. Click "Add Employee" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const mentorName = getMentorName(emp.mentorId);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="w-3 h-3 text-slate-400" /> {emp.email}
                        </div>
                        {emp.phone && (
                          <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" /> {emp.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{emp.position || 'Staff Member'}</div>
                        <div className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {getDepartmentName(emp.departmentId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {mentorName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                            {mentorName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None assigned</span>
                        )}
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
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmTarget(emp)}
                            className="text-red-600 hover:text-red-900 font-medium text-xs inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                {editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs flex items-start gap-2 border border-red-200">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="First Name *" 
                  required 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="e.g. Saran"
                />
                <Input 
                  label="Last Name *" 
                  required 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="e.g. Ramesh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Email Address *" 
                  type="email" 
                  required 
                  value={formData.email}
                  disabled={!!editingEmployee}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="employee@sricore.com"
                />
                <Input 
                  label="Phone Number" 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">System Role *</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </div>
                
                <Input 
                  label="Position / Title" 
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="e.g. Lead Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select 
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                    {departments.length === 0 && (
                      <>
                        <option value="Software">Software Engineering</option>
                        <option value="Hardware">Hardware & Embedded Systems</option>
                        <option value="Research">Research & Development</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Mentor
                  </label>
                  <select 
                    value={formData.mentorId}
                    onChange={(e) => setFormData({...formData, mentorId: e.target.value})}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- No Mentor (Optional) --</option>
                    {mentors.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Account is Active & Operational
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button variant="outline" type="button" disabled={saving} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingEmployee ? 'Update Employee' : 'Save Employee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmTarget}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteConfirmTarget?.firstName} ${deleteConfirmTarget?.lastName}" (${deleteConfirmTarget?.email})? This action will permanently remove their employee document from Firestore.`}
        confirmLabel="Delete Permanently"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}
