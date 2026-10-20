import React, { useEffect, useState, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { User, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  X, 
  KeyRound, 
  CheckCircle2, 
  ShieldAlert,
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  Users as UsersIcon,
  Check,
  Filter,
  RotateCcw,
  UserCheck,
  UserX
} from 'lucide-react';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface CsvUserCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  position: string;
  department: string;
  status: 'VALID' | 'DUPLICATE' | 'INVALID';
  errorReason?: string;
  selected: boolean;
}

export default function Users() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Single User Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CANDIDATE' as UserRole,
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // CSV Import Modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [parsedCandidates, setParsedCandidates] = useState<CsvUserCandidate[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [csvError, setCsvError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-app Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // In-app Password Reset Confirmation
  const [resetTargetEmail, setResetTargetEmail] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: User[] = [];
      snapshot.forEach(docSnap => {
        userList.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      setUsers(userList);
      setLoading(false);
    }, (err) => {
      console.error("Error streaming users:", err);
      setFeedback({ message: "Failed to stream users: " + (err?.message || "Permission error"), type: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'CANDIDATE',
      isActive: true
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: (user as any).phone || '',
      role: user.role,
      isActive: user.isActive ?? true
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanFirst = formData.firstName.trim();
    const cleanLast = formData.lastName.trim();

    if (!cleanFirst || !cleanLast) {
      setError('Please provide first and last name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingUser && editingUser.id) {
        // Update existing user profile
        await updateDoc(doc(db, 'users', editingUser.id), {
          firstName: cleanFirst,
          lastName: cleanLast,
          phone: formData.phone.trim(),
          role: formData.role,
          isActive: formData.isActive,
          updatedAt: serverTimestamp()
        });
        
        if (currentUser?.uid) {
          await logActivity('USER_UPDATED', currentUser.uid, editingUser.id, 'user', `Updated profile for ${cleanEmail}`);
        }

        setFeedback({ message: `User "${cleanFirst} ${cleanLast}" profile updated successfully!`, type: 'success' });
      } else {
        // Create new user record
        const userRef = doc(collection(db, 'users'));
        await setDoc(userRef, {
          uid: userRef.id,
          id: userRef.id,
          email: cleanEmail,
          firstName: cleanFirst,
          lastName: cleanLast,
          phone: formData.phone.trim(),
          role: formData.role,
          isActive: formData.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        if (currentUser?.uid) {
          await logActivity('USER_CREATED', currentUser.uid, userRef.id, 'user', `Created user record for ${cleanEmail}`);
        }

        setFeedback({ message: `New user "${cleanFirst} ${cleanLast}" (${formData.role}) saved to Firestore!`, type: 'success' });
      }
      
      setIsModalOpen(false);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Save user error:", err);
      setError(err?.message || 'Failed to save user record to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', deleteTarget.id));
      if (currentUser?.uid) {
        await logActivity('USER_DELETED', currentUser.uid, deleteTarget.id, 'user', `Deleted user profile for ${deleteTarget.email}`);
      }
      setFeedback({ message: `User "${deleteTarget.firstName} ${deleteTarget.lastName}" removed from Firestore.`, type: 'success' });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setFeedback({ message: err?.message || 'Failed to delete user.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const executePasswordReset = async () => {
    if (!resetTargetEmail) return;
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetTargetEmail);
      setFeedback({ message: `Password reset email sent to ${resetTargetEmail}!`, type: 'success' });
    } catch (err: any) {
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: resetTargetEmail,
            subject: "Password Reset Request - Sricore Solutions",
            html: `<p>An administrator has initiated a password reset for your account at Sricore Solutions.</p>`
          })
        });
        setFeedback({ message: `Password reset instructions sent to ${resetTargetEmail}!`, type: 'success' });
      } catch (backupErr) {
        setFeedback({ message: err?.message || 'Could not send reset email.', type: 'error' });
      }
    } finally {
      setIsResetting(false);
      setResetTargetEmail(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // --- CSV IMPORT LOGIC ---

  // Standard CSV row parser supporting quoted strings and commas
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Normalize role string from CSV to standard UserRole
  const normalizeRole = (roleStr: string): UserRole => {
    const clean = (roleStr || '').trim().toUpperCase();
    if (clean === 'ADMIN' || clean === 'ADMINISTRATOR') return 'ADMINISTRATOR';
    if (clean === 'EMPLOYEE' || clean === 'STAFF' || clean === 'ENGINEER') return 'EMPLOYEE';
    if (clean === 'MENTOR') return 'MENTOR';
    if (clean === 'INTERN') return 'INTERN';
    if (clean === 'CLIENT' || clean === 'CUSTOMER') return 'CLIENT';
    if (clean === 'EMPLOYER' || clean === 'EMPLOYERS') return 'EMPLOYER';
    return 'CANDIDATE';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setCsvError('');
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setCsvError('The selected file is empty.');
          setIsParsing(false);
          return;
        }

        const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setCsvError('The CSV file must contain a header row and at least one user record.');
          setIsParsing(false);
          return;
        }

        // Parse Header
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const colIndices = {
          firstName: headers.findIndex(h => h.includes('first') || h === 'firstname' || h === 'fname' || h === 'name'),
          lastName: headers.findIndex(h => h.includes('last') || h === 'lastname' || h === 'lname' || h === 'surname'),
          email: headers.findIndex(h => h.includes('email') || h === 'mail'),
          phone: headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact')),
          role: headers.findIndex(h => h.includes('role') || h === 'type'),
          position: headers.findIndex(h => h.includes('position') || h.includes('title') || h.includes('designation')),
          department: headers.findIndex(h => h.includes('department') || h.includes('dept'))
        };

        if (colIndices.email === -1) {
          setCsvError('CSV header missing "Email" column. Please ensure an "email" column header is provided.');
          setIsParsing(false);
          return;
        }

        // Existing emails set from Firestore
        const existingEmails = new Set(users.map(u => (u.email || '').toLowerCase().trim()));
        const seenInCsv = new Set<string>();
        const candidates: CsvUserCandidate[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length === 0 || (row.length === 1 && !row[0])) continue;

          let firstName = colIndices.firstName !== -1 ? (row[colIndices.firstName] || '').trim() : '';
          let lastName = colIndices.lastName !== -1 ? (row[colIndices.lastName] || '').trim() : '';
          const email = (row[colIndices.email] || '').toLowerCase().trim();
          const phone = colIndices.phone !== -1 ? (row[colIndices.phone] || '').trim() : '';
          const roleRaw = colIndices.role !== -1 ? (row[colIndices.role] || '').trim() : 'CANDIDATE';
          const position = colIndices.position !== -1 ? (row[colIndices.position] || '').trim() : '';
          const department = colIndices.department !== -1 ? (row[colIndices.department] || '').trim() : '';

          // If only a single "Name" column was provided, split into first and last
          if (firstName && !lastName && colIndices.lastName === -1) {
            const parts = firstName.split(' ');
            firstName = parts[0] || 'User';
            lastName = parts.slice(1).join(' ') || '';
          }

          if (!firstName) firstName = 'New';
          if (!lastName) lastName = 'Member';

          const role = normalizeRole(roleRaw);
          let status: CsvUserCandidate['status'] = 'VALID';
          let errorReason: string | undefined = undefined;

          if (!email || !email.includes('@') || !email.includes('.')) {
            status = 'INVALID';
            errorReason = 'Invalid email syntax';
          } else if (existingEmails.has(email)) {
            status = 'DUPLICATE';
            errorReason = 'Already in database';
          } else if (seenInCsv.has(email)) {
            status = 'DUPLICATE';
            errorReason = 'Duplicated in this CSV';
          } else {
            seenInCsv.add(email);
          }

          candidates.push({
            id: `row_${i}_${email || Math.random()}`,
            firstName,
            lastName,
            email,
            phone,
            role,
            position,
            department,
            status,
            errorReason,
            selected: status === 'VALID'
          });
        }

        setParsedCandidates(candidates);
      } catch (err: any) {
        console.error("CSV Parse error:", err);
        setCsvError('Failed to parse CSV file: ' + (err?.message || 'Invalid CSV format'));
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  // Toggle selection of a candidate
  const toggleCandidateSelection = (id: string) => {
    setParsedCandidates(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  // Select all or deselect all valid
  const selectAllValid = (selected: boolean) => {
    setParsedCandidates(prev => prev.map(c => c.status === 'VALID' ? { ...c, selected } : c));
  };

  // Download Sample CSV Template
  const downloadSampleTemplate = () => {
    const csvContent = 
`First Name,Last Name,Email,Phone,Role,Position,Department
Rajesh,Murugan,rajesh.sample@sricoresolutions.com,+91 98402 34567,MENTOR,Principal Hardware Architect,Embedded Systems & IoT
Sneha,Patel,sneha.sample@sricoresolutions.com,+91 98405 67890,EMPLOYEE,Senior Frontend Developer,Software Engineering
Rahul,Verma,rahul.sample@sricoresolutions.com,+91 97100 11223,INTERN,Full-Stack Web Intern,Software Engineering
Kavita,Reddy,kavita.sample@gmail.com,+91 96111 44556,CANDIDATE,Prospective AI Intern,AI & Data Science
GreenAgro,Enterprises,contact@greenagrotech.sample.in,+91 94440 88990,CLIENT,Client Representative,Commercial Partnerships`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sricore_users_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Commit selected CSV candidates to Firestore Database
  const handleImportToDatabase = async () => {
    const toImport = parsedCandidates.filter(c => c.selected && c.status === 'VALID');
    if (toImport.length === 0) {
      setCsvError('No valid users selected for import.');
      return;
    }

    setIsImporting(true);
    setCsvError('');
    setImportProgress({ current: 0, total: toImport.length });

    let successCount = 0;
    const errorsList: string[] = [];

    for (let i = 0; i < toImport.length; i++) {
      const u = toImport[i];
      try {
        const userRef = doc(collection(db, 'users'));
        await setDoc(userRef, {
          uid: userRef.id,
          id: userRef.id,
          email: u.email.toLowerCase().trim(),
          firstName: u.firstName.trim(),
          lastName: u.lastName.trim(),
          phone: u.phone.trim(),
          role: u.role,
          position: u.position.trim(),
          departmentId: u.department.trim(),
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        successCount++;
      } catch (err: any) {
        console.error(`Error saving user ${u.email}:`, err);
        errorsList.push(`${u.email}: ${err?.message}`);
      }
      setImportProgress({ current: i + 1, total: toImport.length });
    }

    if (currentUser?.uid && successCount > 0) {
      await logActivity(
        'BULK_CSV_USER_IMPORT',
        currentUser.uid,
        'system',
        'user',
        `Imported ${successCount} user accounts via CSV upload`
      );
    }

    setIsImporting(false);
    setIsCsvModalOpen(false);
    setParsedCandidates([]);
    setCsvFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      const warningNote = errorsList.length > 0 ? ` (${errorsList.length} skipped with errors)` : '';
      setFeedback({
        message: `Successfully imported and added ${successCount} new user(s) to the database!${warningNote}`,
        type: 'success'
      });
    } else if (errorsList.length > 0) {
      setFeedback({
        message: `Import failed: ${errorsList.join(', ')}`,
        type: 'error'
      });
    }
    setTimeout(() => setFeedback(null), 6000);
  };

  // Quick Toggle Active/Inactive Status
  const handleToggleStatus = async (user: User) => {
    if (!user.id) return;
    const newStatus = !(user.isActive ?? true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isActive: newStatus,
        updatedAt: serverTimestamp()
      });

      if (currentUser?.uid) {
        await logActivity(
          'USER_STATUS_TOGGLED',
          currentUser.uid,
          user.id,
          'user',
          `Set status of ${user.email} to ${newStatus ? 'Active' : 'Inactive'}`
        );
      }

      setFeedback({
        message: `User "${user.firstName} ${user.lastName}" marked as ${newStatus ? 'Active' : 'Inactive'}.`,
        type: 'success'
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error("Status toggle error:", err);
      setFeedback({ message: `Failed to update status: ${err?.message}`, type: 'error' });
    }
  };

  // Metrics for quick filtering
  const metrics = {
    total: users.length,
    active: users.filter(u => u.isActive ?? true).length,
    inactive: users.filter(u => !(u.isActive ?? true)).length,
    EMPLOYEE: users.filter(u => u.role === 'EMPLOYEE').length,
    MENTOR: users.filter(u => u.role === 'MENTOR').length,
    INTERN: users.filter(u => u.role === 'INTERN').length,
    CLIENT: users.filter(u => u.role === 'CLIENT').length,
    EMPLOYER: users.filter(u => u.role === 'EMPLOYER').length,
    CANDIDATE: users.filter(u => u.role === 'CANDIDATE').length,
    ADMINISTRATOR: users.filter(u => u.role === 'ADMINISTRATOR').length
  };

  const filteredUsers = users.filter(u => {
    const searchTarget = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${u.role || ''} ${(u as any).position || ''} ${(u as any).phone || ''}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const isUserActive = u.isActive ?? true;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? isUserActive : !isUserActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const isAnyFilterActive = roleFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm.trim().length > 0;

  const resetAllFilters = () => {
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setSearchTerm('');
  };

  const validCount = parsedCandidates.filter(c => c.status === 'VALID').length;
  const duplicateCount = parsedCandidates.filter(c => c.status === 'DUPLICATE').length;
  const invalidCount = parsedCandidates.filter(c => c.status === 'INVALID').length;
  const selectedCount = parsedCandidates.filter(c => c.selected && c.status === 'VALID').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Manage credentials, administrative privileges, and global organizational accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              setParsedCandidates([]);
              setCsvFileName('');
              setCsvError('');
              setIsCsvModalOpen(true);
            }} 
            className="flex items-center gap-2 shadow-sm border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </Button>

          <Button onClick={openAddModal} className="flex items-center gap-2 shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <UserPlus className="w-4 h-4" />
            Add User Profile
          </Button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border shadow-sm transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Ribbon & Quick Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div 
          onClick={() => { setRoleFilter('ALL'); setStatusFilter('ALL'); }}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            roleFilter === 'ALL' && statusFilter === 'ALL'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">All Users</p>
          <p className="text-lg font-extrabold text-slate-900 mt-0.5">{metrics.total}</p>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active</p>
          <p className="text-lg font-extrabold text-emerald-700 mt-0.5">{metrics.active}</p>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'INACTIVE'
              ? 'bg-red-50/80 border-red-300 ring-2 ring-red-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Inactive</p>
          <p className="text-lg font-extrabold text-red-700 mt-0.5">{metrics.inactive}</p>
        </div>

        <div 
          onClick={() => setRoleFilter(roleFilter === 'EMPLOYEE' ? 'ALL' : 'EMPLOYEE')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            roleFilter === 'EMPLOYEE'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employees</p>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">{metrics.EMPLOYEE}</p>
        </div>

        <div 
          onClick={() => setRoleFilter(roleFilter === 'MENTOR' ? 'ALL' : 'MENTOR')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            roleFilter === 'MENTOR'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mentors</p>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">{metrics.MENTOR}</p>
        </div>

        <div 
          onClick={() => setRoleFilter(roleFilter === 'INTERN' ? 'ALL' : 'INTERN')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            roleFilter === 'INTERN'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interns</p>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">{metrics.INTERN}</p>
        </div>

        <div 
          onClick={() => setRoleFilter(roleFilter === 'CLIENT' ? 'ALL' : 'CLIENT')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            roleFilter === 'CLIENT'
              ? 'bg-cyan-50/80 border-cyan-300 ring-2 ring-cyan-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clients</p>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">{metrics.CLIENT}</p>
        </div>

        <div 
          onClick={() => setRoleFilter(roleFilter === 'CANDIDATE' ? 'ALL' : 'CANDIDATE')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            roleFilter === 'CANDIDATE'
              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Candidates</p>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">{metrics.CANDIDATE}</p>
        </div>
      </div>

      {/* Main Users Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar with Search, Role Filter, Status Filter & Reset */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3.5">
          <div className="relative w-full lg:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, role, phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 justify-start lg:justify-end">
            {/* Role Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Role:
              </span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 shadow-sm"
              >
                <option value="ALL">All Roles ({metrics.total})</option>
                <option value="EMPLOYEE">Employee ({metrics.EMPLOYEE})</option>
                <option value="MENTOR">Mentor ({metrics.MENTOR})</option>
                <option value="INTERN">Intern ({metrics.INTERN})</option>
                <option value="CLIENT">Client ({metrics.CLIENT})</option>
                <option value="EMPLOYER">Employer ({metrics.EMPLOYER})</option>
                <option value="CANDIDATE">Candidate ({metrics.CANDIDATE})</option>
                <option value="ADMINISTRATOR">Administrator ({metrics.ADMINISTRATOR})</option>
              </select>
            </div>

            {/* Active / Inactive Status Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 shadow-sm"
              >
                <option value="ALL">All Status ({metrics.total})</option>
                <option value="ACTIVE">Active ({metrics.active})</option>
                <option value="INACTIVE">Inactive ({metrics.inactive})</option>
              </select>
            </div>

            {/* Reset Filters Action */}
            {isAnyFilterActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllFilters}
                className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 border-dashed flex items-center gap-1 bg-white"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}

            <span className="text-xs text-slate-500 font-medium pl-1">
              Showing <strong>{filteredUsers.length}</strong> of {users.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Streaming users from Firestore...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <UsersIcon className="w-12 h-12 text-slate-300 mb-3" />
                      <h3 className="font-bold text-slate-700 text-sm">No users match current filters</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4 text-center">
                        {isAnyFilterActive 
                          ? `No accounts found with Role: "${roleFilter}", Status: "${statusFilter}"${searchTerm ? `, Search: "${searchTerm}"` : ''}.`
                          : 'Get started by creating users or importing from CSV.'}
                      </p>
                      <div className="flex items-center gap-2">
                        {isAnyFilterActive ? (
                          <Button size="sm" onClick={resetAllFilters} variant="outline" className="text-xs">
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear All Filters
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => setIsCsvModalOpen(true)} variant="outline" className="text-xs">
                              <Upload className="w-3.5 h-3.5 mr-1" /> Import CSV
                            </Button>
                            <Button size="sm" onClick={openAddModal} className="text-xs">
                              <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Profile
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{u.firstName} {u.lastName}</div>
                      {(u as any).position && (
                        <div className="text-xs text-slate-400">{(u as any).position}</div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMINISTRATOR' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'MENTOR' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'EMPLOYEE' ? 'bg-emerald-100 text-emerald-800' :
                        u.role === 'INTERN' ? 'bg-amber-100 text-amber-800' :
                        u.role === 'CLIENT' ? 'bg-cyan-100 text-cyan-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        title="Click to toggle Active / Inactive status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          (u.isActive ?? true)
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${(u.isActive ?? true) ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {(u.isActive ?? true) ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditModal(u)}
                          title="Edit User"
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setResetTargetEmail(u.email)} 
                          title="Send Password Reset"
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => setDeleteTarget(u)}
                          title="Delete User Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV UPLOAD & IMPORT MODAL */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Bulk User Import via CSV</h2>
                  <p className="text-xs text-slate-500">Upload a spreadsheet, review parsed candidates, and add them to Firestore</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCsvModalOpen(false)} 
                disabled={isImporting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {csvError && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs my-3 border border-red-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span className="leading-relaxed">{csvError}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {/* Upload Zone & Download Template */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csvFileInput"
                    disabled={isImporting || isParsing}
                  />
                  <Upload className="w-8 h-8 text-blue-600 mb-2" />
                  <label 
                    htmlFor="csvFileInput" 
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer underline"
                  >
                    Click to select CSV file
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts comma-delimited .csv files with headers
                  </p>
                  {csvFileName && (
                    <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      {csvFileName}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      Sample Template
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      Need the standard format? Download the ready-to-use template with expected columns.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadSampleTemplate}
                    className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 bg-white shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .CSV Template
                  </Button>
                </div>
              </div>

              {/* Parsing State Indicator */}
              {isParsing && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 animate-pulse">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-xs font-semibold text-slate-700">Reading and validating CSV rows...</p>
                </div>
              )}

              {/* Parsed Candidates Preview */}
              {parsedCandidates.length > 0 && (
                <div className="space-y-3">
                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 rounded-xl text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-4">
                      <span>Parsed: <strong>{parsedCandidates.length}</strong></span>
                      <span className="text-emerald-700">● Valid: <strong>{validCount}</strong></span>
                      {duplicateCount > 0 && <span className="text-amber-700">● Duplicate: <strong>{duplicateCount}</strong></span>}
                      {invalidCount > 0 && <span className="text-red-700">● Invalid: <strong>{invalidCount}</strong></span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => selectAllValid(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Select All Valid
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => selectAllValid(false)}
                        className="text-xs text-slate-600 hover:text-slate-800 font-medium"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Table of Parsed Users */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-2.5 w-10 text-center">Import</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Position / Dept</th>
                          <th className="p-2.5">Validation Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedCandidates.map(c => (
                          <tr 
                            key={c.id} 
                            className={`transition-colors ${
                              c.status === 'DUPLICATE' ? 'bg-amber-50/40 text-slate-500' :
                              c.status === 'INVALID' ? 'bg-red-50/40 text-slate-400' :
                              c.selected ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={c.selected}
                                disabled={c.status !== 'VALID' || isImporting}
                                onChange={() => toggleCandidateSelection(c.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-2.5 font-semibold text-slate-900">
                              {c.firstName} {c.lastName}
                            </td>
                            <td className="p-2.5 font-mono text-[11px]">
                              {c.email}
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                {c.role}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-500 truncate max-w-xs">
                              {c.position || c.department || '-'}
                            </td>
                            <td className="p-2.5">
                              {c.status === 'VALID' && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Ready
                                </span>
                              )}
                              {c.status === 'DUPLICATE' && (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px]" title={c.errorReason}>
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                  {c.errorReason}
                                </span>
                              )}
                              {c.status === 'INVALID' && (
                                <span className="inline-flex items-center gap-1 text-red-700 font-medium text-[11px]" title={c.errorReason}>
                                  <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                  {c.errorReason}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Progress Bar */}
              {isImporting && importProgress && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-bold text-blue-900">
                    <span>Importing into Firestore database...</span>
                    <span>{importProgress.current} / {importProgress.total}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 transition-all duration-200"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-3">
              <span className="text-xs text-slate-500">
                {selectedCount > 0 ? (
                  <span><strong>{selectedCount}</strong> user(s) selected for database creation</span>
                ) : (
                  <span>No users selected</span>
                )}
              </span>

              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isImporting}
                  onClick={() => setIsCsvModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={selectedCount === 0 || isImporting || isParsing}
                  isLoading={isImporting}
                  onClick={handleImportToDatabase}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import {selectedCount} Users to Database
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Single User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">{editingUser ? 'Edit User Profile' : 'Add User Profile'}</h2>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name *" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                <Input label="Last Name *" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
              </div>
              
              <Input label="Email Address *" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={!!editingUser} />
              
              <Input label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 ..." />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CANDIDATE">Candidate</option>
                  <option value="INTERN">Intern</option>
                  <option value="CLIENT">Client</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userIsActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="userIsActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Account Active & Enabled
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingUser ? 'Update Profile' : 'Save User Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User Record"
        message={`Are you sure you want to permanently delete user "${deleteTarget?.firstName} ${deleteTarget?.lastName}" (${deleteTarget?.email})?`}
        confirmLabel="Delete User"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Password Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={!!resetTargetEmail}
        title="Send Password Reset"
        message={`Send official password reset instructions to "${resetTargetEmail}"?`}
        confirmLabel="Send Reset Email"
        variant="warning"
        isLoading={isResetting}
        onConfirm={executePasswordReset}
        onCancel={() => setResetTargetEmail(null)}
      />
    </div>
  );
}
