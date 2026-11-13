import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Container } from './ui/Container';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export interface FAQItem {
  id: string;
  index: string;
  category: 'services' | 'internships';
  categoryLabel: string;
  question: string;
  answer: string;
  actionLink?: {
    label: string;
    href: string;
  };
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-engagement-scope',
    index: '01',
    category: 'services',
    categoryLabel: 'Engineering Services',
    question:
      'What types of software, hardware, and AI engineering projects does Sricore Solutions deliver?',
    answer:
      'We deliver end-to-end engineering systems across four technical tracks: (1) Enterprise web applications, SaaS platforms, and REST/GraphQL APIs built with React, TypeScript, and Node.js; (2) Custom multi-layer PCB design, STM32/ESP32 firmware, and industrial Modbus/LoRaWAN/MQTT telemetry gateways; (3) Computer vision quality inspection, predictive maintenance models, and domain-specific LLM/RAG pipelines; and (4) Scientific simulation, algorithm benchmarking, and technical documentation.',
    actionLink: {
      label: 'Explore All Services',
      href: '/services',
    },
  },
  {
    id: 'faq-ip-ownership',
    index: '02',
    category: 'services',
    categoryLabel: 'Engineering Services',
    question:
      'How do intellectual property (IP) ownership, source code handover, and NDAs work for client projects?',
    answer:
      'Every commercial and research engagement begins with a mutual Non-Disclosure Agreement (NDA). Upon project completion and milestone sign-off, 100% of the custom source code, Gerber/schematic files, trained model weights, and system architecture documentation are transferred to your organization with no vendor lock-in.',
    actionLink: {
      label: 'Request a Project Consultation',
      href: '/enquiry',
    },
  },
  {
    id: 'faq-hardware-software-integration',
    index: '03',
    category: 'services',
    categoryLabel: 'Engineering Services',
    question:
      'Can Sricore Solutions handle combined hardware-plus-software products from prototype to production?',
    answer:
      'Yes. Our cross-functional teams co-design embedded hardware and cloud software under one roof. We handle sensor interfacing, schematic capture, PCB layout, RTOS firmware, secure MQTT/WebSocket ingestion, and real-time React monitoring dashboards so your hardware and cloud layers work together seamlessly.',
    actionLink: {
      label: 'View Hardware & IoT Solutions',
      href: '/solutions/hardware',
    },
  },
  {
    id: 'faq-research-support',
    index: '04',
    category: 'services',
    categoryLabel: 'Engineering Services',
    question:
      'What level of validation and documentation is included in your Research & Development services?',
    answer:
      'Our R&D division provides mathematical formulation, reproducible simulation environments (Python, MATLAB, NS-3, PyTorch), comparative baseline benchmarking, ablation studies, and publication-grade technical manuscripts formatted for IEEE, Springer, Elsevier, and Scopus-indexed venues.',
    actionLink: {
      label: 'Explore Research Services',
      href: '/services/research',
    },
  },
  {
    id: 'faq-internship-structure',
    index: '05',
    category: 'internships',
    categoryLabel: 'Internship Programs',
    question:
      'How are Sricore Solutions internship and industrial training programs structured?',
    answer:
      'Our internship cohorts are structured around hands-on engineering execution rather than passive lectures. Trainees select a specialized track—such as Full-Stack Web Development, Embedded Systems & IoT, Applied AI & Computer Vision, Cloud & DevOps, or Cybersecurity—and build production-grade modules with weekly code and architecture reviews from senior engineers.',
    actionLink: {
      label: 'Browse Internship Curriculums',
      href: '/internships',
    },
  },
  {
    id: 'faq-internship-eligibility',
    index: '06',
    category: 'internships',
    categoryLabel: 'Internship Programs',
    question:
      'Who is eligible to apply for the internship tracks, and what durations are available?',
    answer:
      'Undergraduate (B.E./B.Tech/B.Sc/BCA) and postgraduate (M.E./M.Tech/MCA/M.Sc) students as well as recent graduates in Computer Science, Electronics, Electrical, Mechatronics, and allied disciplines are eligible. We offer flexible 4-week, 8-week, and 12-to-16-week semester capstone tracks in both hybrid and remote formats.',
    actionLink: {
      label: 'Apply for an Internship Track',
      href: '/internships/apply',
    },
  },
  {
    id: 'faq-internship-deliverables',
    index: '07',
    category: 'internships',
    categoryLabel: 'Internship Programs',
    question:
      'What credentials and portfolio outcomes do interns receive upon completing a cohort?',
    answer:
      'Graduating interns receive an ISO-aligned Internship Completion Certificate with a unique verification ID, a detailed project evaluation report, and a documented GitHub/hardware capstone portfolio demonstrating real engineering deliverables to prospective employers.',
  },
  {
    id: 'faq-project-timeline',
    index: '08',
    category: 'services',
    categoryLabel: 'Engineering Services',
    question:
      'How quickly can we initiate a new technical discovery call or project quote?',
    answer:
      'Once you submit your technical requirements through our Enquiry or Contact portal, a lead systems architect reviews your brief and responds within 24 business hours with a preliminary feasibility assessment, proposed architecture roadmap, and milestone estimate.',
    actionLink: {
      label: 'Contact Our Engineering Team',
      href: '/contact',
    },
  },
];

