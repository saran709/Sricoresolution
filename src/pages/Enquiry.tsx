import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { APP_CONFIG } from '../config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Enquiry as EnquiryType } from '../types';

export default function Enquiry() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const serviceInterest = formData.get('serviceInterest') as string;
    
    let enquiryType: EnquiryType['enquiryType'] = 'commercial';
    if (serviceInterest === 'research') enquiryType = 'research';
    else if (serviceInterest === 'student_project') enquiryType = 'student';
    else if (serviceInterest === 'internship') enquiryType = 'internship';
    
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      serviceInterest,
      projectDetails: formData.get('projectDetails'),
      createdAt: serverTimestamp(),
      status: 'NEW',
      enquiryType
    };
    
    try {
      await addDoc(collection(db, 'enquiries'), data);
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting enquiry:", err);
      setError("An error occurred while submitting your request. Please try again later.");
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Received</h2>
            <p className="text-lg text-slate-600 mb-8">
              Thank you for reaching out to {APP_CONFIG.company.name}. One of our technical specialists will review your project requirements and contact you within 24 hours.
            </p>
            <Button onClick={() => setIsSuccess(false)}>Submit Another Request</Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20 lg:py-32 bg-slate-50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <SectionHeader 
              title="Get a Project Quote"
              description="Discuss your technical requirements with our engineering team. We'll provide a comprehensive consultation and preliminary architecture overview."
              align="left"
              badge="Enquiry"
            />
            
            <div className="mt-12 space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">What happens next?</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Technical Review</h4>
                    <p className="text-slate-600 mt-1 text-sm">Our senior engineers will review your initial requirements and constraints.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Discovery Call</h4>
                    <p className="text-slate-600 mt-1 text-sm">We'll schedule a 30-minute consultation to dive deeper into your vision.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Detailed Proposal</h4>
                    <p className="text-slate-600 mt-1 text-sm">You'll receive a comprehensive proposal including architecture design, timelines, and costs.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="First Name" name="firstName" required placeholder="John" />
                <Input label="Last Name" name="lastName" required placeholder="Doe" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Email Address" name="email" type="email" required placeholder="john@company.com" />
                <Input label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              
              <Input label="Company / Institution" name="company" placeholder="Your Organization or University" />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Service Interest
                </label>
                <select name="serviceInterest" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                  <option value="software">Commercial Software Development</option>
                  <option value="hardware">Commercial Hardware & IoT</option>
                  <option value="ai">Commercial AI / Machine Learning</option>
                  <option value="research">Research Services</option>
                  <option value="student_project">Student / Academic Project</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Textarea 
                label="Project Details" 
                name="projectDetails"
                required 
                placeholder="Please describe your requirements, challenges, and goals..." 
                className="min-h-[150px]"
              />

              <Button type="submit" isLoading={isSubmitting} fullWidth className="py-3 mt-4">
                Submit Request
              </Button>
              
              <p className="text-xs text-slate-500 text-center mt-4">
                By submitting this form, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
