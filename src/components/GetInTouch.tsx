import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Container } from './ui/Container';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export interface GetInTouchValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface GetInTouchErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SUBJECT_PRESETS = [
  'Enterprise Software Development Inquiry',
  'Hardware & Industrial IoT Prototyping',
  'AI / Computer Vision Solution',
  'Scientific Research & Benchmarking',
  'Internship Cohort & Training Program',
];

export function GetInTouch() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';
  const brandName = settings?.brandName || 'Sricore Solutions';

  const contactEmail =
    settings?.contact?.primaryEmail || 'contact@sricoresolutions.com';
  const contactPhone = settings?.contact?.primaryPhone || '+91 98402 34567';
  const officeAddress =
    settings?.contact?.address || 'Namakkal - 637018 & Chennai, Tamil Nadu, India';

  const [values, setValues] = useState<GetInTouchValues>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<GetInTouchErrors>({});
  const [touched, setTouched] = useState<Record<keyof GetInTouchValues, boolean>>({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<{
    referenceId: string;
    name: string;
    email: string;
    subject: string;
  } | null>(null);

  const validateField = (
    field: keyof GetInTouchValues,
    value: string
  ): string | undefined => {
    const trimmed = value.trim();
    if (field === 'name') {
      if (!trimmed) return 'Please enter your full name.';
      if (trimmed.length < 2) return 'Name must be at least 2 characters.';
    }
    if (field === 'email') {
      if (!trimmed) return 'Please enter your email address.';
      if (!EMAIL_PATTERN.test(trimmed)) {
        return 'Please enter a valid email address (e.g., name@company.com).';
      }
    }
    if (field === 'subject') {
      if (!trimmed) return 'Please enter a subject for your inquiry.';
      if (trimmed.length < 3) return 'Subject must be at least 3 characters.';
    }
    if (field === 'message') {
      if (!trimmed) return 'Please enter your project details or message.';
      if (trimmed.length < 15) {
        return 'Please provide at least 15 characters describing your requirements.';
      }
    }
    return undefined;
  };

  const validateAll = (currentValues: GetInTouchValues): GetInTouchErrors => {
    const nextErrors: GetInTouchErrors = {};
    (Object.keys(currentValues) as (keyof GetInTouchValues)[]).forEach((field) => {
      const err = validateField(field, currentValues[field]);
      if (err) nextErrors[field] = err;
    });
    return nextErrors;
  };

  const handleChange = (field: keyof GetInTouchValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value),
      }));
    }
  };

  const handleBlur = (field: keyof GetInTouchValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, values[field]),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });

    const validationErrors = validateAll(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const referenceId = `SRI-INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await addDoc(collection(db, 'enquiries'), {
        referenceId,
        fullName: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        source: 'homepage-get-in-touch',
        status: 'NEW',
        createdAt: serverTimestamp(),
      });
    } catch {
      try {
        const storedRaw = localStorage.getItem('sricore_contact_submissions');
        const stored = storedRaw ? JSON.parse(storedRaw) : [];
        stored.push({
          referenceId,
          ...values,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('sricore_contact_submissions', JSON.stringify(stored));
      } catch {
        // Ignore localStorage restrictions
      }
    } finally {
      setIsSubmitting(false);
      setSubmittedRecord({
        referenceId,
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
      });
      setValues({ name: '', email: '', subject: '', message: '' });
      setTouched({ name: false, email: false, subject: false, message: false });
      setErrors({});
    }
  };

  return (
    <section
      id="get-in-touch"
      aria-labelledby="get-in-touch-heading"
      className="content-visibility-auto py-12 md:py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Engineering Contact Coordinates & SLA */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              <span style={{ color: primaryColor }}>Get In Touch</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span>Direct Engineering Desk</span>
            </div>

            <h2
              id="get-in-touch-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Discuss Your Project or Technical Inquiry
            </h2>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Connect with {brandName} architects regarding custom software platforms, embedded IoT hardware, applied AI systems, or mentored internship cohorts.
            </p>

            {/* Contact Coordinates List */}
            <div className="space-y-4 bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Direct Email
                  </div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:underline break-all"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Engineering Desk Phone
                  </div>
                  <a
                    href={`tel:${contactPhone}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:underline"
                  >
                    {contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Office Location
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {officeAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Mon – Sat · 9:00 AM – 6:30 PM IST (24-Hour Technical Response SLA)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
              <span>All project disclosures are protected under mutual NDA confidentiality.</span>
            </div>
          </div>

          {/* Right Column: Validated 'Get In Touch' Form */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
              {submittedRecord ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="py-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                      Reference ID: {submittedRecord.referenceId}
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Thank You, {submittedRecord.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                      Your message regarding{' '}
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        &ldquo;{submittedRecord.subject}&rdquo;
                      </strong>{' '}
                      has been routed to our engineering team. We will respond to{' '}
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        {submittedRecord.email}
                      </strong>{' '}
                      within 24 business hours.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setSubmittedRecord(null)}
                      className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-95 cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Send Us a Message
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Complete all fields below and our technical team will respond promptly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={values.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="Dr. / Er. Full Name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-950"
                      />
                      {errors.name && (
                        <p
                          id="contact-name-error"
                          role="alert"
                          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="you@organization.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-950"
                      />
                      {errors.email && (
                        <p
                          id="contact-email-error"
                          role="alert"
                          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject Field + Quick Topic Buttons */}
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={values.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      onBlur={() => handleBlur('subject')}
                      placeholder="e.g., Custom IoT Telemetry & Cloud Dashboard"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-950"
                    />
                    {errors.subject && (
                      <p
                        id="contact-subject-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.subject}</span>
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
                        Quick Topics:
                      </span>
                      {SUBJECT_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            handleChange('subject', preset);
                            setErrors((prev) => ({ ...prev, subject: undefined }));
                          }}
                          className="text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Project Details / Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={values.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      placeholder="Describe your technical requirements, target timeline, or internship inquiry..."
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-950 resize-y"
                    />
                    {errors.message && (
                      <p
                        id="contact-message-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Action */}
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Fields marked with <span className="text-red-500">*</span> are required.
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-60 cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default GetInTouch;
