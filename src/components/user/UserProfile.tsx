import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function UserProfile() {
  const { userProfile, currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="sm" />;
  }

  if (!userProfile) {
    return <div className="text-slate-500">Profile data not available.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-4">User Profile</h2>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</p>
          <p className="text-sm font-medium text-slate-900">{userProfile.firstName} {userProfile.lastName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</p>
          <p className="text-sm font-medium text-slate-900">{currentUser?.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</p>
          <p className="text-sm font-medium text-slate-900">{userProfile.role}</p>
        </div>
      </div>
    </div>
  );
}
