import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, GraduationCap, Award, BookOpen, UserPlus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function Mentors() {
  const { currentUser } = useAuth();
  const [mentors, setMentors] = useState<User[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    setLoading(true);
    // Listen to all staff/users to flexibly categorize mentors and available candidates
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      
      const currentMentors = allUsers.filter(u => {
        const r = (u.role || '').toUpperCase();
        return r === 'MENTOR';
      });

      const employees = allUsers.filter(u => {
        const r = (u.role || '').toUpperCase();
        return r === 'EMPLOYEE' || r === 'INTERN' || r === 'CLIENT';
      });

      setMentors(currentMentors);
      setAvailableEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error("Failed to listen to mentors:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePromoteToMentor = async () => {
    if (!selectedEmpId) return;
    setSaving(true);
    setModalError('');
    try {
      await updateDoc(doc(db, 'users', selectedEmpId), {
        role: 'MENTOR',
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity('ASSIGN_MENTOR', currentUser.uid, selectedEmpId, 'user', `Assigned employee to mentor role`);
      }
      setIsPromoteModalOpen(false);
      setSelectedEmpId('');
    } catch (err: any) {
      console.error("Error assigning mentor:", err);
      setModalError(err?.message || "Failed to assign mentor role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDemoteMentor = async (mentor: User) => {
    if (!mentor.id) return;
    if (!confirm(`Revert ${mentor.firstName} ${mentor.lastName} to standard Employee role?`)) return;

    try {
      await updateDoc(doc(db, 'users', mentor.id), {
        role: 'EMPLOYEE',
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity('REVERT_MENTOR', currentUser.uid, mentor.id, 'user', `Reverted mentor to employee`);
      }
      fetchData();
    } catch (err) {
      console.error("Error reverting role:", err);
      alert("Failed to update role.");
    }
  };

  const filteredMentors = mentors.filter(m => 
    `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Management</h1>
          <p className="text-sm text-slate-500">Assign project mentors, evaluate internship guidance and technical trainers</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsPromoteModalOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Assign Mentor
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input 
          type="text"
          placeholder="Search mentors by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            Loading mentors...
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500 p-8">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No mentors found</p>
            <p className="text-sm text-slate-500 mt-1">Designate an existing employee as a mentor to guide interns and lead student projects.</p>
            <Button size="sm" className="mt-4" onClick={() => setIsPromoteModalOpen(true)}>Assign First Mentor</Button>
          </div>
        ) : (
          filteredMentors.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg">
                    {m.firstName?.[0] || 'M'}{m.lastName?.[0] || ''}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
                    Mentor
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mt-3">{m.firstName} {m.lastName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{m.email}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Role: Academic & Project Mentor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>Status: <strong className="text-emerald-600">Active</strong></span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs text-slate-600 hover:text-red-600 border-slate-200"
                  onClick={() => handleDemoteMentor(m)}
                >
                  Revert to Employee
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Designate Mentor</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select an active company employee to elevate to the Mentor role with intern guidance privileges.
            </p>
            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}
            {availableEmployees.length === 0 ? (
              <p className="text-sm text-slate-600 py-4">No employees available to promote. Please create an employee first.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Employee *
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={e => setSelectedEmpId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">-- Choose Employee --</option>
                    {availableEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button type="button" variant="outline" onClick={() => setIsPromoteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePromoteToMentor} 
                    disabled={!selectedEmpId}
                    isLoading={saving}
                  >
                    Assign as Mentor
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
