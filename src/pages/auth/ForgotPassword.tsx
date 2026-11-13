import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage(
        'Reset link sent. Check your inbox (and Spam or Promotions folder) for an email with a link to choose a new password.'
      );
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err?.code === 'auth/user-not-found') {
        setError('No account matches that email address. Double-check the spelling or create a new account.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err?.message || 'Unable to send reset email right now. Please try again.');
      }
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
            Reset Your Password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter your account email address and we will send you a secure link to set a new password immediately.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-lg text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Registered Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Button
            type="submit"
            className="w-full justify-center py-2.5 text-base font-semibold shadow-sm"
            isLoading={loading}
          >
            {loading ? 'Sending Reset Link...' : 'Send Password Reset Email'}
          </Button>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              Usually sign in with Google? Click <strong>Sign in with Google</strong> on the Sign In
              page instead of resetting a password.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 text-sm">
            <Link
              to="/login"
              className="font-semibold text-amber-700 dark:text-amber-400 hover:underline transition-colors"
            >
              Back to Sign In
            </Link>
            <Link
              to="/contact"
              className="font-medium text-slate-600 dark:text-slate-400 hover:underline transition-colors"
            >
              Still need help?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
