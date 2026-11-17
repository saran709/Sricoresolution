import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';
import { Container } from '../ui/Container';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { EngineeringServiceKey } from './ServiceSchema';

export interface FAQSchemaItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  actionLink?: {
    label: string;
    href: string;
  };
}

export interface ServiceFAQCollection {
  serviceKey: EngineeringServiceKey;
  badge: string;
  heading: string;
  description: string;
  items: FAQSchemaItem[];
}

export const SERVICE_FAQ_CATALOG: Record<EngineeringServiceKey, ServiceFAQCollection> = {
  'services-hub': {
    serviceKey: 'services-hub',
    badge: 'Engineering Knowledge Base',
    heading: 'Frequently Asked Questions About Our Engineering Services',
    description:
      'Answers to common technical and commercial questions regarding project scoping, intellectual property handover, multi-disciplinary co-design, and engagement timelines.',
    items: [
      {
        id: 'services-faq-1',
        category: 'Engagement Scope',
        question:
          'What types of software, hardware, and AI engineering projects does Sricore Solutions deliver?',
        answer:
          'We deliver end-to-end engineering systems across five specialized tracks: (1) Enterprise web applications, multi-tenant SaaS platforms, and REST/GraphQL/gRPC APIs built with React, TypeScript, and Node.js; (2) Custom multi-layer PCB design, STM32/ESP32 RTOS firmware, and industrial Modbus/LoRaWAN/MQTT telemetry gateways; (3) Computer vision quality inspection, predictive maintenance models, and domain-specific LLM/RAG pipelines; (4) Scientific simulation, algorithm benchmarking, and IEEE/Scopus technical documentation; and (5) Mentored industrial engineering internships.',
        actionLink: {
          label: 'Request a Custom Project Quote',
          href: '/enquiry',
        },
      },
      {
        id: 'services-faq-2',
        category: 'IP & Security',
        question:
          'How do intellectual property (IP) ownership, source code handover, and NDAs work for client projects?',
        answer:
          'Every commercial and research engagement begins with a mutual Non-Disclosure Agreement (NDA). Upon project completion and milestone sign-off, 100% of the custom source code, Altium/KiCad Gerber and schematic files, bill of materials (BOM), trained model weights, and system architecture documentation are transferred to your organization with zero vendor lock-in.',
        actionLink: {
          label: 'Review Our Terms of Service',
          href: '/terms',
        },
      },
      {
        id: 'services-faq-3',
        category: 'Co-Design',
        question:
          'Can Sricore Solutions handle combined hardware-plus-software products from prototype to production?',
        answer:
          'Yes. Our cross-functional teams co-design embedded hardware and cloud software under one roof. We handle sensor interfacing, schematic capture, multi-layer PCB layout, deterministic RTOS firmware, secure MQTT/TLS ingestion, and real-time React monitoring dashboards so your physical devices and cloud infrastructure operate seamlessly.',
        actionLink: {
          label: 'Explore Hardware & IoT Solutions',
          href: '/solutions/hardware',
        },
      },
      {
        id: 'services-faq-4',
        category: 'Discovery & Delivery',
        question:
          'How quickly can we initiate a technical discovery call and receive a project architecture proposal?',
        answer:
          'Once you submit your technical requirements through our Enquiry or Contact portal, a lead systems architect reviews your brief and responds within 24 business hours with a preliminary feasibility assessment, proposed system architecture roadmap, and milestone delivery schedule.',
        actionLink: {
          label: 'Contact Our Engineering Desk',
          href: '/contact',
        },
      },
    ],
  },

  'software-solutions': {
    serviceKey: 'software-solutions',
    badge: 'Software Architecture FAQ',
    heading: 'Software Engineering & Cloud Architecture FAQs',
    description:
      'Key technical details covering our full-stack technology choices, scalability benchmarks, security compliance, and legacy migration workflows.',
    items: [
      {
        id: 'software-faq-1',
        category: 'Tech Stack & Performance',
        question:
          'What technology stack do you use for enterprise web applications and distributed backend APIs?',
        answer:
          'We engineer frontends using React 19, TypeScript, Next.js, and Tailwind CSS, paired with Node.js, Express, Go, and Python FastAPI backends. For persistence and caching, we deploy PostgreSQL, Firestore, TimescaleDB, and Redis, orchestrated via Docker, Kubernetes, and Terraform CI/CD pipelines.',
        actionLink: {
          label: 'View Software Case Studies',
          href: '/projects',
        },
      },
      {
        id: 'software-faq-2',
        category: 'Security & RBAC',
        question:
          'How do you implement multi-tenant security and Role-Based Access Control (RBAC) in enterprise platforms?',
        answer:
          'Every enterprise portal is built on a Zero-Trust security model featuring granular Role-Based Access Control (RBAC), short-lived JWT/OIDC session tokens, OWASP Top 10 mitigation, encrypted data-at-rest (AES-256), and immutable audit logging for administrative and data-access events.',
      },
      {
        id: 'software-faq-3',
        category: 'Legacy Modernization',
        question:
          'Can you modernize or migrate an existing legacy monolith without causing operational downtime?',
        answer:
          'Yes. We use the incremental Strangler Fig pattern to decouple legacy monolithic modules into cloud-native microservices behind an API gateway. Combined with automated regression test harnesses and blue/green deployments, this guarantees zero downtime during cutover.',
      },
      {
        id: 'software-faq-4',
        category: 'Quality Assurance',
        question:
          'What automated testing, SLA guarantees, and post-launch support are included with custom software delivery?',
        answer:
          'Our engineering workflow enforces a minimum 85% automated test coverage across unit, API integration, and end-to-end Playwright browser suites, accompanied by OpenAPI 3.0 documentation, Prometheus/Grafana observability dashboards, and optional SLA-backed maintenance retainers.',
        actionLink: {
          label: 'Schedule a Software Architecture Call',
          href: '/contact?service=software',
        },
      },
    ],
  },

  'hardware-solutions': {
    serviceKey: 'hardware-solutions',
    badge: 'Hardware & IIoT FAQ',
    heading: 'Embedded Hardware, PCB & Industrial IoT FAQs',
    description:
      'Technical answers regarding microcontroller selection, multi-layer PCB manufacturing deliverables, industrial protocols, and offline resilience.',
    items: [
      {
        id: 'hardware-faq-1',
        category: 'Microcontrollers & RTOS',
        question:
          'Which microcontrollers and real-time operating systems (RTOS) do you support for custom firmware?',
        answer:
          'We develop bare-metal and deterministic RTOS firmware (FreeRTOS, Zephyr, and Embedded Linux) in C, C++, and Rust for STM32 (ARM Cortex-M0/M4/M7), ESP32-S3/C6, NXP i.MX RT, Nordic nRF52/nRF53, and NVIDIA Jetson edge modules.',
      },
      {
        id: 'hardware-faq-2',
        category: 'PCB Design Deliverables',
        question:
          'What manufacturing files and deliverables do we receive after custom PCB layout and prototyping?',
        answer:
          'You receive the complete native Altium Designer or KiCad project archives, schematic capture files, multi-layer Gerber and NC Drill files, pick-and-place (centroid) coordinates, IPC-compliant footprint libraries, thermal/impedance simulation reports, and a cost-optimized Bill of Materials (BOM) with verified distributor part numbers.',
      },
      {
        id: 'hardware-faq-3',
        category: 'Industrial Connectivity',
        question:
          'How do your Industrial IoT gateways handle intermittent connectivity and noisy factory environments?',
        answer:
          'Our hardware incorporates galvanic opto-isolation on RS-485/Modbus and CAN bus lines, hardware watchdog timers, and local flash ring-buffers on the edge gateway. If cellular (4G/NB-IoT), WiFi, or LoRaWAN links drop, telemetry packets are queued locally with timestamps and automatically synchronized over MQTT/TLS 1.3 once connectivity resumes.',
        actionLink: {
          label: 'Inspect IoT Telemetry Case Studies',
          href: '/projects',
        },
      },
      {
        id: 'hardware-faq-4',
        category: 'Prototyping to Production',
        question:
          'Do you assist with SMD assembly, enclosure design, and EMI/EMC pre-compliance testing?',
        answer:
          'Yes. Beyond schematic and PCB layout, we manage rapid SMT/through-hole board bring-up, 3D-printed and IP65/IP67 industrial enclosure integration, power profiling, and EMI/EMC pre-compliance validation to prepare your hardware for volume manufacturing.',
        actionLink: {
          label: 'Inquire About Hardware Prototyping',
          href: '/contact?service=hardware',
        },
      },
    ],
  },

  'ai-solutions': {
    serviceKey: 'ai-solutions',
    badge: 'Applied AI & MLOps FAQ',
    heading: 'Artificial Intelligence, Computer Vision & RAG FAQs',
    description:
      'Answers covering edge inference latency, enterprise RAG data privacy, dataset curation, and predictive maintenance model accuracy.',
    items: [
      {
        id: 'ai-faq-1',
        category: 'Edge Computer Vision',
        question:
          'Can your computer vision defect inspection models run offline on edge hardware without cloud latency?',
        answer:
          'Yes. We prune and quantize custom YOLOv8 and CNN vision architectures into INT8/FP16 engines using NVIDIA TensorRT and ONNX Runtime. Deployed on NVIDIA Jetson or industrial edge PCs with global-shutter cameras, our systems achieve sub-15ms inference latencies entirely on-premises.',
        actionLink: {
          label: 'Explore Our Optical Inspection Case Study',
          href: '/projects/quality-inspection',
        },
      },
      {
        id: 'ai-faq-2',
        category: 'Enterprise RAG & Privacy',
        question:
          'How do you prevent hallucinations and protect proprietary data in Enterprise LLM and RAG deployments?',
        answer:
          'Our Retrieval-Augmented Generation (RAG) pipelines combine hybrid vector + keyword retrieval (pgvector, Pinecone, ChromaDB) with strict semantic guardrails and mandatory source citations. For sensitive workloads, we deploy self-hosted open-weights models inside your private VPC or on-premises GPU servers so proprietary data never leaves your perimeter.',
      },
      {
        id: 'ai-faq-3',
        category: 'Dataset Engineering',
        question:
          'What if our organization has limited labeled training data for a custom AI or predictive maintenance model?',
        answer:
          'We handle the complete data engineering lifecycle—including sensor telemetry sanitization, synthetic data augmentation, active-learning annotation workflows, and transfer learning from domain-pretrained backbones—to achieve high precision and recall even with compact initial datasets.',
      },
      {
        id: 'ai-faq-4',
        category: 'MLOps & Drift Monitoring',
        question:
          'How are machine learning models versioned, monitored, and updated once deployed in production?',
        answer:
          'We package models in reproducible Docker/ONNX containers tracked with DVC and MLflow, exposing real-time Prometheus metrics for inference latency, confidence distributions, and data drift so models can be retrained and rolled out via shadow or canary deployments.',
        actionLink: {
          label: 'Request an AI Feasibility Assessment',
          href: '/contact?service=ai',
        },
      },
    ],
  },

  'research-services': {
    serviceKey: 'research-services',
    badge: 'Scientific R&D FAQ',
    heading: 'Research, Simulation & Technical Documentation FAQs',
    description:
      'Clarifications on simulation environments, reproducibility standards, academic ethics, and publication formatting support.',
    items: [
      {
        id: 'research-faq-1',
        category: 'Simulation & Tooling',
        question:
          'Which scientific simulation environments and mathematical frameworks does your R&D team support?',
        answer:
          'Our research engineers build reproducible simulation testbeds in Python (NumPy, SciPy, PyTorch, scikit-learn), MATLAB/Simulink, NS-3 and OMNeT++ for wireless/network protocols, and C++/CUDA for high-performance numerical and cryptographic benchmarking.',
      },
      {
        id: 'research-faq-2',
        category: 'Reproducibility & Artifacts',
        question:
          'What empirical artifacts and documentation are delivered at the conclusion of an R&D engagement?',
        answer:
          'Every R&D project delivers clean, well-commented source code, synthetic and empirical benchmark datasets, statistical significance and ablation study plots, architecture block diagrams, and publication-ready LaTeX/Overleaf manuscripts formatted for IEEE, ACM, Springer, or Elsevier templates.',
      },
      {
        id: 'research-faq-3',
        category: 'Ethics & Compliance',
        question:
          'How does Sricore Solutions uphold research integrity and ethical standards in academic collaborations?',
        answer:
          'We strictly enforce our Technical Editorial & Quality Policy. We provide legitimate algorithmic engineering, simulation implementation, statistical validation, and LaTeX typesetting mentorship, while strictly prohibiting data fabrication, plagiarism, or contract-cheating practices.',
        actionLink: {
          label: 'Read Our Editorial & Quality Policy',
          href: '/editorial-policy',
        },
      },
      {
        id: 'research-faq-4',
        category: 'PoC & Patent Support',
        question:
          'Can you help translate a theoretical research algorithm into a working hardware or software Proof of Concept (PoC)?',
        answer:
          'Yes. Bridging theory and physical implementation is our core strength. We routinely port mathematical formulations from MATLAB or Python into real-time embedded firmware, FPGA/edge accelerators, or scalable web APIs, and prepare prior-art matrices and claim diagrams for patent filings.',
        actionLink: {
          label: 'Submit a Research Collaboration Enquiry',
          href: '/enquiry',
        },
      },
    ],
  },

  'internship-programs': {
    serviceKey: 'internship-programs',
    badge: 'Internship Cohort FAQ',
    heading: 'Frequently Asked Questions About Engineering Internships',
    description:
      'Essential details regarding cohort durations, university credit validity, evaluation phases, and registration channels.',
    items: [
      {
        id: 'internship-faq-1',
        category: 'Tenure & Format',
        question:
          'How long is the Sricore Solutions internship program, and what formats are available?',
        answer:
          'The standard intensive curriculum spans 1 month (4 weeks), with extended 8-week (2-month) and 12-to-16-week semester capstone tracks available for students requiring longer industrial training tenure for university credit.',
      },
      {
        id: 'internship-faq-2',
        category: 'Academic Credit & Certification',
        question:
          'Is the internship completion certificate valid for university placement and academic credit?',
        answer:
          'Yes. Certificates are issued by Sricore Solutions (an ISO 9001:2015 aligned technology organization) complete with unique verification serial IDs, project titles, and senior engineer sign-offs accepted by engineering colleges and universities.',
      },
      {
        id: 'internship-faq-3',
        category: 'Registration Process',
        question:
          'Can I register through both the website portal and the official Google Form?',
        answer:
          'Both submission channels synchronize directly to our candidate evaluation ledger. You may either register through our web portal or complete the official Google Form, and offer letters are dispatched within 24 to 48 business hours.',
        actionLink: {
          label: 'Apply for an Internship Cohort',
          href: '/internships/apply',
        },
      },
      {
        id: 'internship-faq-4',
        category: 'Deliverables & Mentorship',
        question:
          'What hands-on deliverables and code reviews will I complete during the cohort?',
        answer:
          'Every trainee completes a 4-phase engineering workflow—Foundation & Tooling, Sprint Execution, Senior Engineer Code Review & Auditing, and Final Credentialing—graduating with a verified GitHub or hardware capstone repository and a formal evaluation report.',
      },
    ],
  },
};

