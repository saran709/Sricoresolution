import React, { useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Notification as AppNotification, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import {
  BellRing,
  CheckCheck,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { queryClient } from '../../lib/queryClient';
import {
  dashboardQueryKeys,
  invalidateAdminCaches,
  useAdminNotifications,
  useAdminUsers,
} from '../../hooks/useDashboardQueries';
import { ShimmerBlock } from '../../components/ui/DashboardSuspense';

export default function AdminNotifications() {
  const { currentUser } = useAuth();
  const {
    data: notifications = [],
    isLoading: notifsLoading,
  } = useAdminNotifications(100);
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const loading = notifsLoading && usersLoading;
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'read'>('all');

  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleMarkAsRead = async (notifId?: string) => {
    if (!notifId) return;
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
      queryClient.setQueryData<AppNotification[]>(
        dashboardQueryKeys.adminNotifications(100),
        (prev) =>
          prev
            ? prev.map((item) => (item.id === notifId ? { ...item, read: true } : item))
            : []
      );
      invalidateAdminCaches(['notifications']);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read && n.id);
    if (unread.length === 0) return;
    try {
      await Promise.all(
        unread.map((n) => updateDoc(doc(db, 'notifications', n.id!), { read: true }))
      );
      queryClient.setQueryData<AppNotification[]>(
        dashboardQueryKeys.adminNotifications(100),
        (prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : [])
      );
      invalidateAdminCaches(['notifications']);
      setFeedback({
        type: 'success',
        text: `Marked ${unread.length} notification(s) as read.`,
      });
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
      setFeedback({ type: 'error', text: 'Failed to update notification statuses.' });
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !title.trim() || !message.trim()) {
      setFeedback({
        type: 'error',
        text: 'Select a recipient and enter both a title and message.',
      });
      return;
    }

    setSending(true);
    setFeedback(null);
    try {
      const payload = {
        userId: recipientId,
        title: title.trim(),
        message: message.trim(),
        read: false,
        createdBy: currentUser?.uid || 'admin',
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'notifications'), payload);
      queryClient.setQueryData<AppNotification[]>(
        dashboardQueryKeys.adminNotifications(100),
        (prev) => [
          { id: docRef.id, ...payload, createdAt: new Date() } as AppNotification,
          ...(prev || []),
        ]
      );
      invalidateAdminCaches(['notifications']);
      setTitle('');
      setMessage('');
      setRecipientId('');
      setFeedback({
        type: 'success',
        text: 'Direct notification delivered to the user workspace.',
      });
    } catch (err: any) {
      console.error('Failed to send notification:', err);
      setFeedback({
        type: 'error',
        text: err?.message || 'Could not send notification.',
      });
    } finally {
      setSending(false);
    }
  };

  const userLookup = new Map<string, User>(users.map((u) => [u.id || u.uid, u]));

  const filtered = notifications.filter((n) => {
    if (filterMode === 'unread') return !n.read;
    if (filterMode === 'read') return Boolean(n.read);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Send targeted alerts to individual accounts or review recent delivery updates.
            For role-wide notices, use{' '}
            <Link
              to="/admin/announcements"
              className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Announcements
            </Link>
            .
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleMarkAllRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Direct Notification Composer */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs h-fit">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Send className="w-4 h-4 text-amber-600" />
            Send Direct Notification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Notifies the selected user inside their portal.
          </p>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient User
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Choose a user...</option>
                {users.map((u) => {
                  const uid = u.id || u.uid;
                  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                  return (
                    <option key={uid} value={uid}>
                      {fullName ? `${fullName} (${u.email})` : u.email} — {u.role}
                    </option>
                  );
                })}
              </select>
            </div>

            <Input
              label="Notification Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Offer Letter Ready"
              required
            />

            <Textarea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide clear next steps for the user..."
              rows={4}
              required
            />

            <Button type="submit" isLoading={sending} className="w-full justify-center gap-2">
              <Send className="w-4 h-4" />
              Send Notification
            </Button>
          </form>
        </div>

        {/* Notifications Log */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Notifications ({filtered.length})
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {(['all', 'unread', 'read'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors cursor-pointer ${
                    filterMode === mode
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div
              role="status"
              aria-label="Loading notifications..."
              className="divide-y divide-slate-100 dark:divide-slate-800"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ShimmerBlock className="h-4 w-44 max-w-full" />
                      <ShimmerBlock className="h-3 w-28" />
                    </div>
                    <ShimmerBlock className="h-3 w-full max-w-lg" />
                    <ShimmerBlock className="h-2.5 w-32" />
                  </div>
                  <ShimmerBlock className="h-7 w-20 rounded-lg shrink-0" />
                </div>
              ))}
              <span className="sr-only">Loading notifications...</span>
            </div>
          ) : filtered.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => {
                const targetUser = userLookup.get(item.userId);
                const recipientLabel = targetUser
                  ? `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() ||
                    targetUser.email
                  : item.userId;

                return (
                  <li
                    key={item.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors ${
                      item.read
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-amber-50/40 dark:bg-amber-950/15'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          · To: {recipientLabel}
                        </span>
                        {!item.read && (
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                            · Unread
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.message}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.createdAt?.toDate
                          ? item.createdAt.toDate().toLocaleString()
                          : item.createdAt instanceof Date
                          ? item.createdAt.toLocaleString()
                          : 'Recently'}
                      </p>
                    </div>

                    {!item.read && item.id && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="shrink-0 text-xs"
                      >
                        Mark Read
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-10 text-center space-y-2">
              <BellRing className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                No {filterMode === 'all' ? '' : filterMode} notifications found
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use the form on the left to send an update directly to any user.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
