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
const LEGACY_PROFILE_STORAGE_KEY = 'sricore_active_profile';

function purgeLegacyProfileStorage(uid?: string) {
  try {
    localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY);
    if (uid) {
      localStorage.removeItem(`sricore_profile_${uid}`);
    }
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && (key === LEGACY_PROFILE_STORAGE_KEY || key.startsWith('sricore_profile_'))) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage access restrictions
  }
}

function isVerifiedBootstrapAdmin(user: FirebaseUser): boolean {
  const normalizedEmail = (user.email || '').toLowerCase().trim();
  const providerId = user.providerData?.[0]?.providerId;
  const isTrustedProvider =
    Boolean(user.emailVerified) || providerId === 'google.com';
  return Boolean(
    normalizedEmail &&
      isTrustedProvider &&
      !user.isAnonymous &&
      ADMIN_EMAILS.includes(normalizedEmail)
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  // Keep authorization state strictly in memory; never hydrate roles or overrides from localStorage
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    purgeLegacyProfileStorage();
  }, []);

  const hydrateProfile = useCallback((user: FirebaseUser, rawData: any) => {
    const isConfiguredAdmin = isVerifiedBootstrapAdmin(user);

    const canonicalRole: CanonicalRole = isConfiguredAdmin
      ? 'ADMIN'
      : normalizeToCanonicalRole(rawData?.canonicalRole || rawData?.role);

    // Keep backward-compatible role value while exposing canonicalRole
    const effectiveRole: UserRole =
      canonicalRole === 'ADMIN'
        ? 'ADMINISTRATOR'
        : (canonicalRole as UserRole);

    const sanitizedOverrides =
      rawData?.permissionOverrides && typeof rawData.permissionOverrides === 'object'
        ? rawData.permissionOverrides
        : undefined;
    const sanitizedLimitOverrides =
      rawData?.limitOverrides && typeof rawData.limitOverrides === 'object'
        ? rawData.limitOverrides
        : undefined;

    const profileData: UserProfile = {
      ...rawData,
      uid: user.uid,
      email: user.email || rawData?.email || '',
      role: effectiveRole,
      canonicalRole,
      isActive: rawData?.isActive !== false && rawData?.status !== 'suspended',
      ...(sanitizedOverrides ? { permissionOverrides: sanitizedOverrides } : {}),
      ...(sanitizedLimitOverrides ? { limitOverrides: sanitizedLimitOverrides } : {}),
    };

    setUserProfile(profileData);
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
      const isConfiguredAdmin = isVerifiedBootstrapAdmin(user);

      // Only copy pre-provisioned profile records if user's email is verified
      if (user.email && user.emailVerified) {
        try {
          const q = query(collection(db, 'users'), where('email', '==', user.email.trim()));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const candidateDoc = querySnap.docs[0].data();
            const candidateCanonical = normalizeToCanonicalRole(
              candidateDoc?.canonicalRole || candidateDoc?.role
            );
            // Never self-provision ADMIN from an unverified/legacy lookup unless verified bootstrap admin
            const safeRole: CanonicalRole =
              candidateCanonical === 'ADMIN' && !isConfiguredAdmin
                ? 'INTERN_STUDENT'
                : candidateCanonical;

            rawData = {
              firstName: candidateDoc?.firstName || '',
              lastName: candidateDoc?.lastName || '',
              phone: candidateDoc?.phone || '',
              photoUrl: candidateDoc?.photoUrl || '',
              email: user.email,
              role: safeRole,
              canonicalRole: safeRole,
              isActive: candidateDoc?.isActive !== false,
            };

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
        const profileData = hydrateProfile(user, rawData);
        syncSessionSideEffects(user, profileData);
        return;
      }

      const displayNameParts = (user.displayName || '').split(' ');
      const initialRole: CanonicalRole = isConfiguredAdmin ? 'ADMIN' : 'INTERN_STUDENT';
      const fallbackRaw = {
        uid: user.uid,
        email: user.email || '',
        firstName: displayNameParts[0] || 'User',
        lastName: displayNameParts.slice(1).join(' ') || '',
        role: isConfiguredAdmin ? 'ADMINISTRATOR' : 'INTERN_STUDENT',
        canonicalRole: initialRole,
        isActive: true,
        status: 'active',
      };

      if (isConfiguredAdmin) {
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              ...fallbackRaw,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {}
      }

      hydrateProfile(user, fallbackRaw);
    },
    [hydrateProfile, syncSessionSideEffects]
  );

  const refreshProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    setProfileLoading(true);
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const profileData = hydrateProfile(user, snap.data());
        syncSessionSideEffects(user, profileData);
      } else {
        await resolveMissingProfile(user);
      }
    } catch {
      // Retain in-memory profile if transiently offline
    } finally {
      setProfileLoading(false);
    }
  }, [hydrateProfile, resolveMissingProfile, syncSessionSideEffects]);

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
        purgeLegacyProfileStorage();
        setProfileLoading(false);
        return;
      }

      // Remove any legacy localStorage profile cache to prevent DevTools tampering
      purgeLegacyProfileStorage(user.uid);
      setProfileLoading(true);

      let initialized = false;
      const isConfiguredAdmin = isVerifiedBootstrapAdmin(user);

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
                  { role: 'ADMIN', canonicalRole: 'ADMIN', updatedAt: serverTimestamp() },
                  { merge: true }
                ).catch(() => {});
              }

              const profileData = hydrateProfile(user, rawData);
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
  }, [hydrateProfile, resolveMissingProfile, syncSessionSideEffects]);

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
