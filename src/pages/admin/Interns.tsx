import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Search, GraduationCap, Award, BookOpen, UserCheck, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function Interns() {
  const { currentUser } = useAuth();
  const [interns, setInterns] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Assign mentor modal state
  const [assigningIntern, setAssigningIntern] = useState<User | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [saving, setSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Promote intern to employee confirmation
  const [promoteConfirmIntern, setPromoteConfirmIntern] = useState<User | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);

    // 1. Live stream interns
    const qInterns = query(collection(db, 'users'), where('role', '==', 'INTERN'));
    const unsubInterns = onSnapshot(qInterns, (snapshot) => {
      const internList: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setInterns(internList);
      setLoading(false);
    }, (err) => {
      console.error("Failed to stream interns:", err);
      setFeedback({ message: "Failed to stream interns: " + (err?.message || "Permission issue"), type: 'error' });
      setLoading(false);
    });

    // 2. Live stream mentors
    const qMentors = query(collection(db, 'users'), where('role', 'in', ['MENTOR', 'EMPLOYEE']));
    const unsubMentors = onSnapshot(qMentors, (snapshot) => {
      const mentorList: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setMentors(mentorList);
    }, (err) => {
      console.warn("Failed to stream mentors:", err);
    });

    return () => {
      unsubInterns();
      unsubMentors();
    };
  }, []);

  const handleAssignMentor = async () => {
    if (!assigningIntern || !assigningIntern.id) return;
    setSaving(true);
    setAssignError('');
    try {
      await updateDoc(doc(db, 'users', assigningIntern.id), {
        mentorId: selectedMentorId || '',
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity(
          'ASSIGN_INTERN_MENTOR', 
          currentUser.uid, 
          assigningIntern.id, 
          'user', 
          `Assigned mentor to intern ${assigningIntern.email}`
        );
      }
      const mentorObj = mentors.find(m => m.id === selectedMentorId);
      setFeedback({ 
        message: selectedMentorId 
          ? `Mentor ${mentorObj?.firstName} ${mentorObj?.lastName} assigned to ${assigningIntern.firstName} ${assigningIntern.lastName}!` 
          : `Removed mentor from ${assigningIntern.firstName} ${assigningIntern.lastName}.`,
        type: 'success' 
      });
      setAssigningIntern(null);
      setSelectedMentorId('');
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Failed to assign mentor:", err);
      setAssignError(err?.message || "Failed to assign mentor in Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const executePromoteToEmployee = async () => {
    if (!promoteConfirmIntern || !promoteConfirmIntern.id) return;
    setIsPromoting(true);

    try {
      await updateDoc(doc(db, 'users', promoteConfirmIntern.id), {
        role: 'EMPLOYEE',
        position: 'Junior Associate',
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity(
          'HIRE_INTERN', 
          currentUser.uid, 
          promoteConfirmIntern.id, 
          'user', 
          `Hired intern ${promoteConfirmIntern.email} as permanent employee`
        );
      }
      setFeedback({ 
        message: `Intern "${promoteConfirmIntern.firstName} ${promoteConfirmIntern.lastName}" successfully promoted to permanent Employee!`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Failed to promote intern:", err);
      setFeedback({ message: err?.message || "Failed to promote intern.", type: 'error' });
    } finally {
      setIsPromoting(false);
      setPromoteConfirmIntern(null);
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
            <div className="text-xs font-medium">Streaming active interns from Firestore...</div>
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
              <div key={intern.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg">
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
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Guidance Mentor:
                      </span>
                      <strong className="text-slate-800">
                        {assignedMentor ? `${assignedMentor.firstName} ${assignedMentor.lastName}` : (
                          <span className="text-amber-600 font-semibold italic">Unassigned</span>
                        )}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Award className="w-3.5 h-3.5 text-slate-400" /> Training Track:
                      </span>
                      <span className="text-slate-700 font-medium">Core Engineering</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                    onClick={() => {
                      setAssigningIntern(intern);
                      setSelectedMentorId((intern as any).mentorId || '');
                      setAssignError('');
                    }}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {assignedMentor ? 'Change Mentor' : 'Assign Mentor'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setPromoteConfirmIntern(intern)}
                  >
                    Hire Employee
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Mentor Modal */}
      {assigningIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">
                Assign Mentor for {assigningIntern.firstName}
              </h2>
              <button onClick={() => setAssigningIntern(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select an experienced staff mentor to review technical tasks and guide internship milestones.
            </p>

            {assignError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs mb-4 flex items-start gap-2 border border-red-200">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{assignError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Mentor
                </label>
                <select
                  value={selectedMentorId}
                  onChange={e => setSelectedMentorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- No Mentor (Unassign) --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.email}) - {m.role}
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

      {/* Promote to Employee Confirm Modal */}
      <ConfirmModal
        isOpen={!!promoteConfirmIntern}
        title="Hire and Promote Intern"
        message={`Promote "${promoteConfirmIntern?.firstName} ${promoteConfirmIntern?.lastName}" to permanent EMPLOYEE role? Their system privileges and credentials will automatically elevate in Firestore.`}
        confirmLabel="Hire as Full Employee"
        variant="primary"
        isLoading={isPromoting}
        onConfirm={executePromoteToEmployee}
        onCancel={() => setPromoteConfirmIntern(null)}
      />
    </div>
  );
}
