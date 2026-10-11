import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, InternshipApplication } from '../../types';
import { Button } from '../../components/ui/Button';
import { Search, UserCheck, CheckCircle2, Clock, XCircle, Mail, Phone, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function Candidates() {
  const { currentUser } = useAuth();
  const [candidates, setCandidates] = useState<User[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [promoteConfirmCandidate, setPromoteConfirmCandidate] = useState<User | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);

    // 1. Live stream candidates
    const qCandidates = query(collection(db, 'users'), where('role', '==', 'CANDIDATE'));
    const unsubCandidates = onSnapshot(qCandidates, (snapshot) => {
      const list: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setCandidates(list);
      setLoading(false);
    }, (err) => {
      console.error("Error streaming candidates:", err);
      setFeedback({ message: "Failed to stream candidates: " + (err?.message || "Permission issue"), type: 'error' });
      setLoading(false);
    });

    // 2. Live stream applications
    const unsubApps = onSnapshot(collection(db, 'internship_applications'), (snapshot) => {
      const appList: InternshipApplication[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InternshipApplication));
      setApplications(appList);
    }, (err) => {
      console.warn("Failed to stream internship applications:", err);
    });

    return () => {
      unsubCandidates();
      unsubApps();
    };
  }, []);

  const executePromoteToIntern = async () => {
    if (!promoteConfirmCandidate || !promoteConfirmCandidate.id) return;
    setIsPromoting(true);

    try {
      await updateDoc(doc(db, 'users', promoteConfirmCandidate.id), {
        role: 'INTERN',
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity(
          'CONVERT_CANDIDATE', 
          currentUser.uid, 
          promoteConfirmCandidate.id, 
          'user', 
          `Converted candidate ${promoteConfirmCandidate.email} to Intern`
        );
      }
      setFeedback({ 
        message: `Candidate "${promoteConfirmCandidate.firstName} ${promoteConfirmCandidate.lastName}" successfully converted to active Intern!`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Failed to convert candidate:", err);
      setFeedback({ message: err?.message || "Failed to promote candidate.", type: 'error' });
    } finally {
      setIsPromoting(false);
      setPromoteConfirmCandidate(null);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    `${c.firstName} ${c.lastName} ${c.email} ${c.phone || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Management</h1>
          <p className="text-sm text-slate-500">Review internship applicants, prospective students, and interview candidates</p>
        </div>
        <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold border border-blue-200">
          Total Candidates: {candidates.length}
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
          placeholder="Search candidates by name, email, or phone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Candidate</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Streaming candidates from Firestore...</span>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    No candidates found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(c => {
                  const app = applications.find(a => a.candidateId === c.id || a.candidateEmail === c.email);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-slate-500">
                          {app ? `Applied for: ${app.programId || 'Internship'}` : 'Applicant Profile'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-500" />
                          Pending Review
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          size="sm" 
                          className="inline-flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          onClick={() => setPromoteConfirmCandidate(c)}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Accept as Intern
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accept Candidate Confirmation Modal */}
      <ConfirmModal
        isOpen={!!promoteConfirmCandidate}
        title="Accept as Active Intern"
        message={`Accept prospective candidate "${promoteConfirmCandidate?.firstName} ${promoteConfirmCandidate?.lastName}" (${promoteConfirmCandidate?.email}) into active internship training? Their role will update to INTERN in Firestore.`}
        confirmLabel="Accept as Intern"
        variant="primary"
        isLoading={isPromoting}
        onConfirm={executePromoteToIntern}
        onCancel={() => setPromoteConfirmCandidate(null)}
      />
    </div>
  );
}
