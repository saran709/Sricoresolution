import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Code,
  Cpu,
  Brain,
  FlaskConical,
  CheckCircle2,
  Sparkles,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebaseError';
import { queryClient } from '../../lib/queryClient';
import { useAuth } from '../../contexts/AuthContext';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { APP_CONFIG } from '../../config';
import { trackPromise } from '../../lib/topProgressBar';

export type QuickServiceTrack = 'software' | 'hardware' | 'ai' | 'research';

interface TrackOption {
  id: QuickServiceTrack;
  label: string;
  shortLabel: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TRACK_OPTIONS: TrackOption[] = [
  {
    id: 'software',
    label: 'Software & Cloud Engineering',
    shortLabel: 'Software',
    tagline: 'Web Apps, SaaS, APIs & Mobile',
    icon: Code,
  },
  {
    id: 'hardware',
    label: 'Hardware & Industrial IoT',
    shortLabel: 'IoT & PCB',
    tagline: 'STM32/ESP32, PCB Layout & Telemetry',
    icon: Cpu,
  },
  {
    id: 'ai',
    label: 'AI, Vision & RAG Systems',
    shortLabel: 'AI / ML',
    tagline: 'Computer Vision, Edge AI & LLMs',
    icon: Brain,
  },
  {
    id: 'research',
    label: 'R&D & PoC Prototyping',
    shortLabel: 'Research',
    tagline: 'Simulation, Benchmarking & Specs',
    icon: FlaskConical,
  },
];

function detectDefaultTrackFromPath(pathname: string): QuickServiceTrack {
  const normalized = pathname.toLowerCase();
  if (normalized.includes('hardware') || normalized.includes('iot')) {
    return 'hardware';
  }
  if (normalized.includes('ai-ml') || normalized.includes('vision')) {
    return 'ai';
  }
  if (normalized.includes('research')) {
    return 'research';
  }
  return 'software';
}

export function QuickContactFAB() {
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<QuickServiceTrack>(() =>
    detectDefaultTrackFromPath(location.pathname)
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<{
    referenceId: string;
    trackLabel: string;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Sync default service track with current page path when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedTrack(detectDefaultTrackFromPath(location.pathname));
    }
  }, [location.pathname, isOpen]);

  // Pre-populate authenticated user details if empty
  useEffect(() => {
    if (userProfile || currentUser) {
      const derivedName =
        [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ') ||
        currentUser?.displayName ||
        '';
      const derivedEmail = userProfile?.email || currentUser?.email || '';
      const derivedPhone = userProfile?.phone || '';

      setFullName((prev) => prev || derivedName);
      setEmail((prev) => prev || derivedEmail);
      setPhone((prev) => prev || derivedPhone);
    }
  }, [userProfile, currentUser]);

  // Handle Escape key and lock background scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  // Hide on Admin and Workspace portal routes
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/dashboard')
  ) {
    return null;
  }

  const activeTrack =
    TRACK_OPTIONS.find((t) => t.id === selectedTrack) || TRACK_OPTIONS[0];

