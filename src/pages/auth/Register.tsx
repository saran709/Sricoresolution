import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Info } from 'lucide-react';

type PublicSignupRole = 'INTERN_STUDENT' | 'CLIENT';

export default function Register() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<PublicSignupRole>('INTERN_STUDENT');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, guide straight to their workspace
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [authLoading, currentUser, isAdmin, navigate]);

  const formatAuthError = (err: any) => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/unauthorized-domain':
        return 'Google sign-up is unavailable from this browser address. Complete the email form below to register immediately.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Click "Sign in here" above to access your workspace.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/operation-not-allowed':
        return 'Email registration is currently unavailable. Please use Google sign-up or contact support.';
      case 'auth/network-request-failed':
        return 'Network connection error. Check your internet connection and try again.';
      default:
        return err?.message || 'Could not create your account. Please review your details and try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      return setError('Please enter both your first name and last name.');
    }

    if (!trimmedEmail) {
      return setError('Please enter a valid email address.');
    }

    if (password.length < 6) {
      return setError('Please choose a password with at least 6 characters.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match. Re-enter the same password in both fields.');
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      const isAdminEmail = trimmedEmail.toLowerCase() === 'saranramesh709@gmail.com';
      const assignedRole = isAdminEmail ? 'ADMIN' : role;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        role: assignedRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });

      navigate(isAdminEmail ? '/admin' : '/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const passwordLongEnough = password.length >= 6;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-xl w-full space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              SRICORE<span className="text-amber-600 dark:text-amber-400">SOLUTIONS</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-amber-700 dark:text-amber-400 hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector First so Google Sign Up picks the intended workspace immediately */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Step 1: Choose how you will use Sricore
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('INTERN_STUDENT')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                role === 'INTERN_STUDENT'
                  ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Student / Intern
                </span>
                {role === 'INTERN_STUDENT' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Apply for internships, submit assignments, view mentor feedback, and track certificates.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                role === 'CLIENT'
                  ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Client / Business Partner
                </span>
                {role === 'CLIENT' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Request commercial software, hardware/IoT, or AI quotes, track milestones, and manage invoices.
              </p>
            </button>
          </div>

          <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Staff Engineers & Mentors:</strong> sign up or sign in using your work email,
              and contact your Administrator if your team role needs activation.
            </span>
          </div>
        </div>

        {/* 1-Click Google Sign Up */}
        <div>
          <button
            type="button"
            onClick={async () => {
              setError('');
              setLoading(true);
              try {
                const provider = new GoogleAuthProvider();
                const userCredential = await signInWithPopup(auth, provider);
                const user = userCredential.user;

                const names = (user.displayName || '').split(' ');
                const userEmail = (user.email || '').toLowerCase().trim();
                const isAdminEmail = userEmail === 'saranramesh709@gmail.com';
                const assignedRole = isAdminEmail ? 'ADMIN' : role;

                await setDoc(
                  doc(db, 'users', user.uid),
                  {
                    uid: user.uid,
                    email: user.email,
                    firstName: names[0] || 'User',
                    lastName: names.slice(1).join(' ') || '',
                    role: assignedRole,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    isActive: true,
                  },
                  { merge: true }
                );

                navigate(isAdminEmail ? '/admin' : '/dashboard');
              } catch (err: any) {
                console.error('Google registration error:', err);
                if (err?.code === 'auth/popup-closed-by-user') {
                  setError('Google sign-up window was closed before finishing.');
                } else {
                  setError(formatAuthError(err));
                }
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google as {role === 'CLIENT' ? 'Client / Business' : 'Student / Intern'}
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-medium">
                Or Step 2: Register with email
              </span>
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Aarav"
              autoComplete="given-name"
            />
            <Input
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Kumar"
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <p
                  className={`mt-1 text-[11px] font-medium ${
                    passwordLongEnough
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {passwordLongEnough ? 'Length OK (6+ characters)' : 'Use at least 6 characters'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p
                  className={`mt-1 text-[11px] font-medium ${
                    passwordsMatch
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full justify-center py-2.5 text-base font-semibold shadow-sm"
            isLoading={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-amber-700 dark:text-amber-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-amber-700 dark:text-amber-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
