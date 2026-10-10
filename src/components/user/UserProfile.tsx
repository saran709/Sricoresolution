import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { EditProfileModal } from '../ui/EditProfileModal';

export function UserProfile() {
  const { userProfile, currentUser, loading } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner size="sm" />;
  }

  if (!userProfile) {
    return <div className="text-slate-500">Profile data not available.</div>;
  }

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">User Profile</h2>
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
            Edit
          </Button>
        </div>
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
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </>
  );
}
