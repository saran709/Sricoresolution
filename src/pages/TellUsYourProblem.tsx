import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Upload, FileText, CheckCircle2 } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  serviceCategory: string;
  problem: string;
};

export default function TellUsYourProblem() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const { currentUser } = useAuth();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      serviceCategory: 'Software'
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const generateRequestId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SRC-REQ-${year}-${random}`;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const fileUrls: string[] = [];
      
      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const fileRef = ref(storage, `solution_requests/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          fileUrls.push(downloadURL);
        }
      }

      const payload = {
        requestId: generateRequestId(),
        ...data,
        fileUrls,
        userId: currentUser?.uid || null,
        clientId: currentUser?.uid || null, // Match rule requirements for read/update
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'NEW'
      };

      await addDoc(collection(db, 'solutionRequests'), payload);
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting problem:", err);
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
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Problem Logged Successfully</h2>
            <p className="text-lg text-slate-600 mb-8">
              Thank you for trusting us with your challenge. Our engineering team will review your submission and initiate the triage process. We will reach out to you shortly to schedule a discovery call.
            </p>
            <Button onClick={() => setIsSuccess(false)}>Submit Another Problem</Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24 bg-slate-50">
      <Container>
        <div className="max-w-4xl mx-auto">
          <SectionHeader 
            title="Tell Us Your Problem"
            description="Provide as much context as possible. Our engineering team uses this information to understand your constraints, assess feasibility, and design robust solutions."
            align="center"
            badge="Solution Request"
          />

          <div className="mt-12 bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 text-blue-50/50 pointer-events-none">
              <Shield className="w-64 h-64" />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
              
              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
                  Contact & Organization
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Input label="Your Name" {...register('name', { required: true })} placeholder="Full Name" />
                    {errors.name && <span className="text-xs text-red-500">This field is required</span>}
                  </div>
                  <div>
                    <Input label="Email Address" type="email" {...register('email', { required: true })} placeholder="name@company.com" />
                    {errors.email && <span className="text-xs text-red-500">This field is required</span>}
                  </div>
                  <div>
                    <Input label="Phone Number" type="tel" {...register('phone')} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <Input label="Organization / Company" {...register('organization', { required: true })} placeholder="Company Name" />
                    {errors.organization && <span className="text-xs text-red-500">This field is required</span>}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Problem Definition */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
                  The Challenge
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Category</label>
                    <select {...register('serviceCategory')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                      <option value="Software">Software</option>
                      <option value="Hardware">Hardware</option>
                      <option value="IoT">IoT</option>
                      <option value="AI">AI</option>
                      <option value="ML">ML</option>
                    </select>
                  </div>
                  <div>
                    <Textarea 
                      label="What is the primary problem you are trying to solve?" 
                      {...register('problem', { required: true })}
                      placeholder="Describe the challenge in detail..." 
                      className="min-h-[120px]"
                    />
                    {errors.problem && <span className="text-xs text-red-500">This field is required</span>}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* File Upload */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">3</span>
                  Upload Project Files (Optional)
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload project files"
                  />
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-slate-500 text-sm">PDF, DOCX, ZIP, or Image files (Max. 50MB total)</p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-700">Selected files:</p>
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6">
                <Button type="submit" isLoading={isSubmitting} size="lg" fullWidth className="text-lg">
                  Submit Problem Request
                </Button>
                <p className="text-xs text-slate-500 text-center mt-4">
                  By submitting this request, you agree to our Privacy Policy. All uploaded materials remain strictly confidential.
                </p>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
