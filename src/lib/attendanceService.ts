import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Attendance, UserRole } from '../types';
import { logActivity } from './activityLogger';

export const ATTENDANCE_START_HOUR = 9;  // 9:00 AM
export const ATTENDANCE_END_HOUR = 16;   // 4:00 PM

/**
 * Returns true if the provided date/time is between 9:00 AM and 4:00 PM local time.
 */
export function isWithinAttendanceWindow(date: Date = new Date()): boolean {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // 9:00 AM (09:00) to 4:00 PM (16:00)
  if (hours < ATTENDANCE_START_HOUR) return false;
  if (hours > ATTENDANCE_END_HOUR) return false;
  if (hours === ATTENDANCE_END_HOUR && minutes > 0) return false;
  return true;
}

/**
 * Formats a Date into local YYYY-MM-DD string
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses any date or timestamp into YYYY-MM-DD string
 */
export function parseAttendanceDateString(val: any): string {
  if (!val) return getLocalDateString();
  if (typeof val === 'string') {
    // If it's already YYYY-MM-DD or ISO
    return val.split('T')[0];
  }
  if (val.toDate && typeof val.toDate === 'function') {
    return getLocalDateString(val.toDate());
  }
  if (val instanceof Date) {
    return getLocalDateString(val);
  }
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return getLocalDateString(d);
    }
  } catch {}
  return getLocalDateString();
}

/**
 * Safely extracts check-in time formatted nicely
 */
export function formatTimeDisplay(timeVal: any): string {
  if (!timeVal) return '';
  if (typeof timeVal === 'string') return timeVal;
  if (timeVal.toDate && typeof timeVal.toDate === 'function') {
    return timeVal.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (timeVal instanceof Date) {
    return timeVal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  return String(timeVal);
}

export interface AutoAttendanceResult {
  success: boolean;
  marked: boolean;
  reason: 'marked_present' | 'already_marked' | 'outside_window' | 'not_employee' | 'error';
  message: string;
  record?: Attendance;
}

/**
 * Automatically marks an employee as Present when they log in between 9:00 AM and 4:00 PM.
 * Checks existing records to avoid duplicates and protects any admin overrides.
 */
export async function autoMarkEmployeeAttendance(user: {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole | string;
  departmentId?: string;
}): Promise<AutoAttendanceResult> {
  try {
    if (!user || !user.uid) {
      return {
        success: false,
        marked: false,
        reason: 'not_employee',
        message: 'No user authenticated.'
      };
    }

    // Check if the user is an employee / staff member
    const userRole = (user.role || '').toUpperCase();
    const isStaffRole = ['EMPLOYEE', 'MENTOR', 'INTERN'].includes(userRole);
    if (!isStaffRole) {
      return {
        success: false,
        marked: false,
        reason: 'not_employee',
        message: `User role (${userRole}) is not tracked for employee daily attendance.`
      };
    }

    const now = new Date();
    // Verify window: 9:00 AM - 4:00 PM
    if (!isWithinAttendanceWindow(now)) {
      const currentFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      return {
        success: true,
        marked: false,
        reason: 'outside_window',
        message: `Current time (${currentFormatted}) is outside the auto check-in window (9:00 AM – 4:00 PM).`
      };
    }

    const todayStr = getLocalDateString(now);
    const docId = `${user.uid}_${todayStr}`;
    const attRef = doc(db, 'attendance', docId);

    // Check existing attendance doc
    const existingSnap = await getDoc(attRef);

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as Attendance;
      // If already present or has an admin override, preserve it
      return {
        success: true,
        marked: false,
        reason: 'already_marked',
        message: `Attendance for today is already recorded as ${existingData.status.toUpperCase()}.`,
        record: { id: docId, ...existingData }
      };
    }

    // Auto mark present
    const checkInTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Employee';

    const newRecord: Attendance = {
      id: docId,
      userId: user.uid,
      userName: fullName,
      userEmail: user.email || '',
      userRole: user.role,
      departmentId: user.departmentId || '',
      date: todayStr,
      checkIn: checkInTimeStr,
      status: 'present',
      autoMarked: true,
      modifiedByAdmin: false,
      notes: 'Automatically marked present on login during office hours (9:00 AM – 4:00 PM)',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(attRef, newRecord, { merge: true });

    // Log the auto attendance action
    await logActivity(
      'AUTO_ATTENDANCE',
      user.uid,
      docId,
      'attendance' as any,
      `Employee ${user.email || fullName} auto-marked PRESENT on login at ${checkInTimeStr} (9 AM - 4 PM window)`
    );

    return {
      success: true,
      marked: true,
      reason: 'marked_present',
      message: `Welcome! You have been automatically marked Present for today at ${checkInTimeStr}.`,
      record: newRecord
    };
  } catch (err: any) {
    console.error('Error in autoMarkEmployeeAttendance:', err);
    return {
      success: false,
      marked: false,
      reason: 'error',
      message: err?.message || 'Failed to auto-mark attendance.'
    };
  }
}

/**
 * Admin action: Change or override an employee's attendance state
 */
export async function adminChangeAttendanceState(params: {
  adminUid: string;
  adminEmail?: string;
  targetUserId: string;
  targetUserName: string;
  targetUserEmail?: string;
  targetUserRole?: string;
  date: string; // YYYY-MM-DD
  status: Attendance['status'];
  checkIn?: string | null;
  checkOut?: string | null;
  adminNotes?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const {
      adminUid,
      targetUserId,
      targetUserName,
      targetUserEmail,
      targetUserRole,
      date,
      status,
      checkIn,
      checkOut,
      adminNotes
    } = params;

    const docId = `${targetUserId}_${date}`;
    const attRef = doc(db, 'attendance', docId);

    const updatePayload: Partial<Attendance> = {
      userId: targetUserId,
      userName: targetUserName,
      userEmail: targetUserEmail || '',
      userRole: targetUserRole || 'EMPLOYEE',
      date: date,
      status: status,
      modifiedByAdmin: true,
      adminNotes: adminNotes || '',
      updatedAt: serverTimestamp()
    };

    if (status !== 'absent') {
      updatePayload.checkIn = checkIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
      updatePayload.checkIn = null;
    }

    if (checkOut !== undefined) {
      updatePayload.checkOut = checkOut;
    }

    await setDoc(attRef, updatePayload, { merge: true });

    await logActivity(
      'ADMIN_ATTENDANCE_OVERRIDE',
      adminUid,
      docId,
      'attendance' as any,
      `Admin changed attendance for ${targetUserName} on ${date} to ${status.toUpperCase()}${adminNotes ? ` (Notes: ${adminNotes})` : ''}`
    );

    return {
      success: true,
      message: `Successfully updated attendance for ${targetUserName} to ${status.toUpperCase()}.`
    };
  } catch (err: any) {
    console.error('Error in adminChangeAttendanceState:', err);
    throw err;
  }
}
