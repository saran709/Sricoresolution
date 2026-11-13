import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, AlertCircle, ArrowRight, Info } from 'lucide-react';

export default function Login() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');

  // Avoid showing the sign-in form to users who are already signed in
  useEffect(() => {
    if (!authLoading && currentUser) {
      const target = location.state?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');
      navigate(target, { replace: true });
    }
  }, [authLoading, currentUser, isAdmin, navigate, location.state]);

  const formatAuthError = (err: any) => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/unauthorized-domain':
        return 'Google sign-in is unavailable from this browser address. Please sign in using your email and password below, or contact support.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password. Double-check your details, reset your password below, or create a new account if you are new.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address (for example, name@company.com).';
      case 'auth/user-disabled':
        return 'This account has been deactivated. Please contact your Sricore Solutions administrator.';
      case 'auth/too-many-requests':
        return 'Too many failed sign-in attempts. Please wait a few minutes or reset your password.';
      case 'auth/operation-not-allowed':
        return 'Email and password sign-in is currently unavailable. Try Google sign-in or contact support.';
      case 'auth/network-request-failed':
        return 'Unable to reach the sign-in service. Check your internet connection and try again.';
      default:
        return err?.message || 'Unable to sign in right now. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in window was closed before completing. Click the button above whenever you are ready.');
      } else {
        setError(formatAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              SRICORE<span className="text-amber-600 dark:text-amber-400">SOLUTIONS</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Sign in to your workspace
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            New to Sricore?{' '}
            <Link
              to="/register"
              className="font-semibold text-amber-700 dark:text-amber-400 hover:underline transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Clear Single-Portal Guidance */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white">One portal for every role:</strong>{' '}
            Clients, Employees, Mentors, Interns, and Admins sign in here and are directed to their
            authorized dashboard automatically.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Google Sign In */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign in with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-medium">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

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
                placeholder="Enter your password"
                autoComplete="current-password"
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
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 rounded"
              />
              <span className="ml-2">Keep me signed in</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full justify-center py-2.5 text-base font-semibold shadow-sm"
            isLoading={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Visitor quick actions when no account is needed */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Just exploring or need a quick estimate?
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              to="/enquiry"
              className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              <span>Request quote without signing in</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/internships/apply"
              className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:underline"
            >
              <span>Apply for internship</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
