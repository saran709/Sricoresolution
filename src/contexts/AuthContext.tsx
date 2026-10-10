import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  [key: string]: any;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  profileLoading: true,
  isAdmin: false,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('sricore_active_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = useCallback(async (user: FirebaseUser | null) => {
    setProfileLoading(true);
    if (!user) {
      setUserProfile(null);
      try { localStorage.removeItem('sricore_active_profile'); } catch {}
      setProfileLoading(false);
      return;
    }

    try {
      // 1. Try cache
      const cachedStr = localStorage.getItem(`sricore_profile_${user.uid}`);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached && cached.uid === user.uid) {
          setUserProfile(cached);
        }
      }

      // 2. Fetch fresh data in background
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = { uid: user.uid, ...userDoc.data() } as UserProfile;
        setUserProfile(profileData);
        localStorage.setItem(`sricore_profile_${user.uid}`, JSON.stringify(profileData));
        localStorage.setItem('sricore_active_profile', JSON.stringify(profileData));
      } else {
         // Fallback
        const displayNameParts = (user.displayName || '').split(' ');
        const fallback: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          firstName: displayNameParts[0] || 'User',
          lastName: displayNameParts.slice(1).join(' ') || '',
          role: 'CANDIDATE',
        };
        setUserProfile(fallback);
      }
    } catch (error) {
      console.warn("Could not fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false); // Auth is known
      await fetchProfile(user); // Profile loads in background
    });

    return unsubscribe;
  }, [fetchProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    isAdmin: userProfile?.role === 'ADMINISTRATOR',
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
