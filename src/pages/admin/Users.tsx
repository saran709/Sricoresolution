import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { User, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Edit2, Trash2, UserPlus, X, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function Users() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CANDIDATE' as UserRole,
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // In-app Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // In-app Password Reset Confirmation
  const [resetTargetEmail, setResetTargetEmail] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: User[] = [];
      snapshot.forEach(docSnap => {
        userList.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      setUsers(userList);
      setLoading(false);
    }, (err) => {
      console.error("Error streaming users:", err);
      setFeedback({ message: "Failed to stream users: " + (err?.message || "Permission error"), type: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'CANDIDATE',
      isActive: true
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: (user as any).phone || '',
      role: user.role,
      isActive: user.isActive ?? true
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
      setError('Please provide first and last name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingUser && editingUser.id) {
        // Update existing user profile
        await updateDoc(doc(db, 'users', editingUser.id), {
          firstName: cleanFirst,
          lastName: cleanLast,
          phone: formData.phone.trim(),
          role: formData.role,
          isActive: formData.isActive,
          updatedAt: serverTimestamp()
        });
        
        if (currentUser?.uid) {
          await logActivity('USER_UPDATED', currentUser.uid, editingUser.id, 'user', `Updated profile for ${cleanEmail}`);
        }

        setFeedback({ message: `User "${cleanFirst} ${cleanLast}" profile updated successfully!`, type: 'success' });
      } else {
        // Create new user record
        const userRef = doc(collection(db, 'users'));
        await setDoc(userRef, {
          email: cleanEmail,
          firstName: cleanFirst,
          lastName: cleanLast,
          phone: formData.phone.trim(),
          role: formData.role,
          isActive: formData.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        if (currentUser?.uid) {
          await logActivity('USER_CREATED', currentUser.uid, userRef.id, 'user', `Created user record for ${cleanEmail}`);
        }

        setFeedback({ message: `New user "${cleanFirst} ${cleanLast}" (${formData.role}) saved to Firestore!`, type: 'success' });
      }
      
      setIsModalOpen(false);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Save user error:", err);
      setError(err?.message || 'Failed to save user record to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', deleteTarget.id));
      if (currentUser?.uid) {
        await logActivity('USER_DELETED', currentUser.uid, deleteTarget.id, 'user', `Deleted user profile for ${deleteTarget.email}`);
      }
      setFeedback({ message: `User "${deleteTarget.firstName} ${deleteTarget.lastName}" removed from Firestore.`, type: 'success' });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setFeedback({ message: err?.message || 'Failed to delete user.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const executePasswordReset = async () => {
    if (!resetTargetEmail) return;
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetTargetEmail);
      setFeedback({ message: `Password reset email sent to ${resetTargetEmail}!`, type: 'success' });
    } catch (err: any) {
      // Fallback via backend route if client-side domain blocked
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: resetTargetEmail,
            subject: "Password Reset Request - Sricore Solutions",
            html: `<p>An administrator has initiated a password reset for your account at Sricore Solutions.</p>`
          })
        });
        setFeedback({ message: `Password reset instructions sent to ${resetTargetEmail}!`, type: 'success' });
      } catch (backupErr) {
        setFeedback({ message: err?.message || 'Could not send reset email.', type: 'error' });
      }
    } finally {
      setIsResetting(false);
      setResetTargetEmail(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Manage credentials, administrative privileges, and global user accounts</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 shadow-sm">
          <UserPlus className="w-4 h-4" /> Add User Profile
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
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total Accounts: <strong>{users.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Streaming users from Firestore...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{u.firstName} {u.lastName}</td>
                    <td className="p-4 font-mono text-xs text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMINISTRATOR' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'MENTOR' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'EMPLOYEE' ? 'bg-emerald-100 text-emerald-800' :
                        u.role === 'INTERN' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditModal(u)}
                          title="Edit User"
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setResetTargetEmail(u.email)} 
                          title="Send Password Reset"
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => setDeleteTarget(u)}
                          title="Delete User Profile"
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

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">{editingUser ? 'Edit User Profile' : 'Add User Profile'}</h2>
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
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name *" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                <Input label="Last Name *" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
              </div>
              
              <Input label="Email Address *" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={!!editingUser} />
              
              <Input label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 ..." />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CANDIDATE">Candidate</option>
                  <option value="INTERN">Intern</option>
                  <option value="CLIENT">Client</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userIsActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="userIsActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Account Active & Enabled
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingUser ? 'Update Profile' : 'Save User Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User Record"
        message={`Are you sure you want to permanently delete user "${deleteTarget?.firstName} ${deleteTarget?.lastName}" (${deleteTarget?.email})?`}
        confirmLabel="Delete User"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Password Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={!!resetTargetEmail}
        title="Send Password Reset"
        message={`Send official password reset instructions to "${resetTargetEmail}"?`}
        confirmLabel="Send Reset Email"
        variant="warning"
        isLoading={isResetting}
        onConfirm={executePasswordReset}
        onCancel={() => setResetTargetEmail(null)}
      />
    </div>
  );
}
