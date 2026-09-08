import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';

// Import role dashboards
import EmployeeDashboard from './roles/EmployeeDashboard';
import MentorDashboard from './roles/MentorDashboard';
import InternDashboard from './roles/InternDashboard';
import ClientDashboard from './roles/ClientDashboard';
import CandidateDashboard from './roles/CandidateDashboard';

export default function Dashboard() {
  const { userProfile, currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const makeMeAdmin = async () => {
    if (!currentUser) return;
    setIsUpgrading(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { role: 'ADMINISTRATOR' }, { merge: true });
      // Force reload to update auth context
      window.location.href = '/admin';
    } catch (error) {
      console.error(error);
      alert('Failed to upgrade account.');
      setIsUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-slate-50 py-12">
        <Container>
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-24 bg-slate-200 rounded-xl w-full"></div>
            <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
          </div>
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
                ${userProfile?.role === 'CLIENT' ? 'bg-amber-100 text-amber-800' :
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
        
        {userProfile?.role !== 'ADMINISTRATOR' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="p-2 bg-red-100 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">Initial Setup: Admin Required</h3>
                <p className="text-red-700 text-sm mt-1 max-w-2xl">Since you received an "email already in use" error on the setup page, you can use this emergency button to securely promote your current account to the Administrator role.</p>
              </div>
            </div>
            <Button onClick={makeMeAdmin} isLoading={isUpgrading} className="bg-red-600 hover:bg-red-700 text-white shrink-0 w-full sm:w-auto">
              Promote Me to Admin
            </Button>
          </div>
        )}

        {/* Role-specific content */}
        {renderRoleDashboard()}
        
      </Container>
    </div>
  );
}
