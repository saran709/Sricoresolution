import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LeaveRequest, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Calendar, CheckCircle2, XCircle, Clock, Search, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function Leaves() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaveSnap, userSnap] = await Promise.all([
        getDocs(collection(db, 'leaveRequests')),
        getDocs(collection(db, 'users'))
      ]);

      const userMap: Record<string, User> = {};
      userSnap.forEach(d => {
        userMap[d.id] = { id: d.id, ...d.data() } as User;
      });
      setUsers(userMap);

      const items: LeaveRequest[] = leaveSnap.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
      setLeaves(items);
    } catch (err) {
      console.error("Failed to load leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leaveId: string, status: 'approved' | 'rejected') => {
    setUpdatingId(leaveId);
    try {
      await updateDoc(doc(db, 'leaveRequests', leaveId), {
        status,
        evaluatedBy: currentUser?.uid,
        evaluatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (currentUser) {
        await logActivity('EVALUATE_LEAVE', currentUser.uid, leaveId, 'user', `Marked leave request as ${status}`);
      }

      fetchData();
    } catch (err) {
      console.error("Failed to evaluate leave:", err);
      alert("Failed to update status.");
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
          <p className="text-sm text-slate-500">Review time-off submissions, sick leaves and vacation approvals</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Employee</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                    Loading leave requests...
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(leave => {
                  const emp = users[leave.userId];
                  const startStr = leave.startDate?.toDate ? new Date(leave.startDate.toDate()).toLocaleDateString() : String(leave.startDate || 'N/A');
                  const endStr = leave.endDate?.toDate ? new Date(leave.endDate.toDate()).toLocaleDateString() : String(leave.endDate || 'N/A');

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">
                          {emp ? `${emp.firstName} ${emp.lastName}` : 'Staff Member'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {emp?.email || leave.userId}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{startStr} to {endStr}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-700 max-w-xs">
                        <p className="line-clamp-2">{leave.reason || 'Personal Time-Off'}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          leave.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          leave.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {leave.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {leave.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {leave.status === 'pending' && <Clock className="w-3 h-3" />}
                          {leave.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {leave.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1"
                              isLoading={updatingId === leave.id}
                              onClick={() => handleUpdateStatus(leave.id!, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2.5 py-1"
                              isLoading={updatingId === leave.id}
                              onClick={() => handleUpdateStatus(leave.id!, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Resolved</span>
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