export interface FAQSchemaProps {
  /** Predefined engineering service key to pull curated service FAQs */
  serviceKey?: EngineeringServiceKey;
  /** Custom FAQ items (overrides or supplements serviceKey items) */
  items?: FAQSchemaItem[];
  /** Optional canonical path override */
  canonicalPath?: string;
}

/**
 * Builds a Schema.org `FAQPage` JSON-LD object from a list of question/answer items.
 */
export function buildFAQPageJsonLd(
  items: FAQSchemaItem[],
  canonicalUrl: string,
  brandName = 'Sricore Solutions'
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    name: `${brandName} – Frequently Asked Questions`,
    url: canonicalUrl,
    mainEntity: items.map((item, idx) => ({
      '@type': 'Question',
      '@id': `${canonicalUrl}#faq-q-${item.id || idx + 1}`,
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Headless Schema.org `FAQPage` JSON-LD generator component.
 * Injects `<script type="application/ld+json">` into `<head>` via Helmet.
 */
export const FAQSchema: React.FC<FAQSchemaProps> = ({
  serviceKey,
  items,
  canonicalPath,
}) => {
  const location = useLocation();
  const { settings } = useWebsiteSettings();

  const resolvedItems = useMemo(() => {
    if (items && items.length > 0) return items;
    if (serviceKey && SERVICE_FAQ_CATALOG[serviceKey]) {
      return SERVICE_FAQ_CATALOG[serviceKey].items;
    }
    return [];
  }, [items, serviceKey]);

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.sricoresolutions.com';

  const activePath = canonicalPath || location.pathname;

  const normalizedPath =
    !activePath || activePath === '/'
      ? '/'
      : activePath.endsWith('/')
      ? activePath.slice(0, -1)
      : activePath;

  const canonicalUrl = `${origin}${normalizedPath}`;
  const brandName = settings?.brandName || 'Sricore Solutions';

  const jsonLd = useMemo(
    () => buildFAQPageJsonLd(resolvedItems, canonicalUrl, brandName),
    [resolvedItems, canonicalUrl, brandName]
  );

  if (resolvedItems.length === 0) {
    return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export interface ServiceFAQSectionProps {
  serviceKey: EngineeringServiceKey;
  items?: FAQSchemaItem[];
  badge?: string;
  heading?: string;
  description?: string;
  className?: string;
}

/**
 * Renders an accessible, collapsible service-specific FAQ section AND automatically
 * injects the matching Schema.org `FAQPage` JSON-LD markup into `<head>`.
 */
export const ServiceFAQSection: React.FC<ServiceFAQSectionProps> = ({
  serviceKey,
  items,
  badge,
  heading,
  description,
  className = '',
}) => {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const catalogEntry = SERVICE_FAQ_CATALOG[serviceKey];
  const faqItems = items && items.length > 0 ? items : catalogEntry.items;
  const resolvedBadge = badge || catalogEntry.badge;
  const resolvedHeading = heading || catalogEntry.heading;
  const resolvedDescription = description || catalogEntry.description;

  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id || null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-labelledby={`faq-heading-${serviceKey}`}
      className={`py-12 md:py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 ${className}`}
    >
      {/* Inject synchronized Schema.org FAQPage JSON-LD */}
      <FAQSchema serviceKey={serviceKey} items={faqItems} />

      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2">
              <HelpCircle className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span style={{ color: primaryColor }}>{resolvedBadge}</span>
            </div>
            <h2
              id={`faq-heading-${serviceKey}`}
              className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3"
            >
              {resolvedHeading}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {resolvedDescription}
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openId === item.id;
              const triggerId = `${item.id}-trigger`;
              const panelId = `${item.id}-panel`;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors"
                >
                  <h3>
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => handleToggle(item.id)}
                      className="w-full p-5 md:p-6 flex items-start justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors focus:outline-none"
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className="font-mono text-xs font-bold tabular-nums pt-0.5 shrink-0"
                          style={{ color: isOpen ? primaryColor : undefined }}
                        >
                          0{idx + 1}.
                        </span>
                        <div>
                          {item.category && (
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                              {item.category}
                            </span>
                          )}
                          <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {item.question}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 ${
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
                      aria-labelledby={triggerId}
                      className="px-5 md:px-6 pb-5 md:pb-6 pl-12 md:pl-14 border-t border-slate-100 dark:border-slate-800/80 pt-4"
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
      </Container>
    </section>
  );
};

export default FAQSchema;
