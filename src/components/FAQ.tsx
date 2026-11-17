import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ArrowRight,
  Search,
  Code2,
  Cpu,
  Brain,
  FlaskConical,
  HelpCircle,
  X,
} from 'lucide-react';
import { Container } from './ui/Container';
import { FAQSchema, FAQSchemaItem } from './seo/FAQSchema';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export type FAQCategory = 'software' | 'iot' | 'ai' | 'research' | 'internships';

export interface FAQItem {
  id: string;
  index: string;
  category: FAQCategory;
  categoryLabel: string;
  question: string;
  answer: string;
  highlights?: string[];
  actionLink?: {
    label: string;
    href: string;
  };
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-software-architecture',
    index: '01',
    category: 'software',
    categoryLabel: 'Software Engineering',
    question:
      'What tech stack and cloud architecture does Sricore Solutions use for custom enterprise software?',
    answer:
      'We architect full-stack web applications, multi-tenant SaaS platforms, and distributed APIs using React, TypeScript, Node.js, Python, and PostgreSQL/Firestore. Every system is engineered with role-based access control (RBAC), automated CI/CD pipelines, containerized microservices, and comprehensive OpenAPI documentation.',
    highlights: ['React & TypeScript', 'Node.js & Python APIs', 'Multi-Tenant RBAC'],
    actionLink: {
      label: 'Explore Software Solutions',
      href: '/solutions/software',
    },
  },
  {
    id: 'faq-software-ip-handover',
    index: '02',
    category: 'software',
    categoryLabel: 'Software Engineering',
    question:
      'How do intellectual property (IP) ownership, source code handover, and NDAs work for software projects?',
    answer:
      'Every commercial and research engagement starts with a mutual Non-Disclosure Agreement (NDA). Upon milestone completion and final sign-off, 100% of the custom Git repositories, database schemas, CI/CD configurations, and deployment documentation are transferred to your organization with zero vendor lock-in.',
    highlights: ['100% IP Ownership', 'Mutual NDA Protection', 'Zero Vendor Lock-In'],
    actionLink: {
      label: 'Request a Software Quote',
      href: '/enquiry',
    },
  },
  {
    id: 'faq-iot-hardware-design',
    index: '03',
    category: 'iot',
    categoryLabel: 'Hardware & Industrial IoT',
    question:
      'Can Sricore Solutions design custom multi-layer PCBs, embedded firmware, and industrial IoT gateways?',
    answer:
      'Yes. Our embedded systems lab handles end-to-end hardware product development—from schematic capture and multi-layer PCB layout (KiCad/Altium) to bare-metal C/C++ and FreeRTOS/Zephyr firmware on STM32, ESP32, and ARM Cortex-M microcontrollers, complete with industrial Modbus RTU/TCP, CAN bus, BLE, and LoRaWAN connectivity.',
    highlights: ['STM32 & ESP32 Firmware', 'Multi-Layer PCB Layout', 'Modbus, CAN & LoRaWAN'],
    actionLink: {
      label: 'View Hardware & IoT Solutions',
      href: '/solutions/hardware',
    },
  },
  {
    id: 'faq-iot-cloud-telemetry',
    index: '04',
    category: 'iot',
    categoryLabel: 'Hardware & Industrial IoT',
    question:
      'How do your IoT devices handle offline network drops, secure OTA updates, and real-time cloud dashboards?',
    answer:
      'Our industrial edge gateways feature local ring-buffer flash storage to prevent telemetry loss during connectivity drops, mutual TLS (mTLS) encrypted MQTT/WebSocket streams, signed Over-The-Air (OTA) firmware updates with automatic rollback, and live React telemetry dashboards with configurable threshold alerts.',
    highlights: ['mTLS Encrypted MQTT', 'Signed OTA Rollback', 'Real-Time Dashboards'],
    actionLink: {
      label: 'Explore IoT Telemetry Architecture',
      href: '/solutions/hardware',
    },
  },
  {
    id: 'faq-ai-computer-vision',
    index: '05',
    category: 'ai',
    categoryLabel: 'AI & Machine Learning',
    question:
      'What AI, computer vision, and machine learning solutions do you deploy for industrial and enterprise clients?',
    answer:
      'We build custom computer vision pipelines for automated optical defect inspection, predictive maintenance models for rotating machinery, and domain-specific Retrieval-Augmented Generation (RAG) assistants. Models are optimized with ONNX and TensorRT for low-latency inference on edge GPUs (NVIDIA Jetson) or cloud clusters.',
    highlights: ['Optical Defect Detection', 'Edge TensorRT Inference', 'Enterprise RAG Pipelines'],
    actionLink: {
      label: 'Explore AI & ML Solutions',
      href: '/solutions/ai-ml',
    },
  },
  {
    id: 'faq-ai-data-privacy',
    index: '06',
    category: 'ai',
    categoryLabel: 'AI & Machine Learning',
    question:
      'Can your AI models and enterprise RAG systems run on-premise or within a private cloud VPC?',
    answer:
      'Absolutely. For manufacturing plants, healthcare systems, and regulated enterprises, we deploy air-gapped or private-VPC inference pipelines and vector databases so your proprietary documents, sensor datasets, and model weights never leave your controlled infrastructure.',
    highlights: ['On-Premise & Private VPC', 'Data Sovereignty', 'Custom Model Weights'],
    actionLink: {
      label: 'Schedule an AI Architecture Review',
      href: '/enquiry',
    },
  },
  {
    id: 'faq-research-validation',
    index: '07',
    category: 'research',
    categoryLabel: 'R&D & Internships',
    question:
      'What level of validation and documentation is included in your Research & Development (R&D) services?',
    answer:
      'Our R&D division provides mathematical formulation, reproducible simulation environments (Python, MATLAB, NS-3, PyTorch), comparative baseline benchmarking, ablation studies, and publication-grade LaTeX manuscripts formatted for IEEE, Springer, Elsevier, and Scopus-indexed venues.',
    highlights: ['MATLAB, NS-3 & PyTorch', 'Ablation & Benchmarking', 'IEEE / Scopus Formatting'],
    actionLink: {
      label: 'Explore Research Services',
      href: '/services/research',
    },
  },
  {
    id: 'faq-internship-cohorts',
    index: '08',
    category: 'internships',
    categoryLabel: 'R&D & Internships',
    question:
      'How are Sricore Solutions mentored engineering internship programs structured for students and graduates?',
    answer:
      'Our internship cohorts focus on hands-on engineering execution across Full-Stack Software, Embedded Systems & IoT, and Applied AI. Trainees build production-grade capstone modules with weekly code and hardware reviews from senior engineers, earning an ISO-aligned completion certificate with a verifiable ID.',
    highlights: ['4 to 16 Week Tracks', 'Senior Engineer Mentorship', 'Verifiable ISO Certificate'],
    actionLink: {
      label: 'Browse Internship Tracks',
      href: '/internships',
    },
  },
];

