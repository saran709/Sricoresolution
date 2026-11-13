import React, { Suspense } from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Hero } from '../components/Hero';
import { ServicesSection } from '../components/Services';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

const FeaturedProjects = React.lazy(() => import('../components/FeaturedProjects'));
const FAQ = React.lazy(() => import('../components/FAQ'));
const GetInTouch = React.lazy(() => import('../components/GetInTouch'));

function SectionShimmerFallback({ minHeightClass = 'min-h-[360px]' }: { minHeightClass?: string }) {
  return (
    <div className={`${minHeightClass} py-12 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800`}>
      <Container>
        <div className="space-y-4">
          <div className="h-4 w-40 rounded skeleton-shimmer" />
          <div className="h-8 w-72 max-w-full rounded skeleton-shimmer" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="h-48 rounded-xl skeleton-shimmer" />
            <div className="h-48 rounded-xl skeleton-shimmer" />
            <div className="h-48 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function Home() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';
  const metrics = settings?.metrics || [];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Banner */}
      <Hero />

      {/* Clear 3-Path Visitor Orientation Bar */}
      <section
        aria-label="Choose Your Starting Path"
        className="py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/enquiry"
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-amber-400 transition-colors flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  For Businesses & Researchers
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Request a Custom Project Quote
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  No sign-in needed · Response within 24 hours
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 transition-colors" />
            </Link>

            <Link
              to="/internships"
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-amber-400 transition-colors flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  For Students & Graduates
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Explore & Apply for Internships
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Software, IoT, AI/ML & Embedded cohorts
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 transition-colors" />
            </Link>

            <Link
              to="/login"
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-amber-400 transition-colors flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  For Existing Members & Staff
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Sign In to Your Workspace
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Clients, Staff, Mentors, Interns & Admins
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 transition-colors" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Dynamic Key Metrics & Milestones */}
      {metrics && metrics.length > 0 && (
        <section className="content-visibility-auto py-6 md:py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="p-4 md:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-center flex flex-col items-center justify-center hover:shadow-xs transition-all tabular-nums"
                >
                  <div
                    className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight mb-1"
                    style={{ color: primaryColor }}
                  >
                    {metric.value}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white text-[11px] md:text-xs mb-1">
                    {metric.label}
                  </div>
                  {metric.description && (
                    <div className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                      {metric.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Core Services Section (Software, Hardware/IoT, AI/ML, Research, Internships) */}
      <ServicesSection />

      {/* Featured Projects Carousel & Case Study Grid */}
      <Suspense fallback={<SectionShimmerFallback minHeightClass="min-h-[520px]" />}>
        <FeaturedProjects />
      </Suspense>

      {/* Why Choose Us Section */}
      <section className="content-visibility-auto py-10 md:py-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div>
              <SectionHeader
                title="Built on Engineering Excellence"
                align="left"
                badge={`Why ${settings?.brandName || 'Sricore Solutions'}`}
                className="mb-3 md:mb-4"
              />
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                We bridge the gap between academic research and industrial application. Our team of experienced engineers and domain experts deliver solutions that are not only technologically advanced but also practically viable and commercially scalable.
              </p>

              <ul className="space-y-2.5">
                {[
                  'Integrated approach combining software, hardware, and AI',
                  'Rigorous research-backed development methodologies',
                  'End-to-end project lifecycle support and maintenance',
                  'Dedicated training and mentorship programs',
                  'Focus on scalable and secure architectures',
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2
                      className="h-4 w-4 mr-2 shrink-0 mt-0.5"
                      style={{ color: primaryColor }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Our Engineering Workflow
              </h3>
              <div className="space-y-3.5">
                {[
                  {
                    step: '01',
                    title: 'Analysis & Research',
                    desc: 'Thorough requirement gathering and technical feasibility studies.',
                  },
                  {
                    step: '02',
                    title: 'Architecture & Design',
                    desc: 'Scalable system design encompassing software, hardware, and data flows.',
                  },
                  {
                    step: '03',
                    title: 'Development & Integration',
                    desc: 'Agile development with continuous integration and rigorous testing.',
                  },
                  {
                    step: '04',
                    title: 'Deployment & Support',
                    desc: 'Seamless transition to production with ongoing maintenance and updates.',
                  },
                ].map((phase, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className="text-base font-bold font-mono opacity-60 tabular-nums"
                      style={{ color: primaryColor }}
                    >
                      {phase.step}
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                        {phase.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Internships & Training Highlight */}
      <section className="content-visibility-auto py-10 md:py-14 bg-slate-50 dark:bg-slate-900/40 transition-colors">
        <Container>
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <span
                  className="text-xs font-bold uppercase tracking-widest mb-2.5"
                  style={{ color: primaryColor }}
                >
                  Education & Growth · Industrial Cohorts
                </span>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2.5">
                  Launch Your Career with Practical Training
                </h2>
                <p className="text-slate-300 text-xs md:text-sm mb-5 leading-relaxed">
                  {settings?.brandName || 'Sricore Solutions'} offers paid internships and specialized practical training programs. Work on live industrial projects, receive mentorship from senior engineers, and build a portfolio that stands out.
                </p>
                <Link
                  to="/careers?type=internships"
                  className="inline-flex items-center font-semibold transition-colors text-sm hover:underline"
                  style={{ color: primaryColor }}
                >
                  Explore Jobs & Internship Programs{' '}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
              <div className="bg-slate-800 relative hidden lg:block">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(${primaryColor} 2px, transparent 2px)`,
                    backgroundSize: '24px 24px',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full h-full border border-slate-700 rounded-xl bg-slate-900/50 backdrop-blur-sm p-4 flex flex-col gap-2.5">
                    <div className="h-2.5 w-1/3 bg-slate-700 rounded" />
                    <div className="h-2.5 w-3/4 bg-slate-700 rounded" />
                    <div className="h-2.5 w-2/3 bg-slate-700 rounded" />
                    <div className="h-2.5 w-1/2 bg-slate-700 rounded" />
                    <div className="mt-auto flex justify-between items-end">
                      <div
                        className="h-7 w-16 rounded"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="h-7 w-7 bg-slate-700 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Frequently Asked Questions (Services & Internship Programs) */}
      <Suspense fallback={<SectionShimmerFallback minHeightClass="min-h-[420px]" />}>
        <FAQ />
      </Suspense>

      {/* Get In Touch Contact Section */}
      <Suspense fallback={<SectionShimmerFallback minHeightClass="min-h-[460px]" />}>
        <GetInTouch />
      </Suspense>
    </div>
  );
}
