import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PagePlaceholder } from './components/ui/PagePlaceholder';
import { AdminLayout } from './components/layout/AdminLayout';

// Main Pages
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Enquiry = React.lazy(() => import('./pages/Enquiry'));
const TellUsYourProblem = React.lazy(() => import('./pages/TellUsYourProblem'));
const Contact = React.lazy(() => import('./pages/Contact'));
const InternshipRegistration = React.lazy(() => import('./pages/InternshipRegistration'));
const Services = React.lazy(() => import('./pages/Services'));
const ResearchServices = React.lazy(() => import('./pages/services/Research'));
const SoftwareSolutions = React.lazy(() => import('./pages/solutions/Software'));
const HardwareSolutions = React.lazy(() => import('./pages/solutions/Hardware'));
const AISolutions = React.lazy(() => import('./pages/solutions/AI'));
const Internships = React.lazy(() => import('./pages/Internships'));
const Projects = React.lazy(() => import('./pages/Projects'));
const Careers = React.lazy(() => import('./pages/Careers'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));

// Auth Pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Setup = React.lazy(() => import('./pages/auth/Setup'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const Unauthorized = React.lazy(() => import('./pages/auth/Unauthorized'));

// Dashboard
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminEmployees = React.lazy(() => import('./pages/admin/Employees'));
const AdminEnquiries = React.lazy(() => import('./pages/admin/Enquiries'));
const AdminProjects = React.lazy(() => import('./pages/admin/Projects'));
const AdminInternships = React.lazy(() => import('./pages/admin/Internships'));
const AdminClients = React.lazy(() => import('./pages/admin/Clients'));
const AdminTasks = React.lazy(() => import('./pages/admin/Tasks'));
const AdminAudit = React.lazy(() => import('./pages/admin/Audit'));
const AdminContent = React.lazy(() => import('./pages/admin/Content'));
const AdminNewsletters = React.lazy(() => import('./pages/admin/Newsletters'));
const AdminSupport = React.lazy(() => import('./pages/admin/Support'));
const AdminDocuments = React.lazy(() => import('./pages/admin/Documents'));
const AdminPayments = React.lazy(() => import('./pages/admin/Payments'));
const AdminInvoices = React.lazy(() => import('./pages/admin/Invoices'));
const AdminDepartments = React.lazy(() => import('./pages/admin/Departments'));
const AdminMentors = React.lazy(() => import('./pages/admin/Mentors'));
const AdminInterns = React.lazy(() => import('./pages/admin/Interns'));
const AdminCandidates = React.lazy(() => import('./pages/admin/Candidates'));
const AdminAttendance = React.lazy(() => import('./pages/admin/Attendance'));
const AdminLeave = React.lazy(() => import('./pages/admin/Leave'));
const AdminVendors = React.lazy(() => import('./pages/admin/Vendors'));
const AdminNotifications = React.lazy(() => import('./pages/admin/Notifications'));
const AdminReports = React.lazy(() => import('./pages/admin/Reports'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));


const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
  </div>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="mentors" element={<AdminMentors />} />
            <Route path="interns" element={<AdminInterns />} />
            <Route path="candidates" element={<AdminCandidates />} />
            <Route path="clients" element={<AdminClients />} />
            
            <Route path="projects" element={<AdminProjects />} />
            <Route path="internships" element={<AdminInternships />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="tasks" element={<AdminTasks />} />
            
            <Route path="finance/payments" element={<AdminPayments />} />
            <Route path="finance/invoices" element={<AdminInvoices />} />
            <Route path="finance/receipts" element={<PagePlaceholder title="Receipts" />} />
            <Route path="finance/refunds" element={<PagePlaceholder title="Refunds" />} />
            
            <Route path="documents" element={<AdminDocuments />} />
            
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="leave" element={<AdminLeave />} />
            <Route path="vendors" element={<AdminVendors />} />
            
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="website" element={<AdminContent />} />
            <Route path="newsletters" element={<AdminNewsletters />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AdminAudit />} />
            <Route path="settings" element={<AdminSettings />} />
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
            <Route path="careers" element={<Careers />} />
            <Route path="contact" element={<Contact />} />
            <Route path="enquiry" element={<Enquiry />} />
            <Route path="tell-us-your-problem" element={<TellUsYourProblem />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            
            {/* Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="setup" element={<Setup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="unauthorized" element={<Unauthorized />} />
            
            {/* Protected Client/Employee Routes */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<PagePlaceholder title="Page Not Found" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
