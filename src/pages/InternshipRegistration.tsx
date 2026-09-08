import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { APP_CONFIG } from '../config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AVAILABLE_INTERNSHIPS } from '../data/internships';
import { useAuth } from '../contexts/AuthContext';
import { CheckoutButton } from '../components/payments/CheckoutButton';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function InternshipRegistration() {
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('program');
  const selectedProgram = AVAILABLE_INTERNSHIPS.find(p => p.id === programId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedProgram) {
      navigate('/internships');
    }
  }, [selectedProgram, navigate]);

  const { currentUser, userProfile } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formStep, setFormStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    institution: '',
    degree: '',
    graduationYear: '',
    gpa: '',
    resumeLink: '',
    motivation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check if user already applied
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'internship_applications'),
          where('candidateId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const targetProgramId = programId || 'general';
        const existingApp = apps.find((app: any) => app.programId === targetProgramId);
        
        if (existingApp) {
          setApplicationId(existingApp.id);
          if ((existingApp as any).status === 'approved' || (existingApp as any).status === 'completed' || (existingApp as any).paymentStatus === 'paid') {
             setStep(3);
          } else if (selectedProgram && selectedProgram.fees > 0) {
             setStep(2);
          } else {
             setStep(3);
          }
        }
      } catch (err) {
        console.error("Error checking applications:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingApplication();
  }, [currentUser, programId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("Please sign in or create an account to submit your application.");
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    if (formStep < 3) {
      setFormStep(formStep + 1);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    const data = {
      candidateId: currentUser.uid,
      programId: selectedProgram?.id || 'general',
      programTitle: selectedProgram?.title || 'General Application',
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: currentUser.email,
      phone: formData.phone,
      institution: formData.institution,
      degree: formData.degree,
      graduationYear: formData.graduationYear,
      gpa: formData.gpa,
      domain: selectedProgram?.title,
      resumeLink: formData.resumeLink,
      motivation: formData.motivation,
      createdAt: serverTimestamp(),
      status: 'pending'
    };
    
    try {
      const docRef = await addDoc(collection(db, 'internship_applications'), data);
      setApplicationId(docRef.id);
      
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

  if (isLoading) {
    return <div className="py-24 text-center">Loading...</div>;
  }

  if (step === 3) {
    return (
      <div className="py-24 bg-slate-50 min-h-[70vh] flex flex-col justify-center">
        <Container className="max-w-2xl text-center">
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Complete</h2>
            <p className="text-lg text-slate-600 mb-8">
              Thank you for applying to the {selectedProgram?.title || 'Internship'} program. Our HR team will review your application and contact you for the next steps.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (step === 2 && selectedProgram) {
    return (
      <div className="py-24 bg-slate-50 min-h-[70vh] flex flex-col justify-center">
        <Container className="max-w-xl text-center">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Registration</h2>
            <p className="text-slate-600 mb-8">
              Pay the registration fee for the <strong>{selectedProgram.title}</strong> internship program to secure your spot.
            </p>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 flex flex-col items-center">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Fee</span>
              <span className="text-4xl font-bold text-slate-900">₹{selectedProgram.fees.toLocaleString()}</span>
            </div>

            <CheckoutButton 
              amount={selectedProgram.fees}
              purpose={`Internship Registration: ${selectedProgram.title}`}
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
            title={selectedProgram ? `Apply for ${selectedProgram.title}` : "Internship Registration"}
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
                 <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="px-4 py-2 bg-white text-amber-700 font-medium rounded-md shadow-sm border border-amber-200 hover:bg-amber-50 transition-colors">
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
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${formStep >= 1 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                <div className={`h-1 w-12 rounded-full ${formStep >= 2 ? 'bg-amber-600' : 'bg-slate-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${formStep >= 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                <div className={`h-1 w-12 rounded-full ${formStep >= 3 ? 'bg-amber-600' : 'bg-slate-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${formStep >= 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {formStep === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="First Name" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" />
                    <Input label="Last Name" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="Email Address" name="email" type="email" required disabled={!!currentUser} value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                    <Input label="Phone Number" name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Academic Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="Institution / University" name="institution" required value={formData.institution} onChange={handleChange} placeholder="University Name" />
                    <Input label="Degree / Course" name="degree" required value={formData.degree} onChange={handleChange} placeholder="B.Tech Computer Science" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="Year of Graduation" name="graduationYear" type="number" required value={formData.graduationYear} onChange={handleChange} placeholder="2025" />
                    <Input label="CGPA / Percentage" name="gpa" required value={formData.gpa} onChange={handleChange} placeholder="8.5 / 85%" />
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
                    <Input label="" name="resumeLink" type="url" required value={formData.resumeLink} onChange={handleChange} placeholder="https://" />
                    <p className="mt-1 text-sm text-slate-500">Please provide a public link to your resume or portfolio.</p>
                  </div>
                  
                  <Textarea 
                    label="Why do you want to join Sricore Solutions?" 
                    name="motivation"
                    required 
                    value={formData.motivation}
                    onChange={handleChange}
                    placeholder="Tell us about your technical interests and career goals..." 
                    className="min-h-[120px]"
                  />
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-slate-100">
                {formStep > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setFormStep(formStep - 1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                <Button type="submit" isLoading={isSubmitting}>
                  {formStep < 3 ? (
                    <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>
                  ) : (
                    !currentUser ? 'Sign In to Apply' : (selectedProgram && selectedProgram.fees > 0) ? 'Continue to Payment' : 'Submit Application'
                  )}
                </Button>
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