export function FAQ() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const [activeFilter, setActiveFilter] = useState<'all' | 'services' | 'internships'>('all');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const filteredItems =
    activeFilter === 'all'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeFilter);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="content-visibility-auto py-12 md:py-16 lg:py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Section Context, Filter Controls & Direct Support Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              <span style={{ color: primaryColor }}>Knowledge Base & FAQ</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span>Services & Internships</span>
            </div>

            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Frequently Asked Questions
            </h2>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Clear answers regarding our commercial software, embedded IoT, and AI engineering workflows, IP handover standards, and mentored internship cohorts.
            </p>

            {/* Interactive Category Filter Buttons */}
            <div
              role="tablist"
              aria-label="Filter FAQ by category"
              className="inline-flex flex-wrap gap-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6"
            >
              {[
                { key: 'all', label: 'All Questions (8)' },
                { key: 'services', label: 'Engineering Services (5)' },
                { key: 'internships', label: 'Internships (3)' },
              ].map((tab) => {
                const isSelected = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveFilter(tab.key as 'all' | 'services' | 'internships')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    style={isSelected ? { color: primaryColor } : undefined}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Direct Engineering Support Box */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Need Custom Architecture Advice?
              </div>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Have a specific hardware specification, software RFP, or academic cohort inquiry not covered here? Reach out directly to our engineering desk.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/enquiry"
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                  style={{ color: primaryColor }}
                >
                  <span>Submit Technical Enquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <Link
                  to="/internships/apply"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
                >
                  <span>Internship Registration</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Accessible Accordion List */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
              {filteredItems.map((item) => {
                const isOpen = openId === item.id;
                const panelId = `${item.id}-panel`;
                const buttonId = `${item.id}-trigger`;

                return (
                  <div key={item.id} className="py-1">
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => handleToggle(item.id)}
                        className="w-full py-4 md:py-5 flex items-start justify-between gap-4 text-left group cursor-pointer focus:outline-none"
                      >
                        <div className="flex items-start gap-3.5">
                          <span
                            className="font-mono text-xs font-bold tabular-nums pt-1 shrink-0"
                            style={{ color: isOpen ? primaryColor : undefined }}
                          >
                            {item.index}.
                          </span>
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                              {item.categoryLabel}
                            </div>
                            <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors leading-snug">
                              {item.question}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`mt-1 w-7 h-7 rounded-md border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                            isOpen
                              ? 'rotate-180 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500'
                          }`}
                          style={isOpen ? { color: primaryColor } : undefined}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>
                    </h3>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="pb-5 pl-7 md:pl-8 pr-4"
                      >
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.answer}
                        </p>
                        {item.actionLink && (
                          <div className="mt-3">
                            <Link
                              to={item.actionLink.href}
                              className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                              style={{ color: primaryColor }}
                            >
                              <span>{item.actionLink.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default FAQ;
