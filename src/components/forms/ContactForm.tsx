import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { 
  Code, 
  Brain, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  ArrowRight,
  Clock,
  Sparkles,
  Building,
  Mail,
  User,
  Phone,
  HelpCircle
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { APP_CONFIG } from '../../config';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { Button } from '../ui/Button';

// Service types supported by the inquiry system
export type ServiceCategory = 'software' | 'ai' | 'hardware' | 'multi';

export interface ServiceOption {
  id: ServiceCategory;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'software',
    name: 'Software Engineering',
    badge: 'Web, Mobile & Cloud',
    description: 'Enterprise web applications, mobile platforms, APIs, microservices, and cloud architecture.',
    icon: Code,
    tags: ['Web Applications', 'Mobile Apps', 'Cloud Infrastructure', 'API Integration', 'DevOps & CI/CD', 'Security Audits']
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence & ML',
    badge: 'LLMs, Vision & Analytics',
    description: 'Generative AI pipelines, custom LLMs, computer vision, automated inference, and data intelligence.',
    icon: Brain,
    tags: ['Generative AI / LLMs', 'Computer Vision', 'Predictive Analytics', 'Natural Language Processing', 'Custom ML Models', 'Data Pipelines']
  },
  {
    id: 'hardware',
    name: 'Hardware & IoT Solutions',
    badge: 'Embedded, PCB & Automation',
    description: 'Embedded firmware, custom PCB layout, sensor telemetry, IoT connectivity, and industrial automation.',
    icon: Cpu,
    tags: ['Embedded Systems', 'IoT Solutions', 'PCB Design & Prototyping', 'Firmware Development', 'Industrial Automation', 'Sensor Telemetry']
  },
  {
    id: 'multi',
    name: 'Multidisciplinary / Custom',
    badge: 'End-to-End Solutions',
    description: 'Integrated cross-domain engineering bridging hardware sensors, cloud backends, and AI pipelines.',
    icon: Layers,
    tags: ['Edge AI + Hardware', 'Smart Connected Device', 'R&D / Proof of Concept', 'Enterprise Transformation', 'Full Turnkey System']
  }
];

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid business or personal email address"),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  serviceCategory: z.enum(['software', 'ai', 'hardware', 'multi'], {
    message: "Please select a service category"
  }),
  selectedSubServices: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters"),
  message: z.string().trim().min(15, "Please provide at least 15 characters describing your project requirements or question"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  serviceCategory?: string;
  subject?: string;
  message?: string;
  general?: string;
}

