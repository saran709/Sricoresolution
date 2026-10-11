import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { APP_CONFIG } from '../../config';

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
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('Password reset link has been sent to your email! Please check your inbox and spam folder.');
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err?.code === 'auth/user-not-found') {
        setError('No account found with this email. Please check the spelling or sign up.');
      } else {
        setError(err?.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              SRICORE<span className="text-blue-600">SOLUTIONS</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Request Password Reset
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email to request a password reset from the administrator.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

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

          <Button 
            type="submit" 
            className="w-full justify-center py-2.5 text-base font-semibold shadow-sm" 
            isLoading={loading}
          >
            {loading ? 'Sending Request...' : 'Request Reset'}
          </Button>
          
          <div className="text-center pt-2">
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 text-sm transition-colors">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
