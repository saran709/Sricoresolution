export type UserRole = 
  | 'ADMINISTRATOR' 
  | 'EMPLOYEE' 
  | 'MENTOR' 
  | 'INTERN' 
  | 'CLIENT' 
  | 'CANDIDATE';

export interface User {
  id?: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}

export interface Employee extends User {
  departmentId: string;
  position: string;
  hireDate: any;
}

export interface Mentor extends Employee {
  expertise: string[];
  assignedInterns: string[];
}

export interface Intern extends User {
  mentorId?: string;
  programId: string;
  startDate: any;
  endDate: any;
  status: 'onboarding' | 'active' | 'completed' | 'terminated';
}

export interface Client extends User {
  companyName: string;
  industry?: string;
}

export interface Candidate extends User {
  appliedFor: string;
  applicationStatus: 'pending' | 'reviewed' | 'interviewing' | 'accepted' | 'rejected';
}

export interface Department {
  id?: string;
  name: string;
  managerId: string;
}

export type ProjectStage = 
  // Client Project
  | 'enquiry'
  | 'requirement_discussion'
  | 'technical_analysis'
  | 'feasibility'
  | 'cost_estimation'
  | 'quotation'
  | 'client_approval'
  | 'agreement'
  | 'advance_payment'
  | 'team_formation'
  | 'development'
  | 'testing'
  | 'demonstration'
  | 'client_feedback'
  | 'revision'
  | 'final_approval'
  | 'final_payment'
  | 'delivery'
  | 'support'
  // Student Project
  | 'student_enquiry'
  | 'requirement'
  | 'project_idea'
  | 'student_feasibility'
  | 'proposal'
  | 'cost_discussion'
  | 'student_approval'
  | 'student_payment'
  | 'student_development'
  | 'student_testing'
  | 'documentation'
  | 'student_demo'
  | 'completion'
  // Research Services
  | 'topic_discussion'
  | 'literature_review'
  | 'methodology_assistance'
  | 'data_analysis'
  | 'model_development'
  | 'technical_documentation'
  | 'paper_preparation'
  | 'formatting'
  | 'submission_assistance'
  | 'revision_assistance';

export type ProjectType = 
  | 'software' 
  | 'ai_ml' 
  | 'iot' 
  | 'android' 
  | 'research' 
  | 'academic' 
  | 'innovation' 
  | 'other'
  | 'commercial'
  | 'student';

export type ProjectOwnershipType = 
  | 'internal' 
  | 'academic' 
  | 'personal' 
  | 'client' 
  | 'collaboration' 
  | 'unknown';

export type ProjectStatus = 
  | 'proposed' 
  | 'in_progress' 
  | 'on_hold' 
  | 'completed' 
  | 'cancelled' 
  | 'unknown'
  | 'active';

export type DataVerificationStatus = 
  | 'verified' 
  | 'partially_verified' 
  | 'needs_review';

export interface Project {
  id?: string;
  projectId?: string;
  projectCode?: string;
  projectTitle?: string;
  projectSlug?: string;
  name: string; // backwards compatibility alias for projectTitle
  description: string; // backwards compatibility alias for projectDescription
  projectDescription?: string;
  problemStatement?: string;
  proposedSolution?: string;
  projectCategory?: string;
  projectType: ProjectType;
  ownershipType?: ProjectOwnershipType;
  clientId?: string;
  clientNameSnapshot?: string;
  employerId?: string;
  employerNameSnapshot?: string;
  projectManagerId?: string;
  teamMemberIds?: string[];
  assignedEmployees?: string[]; // backwards compatibility
  assignedInterns?: string[];
  departmentId?: string;
  departmentNameSnapshot?: string;
  technologyStack?: string[];
  features?: string[];
  objectives?: string[];
  scope?: string;
  deliverables?: string[];
  startDate?: any;
  expectedEndDate?: any;
  actualEndDate?: any;
  endDate?: any;
  budget?: number | null;
  currency?: string;
  paymentStatus?: string;
  projectStatus?: ProjectStatus;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled' | 'in_progress' | 'proposed' | 'unknown';
  stage?: ProjectStage | string;
  projectStage?: string;
  progressPercentage?: number;
  repositoryUrl?: string;
  demoUrl?: string;
  documentationPath?: string;
  portfolioVisibility?: boolean;
  featured?: boolean;
  sourceReferences?: string[];
  dataVerificationStatus?: DataVerificationStatus;
  verificationNotes?: string;
  missingInformationFlags?: string[];
  createdBy?: string;
  createdAt: any;
  updatedAt: any;
}

