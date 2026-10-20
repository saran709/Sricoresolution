import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';
import { autoMarkEmployeeAttendance, getLocalDateString } from '../lib/attendanceService';

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
      // First attempt: check doc by auth.currentUser.uid
      let userDoc = await getDoc(doc(db, 'users', user.uid));
      let rawData: any = userDoc.exists() ? userDoc.data() : null;

      // Second attempt: if doc was saved under a random or custom ID, query by email
      if (!rawData && user.email) {
        try {
          const q = query(collection(db, 'users'), where('email', '==', user.email.trim()));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const firstDoc = querySnap.docs[0];
            rawData = firstDoc.data();
            // Re-sync to doc(users, user.uid) if missing so Firestore rules can match request.auth.uid
            try {
              await setDoc(doc(db, 'users', user.uid), {
                ...rawData,
                uid: user.uid,
                updatedAt: serverTimestamp()
              }, { merge: true });
            } catch (e) {
              console.warn("Could not auto-sync user document ID:", e);
            }
          }
        } catch (queryErr) {
          console.warn("Could not query users by email:", queryErr);
        }
      }

      const ADMIN_EMAILS = ['saranramesh709@gmail.com'];
      const isConfiguredAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());

      if (rawData) {
        let rawRole = (rawData.role || '').toUpperCase();
        if (rawRole === 'USER') rawRole = 'CLIENT';
        if (rawRole === 'ADMIN' || isConfiguredAdmin) rawRole = 'ADMINISTRATOR';

        if (isConfiguredAdmin && rawData.role !== 'ADMINISTRATOR') {
          try {
            await setDoc(doc(db, 'users', user.uid), {
              role: 'ADMINISTRATOR',
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (syncErr) {
            console.warn("Could not sync admin role to Firestore document:", syncErr);
          }
        }

        const profileData = { 
          uid: user.uid, 
          ...rawData,
          role: rawRole || 'CLIENT'
        } as UserProfile;
        
        setUserProfile(profileData);
        localStorage.setItem(`sricore_profile_${user.uid}`, JSON.stringify(profileData));
        localStorage.setItem('sricore_active_profile', JSON.stringify(profileData));

        // Auto-check in employee if logging in between 9:00 AM and 4:00 PM
        if (['EMPLOYEE', 'MENTOR', 'INTERN'].includes(profileData.role)) {
          const todayStr = getLocalDateString();
          const sessionKey = `sricore_att_checked_${user.uid}_${todayStr}`;
          if (!sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, 'done');
            autoMarkEmployeeAttendance(profileData).then((res) => {
              if (res.marked) {
                console.info(`[Attendance] Employee ${profileData.email} auto-marked PRESENT.`);
              }
            }).catch((err) => {
              console.warn('[Attendance] Auto-checkin failed:', err);
            });
          }
        }
      } else {
        // Fallback profile if Firestore document does not exist yet
        const displayNameParts = (user.displayName || '').split(' ');
        const fallback: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          firstName: displayNameParts[0] || 'User',
          lastName: displayNameParts.slice(1).join(' ') || '',
          role: isConfiguredAdmin ? 'ADMINISTRATOR' : 'CANDIDATE',
        };

        // If this is the admin email, automatically initialize the admin record in Firestore
        if (isConfiguredAdmin) {
          try {
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              firstName: fallback.firstName,
              lastName: fallback.lastName,
              role: 'ADMINISTRATOR',
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (initErr) {
            console.warn("Could not auto-create admin doc:", initErr);
          }
        }

        setUserProfile(fallback);
        localStorage.setItem(`sricore_profile_${user.uid}`, JSON.stringify(fallback));
        localStorage.setItem('sricore_active_profile', JSON.stringify(fallback));
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
      {children}
    </AuthContext.Provider>
  );
};
