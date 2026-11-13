import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Container } from './ui/Container';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

const BRIEFING_TOPICS = [
  { id: 'software', label: 'Enterprise Software & Cloud' },
  { id: 'iot', label: 'Embedded Hardware & Industrial IoT' },
  { id: 'ai', label: 'Applied AI & Research Benchmarks' },
  { id: 'internships', label: 'Internship Cohorts & Workshops' },
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Newsletter() {
  const location = useLocation();
  const { settings } = useWebsiteSettings();

  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['software', 'iot', 'ai']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  // Hide public Newsletter section on Admin, User Dashboard Portal, and Auth routes
  const hiddenPrefixes = ['/admin', '/dashboard', '/login', '/register', '/setup', '/forgot-password', '/unauthorized'];
  if (hiddenPrefixes.some((prefix) => location.pathname.startsWith(prefix))) {
    return null;
  }

  const brandName = settings?.brandName || 'Sricore Solutions';
  const primaryColor = settings?.theme?.primary || '#d97706';

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setErrorMessage('Please enter your work, academic, or personal email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setErrorMessage('Please enter a valid email address (for example: engineer@domain.com).');
      return;
    }

    setErrorMessage(null);
    setSubmittedEmail(trimmed);
    setEmail('');

    try {
      const existingRaw = localStorage.getItem('sricore_newsletter_subscriptions');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const next = [
        ...existing.filter((entry: { email?: string }) => entry.email !== trimmed),
        {
          email: trimmed,
          topics: selectedTopics.length > 0 ? selectedTopics : ['all'],
          subscribedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('sricore_newsletter_subscriptions', JSON.stringify(next));
    } catch {
      // Ignore storage quota or private browsing restrictions
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="content-visibility-auto bg-slate-100 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 py-10 md:py-14"
    >
      <Container>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Value Proposition & Topic Filters */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2.5">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span style={{ color: primaryColor }}>Engineering & Research Dispatch</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <span>Monthly Technical Briefing</span>
              </div>

              <h2
                id="newsletter-heading"
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                Stay Updated on {brandName} Technology & R&D Releases
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-5">
                Receive curated engineering notes on distributed software architectures, STM32/ESP32 hardware design, edge AI benchmarks, and upcoming internship cohort registrations. Zero spam—only practical technical insights.
              </p>

              {/* Topic Selection Checkboxes */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Select Briefing Tracks:
                </div>
                <div className="flex flex-wrap gap-2">
                  {BRIEFING_TOPICS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        aria-pressed={isSelected}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                        }`}
                      >
                        <CheckCircle2
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: isSelected ? primaryColor : undefined }}
                        />
                        <span>{topic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Validated Subscription Form / Confirmation State */}
            <div className="lg:col-span-5 w-full">
              {submittedEmail ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="p-5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        Subscription Confirmed
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                        <strong className="font-semibold text-slate-900 dark:text-white">
                          {submittedEmail}
                        </strong>{' '}
                        has been registered for the {brandName} technical briefing.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmittedEmail(null)}
                        className="text-xs font-bold hover:underline cursor-pointer"
                        style={{ color: primaryColor }}
                      >
                        Register another email address
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <div>
                    <label
                      htmlFor="newsletter-email-input"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Work or Academic Email Address
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        id="newsletter-email-input"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="engineer@organization.com"
                        aria-invalid={!!errorMessage}
                        aria-describedby={errorMessage ? 'newsletter-error' : undefined}
                        className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-950"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg shadow-xs transition-opacity hover:opacity-95 shrink-0 cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span>Subscribe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div
                      id="newsletter-error"
                      role="alert"
                      className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    By subscribing, you agree to receive technical updates in accordance with our{' '}
                    <Link
                      to="/privacy"
                      className="underline underline-offset-2 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Privacy Policy
                    </Link>
                    . Unsubscribe anytime with one click.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Newsletter;
