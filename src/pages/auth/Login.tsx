import { firebaseService } from '../../lib/firebaseService';
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { googleSignIn } from '../../lib/auth';
import { auth } from '../../lib/firebase';
import { Container } from '../../components/ui/Container';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

function mapAuthError(err: any) {
  if (err.code === 'auth/operation-not-allowed') return 'Email/Password sign-in is not enabled in Firebase.';
  if (err.code === 'auth/weak-password') return 'Your password must be at least 6 characters long.';
  if (err.code === 'auth/email-already-in-use') return 'An account already exists with this email.';
  if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') return 'Incorrect email or password.';
  return err.message || 'An error occurred';
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        const users = await firebaseService.getByQuery('users', 'uid', '==', result.user.uid);
        if (!users || users.length === 0) {
          await firebaseService.create('users', {
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

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
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
            Login to your account
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
            Login with Google
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

        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input 
              label="Email address"
              type="email" 
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
            />
            <Input 
              label="Password"
              type="password" 
              {...register('password')}
              error={errors.password?.message}
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

          <Button type="submit" isLoading={loading} className="w-full justify-center py-3 text-base">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