  const handleOpen = () => {
    setErrorMessage(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setMessage('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setErrorMessage('Please enter your name (at least 2 characters).');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (trimmedMessage.length < 10) {
      setErrorMessage(
        'Please briefly describe your software or IoT requirements (at least 10 characters).'
      );
      return;
    }

    setIsSubmitting(true);
    const referenceId = `CSRI-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const nameParts = trimmedName.split(/\s+/);
    const firstName = nameParts[0] || trimmedName;
    const lastName = nameParts.slice(1).join(' ');

    const payload: Record<string, unknown> = {
      referenceId,
      name: trimmedName,
      firstName,
      lastName,
      email: trimmedEmail,
      phone: trimmedPhone,
      company: '',
      serviceInterest: activeTrack.label,
      serviceCategory: selectedTrack === 'research' ? 'multi' : selectedTrack,
      subject: `Quick Inquiry: ${activeTrack.label}`,
      message: trimmedMessage,
      projectDetails: trimmedMessage,
      enquiryType: selectedTrack === 'research' ? 'research' : 'commercial',
      status: 'NEW',
      source: `Quick Contact Modal (${location.pathname})`,
      createdAt: serverTimestamp(),
    };

    if (currentUser?.uid) {
      payload.clientId = currentUser.uid;
    }

    try {
      await trackPromise(
        (async () => {
          try {
            await addDoc(collection(db, 'enquiries'), payload);
          } catch (firestoreErr: any) {
            const msg = String(firestoreErr?.message || '').toLowerCase();
            if (
              msg.includes('permission-denied') ||
              msg.includes('insufficient permissions')
            ) {
              handleFirestoreError(firestoreErr, OperationType.CREATE, 'enquiries', auth);
            }
            throw firestoreErr;
          }

          if (currentUser?.uid) {
            void queryClient.invalidateQueries({
              queryKey: ['client-dashboard', currentUser.uid],
            });
          }
          void queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] });

          // Non-blocking email notification
          const recipientEmail =
            settings?.contact?.primaryEmail || APP_CONFIG.company.contact.email;
          void fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: recipientEmail,
              subject: `[Quick Inquiry] ${activeTrack.label} – ${trimmedName}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                  <div style="background-color: #0f172a; color: #ffffff; padding: 20px; border-bottom: 3px solid #d97706;">
                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-weight: bold;">Quick Contact Inquiry</p>
                    <h2 style="margin: 6px 0 0; font-size: 18px;">${activeTrack.label}</h2>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Reference ID: ${referenceId}</p>
                  </div>
                  <div style="padding: 20px; background: #ffffff;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Name:</strong> ${trimmedName}</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Email:</strong> ${trimmedEmail}</p>
                    ${trimmedPhone ? `<p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Phone:</strong> ${trimmedPhone}</p>` : ''}
                    <p style="margin: 0 0 12px; font-size: 13px; color: #334155;"><strong>Page Path:</strong> ${location.pathname}</p>
                    <div style="background-color: #f8fafc; border-left: 4px solid #d97706; padding: 14px; border-radius: 4px;">
                      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #0f172a; white-space: pre-wrap;">${trimmedMessage}</p>
                    </div>
                  </div>
                </div>
              `,
            }),
          }).catch(() => {});
        })(),
        'quick_contact_submit'
      );

      setSubmittedRef({
        referenceId,
        trackLabel: activeTrack.label,
      });
    } catch (err) {
      console.error('Quick Contact submission error:', err);
      setErrorMessage(
        'Unable to submit your inquiry right now. Please try again or use our full Contact page.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Persistent Floating Action Button positioned cleanly above the ThemeToggle FAB */}
      <button
        type="button"
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Open Quick Contact inquiry modal"
        title="Quick Contact – Software & IoT Inquiry"
        className="fixed bottom-18 right-5 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        style={{ backgroundColor: primaryColor }}
      >
        <MessageSquare className="w-4 h-4 shrink-0" />
        <span>Quick Contact</span>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-contact-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-xs animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Direct Engineering Desk</span>
                </div>
                <h2
                  id="quick-contact-modal-title"
                  className="text-base sm:text-lg font-bold tracking-tight text-white"
                >
                  Quick Service Inquiry
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Quick Contact modal"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {submittedRef ? (
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                    Inquiry Received!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                    Our <span className="font-semibold text-slate-900 dark:text-white">{submittedRef.trackLabel}</span> lead will review your brief and respond within 24 business hours.
                  </p>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-left mb-6 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Reference ID
                      </span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {submittedRef.referenceId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Response SLA
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-3.5 h-3.5" /> &lt; 24 Business Hours
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {errorMessage && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 flex items-start gap-2.5 text-xs"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Service Track Selector Pills */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Select Engineering Track
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TRACK_OPTIONS.map((track) => {
                        const Icon = track.icon;
                        const isSelected = selectedTrack === track.id;
                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => setSelectedTrack(track.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-2xs'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {track.shortLabel}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {track.tagline}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="quick-contact-name"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Your Name <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          ref={firstInputRef}
                          id="quick-contact-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Alex Johnson"
                          className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="quick-contact-email"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Email Address <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="quick-contact-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@company.com"
                          className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Phone */}
                  <div>
                    <label
                      htmlFor="quick-contact-phone"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Phone / WhatsApp <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="quick-contact-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Project Brief / Question */}
                  <div>
                    <label
                      htmlFor="quick-contact-message"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      How can our engineers help? <span className="text-amber-600">*</span>
                    </label>
                    <textarea
                      id="quick-contact-message"
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Briefly describe your ${activeTrack.shortLabel} project, target timeline, or technical question...`}
                      className="w-full p-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* Submit & Full Quote Link Footer */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to={`/contact?service=${selectedTrack === 'research' ? 'multi' : selectedTrack}`}
                      onClick={handleClose}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Need detailed RFP scoping?</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-60 transition-all cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickContactFAB;
