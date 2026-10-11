import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LeaveRequest, User } from '../../types';
import { Calendar, CheckCircle2, XCircle, Clock, Search, FileText, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function Leaves() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);

    // 1. Live stream leave requests
    const qLeaves = query(collection(db, 'leaveRequests'), orderBy('createdAt', 'desc'));
    const unsubLeaves = onSnapshot(qLeaves, (snapshot) => {
      const items: LeaveRequest[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
      setLeaves(items);
      setLoading(false);
    }, (err) => {
      // Fallback if orderBy index is compiling
      const fallbackUnsub = onSnapshot(collection(db, 'leaveRequests'), (snap) => {
        const items: LeaveRequest[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
        setLeaves(items);
        setLoading(false);
      });
      return () => fallbackUnsub();
    });

    // 2. Live stream users to resolve applicant names
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userMap: Record<string, User> = {};
      snapshot.forEach(d => {
        userMap[d.id] = { id: d.id, ...d.data() } as User;
      });
      setUsers(userMap);
    }, (err) => {
      console.warn("Could not stream users in leaves:", err);
    });

    return () => {
      unsubLeaves();
      unsubUsers();
    };
  }, []);

  const handleUpdateStatus = async (leave: LeaveRequest, status: 'approved' | 'rejected') => {
    if (!leave.id) return;
    setUpdatingId(leave.id);
    try {
      await updateDoc(doc(db, 'leaveRequests', leave.id), {
        status,
        evaluatedBy: currentUser?.uid,
        evaluatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (currentUser) {
        await logActivity('EVALUATE_LEAVE', currentUser.uid, leave.id, 'user', `Marked leave request as ${status}`);
      }

      setFeedback({ 
        message: `Leave request for ${leave.userName || 'Employee'} marked as ${status.toUpperCase()}!`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Failed to evaluate leave:", err);
      setFeedback({ message: err?.message || "Failed to update leave status.", type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-sm text-slate-500">Review time-off submissions, sick leaves, and vacation approvals</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                statusFilter === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Type & Period</th>
                <th className="p-4">Reason / Notes</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Streaming leave requests from Firestore...</span>
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No leave requests found in this view.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(leave => {
                  const staffUser = users[leave.userId];
                  const applicantName = leave.userName || (staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Employee');

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{applicantName}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {staffUser?.email || leave.userId}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-800 capitalize block">
                          {leave.type} Leave
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {leave.startDate} to {leave.endDate}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{leave.reason || 'No specific reason provided.'}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          leave.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          leave.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {leave.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {leave.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                          {leave.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {leave.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {leave.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={updatingId === leave.id}
                              onClick={() => handleUpdateStatus(leave, 'approved')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-md text-xs transition-colors border border-emerald-200"
                            >
                              Approve
                            </button>
                            <button
                              disabled={updatingId === leave.id}
                              onClick={() => handleUpdateStatus(leave, 'rejected')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-md text-xs transition-colors border border-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Evaluated</span>
                        )}
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
