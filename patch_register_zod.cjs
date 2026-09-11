const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Register.tsx', 'utf8');

const newCode = `import { firebaseService } from '../../lib/firebaseService';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';
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

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(['CANDIDATE', 'CLIENT'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CANDIDATE'
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      await firebaseService.create('users', {
        uid: user.uid,
        email: user.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: true,
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-amber-600 hover:text-amber-500 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="First Name"
              {...register('firstName')}
              error={errors.firstName?.message}
              placeholder="John"
            />
            <Input 
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName?.message}
              placeholder="Doe"
            />
          </div>
          <Input 
            label="Email address"
            type="email" 
            {...register('email')}
            error={errors.email?.message}
            placeholder="you@example.com"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Password"
              type="password" 
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
            />
            <Input 
              label="Confirm Password"
              type="password" 
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Account Type
            </label>
            <select 
              {...register('role')}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            >
              <option value="CANDIDATE">Candidate / Student</option>
              <option value="CLIENT">Client / Business Partner</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
            <p className="mt-1 text-xs text-slate-500">
              Note: Employee and Administrator accounts must be created internally.
            </p>
          </div>
          <Button type="submit" isLoading={loading} className="w-full justify-center py-3 text-base">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}
`
fs.writeFileSync('src/pages/auth/Register.tsx', newCode);
