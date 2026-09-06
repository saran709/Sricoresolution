import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Enquiry, Project } from '../../types';
import { Search, ArrowRightCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Enquiries() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'project_requests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: Enquiry[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Enquiry);
      });
      setEnquiries(items);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'project_requests', id), {
        status: newStatus
      });
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: newStatus as any } : e));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const convertToProject = async (enquiry: Enquiry) => {
    try {
      if (!enquiry.clientId) {
        alert("Enquiry must have a linked Client ID to be converted to a Project. (Guest enquiries need accounts)");
        return;
      }
      
      const pType = enquiry.enquiryType === 'student' ? 'student' : enquiry.enquiryType === 'research' ? 'research' : 'commercial';
      
      let startingStage = 'enquiry';
      if (pType === 'student') startingStage = 'student_enquiry';
      if (pType === 'research') startingStage = 'topic_discussion';

      const newProjectData: Omit<Project, 'id'> = {
        clientId: enquiry.clientId,
        name: `${enquiry.serviceInterest || 'Project'} for ${enquiry.company || enquiry.firstName}`,
        description: enquiry.projectDetails || enquiry.message || '',
        projectType: pType,
        status: 'active',
        stage: startingStage as any,
        startDate: serverTimestamp(),
        assignedEmployees: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'projects'), newProjectData);
      
      // Update enquiry status
      await updateDoc(doc(db, 'project_requests', enquiry.id!), {
        status: 'CONVERTED'
      });
      
      setEnquiries(enquiries.map(e => e.id === enquiry.id ? { ...e, status: 'CONVERTED' as any } : e));
      
      if (userProfile?.uid) {
        await logActivity(
          'PROJECT_CREATED',
          userProfile.uid,
          docRef.id,
          'project',
          `Project created from Enquiry: ${enquiry.id}`
        );
      }
      
      navigate('/admin/projects');
    } catch (error) {
      console.error("Failed to convert to project", error);
    }
  };

  const filteredEnquiries = enquiries.filter(e => 
    `${e.firstName} ${e.lastName} ${e.company} ${e.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
          <p className="text-sm text-slate-500">Manage client project enquiries</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search enquiries..." 
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
                <th className="px-6 py-4">Client Info</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Status & Actions</th>
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
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{enq.firstName} {enq.lastName}</div>
                      <div className="text-slate-500 text-xs mt-1">{enq.company || 'N/A'} • {enq.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="capitalize font-medium text-slate-800">{enq.serviceInterest || 'N/A'}</div>
                      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{enq.enquiryType || 'commercial'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {enq.createdAt?.toDate ? new Date(enq.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <select 
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id!, e.target.value)}
                        className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={enq.status === 'CONVERTED'}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="PROPOSAL">Proposal</option>
                        <option value="NEGOTIATION">Negotiation</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CONVERTED" disabled>Converted</option>
                      </select>
                      
                      {enq.status !== 'CONVERTED' && enq.status !== 'REJECTED' && enq.enquiryType !== 'internship' && (
                        <Button 
                          onClick={() => convertToProject(enq)} 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1 bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          Convert <ArrowRightCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
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
