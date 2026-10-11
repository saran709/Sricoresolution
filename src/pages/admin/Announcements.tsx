import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Announcement, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Megaphone, Plus, Trash2, Calendar, Users, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

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
        await logActivity('POST_ANNOUNCEMENT', currentUser.uid, docRef.id, 'content', `Posted announcement: ${title}`);
      }

      setIsModalOpen(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      setError(err?.message || 'Failed to post announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ann: Announcement) => {
    if (!ann.id) return;
    if (!confirm(`Delete announcement "${ann.title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'announcements', ann.id));
      if (currentUser) {
        await logActivity('DELETE_ANNOUNCEMENT', currentUser.uid, ann.id, 'content', `Deleted announcement: ${ann.title}`);
      }
      fetchAnnouncements();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert("Failed to delete announcement.");
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
        <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500 p-8">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No broadcasts published yet</p>
            <p className="text-sm text-slate-500 mt-1">Broadcast an announcement to notify interns, employees, or clients across their dashboards.</p>
            <Button size="sm" className="mt-4" onClick={() => setIsModalOpen(true)}>Create First Announcement</Button>
          </div>
        ) : (
          announcements.map(ann => {
            const dateStr = ann.createdAt?.toDate ? new Date(ann.createdAt.toDate()).toLocaleDateString() : 'Recent';
            return (
              <div key={ann.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <Megaphone className="w-4 h-4" />
                      </span>
                      <h3 className="font-bold text-lg text-slate-900">{ann.title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed max-w-3xl">
                      {ann.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(ann)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr}
                    </span>
                    <span>Audience: <strong>{ann.targetRoles?.join(', ') || 'All Roles'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Post Global Announcement</h2>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <Input
                  required
                  placeholder="e.g. Q4 Company All-Hands & Technical Showcase"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write message details..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Target Audience Roles</label>
                <div className="flex flex-wrap gap-2">
                  {(['EMPLOYEE', 'MENTOR', 'INTERN', 'CLIENT'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r)}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-colors border ${
                        targetRoles.includes(r)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving} className="flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
