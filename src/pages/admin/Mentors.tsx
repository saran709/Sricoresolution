import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Search, GraduationCap, Award, BookOpen, UserPlus, CheckCircle2, ShieldAlert, X, Users, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function Mentors() {
  const { currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Designate mentor modal state
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  
  // Assign mentees to mentor modal state
  const [menteesModalMentor, setMenteesModalMentor] = useState<User | null>(null);
  const [selectedMenteeId, setSelectedMenteeId] = useState('');
  
  // Demote confirm modal
  const [demoteConfirmTarget, setDemoteConfirmTarget] = useState<User | null>(null);
  const [isDemoting, setIsDemoting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);
    // Real-time listener for all users
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setAllUsers(users);
      setLoading(false);
    }, (err) => {
      console.error("Failed to stream users for mentor dashboard:", err);
      setFeedback({ message: "Failed to stream users: " + (err?.message || "Permission issue"), type: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const mentors = allUsers.filter(u => (u.role || '').toUpperCase() === 'MENTOR');
  
  const availableEmployees = allUsers.filter(u => {
    const r = (u.role || '').toUpperCase();
    return r === 'EMPLOYEE' || r === 'INTERN';
  });

  const handlePromoteToMentor = async () => {
    if (!selectedEmpId) return;
    setSaving(true);
    setModalError('');
    try {
      await updateDoc(doc(db, 'users', selectedEmpId), {
        role: 'MENTOR',
        updatedAt: serverTimestamp()
      });
      
      const designatedUser = allUsers.find(u => u.id === selectedEmpId);
      if (currentUser) {
        await logActivity(
          'ASSIGN_MENTOR', 
          currentUser.uid, 
          selectedEmpId, 
          'user', 
          `Designated ${designatedUser?.email || selectedEmpId} as Mentor`
        );
      }
      
      setFeedback({ 
        message: `Successfully elevated "${designatedUser?.firstName} ${designatedUser?.lastName}" to Mentor!`, 
        type: 'success' 
      });
      setIsPromoteModalOpen(false);
      setSelectedEmpId('');
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error designating mentor:", err);
      setModalError(err?.message || "Failed to assign mentor role in Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignMenteeToMentor = async () => {
    if (!menteesModalMentor || !menteesModalMentor.id || !selectedMenteeId) return;
    setSaving(true);
    setModalError('');
    try {
      await updateDoc(doc(db, 'users', selectedMenteeId), {
        mentorId: menteesModalMentor.id,
        updatedAt: serverTimestamp()
      });

      const menteeUser = allUsers.find(u => u.id === selectedMenteeId);
      if (currentUser) {
        await logActivity(
          'ASSIGN_MENTEE',
          currentUser.uid,
          selectedMenteeId,
          'user',
          `Assigned mentee ${menteeUser?.email} to mentor ${menteesModalMentor.email}`
        );
      }

      setFeedback({
        message: `Assigned "${menteeUser?.firstName} ${menteeUser?.lastName}" to Mentor ${menteesModalMentor.firstName} ${menteesModalMentor.lastName}!`,
        type: 'success'
      });
      setSelectedMenteeId('');
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error assigning mentee:", err);
      setModalError(err?.message || "Failed to assign mentee.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMentee = async (menteeId: string) => {
    try {
      await updateDoc(doc(db, 'users', menteeId), {
        mentorId: '',
        updatedAt: serverTimestamp()
      });
      setFeedback({ message: "Mentee unassigned from mentor.", type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Error unassigning mentee:", err);
      setFeedback({ message: err?.message || "Failed to unassign mentee.", type: 'error' });
    }
  };

  const executeDemoteMentor = async () => {
    if (!demoteConfirmTarget || !demoteConfirmTarget.id) return;

    setIsDemoting(true);
    try {
      await updateDoc(doc(db, 'users', demoteConfirmTarget.id), {
        role: 'EMPLOYEE',
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity(
          'REVERT_MENTOR', 
          currentUser.uid, 
          demoteConfirmTarget.id, 
          'user', 
          `Reverted mentor ${demoteConfirmTarget.email} to standard employee`
        );
      }
      setFeedback({ 
        message: `"${demoteConfirmTarget.firstName} ${demoteConfirmTarget.lastName}" reverted to standard Employee role.`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error reverting role:", err);
      setFeedback({ message: err?.message || "Failed to update role in Firestore.", type: 'error' });
    } finally {
      setIsDemoting(false);
      setDemoteConfirmTarget(null);
    }
  };

  const getMenteesForMentor = (mentorId?: string) => {
    if (!mentorId) return [];
    return allUsers.filter(u => (u as any).mentorId === mentorId);
  };

  const filteredMentors = mentors.filter(m => 
    `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Management</h1>
          <p className="text-sm text-slate-500">Designate mentors, oversee student intern guidance, and assign training mentees</p>
        </div>
        <Button className="flex items-center gap-2 shadow-sm" onClick={() => { setModalError(''); setIsPromoteModalOpen(true); }}>
          <UserPlus className="w-4 h-4" />
          Designate Mentor
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

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input 
          type="text"
          placeholder="Search mentors by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
        <span className="text-xs text-slate-500 font-medium shrink-0 pr-2">
          Active Mentors: <strong>{mentors.length}</strong>
        </span>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <div className="text-xs font-medium">Streaming mentors from Firestore...</div>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-300 text-center text-slate-500 p-8">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No mentors designated yet</p>
            <p className="text-sm text-slate-500 mt-1">Designate an existing employee as a mentor to guide interns and lead student projects.</p>
            <Button size="sm" className="mt-4" onClick={() => setIsPromoteModalOpen(true)}>Designate First Mentor</Button>
          </div>
        ) : (
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Mentor</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Mentees</th>
                <th className="px-5 py-3 font-semibold">Assigned people</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMentors.map(m => {
                const mentees = getMenteesForMentor(m.id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{m.email}</td>
                    <td className="px-5 py-4 text-slate-700">{mentees.length}</td>
                    <td className="px-5 py-4">
                      <div className="flex max-w-sm flex-wrap gap-1">
                        {mentees.length === 0 ? (
                          <span className="text-xs text-slate-400">None assigned</span>
                        ) : mentees.map(mentee => (
                          <span key={mentee.id} className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            {mentee.firstName} {mentee.lastName}
                            <button onClick={() => mentee.id && handleRemoveMentee(mentee.id)} className="text-slate-400 hover:text-red-500" title="Unassign">×</button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => {
                          setModalError('');
                          setSelectedMenteeId('');
                          setMenteesModalMentor(m);
                        }}>
                          <UserCheck className="w-3.5 h-3.5" />
                          Assign
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs text-slate-500 hover:text-red-600 border-slate-200" onClick={() => setDemoteConfirmTarget(m)}>
                          Revert
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Designate Employee as Mentor Modal */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">Designate Staff as Mentor</h2>
              <button onClick={() => setIsPromoteModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select an active company employee to elevate to the Mentor role with intern guidance privileges.
            </p>
            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs mb-4 flex items-start gap-2 border border-red-200">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}
            {availableEmployees.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-sm">
                No employees available to elevate. Create an employee from Employee Management first.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Staff Member *
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={e => setSelectedEmpId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Employee --</option>
                    {availableEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.email}) - {emp.role}
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
                    Assign Mentor Role
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Mentee to Mentor Modal */}
      {menteesModalMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">
                Assign Mentee to {menteesModalMentor.firstName}
              </h2>
              <button onClick={() => setMenteesModalMentor(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select an intern or junior staff member to be mentored by {menteesModalMentor.firstName} {menteesModalMentor.lastName}.
            </p>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs mb-4 flex items-start gap-2 border border-red-200">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Intern / Employee to Assign *
                </label>
                <select
                  value={selectedMenteeId}
                  onChange={e => setSelectedMenteeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Mentee Candidate --</option>
                  {allUsers
                    .filter(u => u.id !== menteesModalMentor.id && ['INTERN', 'EMPLOYEE', 'CANDIDATE'].includes((u.role || '').toUpperCase()))
                    .map(u => {
                      const isAlreadyMentee = (u as any).mentorId === menteesModalMentor.id;
                      return (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.role}) {isAlreadyMentee ? '— [Already Assigned]' : ''}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setMenteesModalMentor(null)}>
                  Close
                </Button>
                <Button 
                  onClick={handleAssignMenteeToMentor} 
                  disabled={!selectedMenteeId}
                  isLoading={saving}
                >
                  Assign to Mentor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demote Confirmation Modal */}
      <ConfirmModal
        isOpen={!!demoteConfirmTarget}
        title="Revert Mentor to Employee"
        message={`Are you sure you want to revert "${demoteConfirmTarget?.firstName} ${demoteConfirmTarget?.lastName}" from Mentor back to standard Employee? Their role will update immediately in Firestore.`}
        confirmLabel="Revert to Employee"
        variant="warning"
        isLoading={isDemoting}
        onConfirm={executeDemoteMentor}
        onCancel={() => setDemoteConfirmTarget(null)}
      />
    </div>
  );
}
