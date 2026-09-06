import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { InternshipApplication, Document as AppDocument, Notification as AppNotification } from '../../../types';
import { FileText, Clock, CheckCircle, Search, FolderOpen, Bell, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export default function CandidateDashboard() {
  const { userProfile } = useAuth();
  const [applications, setApplications] = useState<(InternshipApplication & { programTitle?: string })[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'documents' | 'notifications'>('applications');

  useEffect(() => {
    if (!userProfile?.uid) return;

    const fetchData = async () => {
      try {
        const appQuery = query(
          collection(db, 'internship_applications'),
          where('candidateId', '==', userProfile.uid)
        );
        const appSnap = await getDocs(appQuery);
        
        const apps = await Promise.all(appSnap.docs.map(async (docSnap) => {
          const appData = { id: docSnap.id, ...docSnap.data() } as InternshipApplication;
          let programTitle = 'Unknown Program';
          
          if (appData.programId) {
            try {
              const progDoc = await getDoc(doc(db, 'internship_programs', appData.programId));
              if (progDoc.exists()) {
                programTitle = progDoc.data().title || 'Unknown Program';
              }
            } catch (e) {
              // ignore
            }
          }
          return { ...appData, programTitle };
        }));
        
        setApplications(apps);
        
        const docQuery = query(collection(db, 'documents'), where('ownerId', '==', userProfile.uid));
        const docSnap = await getDocs(docQuery);
        setDocuments(docSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppDocument)));

        const notifQuery = query(collection(db, 'notifications'), where('userId', '==', userProfile.uid));
        const notifSnap = await getDocs(notifQuery);
        setNotifications(notifSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification)));

      } catch (error) {
        console.error("Error fetching candidate data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto mb-6">
        <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'applications' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>My Applications</button>
        <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>My Documents</button>
        <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
          Notifications
          {notifications.filter(n => !n.read).length > 0 && <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">{notifications.filter(n => !n.read).length}</span>}
        </button>
      </div>

      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                My Internship Applications
              </h2>
              <Link to="/internships/apply">
                <Button size="sm">New Application</Button>
              </Link>
            </div>
            <div className="p-0">
              {applications.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {applications.map(app => (
                    <li key={app.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-slate-900 text-lg">{app.programTitle}</p>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5
                          ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            app.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'approved' || app.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'}`}
                        >
                          {app.status === 'completed' || app.status === 'active' || app.status === 'approved' ? 
                            <CheckCircle className="w-3.5 h-3.5" /> : 
                            app.status === 'rejected' ? null :
                            <Clock className="w-3.5 h-3.5" />
                          }
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Applied On</p>
                            <p className="text-sm text-slate-900 font-medium mt-1">
                              {app.createdAt?.toDate ? new Date(app.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Education</p>
                            <p className="text-sm text-slate-900 font-medium mt-1">{app.education || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="mb-4 text-slate-900 font-medium text-lg">You have not submitted any applications yet.</p>
                  <Link to="/internships/apply">
                    <Button variant="outline">Browse Internships</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">My Resume & Documents</h2>
            <Button size="sm" variant="outline">Upload Document</Button>
          </div>
          <div className="p-0">
            {documents.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {documents.map(doc => (
                  <li key={doc.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{doc.title}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{doc.documentType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No documents</h3>
                <p>You have not uploaded any documents or resumes.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Notifications</h2>
          </div>
          <div className="p-0">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {notifications.map(notif => (
                  <li key={notif.id} className={`p-4 ${notif.read ? 'bg-white' : 'bg-blue-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${notif.read ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`font-medium ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>No new notifications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