export interface ProjectTask {
  id?: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'REVIEW' | 'COMPLETED';
  dueDate?: any;
  submissionNote?: string;
  mentorFeedback?: string;
  submittedAt?: any;
  evaluatedAt?: any;
  createdAt?: any;
}

export interface Milestone {
  id?: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: any;
  status: 'pending' | 'completed';
  createdAt: any;
}

export interface InternshipProgram {
  id?: string;
  title: string;
  description: string;
  durationMonths: number;
  mode: 'online' | 'offline' | 'hybrid';
  technologies: string[];
  learningObjectives: string[];
  fees: number;
  eligibility: string;
  capacity: number;
  startDate: any;
  endDate: any;
  status: 'draft' | 'published' | 'closed';
  isOpen: boolean;
}

export interface InternshipApplication {
  id?: string;
  candidateId: string;
  programId: string;
  resumeUrl?: string;
  education?: string;
  status: 
    | 'internship_enquiry' 
    | 'program_selection' 
    | 'registration' 
    | 'payment' 
    | 'application_verification' 
    | 'approved' 
    | 'onboarding' 
    | 'mentor_assignment' 
    | 'training' 
    | 'assignments' 
    | 'practical_work' 
    | 'project' 
    | 'evaluation' 
    | 'completed' 
    | 'certificate'
    | 'rejected';
  createdAt: any;
}

export interface Enquiry {
  id?: string;
  clientId?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  serviceInterest?: string;
  projectDetails?: string;
  name?: string;
  email: string;
  subject?: string;
  message?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  enquiryType: 'commercial' | 'student' | 'research' | 'internship' | 'general';
  createdAt: any;
}

export interface SupportTicket {
  id?: string;
  clientId: string;
  projectId?: string;
  subject: string;
  description: string;
  status: 'open' | 'assigned' | 'investigating' | 'resolved' | 'client_confirmation' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string; // Employee ID
  createdAt: any;
  updatedAt: any;
}

export interface Payment {
  id?: string;
  orderId?: string; // Legacy/reference
  paymentId?: string; // Reference/UTR number
  transactionId?: string; // UPI UTR or Ref number entered by payer
  clientId: string;
  projectId?: string;
  invoiceId?: string;
  amount: number;
  currency?: string;
  date: any;
  status: 'PENDING' | 'INITIATED' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  verificationStatus?: 'pending' | 'verified' | 'failed';
  method?: string; // e.g. 'UPI_QR' or 'NEFT'
  paymentType: 'advance' | 'milestone' | 'final' | 'internship_fee' | 'other';
  receiptUrl?: string;
  proofUrl?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  clientId: string;
  projectId?: string;
  amount: number;
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  total?: number;
  issueDate?: any;
  dueDate: any;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: Array<{ description: string; quantity?: number; amount: number }>;
  paymentId?: string;
  createdAt?: any;
}

export interface CompanySettings {
  id?: string;
  companyName: string;
  legalName?: string;
  address: string;
  phone: string;
  email: string;
  taxId?: string;
  bankDetails?: string;
  upiId?: string;
  upiName?: string;
  qrCodeUrl?: string;
  termsAndConditions?: string;
}

export interface Document {
  id?: string;
  ownerId: string;
  title: string;
  fileUrl: string;
  accessLevel: 'private' | 'company' | 'public' | 'client';
  allowedRoles?: UserRole[];
  projectId?: string;
  documentType: 'resume' | 'project_file' | 'requirement' | 'quotation' | 'invoice' | 'report' | 'certificate' | 'research' | 'technical' | 'other';
  createdAt: any;
}

export interface ActivityHistory {
  id?: string;
  action: string;
  performedBy: string; // userId
  resourceId: string;
  resourceType: 'project' | 'enquiry' | 'internship' | 'payment' | 'task' | 'ticket' | 'user' | 'system' | 'content';
  details: string;
  timestamp: any;
}

// Retain other existing models
export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export interface Attendance {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: UserRole | string;
  departmentId?: string;
  date: any;
  checkIn: any;
  checkOut?: any;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'remote';
  autoMarked?: boolean;
  modifiedByAdmin?: boolean;
  adminNotes?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface LeaveRequest {
  id?: string;
  userId: string;
  userName?: string;
  type?: string;
  startDate: any;
  endDate: any;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  targetRoles: UserRole[];
  createdAt: any;
}

export interface Vendor {
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  servicesProvided: string;
}

export interface AuditLog {
  id?: string;
  action: string;
  performedBy: string;
  resourceId: string;
  resourceType: string;
  details: any;
  timestamp: any;
}

export interface WebsiteContent {
  id?: string;
  section: string;
  content: any;
  lastUpdatedBy: string;
  lastUpdatedAt: any;
}
