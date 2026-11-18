import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { PrivateRoute, AdminPrivateRoute } from './components/PrivateRoute';
import { PagePlaceholder } from './components/ui/PagePlaceholder';
import { ScrollToTop } from './components/layout/ScrollToTop';
import {
  DashboardErrorBoundary,
  DashboardModuleSkeleton,
} from './components/ui/DashboardSuspense';

function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallbackTitle = 'Section Temporarily Unavailable'
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.warn('Lazy module load fallback activated:', error);
      const FallbackComponent = (() => (
        <PagePlaceholder title={fallbackTitle} />
      )) as unknown as T;
      return { default: FallbackComponent };
    }
  });
}

const CookieBanner = React.lazy(() =>
  import('./components/ui/CookieBanner')
    .then((m) => ({ default: m.CookieBanner }))
    .catch(() => ({ default: (() => null) as React.ComponentType }))
);

// Lazy-loaded Unified Workspace Layouts
const AdminDashboardLayout = lazyWithRetry(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboardLayout }))
);
const DashboardLayout = lazyWithRetry(() =>
  import('./components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))
);

import Home from './pages/Home';

// Main Pages
const About = lazyWithRetry(() => import('./pages/About'));
const Enquiry = lazyWithRetry(() => import('./pages/Enquiry'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const InternshipRegistration = lazyWithRetry(() => import('./pages/InternshipRegistration'));
const Services = lazyWithRetry(() => import('./pages/Services'));
const ResearchServices = lazyWithRetry(() => import('./pages/services/Research'));
const SoftwareSolutions = lazyWithRetry(() => import('./pages/solutions/Software'));
const HardwareSolutions = lazyWithRetry(() => import('./pages/solutions/Hardware'));
const AISolutions = lazyWithRetry(() => import('./pages/solutions/AI'));
const Internships = lazyWithRetry(() => import('./pages/Internships'));
const Projects = lazyWithRetry(() => import('./pages/Projects'));
const ProjectDetail = lazyWithRetry(() => import('./pages/ProjectDetail'));
const Careers = lazyWithRetry(() => import('./pages/Careers'));
const Privacy = lazyWithRetry(() => import('./pages/Privacy'));
const Terms = lazyWithRetry(() => import('./pages/Terms'));
const EditorialPolicy = lazyWithRetry(() => import('./pages/EditorialPolicy'));

// Auth Pages
const Login = lazyWithRetry(() => import('./pages/auth/Login'));
const Register = lazyWithRetry(() => import('./pages/auth/Register'));
const Setup = lazyWithRetry(() => import('./pages/auth/Setup'));
const ForgotPassword = lazyWithRetry(() => import('./pages/auth/ForgotPassword'));
const Unauthorized = lazyWithRetry(() => import('./pages/auth/Unauthorized'));

// Dashboard
const Dashboard = lazyWithRetry(() => import('./pages/dashboard/Dashboard'));

// Admin Pages
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/Dashboard'));
const AdminEmployees = lazyWithRetry(() => import('./pages/admin/Employees'));
const AdminEnquiries = lazyWithRetry(() => import('./pages/admin/Enquiries'));
const AdminProjects = lazyWithRetry(() => import('./pages/admin/Projects'));
const AdminInternships = lazyWithRetry(() => import('./pages/admin/Internships'));
const AdminClients = lazyWithRetry(() => import('./pages/admin/Clients'));
const AdminAudit = lazyWithRetry(() => import('./pages/admin/Audit'));
const AdminContent = lazyWithRetry(() => import('./pages/admin/Content'));
const AdminUsers = lazyWithRetry(() => import('./pages/admin/Users'));
const AdminDocuments = lazyWithRetry(() => import('./pages/admin/Documents'));
const AdminPayments = lazyWithRetry(() => import('./pages/admin/Payments'));
const AdminDepartments = lazyWithRetry(() => import('./pages/admin/Departments'));
const AdminMentors = lazyWithRetry(() => import('./pages/admin/Mentors'));
const AdminCandidates = lazyWithRetry(() => import('./pages/admin/Candidates'));
const AdminInterns = lazyWithRetry(() => import('./pages/admin/Interns'));
const AdminAttendance = lazyWithRetry(() => import('./pages/admin/Attendance'));
const AdminLeaves = lazyWithRetry(() => import('./pages/admin/Leaves'));
const AdminVendors = lazyWithRetry(() => import('./pages/admin/Vendors'));
const AdminAnnouncements = lazyWithRetry(() => import('./pages/admin/Announcements'));
const AdminNotifications = lazyWithRetry(() => import('./pages/admin/Notifications'));
const AdminReports = lazyWithRetry(() => import('./pages/admin/Reports'));
const AdminSettings = lazyWithRetry(() => import('./pages/admin/Settings'));
const AdminPermissions = lazyWithRetry(() => import('./components/PermissionConfiguration'));

const PageLoader = () => (
  <div className="min-h-[60vh] bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-6">
    <div className="max-w-7xl mx-auto">
      <DashboardModuleSkeleton variant="page" label="Loading page content..." />
    </div>
  </div>
);

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <DashboardErrorBoundary moduleName="Application View">
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Admin Routes protected by AdminPrivateRoute guard */}
          <Route
            path="/admin"
            element={
              <AdminPrivateRoute>
                <AdminDashboardLayout />
              </AdminPrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="users" element={<AdminUsers />} />
            
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="mentors" element={<AdminMentors />} />
            
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="payments" element={<AdminPayments />} />
            
            <Route path="internships" element={<AdminInternships />} />
            <Route path="candidates" element={<AdminCandidates />} />
            <Route path="interns" element={<AdminInterns />} />
            
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="leaves" element={<AdminLeaves />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="vendors" element={<AdminVendors />} />
            
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="notifications" element={<AdminNotifications />} />
            
            <Route path="permissions" element={<AdminPermissions />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Protected User Workspace Routes (Client, Employee, Mentor, Intern, Candidate) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="*" element={<Dashboard />} />
          </Route>

          {/* Main Application Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="services/research" element={<ResearchServices />} />
            <Route path="solutions/software" element={<SoftwareSolutions />} />
            <Route path="solutions/hardware" element={<HardwareSolutions />} />
            <Route path="solutions/ai-ml" element={<AISolutions />} />
            <Route path="internships" element={<Internships />} />
            <Route path="internships/apply" element={<InternshipRegistration />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="careers" element={<Careers />} />
            <Route path="career" element={<Careers />} />
            <Route path="contact" element={<Contact />} />
            <Route path="enquiry" element={<Enquiry />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="editorial-policy" element={<EditorialPolicy />} />
            
            {/* Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="setup" element={<Setup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="unauthorized" element={<Unauthorized />} />
            
            <Route path="*" element={<PagePlaceholder title="Page Not Found" />} />
          </Route>
        </Routes>
        </Suspense>
      </DashboardErrorBoundary>
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>
    </>
  );
}
