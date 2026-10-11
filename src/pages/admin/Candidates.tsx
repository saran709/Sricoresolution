import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, InternshipApplication } from '../../types';
import { Button } from '../../components/ui/Button';
import { Search, UserCheck, CheckCircle2, Clock, XCircle, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function Candidates() {
  const { currentUser } = useAuth();
  const [candidates, setCandidates] = useState<User[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const [userSnap, appSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'CANDIDATE'))),
        getDocs(collection(db, 'internship_applications'))
      ]);

      setCandidates(userSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setApplications(appSnap.docs.map(d => ({ id: d.id, ...d.data() } as InternshipApplication)));
    } catch (err) {
      console.error("Error loading candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToIntern = async (candidate: User) => {
    if (!candidate.id) return;
    if (!confirm(`Accept and promote ${candidate.firstName} ${candidate.lastName} to active INTERN role?`)) return;

    try {
      await updateDoc(doc(db, 'users', candidate.id), {
        role: 'INTERN',
        updatedAt: serverTimestamp()
      });
      if (currentUser) {
        await logActivity('CONVERT_CANDIDATE', currentUser.uid, candidate.id, 'user', `Converted candidate to Intern`);
      }
      fetchCandidates();
      alert("Candidate successfully converted to Intern!");
    } catch (err) {
      console.error("Failed to convert candidate:", err);
      alert("Failed to promote candidate.");
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

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
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
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                    Loading candidates...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    No candidates found.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(c => {
                  const candidateApps = applications.filter(a => a.candidateId === c.id || a.email === c.email);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-slate-400">UID: {c.id?.substring(0, 10)}...</div>
                        {candidateApps.length > 0 && (
                          <div className="text-[11px] text-blue-600 font-medium mt-1">
                            Applied for: {candidateApps[0].programTitle || 'Internship Program'}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Candidate
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          onClick={() => handlePromoteToIntern(c)}
                        >
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
    </div>
  );
}
