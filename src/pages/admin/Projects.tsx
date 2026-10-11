import React, { useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  setDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Project, 
  ProjectType, 
  ProjectOwnershipType, 
  ProjectStatus, 
  DataVerificationStatus,
  ProjectStage 
} from '../../types';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw, 
  Database, 
  Eye, 
  EyeOff, 
  Edit3, 
  ExternalLink, 
  AlertTriangle, 
  Tag, 
  Code, 
  Calendar, 
  Sparkles,
  Layers,
  X,
  HelpCircle,
  FolderGit2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { 
  auditAndReconcileProjects, 
  MigrationSummaryReport, 
  HISTORICAL_PROJECTS_INVENTORY 
} from '../../lib/projectMigration';

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'software', label: 'Software' },
  { value: 'ai_ml', label: 'AI & Machine Learning' },
  { value: 'iot', label: 'IoT & Hardware' },
  { value: 'android', label: 'Android / Mobile' },
  { value: 'research', label: 'Academic & R&D Research' },
  { value: 'academic', label: 'Academic Platform' },
  { value: 'innovation', label: 'Innovation Challenge' },
  { value: 'other', label: 'Other' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'student', label: 'Student Capstone' }
];

const OWNERSHIP_TYPES: { value: ProjectOwnershipType; label: string }[] = [
  { value: 'internal', label: 'Internal Initiative' },
  { value: 'academic', label: 'Academic / Collegiate' },
  { value: 'personal', label: 'Personal Project' },
  { value: 'client', label: 'Commercial Client' },
  { value: 'collaboration', label: 'R&D Collaboration' },
  { value: 'unknown', label: 'Unknown / Under Review' }
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'in_progress', label: 'In Progress / Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'unknown', label: 'Unknown' }
];

const VERIFICATION_OPTIONS: { value: DataVerificationStatus; label: string }[] = [
  { value: 'verified', label: 'Verified Record' },
  { value: 'partially_verified', label: 'Partially Verified' },
  { value: 'needs_review', label: 'Needs Review' }
];

