import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { InternshipApplication, User } from '../../types';
import { Search, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';
import { SeedInternshipsButton } from '../../components/admin/SeedInternshipsButton';

const STATUSES: { value: InternshipApplication['status']; label: string }[] = [
  { value: 'internship_enquiry', label: 'Enquiry' },
  { value: 'program_selection', label: 'Program Selection' },
  { value: 'registration', label: 'Registration' },
  { value: 'payment', label: 'Payment' },
  { value: 'application_verification', label: 'Verification' },
  { value: 'approved', label: 'Approved' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'mentor_assignment', label: 'Mentor Assignment' },
  { value: 'training', label: 'Training' },
  { value: 'assignments', label: 'Assignments' },
  { value: 'practical_work', label: 'Practical Work' },
  { value: 'project', label: 'Project' },
  { value: 'evaluation', label: 'Evaluation' },
  { value: 'completed', label: 'Completed' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'rejected', label: 'Rejected' }
];

export default function AdminInternships() {
  const { userProfile } = useAuth();
  const [applications, setApplications] = useState<(InternshipApplication & { candidate?: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'internship_applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items = await Promise.all(snapshot.docs.map(async (d) => {
        const app = { id: d.id, ...d.data() } as InternshipApplication;
        let candidate: User | undefined;
        if (app.candidateId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', app.candidateId));
            if (userDoc.exists()) candidate = { id: userDoc.id, ...userDoc.data() } as User;
          } catch (e) {
            console.error(e);
          }
        }
        return { ...app, candidate };
      }));
      setApplications(items);
      setLoading(false);
    }, (error) => {
      console.warn("Realtime internship listener error, falling back:", error);
      const fallbackUnsub = onSnapshot(collection(db, 'internship_applications'), async (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as InternshipApplication));
        setApplications(items);
        setLoading(false);
      });
      return () => fallbackUnsub();
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (app: InternshipApplication, newStatus: InternshipApplication['status']) => {
    try {
      if (!app.id) return;
      await updateDoc(doc(db, 'internship_applications', app.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setApplications(applications.map(p => p.id === app.id ? { ...p, status: newStatus } : p));
      
      if (userProfile?.uid) {
        await logActivity(
          'INTERNSHIP_STATUS_UPDATED',
          userProfile.uid,
          app.id,
          'user', // related to user/candidate
          `Internship workflow updated from ${app.status} to ${newStatus}`
        );
      }
    } catch (error) {
      console.error("Failed to update internship status", error);
    }
  };

  const filteredApplications = applications.filter(a => 
    `${a.candidate?.firstName} ${a.candidate?.lastName} ${a.candidate?.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Internship Workflow</h1>
          <p className="text-sm text-slate-500">Manage operational stages for internships and training</p>
        </div>
        <SeedInternshipsButton />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by candidate name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Program & Education</th>
                <th className="px-6 py-4">Applied On</th>
                <th className="px-6 py-4 text-right">Current Stage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No internship applications found.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {app.candidate ? `${app.candidate.firstName} ${app.candidate.lastName}` : 'Unknown Candidate'}
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        {app.candidate?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 text-xs uppercase tracking-wider">{app.programId}</div>
                      <div className="text-slate-500 text-xs mt-1">{app.education || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {app.createdAt?.toDate ? new Date(app.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app, e.target.value as any)}
                        className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px]"
                      >
                        {STATUSES.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
