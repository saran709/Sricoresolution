import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Attendance, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Calendar, CheckCircle2, Clock, XCircle, Search, UserCheck } from 'lucide-react';
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

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empSnap, attSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', 'in', ['EMPLOYEE', 'MENTOR', 'INTERN']))),
        getDocs(collection(db, 'attendance'))
      ]);

      setEmployees(empSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      
      const allAtts: Attendance[] = attSnap.docs.map(d => ({ id: d.id, ...d.data() } as Attendance));
      setAttendances(allAtts);
    } catch (err) {
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkStatus = async (userId: string, status: Attendance['status']) => {
    setMarking(userId);
    try {
      const attId = `${userId}_${selectedDate}`;
      await setDoc(doc(db, 'attendance', attId), {
        userId,
        date: selectedDate,
        status,
        checkIn: status !== 'absent' ? new Date().toLocaleTimeString() : null,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (currentUser) {
        await logActivity('MARK_ATTENDANCE', currentUser.uid, attId, 'user', `Marked attendance for user ${userId} as ${status}`);
      }

      fetchData();
    } catch (err) {
      console.error("Failed to mark attendance:", err);
      alert("Failed to record attendance.");
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
          <p className="text-sm text-slate-500">Monitor employee check-ins, remote attendance logs and daily presence</p>
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
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
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
                <th className="p-4">Status ({selectedDate})</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                    Loading attendance records...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    No staff members registered.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const record = attendances.find(a => a.userId === emp.id && (a.date === selectedDate || a.date?.toDate?.()?.toISOString()?.split('T')[0] === selectedDate));
                  const currentStatus = record?.status || 'absent';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-slate-400">{emp.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-600">
                        {record?.checkIn || '—'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          currentStatus === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          currentStatus === 'late' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          currentStatus === 'half_day' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {currentStatus === 'present' && <CheckCircle2 className="w-3 h-3" />}
                          {currentStatus === 'late' && <Clock className="w-3 h-3" />}
                          {currentStatus === 'absent' && <XCircle className="w-3 h-3" />}
                          {currentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            size="sm" 
                            variant={currentStatus === 'present' ? 'primary' : 'outline'}
                            className="text-xs px-2.5 py-1"
                            isLoading={marking === emp.id}
                            onClick={() => handleMarkStatus(emp.id!, 'present')}
                          >
                            Present
                          </Button>
                          <Button 
                            size="sm" 
                            variant={currentStatus === 'late' ? 'primary' : 'outline'}
                            className="text-xs px-2.5 py-1"
                            isLoading={marking === emp.id}
                            onClick={() => handleMarkStatus(emp.id!, 'late')}
                          >
                            Late
                          </Button>
                          <Button 
                            size="sm" 
                            variant={currentStatus === 'absent' ? 'primary' : 'outline'}
                            className="text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 border-red-200"
                            isLoading={marking === emp.id}
                            onClick={() => handleMarkStatus(emp.id!, 'absent')}
                          >
                            Absent
                          </Button>
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