export default function AdminProjects() {
  const { userProfile, currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterOwnership, setFilterOwnership] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');

  // Modals & Panels
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Migration & Reconcile State
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationReport, setMigrationReport] = useState<MigrationSummaryReport | null>(null);
  const [migrationActiveTab, setMigrationActiveTab] = useState<'summary' | 'items' | 'inventory'>('summary');

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectCode: '',
    projectSlug: '',
    projectDescription: '',
    problemStatement: '',
    proposedSolution: '',
    projectCategory: 'Software Engineering',
    projectType: 'software' as ProjectType,
    ownershipType: 'internal' as ProjectOwnershipType,
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    technologyStack: '',
    features: '',
    objectives: '',
    deliverables: '',
    startDate: '',
    expectedEndDate: '',
    actualEndDate: '',
    budget: '',
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'in_progress' as ProjectStatus,
    projectStage: 'development',
    progressPercentage: 50,
    repositoryUrl: '',
    demoUrl: '',
    documentationPath: '',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: '',
    dataVerificationStatus: 'verified' as DataVerificationStatus,
    verificationNotes: ''
  });

  // Real-time Firestore Listener
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const items: Project[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          projectId: data.projectId || docSnap.id,
          projectCode: data.projectCode || `SRI-PRJ-${docSnap.id.slice(0, 4).toUpperCase()}`,
          projectTitle: data.projectTitle || data.name || 'Untitled Project',
          projectSlug: data.projectSlug || (data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : docSnap.id),
          name: data.name || data.projectTitle || 'Untitled Project',
          description: data.description || data.projectDescription || '',
          projectDescription: data.projectDescription || data.description || '',
          problemStatement: data.problemStatement || '',
          proposedSolution: data.proposedSolution || '',
          projectCategory: data.projectCategory || 'Software Engineering',
          projectType: (data.projectType as ProjectType) || 'software',
          ownershipType: (data.ownershipType as ProjectOwnershipType) || 'internal',
          clientId: data.clientId || '',
          clientNameSnapshot: data.clientNameSnapshot || '',
          employerId: data.employerId || '',
          employerNameSnapshot: data.employerNameSnapshot || '',
          projectManagerId: data.projectManagerId || '',
          teamMemberIds: data.teamMemberIds || [],
          assignedEmployees: data.assignedEmployees || [],
          assignedInterns: data.assignedInterns || [],
          departmentId: data.departmentId || '',
          technologyStack: data.technologyStack || [],
          features: data.features || [],
          objectives: data.objectives || [],
          scope: data.scope || '',
          deliverables: data.deliverables || [],
          startDate: data.startDate || null,
          expectedEndDate: data.expectedEndDate || null,
          actualEndDate: data.actualEndDate || null,
          budget: data.budget !== undefined ? data.budget : null,
          currency: data.currency || 'INR',
          paymentStatus: data.paymentStatus || 'not_applicable',
          projectStatus: (data.projectStatus as ProjectStatus) || (data.status as any) || 'in_progress',
          status: data.status || 'active',
          stage: data.stage || data.projectStage || 'development',
          projectStage: data.projectStage || data.stage || 'development',
          progressPercentage: data.progressPercentage !== undefined ? data.progressPercentage : 50,
          repositoryUrl: data.repositoryUrl || '',
          demoUrl: data.demoUrl || '',
          documentationPath: data.documentationPath || '',
          portfolioVisibility: data.portfolioVisibility !== undefined ? data.portfolioVisibility : true,
          featured: data.featured || false,
          sourceReferences: data.sourceReferences || [],
          dataVerificationStatus: (data.dataVerificationStatus as DataVerificationStatus) || 'verified',
          verificationNotes: data.verificationNotes || '',
          missingInformationFlags: data.missingInformationFlags || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });

      // Sort with newest or code order
      items.sort((a, b) => (a.projectCode || '').localeCompare(b.projectCode || ''));
      setProjects(items);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to projects:", err);
      setError(`Firestore listener error: ${err.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtered List
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const title = (p.projectTitle || p.name || '').toLowerCase();
      const code = (p.projectCode || '').toLowerCase();
      const desc = (p.projectDescription || p.description || '').toLowerCase();
      const tech = (p.technologyStack || []).join(' ').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = !term || title.includes(term) || code.includes(term) || desc.includes(term) || tech.includes(term);
      const matchesType = filterType === 'all' || p.projectType === filterType;
      const matchesOwnership = filterOwnership === 'all' || p.ownershipType === filterOwnership;
      const matchesStatus = filterStatus === 'all' || p.projectStatus === filterStatus || p.status === filterStatus;
      const matchesVerification = filterVerification === 'all' || p.dataVerificationStatus === filterVerification;
      const matchesVisibility = filterVisibility === 'all' || 
        (filterVisibility === 'public' && p.portfolioVisibility === true) ||
        (filterVisibility === 'private' && p.portfolioVisibility === false);

      return matchesSearch && matchesType && matchesOwnership && matchesStatus && matchesVerification && matchesVisibility;
    });
  }, [projects, searchTerm, filterType, filterOwnership, filterStatus, filterVerification, filterVisibility]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.projectStatus === 'completed' || p.status === 'completed').length;
    const inProgress = projects.filter(p => p.projectStatus === 'in_progress' || p.status === 'active').length;
    const verified = projects.filter(p => p.dataVerificationStatus === 'verified').length;
    const needsReview = projects.filter(p => p.dataVerificationStatus === 'needs_review' || (p.missingInformationFlags && p.missingInformationFlags.length > 0)).length;
    const portfolioApproved = projects.filter(p => p.portfolioVisibility === true).length;
    const missingClientOrEmployer = projects.filter(p => (!p.clientId && !p.clientNameSnapshot) || (!p.employerId && !p.employerNameSnapshot)).length;

    return { total, completed, inProgress, verified, needsReview, portfolioApproved, missingClientOrEmployer };
  }, [projects]);

  // Open Edit Form
  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectTitle: project.projectTitle || project.name || '',
      projectCode: project.projectCode || '',
      projectSlug: project.projectSlug || '',
      projectDescription: project.projectDescription || project.description || '',
      problemStatement: project.problemStatement || '',
      proposedSolution: project.proposedSolution || '',
      projectCategory: project.projectCategory || 'Software Engineering',
      projectType: project.projectType || 'software',
      ownershipType: project.ownershipType || 'internal',
      clientId: project.clientId || '',
      clientNameSnapshot: project.clientNameSnapshot || '',
      employerId: project.employerId || '',
      employerNameSnapshot: project.employerNameSnapshot || '',
      projectManagerId: project.projectManagerId || '',
      technologyStack: (project.technologyStack || []).join(', '),
      features: (project.features || []).join('\n'),
      objectives: (project.objectives || []).join('\n'),
      deliverables: (project.deliverables || []).join('\n'),
      startDate: project.startDate || '',
      expectedEndDate: project.expectedEndDate || '',
      actualEndDate: project.actualEndDate || '',
      budget: project.budget !== null && project.budget !== undefined ? String(project.budget) : '',
      currency: project.currency || 'INR',
      paymentStatus: project.paymentStatus || 'not_applicable',
      projectStatus: project.projectStatus || 'in_progress',
      projectStage: project.projectStage || project.stage || 'development',
      progressPercentage: project.progressPercentage ?? 50,
      repositoryUrl: project.repositoryUrl || '',
      demoUrl: project.demoUrl || '',
      documentationPath: project.documentationPath || '',
      portfolioVisibility: project.portfolioVisibility ?? true,
      featured: project.featured ?? false,
      sourceReferences: (project.sourceReferences || []).join('\n'),
      dataVerificationStatus: project.dataVerificationStatus || 'verified',
      verificationNotes: project.verificationNotes || ''
    });
    setError('');
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      projectTitle: '',
      projectCode: `SRI-PRJ-${String(projects.length + 1).padStart(3, '0')}`,
      projectSlug: '',
      projectDescription: '',
      problemStatement: '',
      proposedSolution: '',
      projectCategory: 'Software Engineering',
      projectType: 'software',
      ownershipType: 'internal',
      clientId: '',
      clientNameSnapshot: '',
      employerId: 'sricore-solutions',
      employerNameSnapshot: 'Sricore Solutions',
      projectManagerId: '',
      technologyStack: 'React, TypeScript, Tailwind CSS',
      features: 'Role-based access\nReal-time dashboard',
      objectives: 'Streamline operational workflows',
      deliverables: 'Web portal application\nAPI documentation',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '',
      actualEndDate: '',
      budget: '',
      currency: 'INR',
      paymentStatus: 'not_applicable',
      projectStatus: 'in_progress',
      projectStage: 'development',
      progressPercentage: 20,
      repositoryUrl: '',
      demoUrl: '',
      documentationPath: '',
      portfolioVisibility: true,
      featured: false,
      sourceReferences: 'Internal Technical Specification',
      dataVerificationStatus: 'verified',
      verificationNotes: ''
    });
    setError('');
    setIsCreateModalOpen(true);
  };

  // Save Project (Create or Update)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectTitle.trim()) {
      setError('Project title is required.');
      return;
    }

    setSaving(true);
    setError('');

    const techArray = formData.technologyStack
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const featuresArray = formData.features
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const objectivesArray = formData.objectives
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const deliverablesArray = formData.deliverables
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const sourceRefsArray = formData.sourceReferences
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const generatedSlug = formData.projectSlug.trim() || 
      formData.projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const payload: Partial<Project> = {
      projectTitle: formData.projectTitle.trim(),
      projectCode: formData.projectCode.trim(),
      projectSlug: generatedSlug,
      name: formData.projectTitle.trim(), // backwards compatibility
      description: formData.projectDescription.trim(), // backwards compatibility
      projectDescription: formData.projectDescription.trim(),
      problemStatement: formData.problemStatement.trim(),
      proposedSolution: formData.proposedSolution.trim(),
      projectCategory: formData.projectCategory.trim(),
      projectType: formData.projectType,
      ownershipType: formData.ownershipType,
      clientId: formData.clientId.trim(),
      clientNameSnapshot: formData.clientNameSnapshot.trim(),
      employerId: formData.employerId.trim(),
      employerNameSnapshot: formData.employerNameSnapshot.trim(),
      projectManagerId: formData.projectManagerId.trim(),
      technologyStack: techArray,
      features: featuresArray,
      objectives: objectivesArray,
      deliverables: deliverablesArray,
      startDate: formData.startDate || null,
      expectedEndDate: formData.expectedEndDate || null,
      actualEndDate: formData.actualEndDate || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      currency: formData.currency,
      paymentStatus: formData.paymentStatus,
      projectStatus: formData.projectStatus,
      status: formData.projectStatus === 'in_progress' ? 'active' : (formData.projectStatus as any),
      stage: formData.projectStage,
      projectStage: formData.projectStage,
      progressPercentage: Number(formData.progressPercentage) || 0,
      repositoryUrl: formData.repositoryUrl.trim(),
      demoUrl: formData.demoUrl.trim(),
      documentationPath: formData.documentationPath.trim(),
      portfolioVisibility: formData.portfolioVisibility,
      featured: formData.featured,
      sourceReferences: sourceRefsArray,
      dataVerificationStatus: formData.dataVerificationStatus,
      verificationNotes: formData.verificationNotes.trim(),
      updatedAt: serverTimestamp()
    };

    try {
      if (editingProject && editingProject.id) {
        await updateDoc(doc(db, 'projects', editingProject.id), payload);
        if (userProfile?.uid) {
          await logActivity(
            'PROJECT_UPDATED',
            userProfile.uid,
            editingProject.id,
            'project',
            `Updated project ${formData.projectTitle} (${formData.projectCode})`
          );
        }
        setFeedback({ message: `Project "${formData.projectTitle}" updated successfully!`, type: 'success' });
        setEditingProject(null);
      } else {
        const canonicalId = `sri-${generatedSlug.slice(0, 30)}`;
        const fullPayload: Project = {
          ...payload,
          id: canonicalId,
          projectId: canonicalId,
          assignedEmployees: [],
          assignedInterns: [],
          createdBy: currentUser?.uid || 'admin',
          createdAt: serverTimestamp()
        } as Project;

        await setDoc(doc(db, 'projects', canonicalId), fullPayload);
        if (userProfile?.uid) {
          await logActivity(
            'PROJECT_CREATED',
            userProfile.uid,
            canonicalId,
            'project',
            `Created project ${formData.projectTitle} (${formData.projectCode})`
          );
        }
        setFeedback({ message: `Project "${formData.projectTitle}" created successfully!`, type: 'success' });
        setIsCreateModalOpen(false);
      }
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Save project error:", err);
      setError(err?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Visibility directly from table
  const handleToggleVisibility = async (project: Project) => {
    if (!project.id) return;
    const newVisibility = !project.portfolioVisibility;
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        portfolioVisibility: newVisibility,
        updatedAt: serverTimestamp()
      });
      setFeedback({
        message: `Project "${project.projectTitle || project.name}" portfolio visibility set to ${newVisibility ? 'PUBLIC' : 'CONFIDENTIAL / PRIVATE'}.`,
        type: 'info'
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Error updating visibility:", err);
    }
  };

  // Delete Project Execution
  const executeDeleteProject = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, 'projects', deleteTarget.id));
      if (userProfile?.uid) {
        await logActivity(
          'PROJECT_DELETED',
          userProfile.uid,
          deleteTarget.id,
          'project',
          `Deleted project ${deleteTarget.projectTitle || deleteTarget.name}`
        );
      }
      setFeedback({ 
        message: `Project "${deleteTarget.projectTitle || deleteTarget.name}" deleted from Firestore.`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      setFeedback({ message: err?.message || "Failed to delete project.", type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Run Migration Tool (Dry Run or Live)
  const handleRunMigration = async (dryRun: boolean) => {
    setMigrationRunning(true);
    try {
      const report = await auditAndReconcileProjects({
        dryRun,
        userUid: currentUser?.uid || 'admin'
      });
      setMigrationReport(report);
      if (!dryRun) {
        setFeedback({
          message: `Reconciliation complete! Migrated ${report.newProjectsToCreate} new projects, updated ${report.matchedExisting} existing records. 0 duplicates created.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error("Migration error:", err);
      setFeedback({ message: err?.message || "Migration error occurred.", type: 'error' });
    } finally {
      setMigrationRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Projects Portfolio & Workflow</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {projects.length} Total Projects
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Reconciled Firestore historical projects inventory, commercial workflows, and public portfolio registry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={() => {
              setIsMigrationModalOpen(true);
              if (!migrationReport) handleRunMigration(true);
            }}
          >
            <Database className="w-4 h-4 text-indigo-600" />
            Historical Migration Utility
          </Button>

          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border shadow-xs transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : feedback.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : feedback.type === 'error' ? (
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total In Database</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live Firestore records</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.completed}</div>
          <div className="text-[11px] text-emerald-600/70 mt-0.5">Fully implemented</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{stats.inProgress}</div>
          <div className="text-[11px] text-blue-600/70 mt-0.5">Active engineering</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">Verified Records</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{stats.verified}</div>
          <div className="text-[11px] text-purple-600/70 mt-0.5">Historical proof checked</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-teal-600 uppercase tracking-wider">Portfolio Public</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">{stats.portfolioApproved}</div>
          <div className="text-[11px] text-teal-600/70 mt-0.5">Approved for showcase</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-amber-600 uppercase tracking-wider">Needs Review</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{stats.needsReview}</div>
          <div className="text-[11px] text-amber-600/70 mt-0.5">Missing metadata/client</div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by project name, code (e.g. SRI-PRJ-001), tech stack, description..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(searchTerm || filterType !== 'all' || filterOwnership !== 'all' || filterStatus !== 'all' || filterVerification !== 'all' || filterVisibility !== 'all') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs shrink-0 text-slate-500 hover:text-slate-800"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterOwnership('all');
                setFilterStatus('all');
                setFilterVerification('all');
                setFilterVisibility('all');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Category / Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Project Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types ({projects.length})</option>
              {PROJECT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Ownership */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ownership</label>
            <select
              value={filterOwnership}
              onChange={e => setFilterOwnership(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Ownerships</option>
              {OWNERSHIP_TYPES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Verification</label>
            <select
              value={filterVerification}
              onChange={e => setFilterVerification(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Verification</option>
              {VERIFICATION_OPTIONS.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Portfolio Visibility */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Portfolio Visibility</label>
            <select
              value={filterVisibility}
              onChange={e => setFilterVisibility(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              <option value="public">Public Showcase Only</option>
              <option value="private">Internal / Confidential Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Projects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-sm font-semibold text-slate-800">
            Showing {filteredProjects.length} of {projects.length} Projects
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Real-time Cloud Firestore synchronization active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Code & Project Title</th>
                <th className="px-4 py-3.5">Classification</th>
                <th className="px-4 py-3.5">Status & Stage</th>
                <th className="px-4 py-3.5">Verification</th>
                <th className="px-4 py-3.5">Portfolio</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      Loading projects from Cloud Firestore...
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto text-center space-y-3">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="font-medium text-slate-800">No matching projects found</div>
                      <p className="text-xs text-slate-500">
                        Try adjusting search terms or click "Historical Migration Utility" to reconcile previous projects.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setIsMigrationModalOpen(true);
                          handleRunMigration(true);
                        }}
                      >
                        Open Migration Reconciler
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  return (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title & Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2.5">
                          <div className="pt-0.5">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                              {project.projectCode || 'SRI-PRJ'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 leading-snug">
                              {project.projectTitle || project.name}
                            </div>
                            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {project.projectDescription || project.description}
                            </div>
                            {project.technologyStack && project.technologyStack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {project.technologyStack.slice(0, 4).map((tech, idx) => (
                                  <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                    {tech}
                                  </span>
                                ))}
                                {project.technologyStack.length > 4 && (
                                  <span className="text-[10px] text-slate-400">+{project.technologyStack.length - 4} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Classification */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="inline-block uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {project.projectType}
                          </span>
                          <div className="text-[11px] text-slate-500 capitalize">
                            {project.ownershipType || 'internal'}
                          </div>
                          {project.employerNameSnapshot && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={project.employerNameSnapshot}>
                              {project.employerNameSnapshot}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status & Progress */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-block uppercase text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            project.projectStatus === 'completed' || project.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : project.projectStatus === 'in_progress' || project.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : project.projectStatus === 'on_hold'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {(project.projectStatus || project.status || 'in_progress').replace('_', ' ')}
                          </span>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>Stage: {project.projectStage || project.stage || 'development'}</span>
                          </div>

                          {project.progressPercentage !== undefined && (
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${project.progressPercentage}%` }} 
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            project.dataVerificationStatus === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : project.dataVerificationStatus === 'partially_verified'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {project.dataVerificationStatus === 'verified' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            )}
                            {project.dataVerificationStatus || 'verified'}
                          </span>

                          {(!project.clientId && !project.clientNameSnapshot) && (
                            <div className="text-[10px] text-slate-400">
                              Client: Non-commercial / Internal
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Portfolio Visibility Toggle */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleVisibility(project)}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-colors ${
                            project.portfolioVisibility
                              ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title="Click to toggle public portfolio visibility"
                        >
                          {project.portfolioVisibility ? (
                            <>
                              <Eye className="w-3 h-3 text-teal-600" />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>Private</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="inline-flex items-center gap-1 text-xs py-1 px-2 text-slate-700 hover:bg-slate-100"
                            onClick={() => setViewingProject(project)}
                            title="Inspect Details"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View
                          </Button>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="inline-flex items-center gap-1 text-xs py-1 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            onClick={() => handleOpenEdit(project)}
                            title="Edit Project"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </Button>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="inline-flex items-center gap-1 text-xs py-1 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => setDeleteTarget(project)}
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* VIEW PROJECT DETAILS DRAWER / MODAL */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {viewingProject.projectCode}
                  </span>
                  <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {viewingProject.projectType}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    viewingProject.portfolioVisibility ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {viewingProject.portfolioVisibility ? 'Portfolio Public' : 'Confidential'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {viewingProject.projectTitle || viewingProject.name}
                </h2>
              </div>
              <button 
                onClick={() => setViewingProject(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Project Overview</div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {viewingProject.projectDescription || viewingProject.description || 'No description provided.'}
              </p>
            </div>

            {/* Problem & Solution */}
            {(viewingProject.problemStatement || viewingProject.proposedSolution) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingProject.problemStatement && (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">Problem Statement</div>
                    <p className="text-xs text-amber-900 leading-relaxed">{viewingProject.problemStatement}</p>
                  </div>
                )}
                {viewingProject.proposedSolution && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">Proposed Solution</div>
                    <p className="text-xs text-emerald-900 leading-relaxed">{viewingProject.proposedSolution}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tech Stack */}
            {viewingProject.technologyStack && viewingProject.technologyStack.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-blue-600" />
                  Technology Stack
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProject.technologyStack.map((tech, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-medium border border-blue-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features */}
            {viewingProject.features && viewingProject.features.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Key Features</div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  {viewingProject.features.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Source References & Verification */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Data Verification:</span>
                <span className="font-medium text-emerald-700 capitalize">{viewingProject.dataVerificationStatus}</span>
              </div>
              {viewingProject.verificationNotes && (
                <div className="text-slate-600 italic">
                  Note: {viewingProject.verificationNotes}
                </div>
              )}
              {viewingProject.sourceReferences && viewingProject.sourceReferences.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Source References:</span>
                  <div className="text-slate-500 space-y-0.5">
                    {viewingProject.sourceReferences.map((ref, i) => (
                      <div key={i}>• {ref}</div>
                    ))}
                  </div>
                </div>
              )}
              {viewingProject.repositoryUrl && (
                <div className="pt-1 flex items-center gap-1 text-blue-600">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <a href={viewingProject.repositoryUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {viewingProject.repositoryUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setViewingProject(null)}>
                Close
              </Button>
              <Button onClick={() => {
                const target = viewingProject;
                setViewingProject(null);
                handleOpenEdit(target);
              }}>
                Edit Information
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {(isCreateModalOpen || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProject ? 'Edit Project Record' : 'Create New Project Record'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ensure all details reflect genuine verified project specifications.
                </p>
              </div>
              <button 
                onClick={() => { setIsCreateModalOpen(false); setEditingProject(null); }} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                  <input
                    required
                    value={formData.projectTitle}
                    onChange={e => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="e.g. NexusHR — AI-Enabled Enterprise HR Platform"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Code</label>
                  <input
                    value={formData.projectCode}
                    onChange={e => setFormData({ ...formData, projectCode: e.target.value })}
                    placeholder="SRI-PRJ-001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
                  <select
                    value={formData.projectType}
                    onChange={e => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {PROJECT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ownership Type</label>
                  <select
                    value={formData.ownershipType}
                    onChange={e => setFormData({ ...formData, ownershipType: e.target.value as ProjectOwnershipType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {OWNERSHIP_TYPES.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.projectStatus}
                    onChange={e => setFormData({ ...formData, projectStatus: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.projectDescription}
                  onChange={e => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="Detailed functional description..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Statement</label>
                  <textarea
                    rows={2}
                    value={formData.problemStatement}
                    onChange={e => setFormData({ ...formData, problemStatement: e.target.value })}
                    placeholder="Specific engineering problem addressed..."
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Solution</label>
                  <textarea
                    rows={2}
                    value={formData.proposedSolution}
                    onChange={e => setFormData({ ...formData, proposedSolution: e.target.value })}
                    placeholder="Technical solution & architecture..."
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technology Stack (comma-separated)</label>
                <input
                  value={formData.technologyStack}
                  onChange={e => setFormData({ ...formData, technologyStack: e.target.value })}
                  placeholder="React, TypeScript, Node.js, Firebase, Python"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Features (one per line)</label>
                  <textarea
                    rows={3}
                    value={formData.features}
                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source References (one per line)</label>
                  <textarea
                    rows={3}
                    value={formData.sourceReferences}
                    onChange={e => setFormData({ ...formData, sourceReferences: e.target.value })}
                    placeholder="Project Spec v1&#10;Hardware schematic doc"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Actual End Date</label>
                  <input
                    type="date"
                    value={formData.actualEndDate}
                    onChange={e => setFormData({ ...formData, actualEndDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Progress Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progressPercentage}
                    onChange={e => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employer / Sponsoring Entity</label>
                  <input
                    value={formData.employerNameSnapshot}
                    onChange={e => setFormData({ ...formData, employerNameSnapshot: e.target.value })}
                    placeholder="e.g. Sricore Solutions / Paavai Engineering College"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Repository URL</label>
                  <input
                    value={formData.repositoryUrl}
                    onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })}
                    placeholder="https://github.com/sricoresolutions/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Verification State</label>
                  <select
                    value={formData.dataVerificationStatus}
                    onChange={e => setFormData({ ...formData, dataVerificationStatus: e.target.value as DataVerificationStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {VERIFICATION_OPTIONS.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.portfolioVisibility}
                      onChange={e => setFormData({ ...formData, portfolioVisibility: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Public Portfolio Showcase</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Featured Badge</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setIsCreateModalOpen(false); setEditingProject(null); }}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTORICAL MIGRATION UTILITY MODAL */}
      {isMigrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">Historical Projects Migration Engine</h2>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-100 text-indigo-800">
                    Idempotent & Safe
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Reconcile all 17 historical Sricore Solutions and Paavai collegiate candidate projects against Cloud Firestore.
                </p>
              </div>
              <button 
                onClick={() => setIsMigrationModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-600">
                Mode: <span className="font-semibold text-slate-800">Field-level merge with normalized duplicate protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1.5"
                  disabled={migrationRunning}
                  onClick={() => handleRunMigration(true)}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${migrationRunning ? 'animate-spin' : ''}`} />
                  Run Dry-Run Audit
                </Button>

                <Button 
                  size="sm"
                  className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                  disabled={migrationRunning}
                  onClick={() => handleRunMigration(false)}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Execute Live Reconciliation
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-medium">
              <button
                onClick={() => setMigrationActiveTab('summary')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  migrationActiveTab === 'summary'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Migration Summary
              </button>
              <button
                onClick={() => setMigrationActiveTab('items')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  migrationActiveTab === 'items'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Audit Diff Breakdown ({migrationReport?.itemizedResults.length || 0})
              </button>
              <button
                onClick={() => setMigrationActiveTab('inventory')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  migrationActiveTab === 'inventory'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Verified Candidate Inventory (17)
              </button>
            </div>

            {/* TAB CONTENT: SUMMARY */}
            {migrationActiveTab === 'summary' && migrationReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-500">Candidates Audited</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{migrationReport.totalCandidates}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[11px] font-semibold text-emerald-800">Already Matched</div>
                    <div className="text-xl font-bold text-emerald-800 mt-0.5">{migrationReport.matchedExisting}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="text-[11px] font-semibold text-blue-800">New Projects to Add</div>
                    <div className="text-xl font-bold text-blue-800 mt-0.5">{migrationReport.newProjectsToCreate}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                    <div className="text-[11px] font-semibold text-purple-800">Duplicates Detected</div>
                    <div className="text-xl font-bold text-purple-800 mt-0.5">{migrationReport.duplicatesDetected}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-semibold text-slate-800">Reconciliation Policies Enforced:</div>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Canonical Stable Document IDs (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded">sri-nexushr</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">sri-ecobinx</code>) preventing multiple runs from duplicating entries.</li>
                    <li>Preserved Paavai Engineering College as an academic community entity rather than a fictitious commercial client.</li>
                    <li>Flagged non-commercial and internal projects accurately without fabricating contract amounts or fake clients.</li>
                    <li>Retained backward compatibility fields (<code className="bg-slate-200 px-1 py-0.5 rounded">name</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">status</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">stage</code>) to avoid breaking existing workflow views.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ITEMIZED BREAKDOWN */}
            {migrationActiveTab === 'items' && migrationReport && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 uppercase font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">Code</th>
                      <th className="px-4 py-2.5">Project Title</th>
                      <th className="px-4 py-2.5">Action</th>
                      <th className="px-4 py-2.5">Match Reason / Changes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {migrationReport.itemizedResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{item.projectCode}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 max-w-[250px] truncate" title={item.projectTitle}>
                          {item.projectTitle}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 font-bold rounded-full text-[10px] ${
                            item.action === 'CREATE' ? 'bg-blue-100 text-blue-800' :
                            item.action === 'UPDATE' ? 'bg-amber-100 text-amber-800' :
                            item.action === 'MATCHED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.action}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {item.matchReason}
                          {item.changesSummary && item.changesSummary.length > 0 && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.changesSummary.join(', ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: INVENTORY */}
            {migrationActiveTab === 'inventory' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500">
                  All 17 candidate historical records curated from verified specifications, research dossiers, and capstone project archives:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {HISTORICAL_PROJECTS_INVENTORY.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-700">{c.projectCode}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {c.projectType}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1">{c.projectTitle}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{c.projectDescription}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsMigrationModalOpen(false)}>
                Close Migration Utility
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete project "${deleteTarget?.projectTitle || deleteTarget?.name}" (${deleteTarget?.projectCode})? All associated records will be permanently removed from Firestore.`}
        confirmLabel="Delete Project"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDeleteProject}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
