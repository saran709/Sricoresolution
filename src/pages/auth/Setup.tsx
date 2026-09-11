import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Setup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const setupDoc = await getDoc(doc(db, 'system', 'setup'));
        if (setupDoc.exists()) {
          setIsInitialized(true);
        } else {
          setIsInitialized(false);
        }
      } catch (err) {
        console.warn('Error checking setup:', err);
        // If we get permission denied on read, it might still mean we can't create it,
        // but our rule allows read: if true;
      }
    };
    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInitialized) return;
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const batch = writeBatch(db);
      
      const setupRef = doc(db, 'system', 'setup');
      batch.set(setupRef, { isInitialized: true });

      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, {
        email: user.email,
        firstName,
        lastName,
        role: 'ADMINISTRATOR',
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to setup administrator');
    } finally {
      setLoading(false);
    }
  };

  if (isInitialized === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-medium text-lg animate-pulse">Checking system status...</p>
      </div>
    );
  }

  if (isInitialized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">System Initialized</h2>
          <p className="text-slate-600 mb-6">
            The administrator account has already been configured for this system.
          </p>
          <Button onClick={() => navigate('/login')} fullWidth>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-amber-100">
        <div className="text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-700 text-sm font-bold tracking-wide mb-4">
            SYSTEM BOOTSTRAP
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Create First Administrator
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            This screen is only visible during the initial deployment. Creating this account will permanently lock the bootstrap process.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="First Name"
              required 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input 
              label="Last Name"
              required 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          
          <Input 
            label="Admin Email Address"
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Input 
            label="Secure Password"
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button type="submit" className="w-full justify-center py-3 text-base" disabled={loading}>
            {loading ? 'Configuring System...' : 'Initialize Administrator Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
