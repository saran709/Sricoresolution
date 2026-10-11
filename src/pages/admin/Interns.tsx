import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Search, GraduationCap, Award, BookOpen, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function Interns() {
  const { currentUser } = useAuth();
  const [interns, setInterns] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningIntern, setAssigningIntern] = useState<User | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [internSnap, mentorSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'INTERN'))),
        getDocs(query(collection(db, 'users'), where('role', 'in', ['MENTOR', 'EMPLOYEE'])))
      ]);

      setInterns(internSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setMentors(mentorSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    } catch (err) {
      console.error("Failed to load interns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMentor = async () => {
    if (!assigningIntern || !assigningIntern.id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', assigningIntern.id), {
        mentorId: selectedMentorId,
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity('ASSIGN_INTERN_MENTOR', currentUser.uid, assigningIntern.id, 'user', `Assigned mentor to intern`);
      }
      setAssigningIntern(null);
      setSelectedMentorId('');
      fetchData();
    } catch (err) {
      console.error("Failed to assign mentor:", err);
      alert("Failed to assign mentor.");
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteToEmployee = async (intern: User) => {
    if (!intern.id) return;
    if (!confirm(`Hire and promote ${intern.firstName} ${intern.lastName} to permanent EMPLOYEE role?`)) return;

    try {
      await updateDoc(doc(db, 'users', intern.id), {
        role: 'EMPLOYEE',
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity('HIRE_INTERN', currentUser.uid, intern.id, 'user', `Hired intern as permanent employee`);
      }
      fetchData();
      alert("Intern successfully promoted to full Employee!");
    } catch (err) {
      console.error("Failed to promote intern:", err);
      alert("Failed to update role.");
    }
  };

  const filteredInterns = interns.filter(i => 
    `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Intern Management</h1>
          <p className="text-sm text-slate-500">Monitor active student interns, assign mentors, and track graduation status</p>
        </div>
        <div className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-semibold border border-emerald-200">
          Active Interns: {interns.length}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input 
          type="text"
          placeholder="Search interns by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            Loading interns...
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500 p-8">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No active interns</p>
            <p className="text-sm text-slate-500 mt-1">Accept prospective applicants from the Candidate Management tab to enroll them as active interns.</p>
          </div>
        ) : (
          filteredInterns.map(intern => {
            const assignedMentor = mentors.find(m => m.id === (intern as any).mentorId);
            return (
              <div key={intern.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg">
                      {intern.firstName?.[0] || 'I'}{intern.lastName?.[0] || ''}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                      Active Intern
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mt-3">{intern.firstName} {intern.lastName}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{intern.email}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Mentor:</span>
                      <strong className="text-slate-800">
                        {assignedMentor ? `${assignedMentor.firstName} ${assignedMentor.lastName}` : 'None'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Joined:</span>
                      <span className="text-slate-600 font-medium">
                        {intern.createdAt?.toDate ? new Date(intern.createdAt.toDate()).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => {
                      setAssigningIntern(intern);
                      setSelectedMentorId((intern as any).mentorId || '');
                    }}
                  >
                    Assign Mentor
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    onClick={() => handlePromoteToEmployee(intern)}
                  >
                    Hire as Staff
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {assigningIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Assign Guide / Mentor</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select an experienced staff member or mentor to supervise {assigningIntern.firstName} {assigningIntern.lastName}.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mentor
                </label>
                <select
                  value={selectedMentorId}
                  onChange={e => setSelectedMentorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="">-- Remove / No Mentor --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setAssigningIntern(null)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignMentor} isLoading={saving}>
                  Save Assignment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
