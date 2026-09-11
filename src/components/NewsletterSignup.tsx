import { firebaseService } from '../lib/firebaseService';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../utils/cn';

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address")
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function NewsletterSignup({ className }: { className?: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema)
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setStatus('loading');
    setMessage('');
    
    try {
      const snap = await firebaseService.getByQuery('newsletter_subscribers', 'email', '==', data.email.toLowerCase());
      
      if (snap && snap.length > 0) {
        setStatus('error');
        setMessage('This email is already subscribed.');
        return;
      }
      
      await firebaseService.create('newsletter_subscribers', {
        email: data.email.toLowerCase(),
        status: 'active'
      });
      
      setStatus('success');
      setMessage('Successfully subscribed to our newsletter!');
      reset();
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-sm font-semibold text-current tracking-wider uppercase mb-4">Newsletter</h3>
      <p className="text-sm opacity-80 text-sm mb-4">Get the latest updates on engineering, AI, and company news.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className={cn(
              "flex-1 px-4 py-2 rounded-md border text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500",
              errors.email ? "border-red-500" : "border-slate-300"
            )}
            {...register('email')}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </div>
        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        {status === 'success' && <span className="text-xs text-green-600">{message}</span>}
        {status === 'error' && <span className="text-xs text-red-500">{message}</span>}
      </form>
    </div>
  );
}