export function ContactForm() {
  const [searchParams] = useSearchParams();
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  // Read service from query parameter if present
  const queryService = searchParams.get('service')?.toLowerCase();
  const initialCategory: ServiceCategory = 
    queryService === 'software' ? 'software' :
    queryService === 'ai' ? 'ai' :
    queryService === 'hardware' ? 'hardware' :
    queryService === 'multi' ? 'multi' : 'software';

  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(initialCategory);
  const [selectedSubServices, setSelectedSubServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    timeline: '1-3-months',
    budget: 'standard',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    referenceId: string;
    fullName: string;
    email: string;
    serviceName: string;
    submittedAt: string;
  } | null>(null);

  // Sync if query param changes
  useEffect(() => {
    if (queryService && ['software', 'ai', 'hardware', 'multi'].includes(queryService)) {
      setServiceCategory(queryService as ServiceCategory);
    }
  }, [queryService]);

  const activeService = SERVICE_OPTIONS.find(s => s.id === serviceCategory) || SERVICE_OPTIONS[0];

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const fullForm = {
      ...formData,
      serviceCategory,
      selectedSubServices
    };

    const result = contactSchema.safeParse(fullForm);
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes(field));
      if (issue) {
        setErrors(prev => ({ ...prev, [field]: issue.message }));
      } else {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleSubService = (tag: string) => {
    setSelectedSubServices(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const fullForm: ContactFormData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      serviceCategory,
      selectedSubServices,
      timeline: formData.timeline,
      budget: formData.budget,
      subject: formData.subject,
      message: formData.message,
    };

    // Zod validation
    const validationResult = contactSchema.safeParse(fullForm);
    if (!validationResult.success) {
      const newErrors: FormErrors = {};
      validationResult.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as keyof FormErrors;
        if (fieldName && !newErrors[fieldName]) {
          newErrors[fieldName] = issue.message;
        }
      });
      setErrors(newErrors);
      setIsSubmitting(false);
      
      // Mark all validated fields as touched
      setTouched({
        fullName: true,
        email: true,
        subject: true,
        message: true
      });
      return;
    }

    const referenceId = `CSRI-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Save to Firestore collection 'enquiries' so admin can review and manage in Admin Dashboard
      try {
        await addDoc(collection(db, 'enquiries'), {
          referenceId,
          name: fullForm.fullName,
          firstName: fullForm.fullName.split(' ')[0] || fullForm.fullName,
          lastName: fullForm.fullName.split(' ').slice(1).join(' ') || '',
          email: fullForm.email,
          phone: fullForm.phone || '',
          company: fullForm.company || '',
          serviceInterest: activeService.name,
          serviceCategory,
          subServices: selectedSubServices,
          timeline: fullForm.timeline,
          budget: fullForm.budget,
          subject: fullForm.subject,
          message: fullForm.message,
          enquiryType: 'commercial',
          status: 'NEW',
          source: 'Website Contact Page',
          createdAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        console.warn("Firestore save warning (proceeding with email notification):", firestoreErr);
      }

      // 2. Dispatch email notification to company contact email
      const recipientEmail = settings?.contact?.primaryEmail || APP_CONFIG.company.contact.email;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #1e293b; color: #ffffff; padding: 24px; text-align: left; border-bottom: 3px solid #d97706;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #f59e0b; font-weight: bold;">New Client Service Inquiry</p>
            <h2 style="margin: 6px 0 0; font-size: 20px;">${fullForm.subject}</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Ref ID: ${referenceId}</p>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #64748b; width: 140px;"><strong>Client Name:</strong></td>
                <td style="padding: 8px 0; font-size: 14px; color: #0f172a;">${fullForm.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #64748b;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; font-size: 14px; color: #0f172a;"><a href="mailto:${fullForm.email}">${fullForm.email}</a></td>
              </tr>
              ${fullForm.phone ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #64748b;"><strong>Phone:</strong></td><td style="padding: 8px 0; font-size: 14px; color: #0f172a;">${fullForm.phone}</td></tr>` : ''}
              ${fullForm.company ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #64748b;"><strong>Company:</strong></td><td style="padding: 8px 0; font-size: 14px; color: #0f172a;">${fullForm.company}</td></tr>` : ''}
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #64748b;"><strong>Service Track:</strong></td>
                <td style="padding: 8px 0; font-size: 14px; color: #d97706; font-weight: bold;">${activeService.name}</td>
              </tr>
              ${selectedSubServices.length > 0 ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #64748b;"><strong>Target Areas:</strong></td><td style="padding: 8px 0; font-size: 13px; color: #0f172a;">${selectedSubServices.join(', ')}</td></tr>` : ''}
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #64748b;"><strong>Timeline:</strong></td>
                <td style="padding: 8px 0; font-size: 14px; color: #0f172a;">${fullForm.timeline}</td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; border-left: 4px solid #d97706; padding: 16px; border-radius: 4px; margin-top: 15px;">
              <h4 style="margin: 0 0 8px; font-size: 13px; color: #334155;">Project Requirements & Message:</h4>
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${fullForm.message}</p>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
            Sent automatically from ${APP_CONFIG.company.name} Client Portal.
          </div>
        </div>
      `;

      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipientEmail,
            subject: `[Client Inquiry] ${activeService.name}: ${fullForm.subject}`,
            html: emailHtml
          })
        });
      } catch (emailErr) {
        console.warn("Email API notification warning:", emailErr);
      }

      setConfirmationData({
        referenceId,
        fullName: fullForm.fullName,
        email: fullForm.email,
        serviceName: activeService.name,
        submittedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrors({ general: "An unexpected error occurred. Please try again or reach out directly via email." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setConfirmationData(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      timeline: '1-3-months',
      budget: 'standard',
      subject: '',
      message: ''
    });
    setSelectedSubServices([]);
    setErrors({});
    setTouched({});
  };

  // SUCCESS CONFIRMATION STATE
  if (isSuccess && confirmationData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 md:p-10 transition-all">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated Success Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-100 shadow-inner">
            <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-amber-600 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> Inquiry Successfully Submitted
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Thank You, {confirmationData.fullName}!
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-6">
            We have received your inquiry regarding <span className="font-semibold text-slate-900">{confirmationData.serviceName}</span>. A dedicated technical specialist has been assigned to your request.
          </p>

          {/* Reference Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 mb-8 text-left max-w-lg mx-auto shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inquiry Reference ID</span>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                {confirmationData.referenceId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Contact Email</span>
                <span className="font-medium text-slate-800 break-all">{confirmationData.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Service Track</span>
                <span className="font-medium text-slate-800">{confirmationData.serviceName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Date & Time</span>
                <span className="font-medium text-slate-800">{confirmationData.submittedAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Expected Response</span>
                <span className="font-medium text-amber-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Within 24 Business Hours
                </span>
              </div>
            </div>
          </div>

          {/* What happens next roadmap */}
          <div className="border border-slate-200 rounded-xl p-5 mb-8 text-left bg-white shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>Next Steps in Our Process</span>
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Technical Scoping Review</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Our senior architects evaluate your technical constraints, tech stack preferences, and feasibility.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Direct Consultation Call</h4>
                  <p className="text-xs text-slate-600 mt-0.5">We'll schedule a 30-minute discovery call to align on system requirements, milestones, and deliverables.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Proposal & Architecture Blueprint</h4>
                  <p className="text-xs text-slate-600 mt-0.5">You will receive a formal statement of work with milestone timelines and fixed or sprint-based cost estimates.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              onClick={resetForm}
              variant="outline"
              className="w-full sm:w-auto text-xs py-2.5 px-5 font-semibold"
            >
              Submit Another Inquiry
            </Button>
            <Link 
              to="/projects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs py-2.5 px-6 font-semibold text-white rounded-md shadow-xs transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Explore Our Portfolio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE CONTACT FORM
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white border-b border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Engineering & Consulting Services
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Request a Project Consultation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Tell us about your software, artificial intelligence, or hardware requirements. Our technical directors will review and respond promptly.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Avg. response time: <strong>&lt; 24h</strong></span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-8" noValidate>
        {/* General Error Banner */}
        {errors.general && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* STEP 1: SERVICE CATEGORY SELECTOR */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-900">
              1. Select Service Category <span className="text-amber-600">*</span>
            </label>
            <span className="text-xs text-slate-400">Software, AI, or Hardware</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SERVICE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = serviceCategory === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setServiceCategory(opt.id);
                    setSelectedSubServices([]);
                    if (errors.serviceCategory) {
                      setErrors(prev => ({ ...prev, serviceCategory: undefined }));
                    }
                  }}
                  className={`relative p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between group ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs ring-1 ring-amber-500/20' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xs text-slate-900 mb-1">{opt.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isSelected ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                      {opt.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.serviceCategory && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.serviceCategory}
            </p>
          )}

          {/* Dynamic Focus Area Tags */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Select Specific Areas of Interest ({activeService.name}):
              </span>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeService.tags.map((tag) => {
                const isSelected = selectedSubServices.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleSubService(tag)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-medium'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 2: CLIENT CONTACT INFORMATION */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">
            2. Contact & Organization Details
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="contact-fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="contact-fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="e.g. Alex Johnson"
                  className={`w-full h-10 pl-9 pr-3 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.fullName && touched.fullName
                      ? 'border-red-500 focus:ring-red-500 text-red-900'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 text-slate-900'
                  }`}
                />
              </div>
              {errors.fullName && touched.fullName && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Email <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="alex@company.com"
                  className={`w-full h-10 pl-9 pr-3 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.email && touched.email
                      ? 'border-red-500 focus:ring-red-500 text-red-900'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 text-slate-900'
                  }`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Company / Organization */}
            <div>
              <label htmlFor="contact-company" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="e.g. Apex Dynamics Ltd."
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: SCOPE, TIMELINE & BUDGET */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">
            3. Project Scope & Timeline
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-timeline" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Desired Deployment Timeline
              </label>
              <select
                id="contact-timeline"
                name="timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="immediate">Immediate / Urgent (&lt; 1 month)</option>
                <option value="1-3-months">1 to 3 Months (Standard)</option>
                <option value="3-6-months">3 to 6 Months (Comprehensive)</option>
                <option value="exploring">Initial Architecture & Feasibility Study</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-budget" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Budget Range
              </label>
              <select
                id="contact-budget"
                name="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="flexible">Flexible / Based on Technical Proposal</option>
                <option value="pilot">&lt; ₹1,00,000 / &lt; $1,500 (PoC / Pilot)</option>
                <option value="standard">₹1,00,000 - ₹5,00,000 / $1,500 - $6,000</option>
                <option value="enterprise">₹5,00,000+ / $6,000+ (Full Enterprise Solution)</option>
              </select>
            </div>
          </div>
        </div>

        {/* STEP 4: PROJECT SPECIFICATIONS & MESSAGE */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">
            4. Project Specifications & Requirements <span className="text-amber-600">*</span>
          </label>

          <div className="space-y-4">
            {/* Subject */}
            <div>
              <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Inquiry Title / Subject <span className="text-amber-600">*</span>
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                onBlur={() => handleBlur('subject')}
                placeholder={`e.g. Inquiry regarding ${activeService.name} for our operations`}
                className={`w-full h-10 px-3 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.subject && touched.subject
                    ? 'border-red-500 focus:ring-red-500 text-red-900'
                    : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 text-slate-900'
                }`}
              />
              {errors.subject && touched.subject && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.subject}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700">
                  Detailed Specifications & Questions <span className="text-amber-600">*</span>
                </label>
                <span className={`text-[11px] ${
                  formData.message.length >= 15 ? 'text-slate-400' : 'text-amber-600 font-medium'
                }`}>
                  {formData.message.length} chars (min 15)
                </span>
              </div>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                placeholder={`Describe your requirements for ${activeService.name}...\n- What problem are you aiming to solve?\n- Are there existing legacy systems, sensors, or datasets?\n- Any compliance, security, or deployment constraints?`}
                className={`w-full p-3 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 resize-y transition-colors min-h-[130px] ${
                  errors.message && touched.message
                    ? 'border-red-500 focus:ring-red-500 text-red-900'
                    : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 text-slate-900'
                }`}
              />
              {errors.message && touched.message && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SUBMISSION & PRIVACY NOTICE */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Strict privacy: Your specifications are protected under our mutual NDA policy.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-xs text-white shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Transmitting Inquiry...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Technical Inquiry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
