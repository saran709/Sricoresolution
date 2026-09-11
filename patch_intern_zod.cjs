const fs = require('fs');

const code = `import { firebaseService } from '../lib/firebaseService';
import { serverTimestamp } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { APP_CONFIG } from '../config';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CheckoutButton from '../components/ui/CheckoutButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const internshipSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  institution: z.string().min(2, "Institution is required"),
  degree: z.string().min(2, "Degree is required"),
  graduationYear: z.string().min(4, "Enter valid year"),
  gpa: z.string().min(1, "GPA/Percentage is required"),
  resumeLink: z.string().url("Please provide a valid URL (https://...)"),
  motivation: z.string().min(20, "Please provide at least 20 characters")
});

type InternshipFormData = z.infer<typeof internshipSchema>;

export default function InternshipRegistration() {
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('program');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const { register, handleSubmit, trigger, formState: { errors }, reset, setValue } = useForm<InternshipFormData>({
    resolver: zodResolver(internshipSchema),
    mode: 'onTouched'
  });

  useEffect(() => {
    if (programId) {
      const fetchProgram = async () => {
        try {
          const programs = await firebaseService.getAll('internships');
          const program = programs.find((p: any) => p.id === programId);
          if (program) {
            setSelectedProgram(program);
          }
        } catch (e) {
          console.error("Error fetching program details", e);
        }
      };
      fetchProgram();
    }
  }, [programId]);

  useEffect(() => {
    if (currentUser?.email) {
      setValue('email', currentUser.email);
    }
  }, [currentUser, setValue]);

  const handleNextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (formStep === 1) fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
    if (formStep === 2) fieldsToValidate = ['institution', 'degree', 'graduationYear', 'gpa'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setFormStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setFormStep(prev => prev - 1);
  };

  const onSubmit = async (data: InternshipFormData) => {
    if (!currentUser) {
      setError("Please sign in or create an account to submit your application.");
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    const payload = {
      candidateId: currentUser.uid,
      programId: selectedProgram?.id || 'general',
      programTitle: selectedProgram?.title || 'General Application',
      firstName: data.firstName,
      lastName: data.lastName,
      email: currentUser.email || data.email,
      phone: data.phone,
      institution: data.institution,
      degree: data.degree,
      graduationYear: data.graduationYear,
      gpa: data.gpa,
      domain: selectedProgram?.title,
      resumeLink: data.resumeLink,
      motivation: data.motivation,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    
    try {
      const id = 'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      payload.id = id;
      
      await firebaseService.createWithId('internship_applications', id, payload);
      setApplicationId(id);
      
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payload.email,
          subject: 'Internship Application Received - Sricore Solutions',
          html: \`
            <h3>Thank you for applying!</h3>
            <p>Dear \${payload.firstName},</p>
            <p>We have received your application for the <strong>\${payload.programTitle}</strong> program.</p>
            <p>Your application ID is: <strong>\${id}</strong></p>
            <p>Our HR team will review your profile and get back to you shortly.</p>
            <br/>
            <p>Best Regards,</p>
            <p>Sricore Solutions Team</p>
          \`
        })
      });
      
      if (selectedProgram && selectedProgram.fees > 0) {
        setStep(2);
      } else {
        setStep(3);
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("An error occurred while submitting your application. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <div className="py-24 bg-slate-50 min-h-[70vh] flex flex-col justify-center">
        <Container className="max-w-2xl text-center">
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted</h2>
            <p className="text-lg text-slate-600 mb-8">
              Thank you for applying to {APP_CONFIG.company.name}. We have received your application and will review it shortly.
            </p>
            <Button onClick={() => navigate('/internships')}>Explore More Programs</Button>
          </div>
        </Container>
      </div>
    );
  }

  if (step === 2 && selectedProgram) {
    return (
      <div className="py-24 bg-slate-50 min-h-[70vh] flex flex-col justify-center">
        <Container className="max-w-lg text-center">
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Registration Fee</h2>
            <p className="text-slate-600 mb-8">
              Please complete the payment for the <strong>{selectedProgram.title}</strong> internship program to secure your spot.
            </p>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 flex flex-col items-center">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Fee</span>
              <span className="text-4xl font-bold text-slate-900">₹{selectedProgram.fees.toLocaleString()}</span>
            </div>

            <CheckoutButton 
              amount={selectedProgram.fees}
              purpose={\`Internship Registration: \${selectedProgram.title}\`}
              referenceId={applicationId || undefined}
              referenceType="internship"
              paymentType="internship_fee"
              label="Pay Registration Fee"
              onSuccess={() => setStep(3)}
              className="w-full py-4 text-lg"
            />
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
            title={selectedProgram ? \`Apply for \${selectedProgram.title}\` : "Internship Registration"}
            description={selectedProgram ? selectedProgram.description : "Apply for our comprehensive industrial training and internship program to gain practical experience on real-world projects."}
            badge="Join Our Team"
          />
          
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl mt-12">
            {!currentUser && (
               <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                 <div>
                   <h4 className="font-semibold text-amber-900">Already have an account?</h4>
                   <p className="text-sm text-amber-700">Sign in to save your application and track its progress.</p>
                 </div>
                 <Link to={\`/login?redirect=\${encodeURIComponent(window.location.pathname + window.location.search)}\`} className="px-4 py-2 bg-white text-amber-700 font-medium rounded-md shadow-sm border border-amber-200 hover:bg-amber-50 transition-colors">
                   Sign In
                 </Link>
               </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            
            {/* Step Indicators */}
            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center space-x-4">
                <div className={\`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm \${formStep >= 1 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}\`}>1</div>
                <div className={\`h-1 w-12 rounded-full \${formStep >= 2 ? 'bg-amber-600' : 'bg-slate-200'}\`}></div>
                <div className={\`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm \${formStep >= 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}\`}>2</div>
                <div className={\`h-1 w-12 rounded-full \${formStep >= 3 ? 'bg-amber-600' : 'bg-slate-200'}\`}></div>
                <div className={\`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm \${formStep >= 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}\`}>3</div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {formStep === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} placeholder="John" />
                    <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} placeholder="Doe" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} disabled={!!currentUser} placeholder="john@example.com" />
                    <Input label="Phone Number" type="tel" {...register('phone')} error={errors.phone?.message} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Academic Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="Institution / University" {...register('institution')} error={errors.institution?.message} placeholder="University Name" />
                    <Input label="Degree / Course" {...register('degree')} error={errors.degree?.message} placeholder="B.Tech Computer Science" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="Year of Graduation" type="number" {...register('graduationYear')} error={errors.graduationYear?.message} placeholder="2025" />
                    <Input label="CGPA / Percentage" {...register('gpa')} error={errors.gpa?.message} placeholder="8.5 / 85%" />
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Internship Preferences</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Resume Link (Google Drive / GitHub / Portfolio)
                    </label>
                    <Input label="" type="url" {...register('resumeLink')} error={errors.resumeLink?.message} placeholder="https://" />
                    <p className="mt-1 text-sm text-slate-500">Please provide a public link to your resume or portfolio.</p>
                  </div>
                  
                  <Textarea 
                    label="Why do you want to join Sricore Solutions?" 
                    {...register('motivation')}
                    error={errors.motivation?.message}
                    placeholder="Tell us about your technical interests and career goals..." 
                    className="min-h-[120px]"
                  />
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-slate-100">
                {formStep > 1 ? (
                  <Button type="button" variant="outline" onClick={handlePreviousStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {formStep < 3 ? (
                  <Button type="button" onClick={handleNextStep}>
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" isLoading={isSubmitting}>
                    {!currentUser ? 'Sign In to Apply' : (selectedProgram && selectedProgram.fees > 0) ? 'Continue to Payment' : 'Submit Application'}
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-slate-500 text-center mt-6">
                By submitting this application, you agree to our <Link to="/privacy" className="text-amber-600 hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
`

fs.writeFileSync('src/pages/InternshipRegistration.tsx', code);
