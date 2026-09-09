import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { googleSignIn } from '../../lib/auth';
import { auth, db } from '../../lib/firebase';
import { readFromSheet, writeToSheet } from '../../lib/sheets';
import { Container } from '../../components/ui/Container';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';


function mapAuthError(err) {
  if (err.code === 'auth/operation-not-allowed') return 'Email/Password sign-in is not enabled in Firebase. Please enable it in the Firebase Console under Authentication > Sign-in method.';
  if (err.code === 'auth/weak-password') return 'Your password must be at least 6 characters long.';
  if (err.code === 'auth/email-already-in-use') return 'An account already exists with this email.';
  if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') return 'Incorrect email or password.';
  return err.message || 'An error occurred';
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  
  
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        // Create user profile if it doesn't exist
        const users = await readFromSheet('users', 'uid', result.user.uid);
        if (!users || users.length === 0) {
          await writeToSheet('users', {
            uid: result.user.uid,
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'CANDIDATE',
            status: 'active'
          });
        }
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/register" className="font-medium text-amber-600 hover:text-amber-500 transition-colors">
              create a new candidate account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors font-medium shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Sign in with Google
            </button>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>
          </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input 
              label="Email address"
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input 
              label="Password"
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-amber-600 hover:text-amber-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full justify-center py-3 text-base" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
