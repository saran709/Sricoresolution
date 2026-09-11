import { firebaseService } from '../lib/firebaseService';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { readFromSheet } from '../lib/sheets';
import { auth, db } from '../lib/firebase';
import { setCachedAccessToken, getIsSigningIn, getCachedAccessToken } from '../lib/auth';
import { UserRole } from '../types';

interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface AuthContextType {
  accessToken: string | null;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  accessToken: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const currentToken = getCachedAccessToken();
        if (currentToken) {
          setAccessToken(currentToken);
        } else if (!getIsSigningIn()) {
          setCachedAccessToken(null);
          setAccessToken(null);
        }

        try {
          let userDoc = null;
          try {
            const docSnap = await firebaseService.getById('users', user.uid);
            if (docSnap) {
                userDoc = docSnap;
            } else {
                // If the master admin logs in for the very first time and isn't in DB, create their record
                if (user.email === 'saranramesh709@gmail.com') {
                    userDoc = await firebaseService.createWithId('users', user.uid, {
                        uid: user.uid,
                        email: user.email,
                        firstName: 'Saran',
                        lastName: 'Ramesh',
                        role: 'ADMINISTRATOR',
                        isActive: true
                    });
                }
            }
          } catch(e) { console.warn('Ignored transient getDoc error:', e.message); }
          
          if (userDoc) {
            setUserProfile(userDoc as unknown as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.warn('Error fetching user profile:', error.message);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        setCachedAccessToken(null);
        setAccessToken(null);
      }
      
      setTimeout(() => setLoading(false), 300); // Fast timeout to prevent indefinite loading
    });

    return unsubscribe;
  }, []);

  const value = {
    accessToken,
    currentUser,
    userProfile,
    loading,
    isAdmin: userProfile?.role === 'ADMINISTRATOR' || currentUser?.email === 'saranramesh709@gmail.com',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
