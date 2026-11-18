import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useRBAC } from '../../../contexts/RBACContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Payment } from '../../../types';
import {
  MessageSquare,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  CreditCard,
  FolderOpen,
  ExternalLink,
  Link2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DriveLinkInput, sanitizeSafeHttpUrl, validateShareableLink } from '../../../components/ui/DriveLinkInput';
import { CheckoutButton } from '../../../components/payments/CheckoutButton';
import { useClientDashboard } from '../../../hooks/useDashboardQueries';
import { queryClient } from '../../../lib/queryClient';
import { logActivity } from '../../../lib/activityLogger';
import { DashboardModuleSkeleton } from '../../../components/ui/DashboardSuspense';

type ClientTab = 'overview' | 'projects' | 'enquiries' | 'payments' | 'documents';
const VALID_CLIENT_TABS: ClientTab[] = [
  'overview',
  'projects',
  'enquiries',
  'payments',
  'documents',
];

export default function ClientDashboard() {
  const { userProfile } = useAuth();
  const { can, canAccessResource } = useRBAC();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data, isLoading: loading } = useClientDashboard(userProfile?.uid);

  const enquiries = data?.enquiries || [];
  const projects = data?.projects || [];
  const payments = (data?.payments || []) as Payment[];
  const documents = data?.documents || [];

  const queryTab = searchParams.get('tab') as ClientTab | null;
  const [activeTab, setActiveTabState] = useState<ClientTab>(
    queryTab && VALID_CLIENT_TABS.includes(queryTab) ? queryTab : 'overview'
  );

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'requirement' | 'project_file' | 'quotation' | 'other'>('requirement');
  const [docLink, setDocLink] = useState('');
  const [openAccessConfirmed, setOpenAccessConfirmed] = useState(false);
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const canSubmitDocs = can('upload') && canAccessResource('documents', 'upload');
  const canCreateEnquiry = can('create') && canAccessResource('enquiries', 'create');

  useEffect(() => {
    if (queryTab && VALID_CLIENT_TABS.includes(queryTab)) {
      setActiveTabState(queryTab);
    } else if (!queryTab) {
      setActiveTabState('overview');
    }
  }, [queryTab]);

  const setActiveTab = (tab: ClientTab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  const handleDocumentLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;
    setStatusBanner(null);

    const trimmedTitle = docTitle.trim();
    if (!trimmedTitle) {
      setStatusBanner({
        type: 'error',
        message: 'Please enter a title for your shared document link.',
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
        accessLevel: 'client',
        documentType: docType,
        createdAt: serverTimestamp(),
      });

      await logActivity(
        'DOCUMENT_LINK_SUBMITTED',
        userProfile.uid,
        docRef.id,
        'project',
        `Client submitted open-to-view document link: ${trimmedTitle}`
      );

      queryClient.invalidateQueries({ queryKey: ['client-dashboard', userProfile.uid] });
      setDocTitle('');
      setDocLink('');
      setOpenAccessConfirmed(false);
      setShowLinkForm(false);
      setStatusBanner({
        type: 'success',
        message: `"${trimmedTitle}" link shared with your engineering team (Open to View).`,
      });
    } catch (err) {
      console.error('Client document link error:', err);
      setStatusBanner({
        type: 'error',
        message: 'Could not save document link. Please try again.',
      });
    } finally {
      setIsSubmittingLink(false);
    }
  };

  if (loading) {
    return (
      <DashboardModuleSkeleton
        variant="page"
        label="Loading client portal data..."
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

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-400 transition-colors"
              onClick={() => setActiveTab('projects')}
            >
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {projects.length}
                </p>
              </div>
            </div>

            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setActiveTab('enquiries')}
            >
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  My Enquiries
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {enquiries.length}
                </p>
              </div>
            </div>

            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => setActiveTab('payments')}
            >
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Payments
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {payments.filter((p) => p.status === 'PENDING' || p.status === 'INITIATED').length}
                </p>
              </div>
            </div>

            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-400 transition-colors"
              onClick={() => setActiveTab('payments')}
            >
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Approved Payments
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {payments.filter((p) => p.status === 'SUCCESS').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 text-center">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Need a new software, hardware, or AI solution?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Share your requirements to get a technical review and project estimate within 24 hours.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {canCreateEnquiry && (
                <Button onClick={() => navigate('/enquiry')}>Start New Enquiry</Button>
              )}
              <Button variant="outline" onClick={() => setActiveTab('documents')}>
                Share Project Document Links
              </Button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 dark:text-white">My Projects</h2>
            {canCreateEnquiry && (
              <Button size="sm" variant="outline" onClick={() => navigate('/enquiry')}>
                Request New Project
              </Button>
            )}
          </div>
          <div className="p-0">
            {projects.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                            {project.name}
                          </h3>
                          <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                            · {project.projectType}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {project.description}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 shrink-0 ${
                          project.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : project.status === 'completed'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {project.status === 'active' ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        {project.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/60">
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Current Stage
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white font-semibold mt-1 bg-white dark:bg-slate-900 inline-block px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          {project.stage ? project.stage.replace(/_/g, ' ').toUpperCase() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Start Date
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white font-medium mt-1">
                          {project.startDate?.toDate
                            ? new Date(project.startDate.toDate()).toLocaleDateString()
                            : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Project ID
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white font-mono mt-1 truncate">
                          {project.id}
                        </p>
                      </div>
                    </div>
                    {project.budget && (
                      <div className="mt-4 flex justify-end">
                        <CheckoutButton
                          amount={project.budget}
                          label="Submit Payment Proof Link"
                          purpose={`Payment for ${project.name}`}
                          referenceId={project.id}
                          referenceType="project"
                          paymentType="advance"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No active projects yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-5">
                  Once your enquiry is approved and kicked off, your live milestones, deliverables,
                  and payment options will appear here automatically.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {canCreateEnquiry && (
                    <Button onClick={() => navigate('/enquiry')}>Request a Project Quote</Button>
                  )}
                  <Button variant="outline" onClick={() => setActiveTab('enquiries')}>
                    Check My Enquiries
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'enquiries' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 dark:text-white">My Enquiries</h2>
            {canCreateEnquiry && (
              <Button size="sm" onClick={() => navigate('/enquiry')}>
                New Enquiry
              </Button>
            )}
          </div>
          <div className="p-0">
            {enquiries.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {enquiries.map((enq) => (
                  <li
                    key={enq.id}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white capitalize text-lg">
                          {enq.serviceInterest}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                          {enq.enquiryType || 'commercial'}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                          enq.status === 'NEW'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : enq.status === 'QUALIFIED' || enq.status === 'PROPOSAL'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : enq.status === 'CONVERTED' || enq.status === 'APPROVED'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {String(enq.status).replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                        {enq.projectDetails || enq.message || ''}
                      </p>
                    </div>
                    <div className="flex gap-6 mt-4 text-sm text-slate-500 dark:text-slate-400">
                      <p>
                        Submitted:{' '}
                        {enq.createdAt?.toDate
                          ? new Date(enq.createdAt.toDate()).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No enquiries yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  Tell us about your software, IoT hardware, or AI goals and our team will prepare a
                  detailed proposal.
                </p>
                {canCreateEnquiry && (
                  <Button onClick={() => navigate('/enquiry')}>Submit Your First Enquiry</Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h2 className="font-semibold text-slate-800 dark:text-white">Payments &amp; Proof Links</h2>
          </div>
          <div className="p-6 space-y-4">
            {payments.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg tabular-nums">
                        ₹{payment.amount?.toLocaleString('en-IN') || '0'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        UTR: {payment.transactionId || payment.paymentId || 'Not provided'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Submitted:{' '}
                        {payment.createdAt?.toDate
                          ? new Date(payment.createdAt.toDate()).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider ${
                          payment.status === 'SUCCESS'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : payment.status === 'FAILED'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {payment.status === 'SUCCESS' ? 'Approved' : payment.status}
                      </span>
                      {sanitizeSafeHttpUrl(payment.proofUrl) && (
                        <a
                          href={sanitizeSafeHttpUrl(payment.proofUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <span>Open proof link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No payments yet
                </h3>
                <p className="text-sm mb-4 max-w-md mx-auto">
                  When an active project has a milestone payment due, you can submit your transaction
                  proof link directly from the My Projects tab.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('projects')}>
                  Go to My Projects
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">My Document Links</h2>
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
              onSubmit={handleDocumentLinkSubmit}
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
                    placeholder="e.g., System Requirements Specification (SRS)"
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
                    <option value="requirement">Project Requirement / SRS Link</option>
                    <option value="project_file">Architecture / Design File Link</option>
                    <option value="quotation">Quotation / Agreement Link</option>
                    <option value="other">Other Shared Link</option>
                  </select>
                </div>
              </div>

              <DriveLinkInput
                label="Google Drive / Cloud Document Link"
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
                      <span className="text-xs text-slate-400">File link unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No document links shared yet
                </h3>
                <p className="text-sm mb-4 max-w-md mx-auto">
                  Share Google Drive links to requirement briefs, architecture diagrams, or agreements with <strong>Anyone with the link can view</strong> enabled.
                </p>
                {canSubmitDocs && !showLinkForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowLinkForm(true)}
                    className="inline-flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    Submit First Document Link
                  </Button>
                ) : !canSubmitDocs ? (
                  <Link to="/contact">
                    <Button variant="outline">Contact Team</Button>
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

