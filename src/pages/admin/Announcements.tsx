import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Announcement, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Megaphone, Plus, Trash2, Calendar, Users, Send, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function Announcements() {
  const { currentUser, userProfile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRoles, setTargetRoles] = useState<UserRole[]>(['EMPLOYEE', 'MENTOR', 'INTERN', 'CLIENT']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Announcement[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
      setAnnouncements(list);
      setLoading(false);
    }, (err) => {
      console.error("Failed to stream announcements:", err);
      setFeedback({ message: "Failed to stream announcements: " + (err?.message || "Permission issue"), type: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and announcement message.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser?.uid || 'admin',
        authorName: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : 'Executive Admin',
        targetRoles,
        createdAt: serverTimestamp()
      });

      if (currentUser) {
        await logActivity('POST_ANNOUNCEMENT', currentUser.uid, docRef.id, 'content', `Posted announcement: ${title.trim()}`);
      }

      setFeedback({ message: `Announcement "${title.trim()}" published and saved to Firestore!`, type: 'success' });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      setError(err?.message || 'Failed to post announcement.');
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, 'announcements', deleteTarget.id));
      if (currentUser) {
        await logActivity('DELETE_ANNOUNCEMENT', currentUser.uid, deleteTarget.id, 'content', `Deleted announcement: ${deleteTarget.title}`);
      }
      setFeedback({ message: `Announcement "${deleteTarget.title}" deleted from Firestore.`, type: 'success' });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      setFeedback({ message: err?.message || "Failed to delete announcement.", type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const toggleRole = (r: UserRole) => {
    if (targetRoles.includes(r)) {
      setTargetRoles(targetRoles.filter(item => item !== r));
    } else {
      setTargetRoles([...targetRoles, r]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Broadcast Announcements</h1>
          <p className="text-sm text-slate-500">Publish internal company news, holiday schedules, and policy updates</p>
        </div>
        <Button className="flex items-center gap-2 shadow-sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New Announcement
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

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <div className="text-xs font-medium">Streaming announcements from Firestore...</div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No announcements published</p>
            <p className="text-sm text-slate-500 mt-1">Broadcast important notices to company employees, interns, or clients.</p>
            <Button size="sm" className="mt-4" onClick={() => setIsModalOpen(true)}>Publish First Announcement</Button>
          </div>
        ) : (
          announcements.map(ann => (
            <div key={ann.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-lg text-slate-900">{ann.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : 'Recent'}
                  </span>
                  <button 
                    onClick={() => setDeleteTarget(ann)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                {ann.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Visible to:</span>
                  <div className="flex flex-wrap gap-1">
                    {(ann.targetRoles || ['EMPLOYEE']).map(r => (
                      <span key={r} className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-slate-400">
                  Published by: <strong className="text-slate-600">{ann.authorName || 'Administrator'}</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Broadcast Announcement</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs mb-4 border border-red-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Title *</label>
                <Input
                  required
                  placeholder="e.g. Q4 Company All-Hands & Technical Showcase"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide all details, schedules, guidelines, or notices..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Audience Visibility</label>
                <div className="flex flex-wrap gap-2">
                  {(['EMPLOYEE', 'MENTOR', 'INTERN', 'CLIENT'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        targetRoles.includes(r)
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {targetRoles.includes(r) ? '✓ ' : '+ '}{r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" disabled={saving} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving} className="flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  Publish Notice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Announcement"
        message={`Are you sure you want to remove the broadcast announcement "${deleteTarget?.title}"?`}
        confirmLabel="Delete Notice"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
