import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Document as AppDocument } from '../../types';
import { Search, Link2, FileText, ExternalLink, Trash2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DriveLinkInput, validateShareableLink } from '../../components/ui/DriveLinkInput';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';
import { queryClient } from '../../lib/queryClient';
import {
  dashboardQueryKeys,
  invalidateAdminCaches,
  useAdminDocuments,
} from '../../hooks/useDashboardQueries';
import { ShimmerTableRows } from '../../components/ui/DashboardSuspense';

export default function AdminDocuments() {
  const { userProfile } = useAuth();
  const {
    data: documents = [],
    isLoading: loading,
    isError,
  } = useAdminDocuments(200);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // New document link form state
  const [docTitle, setDocTitle] = useState('');
  const [docLink, setDocLink] = useState('');
  const [openAccessConfirmed, setOpenAccessConfirmed] = useState(false);
  const [docType, setDocType] = useState<AppDocument['documentType']>('project_file');
  const [accessLevel, setAccessLevel] = useState<AppDocument['accessLevel']>('company');

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;
    setNotice(null);

    const trimmedTitle = docTitle.trim();
    if (!trimmedTitle) {
      setNotice({ type: 'error', text: 'Please enter a document title.' });
      return;
    }

    const linkCheck = validateShareableLink(docLink);
    if (!linkCheck.isValid) {
      setNotice({ type: 'error', text: linkCheck.error || 'Invalid document link.' });
      return;
    }

    if (!openAccessConfirmed) {
      setNotice({
        type: 'error',
        text: 'Please confirm that the Google Drive / cloud link is set to "Anyone with the link can view" (Open to View).',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newDoc: Omit<AppDocument, 'id'> = {
        ownerId: userProfile.uid,
        title: trimmedTitle,
        fileUrl: linkCheck.normalizedUrl,
        accessLevel: accessLevel,
        documentType: docType,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'documents'), newDoc);

      await logActivity(
        'DOCUMENT_LINK_SUBMITTED',
        userProfile.uid,
        docRef.id,
        'project',
        `Submitted open-to-view document link: ${trimmedTitle}`
      );

      invalidateAdminCaches(['documents']);
      setDocTitle('');
      setDocLink('');
      setOpenAccessConfirmed(false);
      setNotice({
        type: 'success',
        text: `Document link "${trimmedTitle}" saved with Open-to-View access.`,
      });
    } catch (error) {
      console.error('Failed to save document link', error);
      setNotice({ type: 'error', text: 'Failed to save document link.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (documentItem: AppDocument) => {
    setNotice(null);
    setPendingDeleteId(null);

    try {
      await deleteDoc(doc(db, 'documents', documentItem.id!));

      queryClient.setQueryData<AppDocument[]>(
        dashboardQueryKeys.adminDocuments(200),
        (prev) => (prev ? prev.filter((d) => d.id !== documentItem.id) : [])
      );
      invalidateAdminCaches(['documents']);

      if (userProfile?.uid) {
        await logActivity(
          'DOCUMENT_DELETED',
          userProfile.uid,
          documentItem.id!,
          'project',
          `Removed document link: ${documentItem.title}`
        );
      }
      setNotice({ type: 'success', text: `Removed "${documentItem.title}".` });
    } catch (error) {
      console.error('Failed to delete document', error);
      setNotice({ type: 'error', text: 'Failed to delete document.' });
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Links Management</h1>
          <p className="text-sm text-slate-500">
            Submit and manage shareable Google Drive &amp; cloud links (direct file uploads are disabled)
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Link-Only Policy • Open-to-View Access Required
        </span>
      </div>

      {isError && !notice && (
        <div className="p-3.5 rounded-xl border text-sm flex items-center gap-2 bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Failed to load documents list.</span>
        </div>
      )}

      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center justify-between gap-3 ${
            notice.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <form
        onSubmit={handleLinkSubmit}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            Add New Document Link (Google Drive — Open to View)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., IoT Gateway Architecture v2.1"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="project_file">Project File</option>
              <option value="requirement">Requirement</option>
              <option value="quotation">Quotation</option>
              <option value="report">Report</option>
              <option value="research">Research</option>
              <option value="technical">Technical</option>
              <option value="certificate">Certificate</option>
              <option value="resume">Resume</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Access Level</label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as any)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="private">Private (Admins Only)</option>
              <option value="company">Company (Employees)</option>
              <option value="client">Client (Shared)</option>
              <option value="public">Public</option>
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

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            {isSubmitting ? 'Saving Link...' : 'Submit Document Link'}
          </Button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search document links by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Access Level</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <ShimmerTableRows rows={5} cols={5} />
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No document links found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((docItem) => (
                  <tr
                    key={docItem.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900 truncate max-w-xs block">
                            {docItem.title}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            Open-to-View Link
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-700">
                      {docItem.documentType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full
                        ${
                          docItem.accessLevel === 'public'
                            ? 'bg-emerald-100 text-emerald-700'
                            : docItem.accessLevel === 'client'
                            ? 'bg-blue-100 text-blue-700'
                            : docItem.accessLevel === 'private'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {docItem.accessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {docItem.createdAt?.toDate
                        ? new Date(docItem.createdAt.toDate()).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <a
                        href={docItem.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                        title="Open Shared Link"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {pendingDeleteId === docItem.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(docItem)}
                            className="px-2 py-1 text-xs font-bold rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(null)}
                            className="px-2 py-1 text-xs font-medium rounded border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(docItem.id || null)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