const CATEGORY_TABS: Array<{
  key: 'all' | 'software' | 'iot' | 'ai' | 'research';
  label: string;
  icon: React.ReactNode;
}> = [
  { key: 'all', label: 'All Topics', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { key: 'software', label: 'Software', icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: 'iot', label: 'Hardware & IoT', icon: <Cpu className="w-3.5 h-3.5" /> },
  { key: 'ai', label: 'AI & ML', icon: <Brain className="w-3.5 h-3.5" /> },
  { key: 'research', label: 'R&D & Internships', icon: <FlaskConical className="w-3.5 h-3.5" /> },
];

export interface FAQSectionProps {
  defaultCategory?: 'all' | 'software' | 'iot' | 'ai' | 'research';
  includeSchema?: boolean;
  className?: string;
}

export function FAQ({
  defaultCategory = 'all',
  includeSchema = true,
  className = '',
}: FAQSectionProps) {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const [activeFilter, setActiveFilter] = useState<'all' | 'software' | 'iot' | 'ai' | 'research'>(
    defaultCategory
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>([FAQ_ITEMS[0].id]);

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        activeFilter === 'all' ||
        item.category === activeFilter ||
        (activeFilter === 'research' &&
          (item.category === 'research' || item.category === 'internships'));

      if (!matchesCategory) return false;

      const trimmedQuery = searchQuery.trim().toLowerCase();
      if (!trimmedQuery) return true;

      return (
        item.question.toLowerCase().includes(trimmedQuery) ||
        item.answer.toLowerCase().includes(trimmedQuery) ||
        item.categoryLabel.toLowerCase().includes(trimmedQuery) ||
        (item.highlights && item.highlights.some((h) => h.toLowerCase().includes(trimmedQuery)))
      );
    });
  }, [activeFilter, searchQuery]);

  const schemaItems = useMemo<FAQSchemaItem[]>(
    () =>
      FAQ_ITEMS.map((item) => ({
        id: item.id,
        category: item.categoryLabel,
        question: item.question,
        answer: item.answer,
      })),
    []
  );

  const handleToggle = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const allFilteredOpen =
    filteredItems.length > 0 && filteredItems.every((item) => openIds.includes(item.id));

  const handleToggleAll = () => {
    if (allFilteredOpen) {
      setOpenIds([]);
    } else {
      setOpenIds(filteredItems.map((item) => item.id));
    }
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className={`content-visibility-auto py-12 md:py-16 lg:py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 ${className}`}
    >
      {includeSchema && <FAQSchema items={schemaItems} />}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Section Context, Category Filter Tabs, Search & Direct Support Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              <span style={{ color: primaryColor }}>Knowledge Base & FAQ</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span>Software, IoT & AI</span>
            </div>

            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Frequently Asked Questions
            </h2>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              Clear answers regarding our enterprise software engineering, embedded hardware & industrial IoT systems, applied AI pipelines, IP ownership, and mentored internship cohorts.
            </p>

            {/* Quick Keyword Search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search software, PCB, MQTT, AI, NDA..."
                aria-label="Search frequently asked questions"
                className="w-full pl-10 pr-9 py-2.5 text-xs md:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear FAQ search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Interactive Category Filter Buttons */}
            <div
              role="tablist"
              aria-label="Filter FAQ by service category"
              className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6"
            >
              {CATEGORY_TABS.map((tab) => {
                const isSelected = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    style={isSelected ? { color: primaryColor } : undefined}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
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
                Have a specific software RFP, hardware schematic requirement, or AI deployment inquiry not covered here? Speak directly with our lead engineers.
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
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
                >
                  <span>Contact Engineering Desk</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Accessible Accordion List */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing <strong className="text-slate-800 dark:text-slate-200">{filteredItems.length}</strong> of {FAQ_ITEMS.length} engineering questions
              </span>
              {filteredItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {allFilteredOpen ? 'Collapse All' : 'Expand All'}
                </button>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 text-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  No matching questions found
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Try clearing your search filter or switching to &ldquo;All Topics&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const isOpen = openIds.includes(item.id);
                  const panelId = `${item.id}-panel`;
                  const buttonId = `${item.id}-trigger`;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                        isOpen
                          ? 'border-amber-500/40 dark:border-amber-500/40 bg-white dark:bg-slate-900 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <h3>
                        <button
                          id={buttonId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => handleToggle(item.id)}
                          className="w-full p-4 md:p-5 flex items-start justify-between gap-4 text-left group cursor-pointer focus:outline-none"
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
                              <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug block">
                                {item.question}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                              isOpen
                                ? 'rotate-180 border-amber-500/30 bg-amber-50 dark:bg-amber-950/40'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500'
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
                          className="overflow-hidden transition-all duration-200"
                        >
                          <div className="px-4 md:px-5 pb-5 pl-11 md:pl-12 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                              {item.answer}
                            </p>

                            {item.highlights && item.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3.5">
                                {item.highlights.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.actionLink && (
                              <div className="mt-4">
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default FAQ;
