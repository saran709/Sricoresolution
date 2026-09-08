import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  title?: string;
  subtitle?: string;
}

export function ContactForm({ 
  onSubmit, 
  title = "Get in Touch", 
  subtitle = "Have a question or want to work together? Leave us a message." 
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>();

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      await onSubmit(data);
      setIsSuccess(true);
      reset();
    } catch (error: any) {
      console.error('Contact form submission failed:', error);
      setGlobalError(error.message || 'Failed to submit the form. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent</h3>
        <p className="text-slate-600 mb-8">
          Thank you for reaching out! We've received your message and will get back to you as soon as possible.
        </p>
        <Button variant="outline" onClick={() => setIsSuccess(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-8 text-center md:text-left">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600">{subtitle}</p>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{globalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            placeholder="John Doe"
            {...register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name is too short' }
            })}
            error={errors.name?.message}
          />
          
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Phone Number (Optional)"
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...register('phone')}
            error={errors.phone?.message}
          />
          
          <Input
            label="Subject"
            placeholder="How can we help you?"
            {...register('subject', { 
              required: 'Subject is required' 
            })}
            error={errors.subject?.message}
          />
        </div>

        <Textarea
          label="Message"
          placeholder="Please provide as much detail as possible..."
          className="min-h-[150px]"
          {...register('message', { 
            required: 'Message is required',
            minLength: { value: 10, message: 'Message must be at least 10 characters' }
          })}
          error={errors.message?.message}
        />

        <Button 
          type="submit" 
          variant="secondary" 
          size="lg" 
          fullWidth 
          isLoading={isSubmitting}
          rightIcon={!isSubmitting && <Send className="w-4 h-4" />}
        >
          {isSubmitting ? 'Sending Message...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}
