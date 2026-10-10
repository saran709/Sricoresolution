import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Edit2, Trash2, UserPlus, X } from 'lucide-react';
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const userList: User[] = [];
      snapshot.forEach(doc => {
        userList.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

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
          ...formData,
          updatedAt: serverTimestamp()
        });
        
        if (currentUser?.uid) {
            await logActivity('USER_UPDATED', currentUser.uid, editingUser.id, 'user', `Updated profile for ${formData.email}`);
        }
      } else {
        // Create - Note: Creating users requires Auth SDK
        // This is a placeholder as full auth creation needs Auth SDK
        throw new Error("User creation via Admin is currently restricted to profiles. Please use Auth SDK for full user creation.");
      }
      
      await fetchUsers();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
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
        await fetchUsers();
    } catch (err) {
        console.error(err);
        setError('Failed to delete user.');
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                    <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                    <Input label="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={!!editingUser} />
                    <Button type="submit" isLoading={saving} className="w-full">{editingUser ? 'Update' : 'Save'}</Button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
