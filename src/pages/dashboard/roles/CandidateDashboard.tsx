import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRBAC } from '../../../contexts/RBACContext';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  FileText,
  Clock,
  CheckCircle,
  FolderOpen,
  Bell,
  ExternalLink,
  Link2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { DriveLinkInput, sanitizeSafeHttpUrl, validateShareableLink } from '../../../components/ui/DriveLinkInput';
import { useCandidateDashboard } from '../../../hooks/useDashboardQueries';
import { queryClient } from '../../../lib/queryClient';
import { logActivity } from '../../../lib/activityLogger';
import { DashboardModuleSkeleton } from '../../../components/ui/DashboardSuspense';

type CandidateTab = 'applications' | 'documents' | 'notifications';
const VALID_CANDIDATE_TABS: CandidateTab[] = [
  'applications',
  'documents',
  'notifications',
];

export default function CandidateDashboard() {
  const { userProfile } = useAuth();
  const { can, canAccessResource } = useRBAC();
  const [searchParams] = useSearchParams();
  const { data, isLoading: loading } = useCandidateDashboard(userProfile?.uid);

  const applications = data?.applications || [];
  const documents = data?.documents || [];
  const notifications = data?.notifications || [];

  const queryTab = searchParams.get('tab') as CandidateTab | null;
  const [activeTab, setActiveTabState] = useState<CandidateTab>(
    queryTab && VALID_CANDIDATE_TABS.includes(queryTab) ? queryTab : 'applications'
  );

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'resume' | 'certificate' | 'report' | 'other'>('resume');
  const [docLink, setDocLink] = useState('');
  const [openAccessConfirmed, setOpenAccessConfirmed] = useState(false);
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const canSubmitDocs = can('upload') && canAccessResource('documents', 'upload');

  useEffect(() => {
    if (queryTab && VALID_CANDIDATE_TABS.includes(queryTab)) {
      setActiveTabState(queryTab);
    } else if (!queryTab) {
      setActiveTabState('applications');
    }
  }, [queryTab]);

  const handleSubmitResumeLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;
    setStatusBanner(null);

    const trimmedTitle = docTitle.trim();
    if (!trimmedTitle) {
      setStatusBanner({
        type: 'error',
        message: 'Please provide a title for your document link (e.g., Resume - Full Stack).',
      });
      return;
    }

    const linkCheck = validateShareableLink(docLink);
    if (!linkCheck.isValid) {
      setStatusBanner({
        type: 'error',
        message: linkCheck.error || 'Please enter a valid shareable URL.',
      });
      return;
    }

    if (!openAccessConfirmed) {
      setStatusBanner({
        type: 'error',
        message: 'Please enable "Anyone with the link can view" (Open to View) on your Google Drive file and check the confirmation box.',
      });
      return;
    }

    setIsSubmittingLink(true);
    try {
      const docRef = await addDoc(collection(db, 'documents'), {
        ownerId: userProfile.uid,
        title: trimmedTitle,
        fileUrl: linkCheck.normalizedUrl,
        accessLevel: 'own',
        documentType: docType,
        createdAt: serverTimestamp(),
      });

      await logActivity(
        'RESUME_LINK_SUBMITTED',
        userProfile.uid,
        docRef.id,
        'user',
        `Intern/Student submitted open-to-view document link: ${trimmedTitle}`
      );

      queryClient.invalidateQueries({ queryKey: ['candidate-dashboard', userProfile.uid] });
      setDocTitle('');
      setDocLink('');
      setOpenAccessConfirmed(false);
      setShowLinkForm(false);
      setStatusBanner({
        type: 'success',
        message: `"${trimmedTitle}" link saved to your workspace documents (Open to View).`,
      });
    } catch (err) {
      console.error('Candidate link submission error:', err);
      setStatusBanner({
        type: 'error',
        message: 'Could not save document link. Please try again.',
      });
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleMarkNotificationRead = async (notifId?: string) => {
    if (!notifId || !userProfile?.uid) return;
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
      queryClient.invalidateQueries({ queryKey: ['candidate-dashboard', userProfile.uid] });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  if (loading) {
    return (
      <DashboardModuleSkeleton
        variant="page"
        label="Loading candidate portal..."
      />
    );
  }

  return (
    <div className="space-y-6">
      {statusBanner && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  My Internship Applications
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track submitted internship cohorts and onboarding verification steps.
                </p>
              </div>
              <Link to="/internships/apply">
                <Button size="sm">New Application</Button>
              </Link>
            </div>
            <div className="p-0">
              {applications.length > 0 ? (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app) => (
                    <li
                      key={app.id}
                      className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <p className="font-medium text-slate-900 dark:text-white text-lg">
                          {app.programTitle}
                        </p>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 shrink-0 ${
                            (app.status as string) === 'pending' ||
                            (app.status as string) === 'internship_enquiry' ||
                            (app.status as string) === 'application_verification'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : (app.status as string) === 'under_review' ||
                                (app.status as string) === 'training' ||
                                (app.status as string) === 'assignments'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : (app.status as string) === 'approved' ||
                                (app.status as string) === 'active' ||
                                (app.status as string) === 'onboarding'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : (app.status as string) === 'completed' ||
                                (app.status as string) === 'certificate'
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              : (app.status as string) === 'rejected'
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {(app.status as string) === 'completed' ||
                          (app.status as string) === 'certificate' ||
                          (app.status as string) === 'approved' ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (app.status as string) === 'rejected' ? null : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {String(app.status).replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Applied On
                            </p>
                            <p className="text-sm text-slate-900 dark:text-white font-medium mt-1">
                              {app.createdAt?.toDate
                                ? new Date(app.createdAt.toDate()).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Education
                            </p>
                            <p className="text-sm text-slate-900 dark:text-white font-medium mt-1">
                              {app.education || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="mb-2 text-slate-900 dark:text-white font-medium text-lg">
                    You have not submitted an application yet
                  </p>
                  <p className="text-sm mb-5 max-w-md mx-auto">
                    Explore open domains (Software, IoT, AI/ML, Embedded Systems) and submit your
                    application directly inside Sricore.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link to="/internships/apply">
                      <Button>Apply for Internship</Button>
                    </Link>
                    <Link to="/internships">
                      <Button variant="outline">Browse Programs</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">
                My Resume &amp; Document Links
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit Google Drive links with &ldquo;Anyone with the link can view&rdquo; (Open to View) access. Direct file uploads are disabled.
              </p>
            </div>
            {canSubmitDocs && (
              <Button
                size="sm"
                variant={showLinkForm ? 'outline' : 'primary'}
                onClick={() => setShowLinkForm((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                {showLinkForm ? 'Cancel' : 'Submit Document Link'}
              </Button>
            )}
          </div>

          {showLinkForm && canSubmitDocs && (
            <form
              onSubmit={handleSubmitResumeLink}
              className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Updated Resume - B.Tech CSE"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="resume">Resume / CV Link</option>
                    <option value="certificate">Academic ID / Certificate Link</option>
                    <option value="report">Project Report / Deliverable Link</option>
                    <option value="other">Other Shared Link</option>
                  </select>
                </div>
              </div>

              <DriveLinkInput
                label="Google Drive / Cloud Share Link"
                value={docLink}
                onChange={setDocLink}
                accessConfirmed={openAccessConfirmed}
                onAccessConfirmedChange={setOpenAccessConfirmed}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLinkForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmittingLink}>
                  Save Open-to-View Link
                </Button>
              </div>
            </form>
          )}

          <div className="p-0">
            {documents.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((docItem) => (
                  <li
                    key={docItem.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {docItem.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                          {docItem.documentType?.replace(/_/g, ' ') || 'document'} • Open-to-View Link
                        </p>
                      </div>
                    </div>
                    {sanitizeSafeHttpUrl(docItem.fileUrl) ? (
                      <a
                        href={sanitizeSafeHttpUrl(docItem.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Link</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Link unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No document links submitted yet
                </h3>
                <p className="text-sm mb-4 max-w-md mx-auto">
                  Submit a Google Drive link to your resume or academic credentials with <strong>Anyone with the link can view</strong> enabled so mentors and HR can review them.
                </p>
                {canSubmitDocs && !showLinkForm && (
                  <Button
                    variant="outline"
                    onClick={() => setShowLinkForm(true)}
                    className="inline-flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    Submit Resume or Document Link
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h2 className="font-semibold text-slate-800 dark:text-white">Notifications</h2>
          </div>
          <div className="p-0">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`p-4 flex items-start justify-between gap-4 ${
                      notif.read
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-blue-50/70 dark:bg-blue-950/25'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full shrink-0 ${
                          notif.read
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            : 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            notif.read
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {notif.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {notif.createdAt?.toDate
                            ? new Date(notif.createdAt.toDate()).toLocaleString()
                            : ''}
                        </p>
                      </div>
                    </div>

                    {!notif.read && notif.id && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkNotificationRead(notif.id)}
                        className="shrink-0 text-xs"
                      >
                        Mark Read
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="font-medium text-slate-800 dark:text-white mb-1">
                  You&apos;re all caught up
                </p>
                <p className="text-sm">
                  Application updates and mentor messages will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

