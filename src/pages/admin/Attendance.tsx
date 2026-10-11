import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Attendance, User } from '../../types';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  UserCheck, 
  ShieldAlert, 
  Edit3, 
  Filter, 
  Zap, 
  ShieldCheck, 
  Users, 
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';
import { 
  isWithinAttendanceWindow, 
  getLocalDateString, 
  parseAttendanceDateString, 
  formatTimeDisplay,
  adminChangeAttendanceState 
} from '../../lib/attendanceService';

export default function AttendancePage() {
  const { currentUser } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'EMPLOYEE' | 'MENTOR' | 'INTERN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Edit State Modal
  const [editingTarget, setEditingTarget] = useState<{
    user: User;
    record?: Attendance;
  } | null>(null);
  const [editStatus, setEditStatus] = useState<Attendance['status']>('present');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Live stream staff and attendance records
  useEffect(() => {
    setLoading(true);

    // 1. Live stream staff members
    const qStaff = query(collection(db, 'users'), where('role', 'in', ['EMPLOYEE', 'MENTOR', 'INTERN']));
    const unsubStaff = onSnapshot(qStaff, (snapshot) => {
      const staffList: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setEmployees(staffList);
      setLoading(false);
    }, (err) => {
      console.error("Error streaming staff for attendance:", err);
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

  // Map of attendances for selected date keyed by userId
  const dateAttendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    attendances.forEach(att => {
      const attDateStr = parseAttendanceDateString(att.date);
      if (attDateStr === selectedDate && att.userId) {
        map.set(att.userId, att);
      }
    });
    return map;
  }, [attendances, selectedDate]);

  // Quick State Change by Admin
  const handleQuickStatusChange = async (user: User, newStatus: Attendance['status']) => {
    if (!user.id || !currentUser) return;
    setMarkingId(user.id);
    try {
      const existing = dateAttendanceMap.get(user.id);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const checkInTime = newStatus !== 'absent' 
        ? (existing?.checkIn ? formatTimeDisplay(existing.checkIn) : nowStr)
        : null;

      await adminChangeAttendanceState({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || '',
        targetUserId: user.id,
        targetUserName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        targetUserEmail: user.email,
        targetUserRole: user.role,
        date: selectedDate,
        status: newStatus,
        checkIn: checkInTime,
        checkOut: existing?.checkOut || null,
        adminNotes: existing?.adminNotes || `Status changed to ${newStatus.toUpperCase()} by Administrator`
      });

      setFeedback({ 
        message: `Attendance for ${user.firstName} ${user.lastName} changed to ${newStatus.toUpperCase()}!`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error("Failed to change attendance status:", err);
      setFeedback({ message: err?.message || "Failed to change attendance.", type: 'error' });
    } finally {
      setMarkingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: User, record?: Attendance) => {
    setEditingTarget({ user, record });
    setEditStatus(record?.status || 'present');
    setEditCheckIn(record?.checkIn ? formatTimeDisplay(record.checkIn) : '09:00 AM');
    setEditCheckOut(record?.checkOut ? formatTimeDisplay(record.checkOut) : '');
    setEditNotes(record?.adminNotes || record?.notes || '');
  };

  // Submit Edit Modal Changes
  const handleSaveModalEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !editingTarget.user.id || !currentUser) return;

    setSavingEdit(true);
    try {
      const { user, record } = editingTarget;
      await adminChangeAttendanceState({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || '',
        targetUserId: user.id,
        targetUserName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        targetUserEmail: user.email,
        targetUserRole: user.role,
        date: selectedDate,
        status: editStatus,
        checkIn: editStatus !== 'absent' ? (editCheckIn.trim() || null) : null,
        checkOut: editCheckOut.trim() || null,
        adminNotes: editNotes.trim() || `State updated by Admin`
      });

      setFeedback({
        message: `Attendance details saved for ${user.firstName} ${user.lastName} (${editStatus.toUpperCase()})`,
        type: 'success'
      });
      setTimeout(() => setFeedback(null), 4000);
      setEditingTarget(null);
    } catch (err: any) {
      console.error("Failed to save attendance edits:", err);
      setFeedback({ message: err?.message || "Failed to update record.", type: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  // Bulk action: Mark all currently unmarked staff
  const handleBulkMarkUnmarked = async (bulkStatus: Attendance['status']) => {
    if (!currentUser) return;
    const unmarkedUsers = filteredEmployees.filter(emp => !dateAttendanceMap.has(emp.id || ''));
    if (unmarkedUsers.length === 0) {
      setFeedback({ message: 'No unmarked staff members found for the current filter.', type: 'info' });
      return;
    }

    if (!window.confirm(`Are you sure you want to mark ${unmarkedUsers.length} staff member(s) as ${bulkStatus.toUpperCase()} for ${selectedDate}?`)) {
      return;
    }

    setLoading(true);
    try {
      let count = 0;
      for (const emp of unmarkedUsers) {
        if (!emp.id) continue;
        await adminChangeAttendanceState({
          adminUid: currentUser.uid,
          adminEmail: currentUser.email || '',
          targetUserId: emp.id,
          targetUserName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
          targetUserEmail: emp.email,
          targetUserRole: emp.role,
          date: selectedDate,
          status: bulkStatus,
          adminNotes: `Bulk marked as ${bulkStatus.toUpperCase()} by Administrator`
        });
        count++;
      }
      setFeedback({
        message: `Successfully marked ${count} staff member(s) as ${bulkStatus.toUpperCase()}!`,
        type: 'success'
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Failed bulk attendance mark:", err);
      setFeedback({ message: err?.message || "Bulk operation failed.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Search filter
      const matchesSearch = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.email || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Role filter
      if (roleFilter !== 'ALL' && emp.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        const record = dateAttendanceMap.get(emp.id || '');
        const currentStatus = record?.status || 'unmarked';
        if (statusFilter === 'unmarked') {
          if (record && record.status) return false;
        } else if (currentStatus !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [employees, searchTerm, roleFilter, statusFilter, dateAttendanceMap]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalStaff = employees.length;
    let presentCount = 0;
    let lateCount = 0;
    let remoteCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let autoMarkedCount = 0;

    employees.forEach(emp => {
      const rec = dateAttendanceMap.get(emp.id || '');
      if (rec) {
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'late') lateCount++;
        else if (rec.status === 'remote') remoteCount++;
        else if (rec.status === 'half_day') halfDayCount++;
        else if (rec.status === 'absent') absentCount++;

        if (rec.autoMarked) autoMarkedCount++;
      }
    });

    const unmarkedCount = totalStaff - (presentCount + lateCount + remoteCount + halfDayCount + absentCount);
    const presentPercentage = totalStaff > 0 ? Math.round(((presentCount + remoteCount) / totalStaff) * 100) : 0;

    return {
      totalStaff,
      presentCount,
      lateCount,
      remoteCount,
      halfDayCount,
      absentCount,
      unmarkedCount: Math.max(0, unmarkedCount),
      autoMarkedCount,
      presentPercentage
    };
  }, [employees, dateAttendanceMap]);

  const isToday = selectedDate === getLocalDateString();
  const windowActive = isToday && isWithinAttendanceWindow();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">Staff Attendance & Presence Manager</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Admin Control
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time automated check-ins (9:00 AM – 4:00 PM), staff presence tracking, and administrator state overrides.
          </p>
        </div>

        {/* Date Selector & Jump to Today */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSelectedDate(getLocalDateString())}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isToday 
                ? 'bg-blue-50 text-blue-700 border-blue-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const y = new Date();
              y.setDate(y.getDate() - 1);
              setSelectedDate(getLocalDateString(y));
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            Yesterday
          </button>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-sm bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Auto-Attendance Policy Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              Automatic Attendance Rule Active
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                windowActive 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {windowActive ? '● Window Active (9 AM - 4 PM)' : 'Office Window 9:00 AM – 4:00 PM'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Employees who log in between <strong>9:00 AM and 4:00 PM</strong> are automatically marked <strong>Present</strong>. Administrators have full privilege to modify, override, or change their attendance state at any time below.
            </p>
          </div>
        </div>
        
        <div className="text-xs text-slate-500 shrink-0 flex items-center gap-1.5 self-end sm:self-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Full Override Enabled</span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border shadow-sm transition-all ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          feedback.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {feedback.type === 'error' && <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />}
            {feedback.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase">Total Staff</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalStaff}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All tracked roles</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-xs font-medium text-emerald-700 uppercase flex items-center justify-between">
            <span>Present</span>
            <span className="text-[10px] font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">
              {stats.presentPercentage}%
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{stats.presentCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{stats.autoMarkedCount} via auto-login</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="text-xs font-medium text-blue-700 uppercase">Remote</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.remoteCount}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Work from home/client</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="text-xs font-medium text-amber-700 uppercase">Late / Half-Day</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{stats.lateCount + stats.halfDayCount}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">{stats.lateCount} late • {stats.halfDayCount} half</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <div className="text-xs font-medium text-red-700 uppercase">Absent</div>
          <div className="text-2xl font-bold text-red-900 mt-1">{stats.absentCount}</div>
          <div className="text-[11px] text-red-600 mt-0.5">Confirmed absent</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase">Unmarked</div>
          <div className="text-2xl font-bold text-slate-700 mt-1">{stats.unmarkedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pending check-in</div>
        </div>
      </div>

      {/* Filter and Bulk Action Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
              Clear
            </button>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="EMPLOYEE">Employees</option>
            <option value="MENTOR">Mentors</option>
            <option value="INTERN">Interns</option>
          </select>

          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
            <option value="remote">Remote</option>
            <option value="absent">Absent</option>
            <option value="unmarked">Unmarked</option>
          </select>

          {/* Bulk Action Buttons */}
          <button
            onClick={() => handleBulkMarkUnmarked('present')}
            disabled={stats.unmarkedCount === 0}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark Unmarked Present
          </button>

          <button
            onClick={() => handleBulkMarkUnmarked('absent')}
            disabled={stats.unmarkedCount === 0}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <XCircle className="w-3.5 h-3.5" />
            Mark Unmarked Absent
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Check-in / Out</th>
                <th className="p-4">Current Attendance State</th>
                <th className="p-4 text-center">Change Attendance State</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Streaming staff & attendance records...</span>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No staff records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const record = dateAttendanceMap.get(emp.id || '');
                  const currentStatus = record?.status || 'unmarked';
                  const isMarkingThis = markingId === emp.id;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Staff Member */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-xs font-mono text-slate-500">{emp.email}</div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          emp.role === 'EMPLOYEE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          emp.role === 'MENTOR' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {emp.role}
                        </span>
                      </td>

                      {/* Check-In / Check-Out */}
                      <td className="p-4 text-xs text-slate-600">
                        {record?.checkIn ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1 text-slate-800 font-medium">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              In: {formatTimeDisplay(record.checkIn)}
                            </span>
                            {record.checkOut && (
                              <span className="text-slate-500">
                                Out: {formatTimeDisplay(record.checkOut)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not checked in</span>
                        )}
                      </td>

                      {/* Current Status Badge */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            currentStatus === 'present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            currentStatus === 'late' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            currentStatus === 'half_day' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                            currentStatus === 'remote' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            currentStatus === 'absent' ? 'bg-red-100 text-red-800 border border-red-300' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              currentStatus === 'present' ? 'bg-emerald-600' :
                              currentStatus === 'late' ? 'bg-amber-600' :
                              currentStatus === 'half_day' ? 'bg-orange-600' :
                              currentStatus === 'remote' ? 'bg-blue-600' :
                              currentStatus === 'absent' ? 'bg-red-600' :
                              'bg-slate-400'
                            }`} />
                            {currentStatus.replace('_', ' ').toUpperCase()}
                          </span>

                          {/* Auto-marked or Admin Tag */}
                          {record?.autoMarked && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                              <Zap className="w-3 h-3 text-blue-600" /> Auto (9 AM - 4 PM)
                            </span>
                          )}
                          {record?.modifiedByAdmin && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-purple-600" /> Admin Override
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Admin Quick State Buttons */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                          <button
                            title="Mark Present"
                            disabled={isMarkingThis}
                            onClick={() => handleQuickStatusChange(emp, 'present')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            title="Mark Late"
                            disabled={isMarkingThis}
                            onClick={() => handleQuickStatusChange(emp, 'late')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              currentStatus === 'late'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            title="Mark Half-Day"
                            disabled={isMarkingThis}
                            onClick={() => handleQuickStatusChange(emp, 'half_day')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              currentStatus === 'half_day'
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-orange-700 hover:bg-orange-50'
                            }`}
                          >
                            Half-Day
                          </button>
                          <button
                            title="Mark Remote"
                            disabled={isMarkingThis}
                            onClick={() => handleQuickStatusChange(emp, 'remote')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              currentStatus === 'remote'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            Remote
                          </button>
                          <button
                            title="Mark Absent"
                            disabled={isMarkingThis}
                            onClick={() => handleQuickStatusChange(emp, 'absent')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>

                      {/* Actions: Edit Modal */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openEditModal(emp, record)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Edit Attendance State Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Admin Attendance Override
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Modifying attendance for <strong>{editingTarget.user.firstName} {editingTarget.user.lastName}</strong> on <strong>{selectedDate}</strong>
                </p>
              </div>
              <button 
                onClick={() => setEditingTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalEdit} className="space-y-4">
              {/* Status Radio Choices */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Select Attendance State *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['present', 'late', 'half_day', 'remote', 'absent'] as Attendance['status'][]).map(status => (
                    <label 
                      key={status} 
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold capitalize transition-all ${
                        editStatus === status 
                          ? status === 'present' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                            status === 'late' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                            status === 'half_day' ? 'bg-orange-50 border-orange-500 text-orange-800' :
                            status === 'remote' ? 'bg-blue-50 border-blue-500 text-blue-800' :
                            'bg-red-50 border-red-500 text-red-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="attendanceStatus" 
                        value={status} 
                        checked={editStatus === status} 
                        onChange={() => setEditStatus(status)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{status.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Inputs */}
              {editStatus !== 'absent' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check-In Time
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text"
                        value={editCheckIn}
                        onChange={e => setEditCheckIn(e.target.value)}
                        placeholder="e.g. 09:15 AM"
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setEditCheckIn(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 shrink-0"
                      >
                        Now
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check-Out Time (Optional)
                    </label>
                    <input 
                      type="text"
                      value={editCheckOut}
                      onChange={e => setEditCheckOut(e.target.value)}
                      placeholder="e.g. 05:30 PM"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Admin Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Notes & Justification
                </label>
                <textarea 
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="e.g. Approved medical leave, client on-site visit, or manual correction..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              {/* Historical Context if auto-marked */}
              {editingTarget.record?.autoMarked && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Auto-Marked Record:</strong> This entry was originally created automatically when the employee logged in during the 9:00 AM – 4:00 PM office window.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save Attendance State
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
