import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Edit2, Trash2, UserPlus, X, KeyRound } from 'lucide-react';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';

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
    role: 'CANDIDATE' as UserRole,
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: User[] = [];
      snapshot.forEach(doc => {
        userList.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(userList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
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
      role: user.role,
      isActive: user.isActive ?? true
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingUser && editingUser.id) {
        // Update existing user profile
        await updateDoc(doc(db, 'users', editingUser.id), {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          role: formData.role,
          isActive: formData.isActive,
          updatedAt: serverTimestamp()
        });
        
        if (currentUser?.uid) {
            await logActivity('USER_UPDATED', currentUser.uid, editingUser.id, 'user', `Updated profile for ${formData.email}`);
        }
      } else {
        // Create new user record
        const userRef = doc(collection(db, 'users'));
        await setDoc(userRef, {
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          role: formData.role,
          isActive: formData.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        if (currentUser?.uid) {
            await logActivity('USER_CREATED', currentUser.uid, userRef.id, 'user', `Created user record for ${formData.email.trim()}`);
        }
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save user error:", err);
      setError(err?.message || 'Failed to save user record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
        await deleteDoc(doc(db, 'users', userId));
        if (currentUser?.uid) {
            await logActivity('USER_DELETED', currentUser.uid, userId, 'user', 'Deleted user profile');
        }
    } catch (err) {
        console.error(err);
        setError('Failed to delete user.');
    }
  };

  const handlePasswordReset = async (email: string) => {
    if (!confirm(`Send password reset instructions to ${email}?`)) return;
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: "Password Reset Request - Sricore Solutions",
          html: `<p>Hello,</p>
                 <p>An administrator has initiated a password reset request for your account.</p>
                 <p>Please follow the instructions from the login page or contact support if you need further assistance.</p>`
        })
      });

      if (!response.ok) throw new Error('Failed to send email');
      alert('Password reset instructions sent!');
    } catch (err) {
      console.error(err);
      setError('Failed to send reset instructions.');
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add User Profile
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="relative w-full max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>

        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                    <tr key={u.id}>
                        <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.role}</td>
                        <td className="p-4">{u.isActive ? 'Active' : 'Inactive'}</td>
                        <td className="p-4 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(u)}><Edit2 className="w-4 h-4"/></Button>
                            <Button variant="outline" size="sm" onClick={() => handlePasswordReset(u.email)} title="Reset Password"><KeyRound className="w-4 h-4 text-amber-600"/></Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(u.id!)}><Trash2 className="w-4 h-4"/></Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{editingUser ? 'Edit User' : 'Add User Profile'}</h2>
                    <button onClick={() => setIsModalOpen(false)}><X/></button>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                    <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                    <Input label="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={!!editingUser} />
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                      <select
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
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
                        Account Active
                      </label>
                    </div>

                    <Button type="submit" isLoading={saving} className="w-full">{editingUser ? 'Update Profile' : 'Save User'}</Button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
