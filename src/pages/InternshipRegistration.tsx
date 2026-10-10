import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { APP_CONFIG } from '../config';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { z } from 'zod';

const internshipSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  institution: z.string().min(2, "Institution is required"),
  degree: z.string().min(2, "Degree is required"),
  graduationYear: z.string().length(4, "Invalid graduation year"),
  gpa: z.string().min(1, "GPA is required"),
  domain: z.string().min(1, "Domain is required"),
  duration: z.string().min(1, "Duration is required"),
  resumeLink: z.string().url("Invalid URL"),
  motivation: z.string().min(20, "Motivation should be at least 20 characters"),
});

export default function InternshipRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Validation
    const result = internshipSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.issues[0].message);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...result.data,
      createdAt: serverTimestamp(),
      status: 'pending'
    };
    
    try {
      await addDoc(collection(db, 'internship_applications'), payload);
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("An error occurred while submitting your application. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-24 bg-slate-50 min-h-[70vh] flex flex-col justify-center">
        <Container className="max-w-2xl text-center">
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted</h2>
            <p className="text-lg text-slate-600 mb-8">
              Thank you for applying to the {APP_CONFIG.company.name} internship program. Our HR team will review your application and contact you for the next steps.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/internships" className="inline-flex items-center justify-center px-6 py-3 font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Back to Internships
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20 lg:py-32 bg-slate-50">
      <Container>
        <div className="max-w-3xl mx-auto">
          <SectionHeader 
            title="Internship Registration"
            description="Apply for our comprehensive industrial training and internship program to gain practical experience on real-world projects."
            badge="Join Our Team"
          />

          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl mt-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <Input label="First Name" name="firstName" required placeholder="John" />
                  <Input label="Last Name" name="lastName" required placeholder="Doe" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <Input label="Email Address" name="email" type="email" required placeholder="john@example.com" />
                  <Input label="Phone Number" name="phone" type="tel" required placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Academic Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <Input label="Institution / University" name="institution" required placeholder="University Name" />
                  <Input label="Degree / Course" name="degree" required placeholder="B.Tech Computer Science" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <Input label="Year of Graduation" name="graduationYear" type="number" required placeholder="2025" />
                  <Input label="CGPA / Percentage" name="gpa" required placeholder="8.5 / 85%" />
                </div>
              </div>

              {/* Internship Preferences */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Internship Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Domain of Interest
                    </label>
                    <select name="domain" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                      <option value="software">Software Engineering</option>
                      <option value="frontend">Frontend Development (React)</option>
                      <option value="backend">Backend Development (Node.js/Firebase)</option>
                      <option value="hardware">Hardware & Embedded Systems</option>
                      <option value="iot">Internet of Things (IoT)</option>
                      <option value="ai-ml">AI & Machine Learning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Preferred Duration
                    </label>
                    <select name="duration" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Resume Link (Google Drive / GitHub / Portfolio)
                  </label>
                  <Input label="" name="resumeLink" type="url" required placeholder="https://" />
                  <p className="mt-1 text-sm text-slate-500">Please provide a public link to your resume or portfolio.</p>
                </div>

                <Textarea 
                  label="Why do you want to join Sricore Solutions?" 
                  name="motivation"
                  required 
                  placeholder="Tell us about your technical interests and career goals..." 
                  className="min-h-[120px]"
                />
              </div>

              <Button type="submit" isLoading={isSubmitting} fullWidth className="py-4 text-base">
                Submit Application
              </Button>
              
              <p className="text-xs text-slate-500 text-center">
                By submitting this application, you agree to our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
