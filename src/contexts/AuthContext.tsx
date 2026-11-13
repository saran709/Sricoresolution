import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';
import { autoMarkEmployeeAttendance, getLocalDateString } from '../lib/attendanceService';
import { CanonicalRole, normalizeToCanonicalRole } from '../lib/rbac';
import { logActivity } from '../lib/activityLogger';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  canonicalRole?: CanonicalRole;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  isActive?: boolean;
  permissionOverrides?: Record<string, boolean>;
  limitOverrides?: Record<string, any>;
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

const ADMIN_EMAILS = ['saranramesh709@gmail.com'];

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

  const hydrateAndPersistProfile = useCallback((user: FirebaseUser, rawData: any) => {
    const isConfiguredAdmin = Boolean(
      user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())
    );

    const canonicalRole: CanonicalRole = isConfiguredAdmin
      ? 'ADMIN'
      : normalizeToCanonicalRole(rawData?.role);

    // Keep backward-compatible role value while exposing canonicalRole
    const effectiveRole: UserRole =
      canonicalRole === 'ADMIN'
        ? 'ADMINISTRATOR'
        : (canonicalRole as UserRole);

    const profileData: UserProfile = {
      uid: user.uid,
      ...rawData,
      email: rawData?.email || user.email || '',
      role: effectiveRole,
      canonicalRole,
      isActive: rawData?.isActive !== false,
    };

    setUserProfile(profileData);
    try {
      localStorage.setItem(`sricore_profile_${user.uid}`, JSON.stringify(profileData));
      localStorage.setItem('sricore_active_profile', JSON.stringify(profileData));
    } catch {}

    return profileData;
  }, []);

  const syncSessionSideEffects = useCallback((user: FirebaseUser, profileData: UserProfile) => {
    const todayStr = getLocalDateString();
    const loginSessionKey = `sricore_login_logged_${user.uid}_${todayStr}`;
    if (!sessionStorage.getItem(loginSessionKey)) {
      sessionStorage.setItem(loginSessionKey, 'done');
      logActivity(
        'USER_LOGIN',
        user.uid,
        user.uid,
        'user',
        `Authenticated login session (${profileData.canonicalRole || profileData.role})`
      ).catch(() => {});
      setDoc(
        doc(db, 'users', user.uid),
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      ).catch(() => {});
    }

    if (
      ['EMPLOYEE', 'MENTOR', 'INTERN_STUDENT', 'INTERN'].includes(
        profileData.canonicalRole || profileData.role
      )
    ) {
      const sessionKey = `sricore_att_checked_${user.uid}_${todayStr}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'done');
        autoMarkEmployeeAttendance(profileData).catch(() => {});
      }
    }
  }, []);

  const resolveMissingProfile = useCallback(
    async (user: FirebaseUser) => {
      let rawData: any = null;
      if (user.email) {
        try {
          const q = query(collection(db, 'users'), where('email', '==', user.email.trim()));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            rawData = querySnap.docs[0].data();
            try {
              await setDoc(
                doc(db, 'users', user.uid),
                {
                  ...rawData,
                  uid: user.uid,
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            } catch {}
          }
        } catch {}
      }

      if (rawData) {
        const profileData = hydrateAndPersistProfile(user, rawData);
        syncSessionSideEffects(user, profileData);
        return;
      }

      const isConfiguredAdmin = Boolean(
        user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())
      );
      const displayNameParts = (user.displayName || '').split(' ');
      const initialRole: CanonicalRole = isConfiguredAdmin ? 'ADMIN' : 'INTERN_STUDENT';
      const fallbackRaw = {
        uid: user.uid,
        email: user.email || '',
        firstName: displayNameParts[0] || 'User',
        lastName: displayNameParts.slice(1).join(' ') || '',
        role: isConfiguredAdmin ? 'ADMINISTRATOR' : 'INTERN_STUDENT',
        isActive: true,
      };

      if (isConfiguredAdmin) {
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              ...fallbackRaw,
              canonicalRole: initialRole,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {}
      }

      hydrateAndPersistProfile(user, fallbackRaw);
    },
    [hydrateAndPersistProfile, syncSessionSideEffects]
  );

  const refreshProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    setProfileLoading(true);
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const profileData = hydrateAndPersistProfile(user, snap.data());
        syncSessionSideEffects(user, profileData);
      } else {
        await resolveMissingProfile(user);
      }
    } catch {
      // Retain cached profile if offline
    } finally {
      setProfileLoading(false);
    }
  }, [hydrateAndPersistProfile, resolveMissingProfile, syncSessionSideEffects]);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      setCurrentUser(user);
      setLoading(false);

      if (!user) {
        setUserProfile(null);
        try {
          localStorage.removeItem('sricore_active_profile');
        } catch {}
        setProfileLoading(false);
        return;
      }

      // Immediately hydrate per-user cached profile if present so workspaces do not block behind a spinner
      let hasCachedProfile = false;
      try {
        const cachedStr = localStorage.getItem(`sricore_profile_${user.uid}`);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (cached && cached.uid === user.uid) {
            setUserProfile(cached);
            hasCachedProfile = true;
          }
        }
      } catch {}
      setProfileLoading(!hasCachedProfile);

      let initialized = false;
      const isConfiguredAdmin = Boolean(
        user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())
      );

      // Single real-time subscription delivers both initial read & live RBAC updates
      profileUnsubscribe = onSnapshot(
        doc(db, 'users', user.uid),
        async (snap) => {
          try {
            if (snap.exists()) {
              const rawData = snap.data();
              if (
                !initialized &&
                isConfiguredAdmin &&
                rawData.role !== 'ADMINISTRATOR' &&
                rawData.role !== 'ADMIN'
              ) {
                setDoc(
                  doc(db, 'users', user.uid),
                  { role: 'ADMIN', updatedAt: serverTimestamp() },
                  { merge: true }
                ).catch(() => {});
              }

              const profileData = hydrateAndPersistProfile(user, rawData);
              if (!initialized) {
                initialized = true;
                syncSessionSideEffects(user, profileData);
              }
            } else if (!initialized) {
              initialized = true;
              await resolveMissingProfile(user);
            }
          } finally {
            setProfileLoading(false);
          }
        },
        () => {
          setProfileLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, [hydrateAndPersistProfile, resolveMissingProfile, syncSessionSideEffects]);

  const isAdmin = useMemo(
    () =>
      userProfile?.role === 'ADMINISTRATOR' ||
      userProfile?.role === 'ADMIN' ||
      userProfile?.canonicalRole === 'ADMIN',
    [userProfile?.role, userProfile?.canonicalRole]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      userProfile,
      loading,
      profileLoading,
      isAdmin,
      refreshProfile,
    }),
    [currentUser, userProfile, loading, profileLoading, isAdmin, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
