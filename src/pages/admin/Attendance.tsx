import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Attendance, User } from '../../types';
import { Calendar, CheckCircle2, Clock, XCircle, Search, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function AttendancePage() {
  const { currentUser } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [marking, setMarking] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);

    // 1. Live stream staff
    const qStaff = query(collection(db, 'users'), where('role', 'in', ['EMPLOYEE', 'MENTOR', 'INTERN']));
    const unsubStaff = onSnapshot(qStaff, (snapshot) => {
      const staffList: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setEmployees(staffList);
      setLoading(false);
    }, (err) => {
      console.error("Error streaming employees for attendance:", err);
      setLoading(false);
    });

    // 2. Live stream attendance
    const unsubAtt = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const attList: Attendance[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Attendance));
      setAttendances(attList);
    }, (err) => {
      console.warn("Error streaming attendance:", err);
    });

    return () => {
      unsubStaff();
      unsubAtt();
    };
  }, []);

  const handleMarkStatus = async (user: User, status: Attendance['status']) => {
    if (!user.id) return;
    setMarking(user.id);
    try {
      const attId = `${user.id}_${selectedDate}`;
      await setDoc(doc(db, 'attendance', attId), {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        date: selectedDate,
        status,
        checkIn: status !== 'absent' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (currentUser) {
        await logActivity('MARK_ATTENDANCE', currentUser.uid, attId, 'user', `Marked attendance for ${user.email} as ${status}`);
      }

      setFeedback({ 
        message: `Attendance for ${user.firstName} ${user.lastName} updated to "${status.toUpperCase()}"!`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Failed to mark attendance:", err);
      setFeedback({ message: err?.message || "Failed to record attendance.", type: 'error' });
    } finally {
      setMarking(null);
    }
  };

  const filteredEmployees = employees.filter(e => 
    `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Tracker</h1>
          <p className="text-sm text-slate-500">Monitor employee check-ins, remote attendance logs, and daily presence</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            Date:
          </label>
          <input 
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700 shadow-sm"
          />
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

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input 
          type="text"
          placeholder="Filter staff by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Check-in Time</th>
                <th className="p-4">Current Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Streaming staff & attendance records...</span>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No active staff found. Add employees in Employee Management.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const record = attendances.find(a => a.userId === emp.id && a.date === selectedDate);
                  const status = record?.status || 'unmarked';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">
                        {emp.firstName} {emp.lastName}
                        <div className="text-xs font-mono text-slate-400 font-normal">{emp.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        {record?.checkIn ? (
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {record.checkIn}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not checked in</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          status === 'absent' ? 'bg-red-50 text-red-700 border border-red-200' :
                          status === 'remote' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          status === 'half_day' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            status === 'present' ? 'bg-emerald-500' :
                            status === 'absent' ? 'bg-red-500' :
                            status === 'remote' ? 'bg-blue-500' :
                            status === 'half_day' ? 'bg-amber-500' :
                            'bg-slate-400'
                          }`} />
                          {status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={marking === emp.id}
                            onClick={() => handleMarkStatus(emp, 'present')}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              status === 'present'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            disabled={marking === emp.id}
                            onClick={() => handleMarkStatus(emp, 'remote')}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              status === 'remote'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            Remote
                          </button>
                          <button
                            disabled={marking === emp.id}
                            onClick={() => handleMarkStatus(emp, 'absent')}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              status === 'absent'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
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
