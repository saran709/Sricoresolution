import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { UserProfile } from '../../components/user/UserProfile';
import { MyProjects } from '../../components/dashboard/MyProjects';
import { AdSlot } from '../../components/ui/AdSlot';
import { queryClient } from '../../lib/queryClient';

// Import role dashboards
import EmployeeDashboard from './roles/EmployeeDashboard';
import MentorDashboard from './roles/MentorDashboard';
import InternDashboard from './roles/InternDashboard';
import ClientDashboard from './roles/ClientDashboard';
import CandidateDashboard from './roles/CandidateDashboard';

export default function Dashboard() {
  const { userProfile, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      queryClient.clear();
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-slate-50 py-12">
        <Container>
          <LoadingSpinner size="lg" />
        </Container>
      </div>
    );
  }

  const renderRoleDashboard = () => {
    switch (userProfile?.role) {
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      case 'MENTOR':
        return <MentorDashboard />;
      case 'INTERN':
        return <InternDashboard />;
      case 'CLIENT':
        return <ClientDashboard />;
      case 'CANDIDATE':
        return <CandidateDashboard />;
      case 'ADMINISTRATOR':
        return <Navigate to="/admin" replace />;
      default:
        return (
          <div className="text-center p-8 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
            <p>Your account role is not fully configured or recognized.</p>
            <p className="text-sm mt-2">Please contact support.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 py-12">
      <Container>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm">Welcome back, {userProfile?.firstName || currentUser?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                ${userProfile?.role === 'CLIENT' ? 'bg-blue-100 text-blue-800' :
                  userProfile?.role === 'EMPLOYEE' ? 'bg-indigo-100 text-indigo-800' :
                  userProfile?.role === 'MENTOR' ? 'bg-purple-100 text-purple-800' :
                  userProfile?.role === 'INTERN' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-100 text-slate-800'}`}
              >
                {userProfile?.role}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="mb-6">
          <UserProfile />
        </div>

        {/* My Projects (shown for clients & employees) */}
        {(userProfile?.role === 'CLIENT' || userProfile?.role === 'EMPLOYEE') && (
          <div className="mb-6">
            <MyProjects />
          </div>
        )}

        {/* Role-specific content */}
        {renderRoleDashboard()}
        
        <AdSlot isLoading={loading} />
        
      </Container>
    </div>
  );
}