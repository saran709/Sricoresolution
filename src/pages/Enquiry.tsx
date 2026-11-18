import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { DriveLinkInput, validateShareableLink } from '../components/ui/DriveLinkInput';
import { APP_CONFIG } from '../config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { queryClient } from '../lib/queryClient';
import { Enquiry as EnquiryType } from '../types';

export default function Enquiry() {
  const { currentUser, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specLink, setSpecLink] = useState('');
  const [openAccessConfirmed, setOpenAccessConfirmed] = useState(false);

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

    const rawDetails = (formData.get('projectDetails') as string) || '';
    let finalProjectDetails = rawDetails;

    if (specLink.trim()) {
      const linkCheck = validateShareableLink(specLink);
      if (!linkCheck.isValid) {
        setError(linkCheck.error || 'Please provide a valid shareable URL for your specification document.');
        setIsSubmitting(false);
        return;
      }
      if (!openAccessConfirmed) {
        setError(
          'Please enable "Anyone with the link can view" (Open to View) on your Google Drive specification link and check the confirmation box.'
        );
        setIsSubmitting(false);
        return;
      }
      finalProjectDetails = `${rawDetails}\n\nShared Specification Link (Open to View): ${linkCheck.normalizedUrl}`;
    }

    const data: Record<string, any> = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      serviceInterest,
      projectDetails: finalProjectDetails,
      createdAt: serverTimestamp(),
      status: 'NEW',
      enquiryType,
    };

    if (currentUser?.uid) {
      data.clientId = currentUser.uid;
    }

    try {
      await addDoc(collection(db, 'enquiries'), data);
      if (currentUser?.uid) {
        queryClient.invalidateQueries({ queryKey: ['client-dashboard', currentUser.uid] });
      }
      setSpecLink('');
      setOpenAccessConfirmed(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setError('An error occurred while submitting your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-24 bg-slate-50 dark:bg-slate-950 min-h-[70vh] flex flex-col justify-center">
        <Container className="max-w-2xl text-center">
          <div className="bg-white dark:bg-slate-900 p-10 sm:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Request Received
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 mb-8">
              Thank you for reaching out to {APP_CONFIG.company.name}. One of our technical
              specialists will review your project requirements and contact you within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {currentUser ? (
                <Link to="/dashboard?tab=enquiries">
                  <Button>Track Enquiry in Workspace</Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button>Create Account to Track Status</Button>
                </Link>
              )}
              <Button variant="outline" onClick={() => setIsSuccess(false)}>
                Submit Another Request
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div>
            <SectionHeader
              title="Get a Project Quote"
              description="Discuss your technical requirements with our engineering team. We'll provide a comprehensive consultation and preliminary architecture overview."
              align="left"
              badge="Enquiry"
            />

            <div className="mt-5 space-y-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                What happens next?
              </h3>
              <ul className="space-y-3.5">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      Technical Review
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                      Our senior engineers review your initial requirements and constraints.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      Discovery Call
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                      We schedule a 30-minute consultation to dive deeper into your vision.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      Detailed Proposal
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                      You receive a structured proposal covering architecture, timeline, and costs.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-md text-red-600 dark:text-red-300 text-xs">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  defaultValue={userProfile?.firstName || ''}
                  required
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  defaultValue={userProfile?.lastName || ''}
                  required
                  placeholder="Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  defaultValue={userProfile?.email || currentUser?.email || ''}
                  required
                  placeholder="john@company.com"
                />
                <Input label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210" />
              </div>

              <Input
                label="Company / Institution"
                name="company"
                placeholder="Your Organization or University"
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Service Interest
                </label>
                <select
                  name="serviceInterest"
                  className="flex h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                >
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
                className="min-h-[100px]"
              />

              <DriveLinkInput
                label="Specification / Reference Document Link (Optional — Google Drive)"
                value={specLink}
                onChange={setSpecLink}
                accessConfirmed={openAccessConfirmed}
                onAccessConfirmedChange={setOpenAccessConfirmed}
                required={false}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                compact
              />

              <Button type="submit" isLoading={isSubmitting} fullWidth className="py-2.5 mt-2 text-xs">
                Submit Request
              </Button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2">
                By submitting this form, you agree to our{' '}
                <Link to="/privacy" className="underline hover:text-slate-800 dark:hover:text-white">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link to="/terms" className="underline hover:text-slate-800 dark:hover:text-white">
                  Terms of Service
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
