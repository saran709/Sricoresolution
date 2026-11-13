import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Cpu,
  BrainCircuit,
  Microscope,
  GraduationCap,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Container } from './ui/Container';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export interface CoreServiceItem {
  id: string;
  index: string;
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  href: string;
  ctaLabel: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentClass: string;
  iconBgClass: string;
  gridSpanClass: string;
}

const CORE_SERVICES: CoreServiceItem[] = [
  {
    id: 'software-development',
    index: '01',
    title: 'Software Development',
    category: 'Enterprise Web & Cloud Systems',
    description:
      'Architecting resilient full-stack web platforms, distributed microservices, role-based enterprise portals, and secure REST/GraphQL APIs engineered for high concurrency and long-term maintainability.',
    deliverables: [
      'React, TypeScript & Node.js Architectures',
      'Multi-Tenant SaaS & RBAC Portals',
      'Cloud-Native Deployment & CI/CD Pipelines',
    ],
    href: '/solutions/software',
    ctaLabel: 'Explore Software Solutions',
    icon: Code2,
    accentClass: 'text-blue-600 dark:text-blue-400',
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/60',
    gridSpanClass: 'lg:col-span-2',
  },
  {
    id: 'hardware-iot',
    index: '02',
    title: 'Hardware & Industrial IoT',
    category: 'Embedded Systems & Edge Telemetry',
    description:
      'End-to-end embedded product engineering covering multi-layer PCB layout, real-time RTOS firmware for STM32/ESP32 microcontrollers, and industrial sensor networks over Modbus, LoRaWAN, and MQTT.',
    deliverables: [
      'Schematic Capture & Multi-Layer PCB Design',
      'Bare-Metal & FreeRTOS Embedded Firmware',
      'Industrial Telemetry & Edge Gateways',
    ],
    href: '/solutions/hardware',
    ctaLabel: 'Explore Hardware & IoT',
    icon: Cpu,
    accentClass: 'text-emerald-600 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60',
    gridSpanClass: 'lg:col-span-2',
  },
  {
    id: 'ai-ml',
    index: '03',
    title: 'AI & Machine Learning',
    category: 'Applied Intelligence & Computer Vision',
    description:
      'Designing production-ready machine learning pipelines, automated optical defect inspection systems, domain-grounded RAG architectures, and quantized neural models optimized for edge hardware.',
    deliverables: [
      'Real-Time Computer Vision & Defect Detection',
      'Custom LLM Workflows & RAG Knowledge Engines',
      'Predictive Maintenance & Time-Series Modeling',
    ],
    href: '/solutions/ai-ml',
    ctaLabel: 'Explore AI & ML Solutions',
    icon: BrainCircuit,
    accentClass: 'text-purple-600 dark:text-purple-400',
    iconBgClass: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/60',
    gridSpanClass: 'lg:col-span-2',
  },
  {
    id: 'research-services',
    index: '04',
    title: 'Research & Development Services',
    category: 'Scientific Prototyping & Validation',
    description:
      'Bridging theoretical innovation and empirical proof through mathematical modeling, comparative algorithm benchmarking, simulation design (MATLAB/Python/NS-3), and publication-grade technical manuscripts.',
    deliverables: [
      'Algorithm Design & Empirical Benchmarking',
      'Simulation Environments & Hardware-in-the-Loop',
      'IEEE / Scopus Manuscript & Patent Documentation',
    ],
    href: '/services/research',
    ctaLabel: 'Explore Research Services',
    icon: Microscope,
    accentClass: 'text-amber-600 dark:text-amber-400',
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60',
    gridSpanClass: 'lg:col-span-3',
  },
  {
    id: 'internship-programs',
    index: '05',
    title: 'Internship & Training Programs',
    category: 'Mentored Industrial Engineering Cohorts',
    description:
      'Structured, hands-on engineering cohorts where undergraduate and postgraduate trainees build production-grade software, embedded IoT prototypes, and AI pipelines under senior engineer mentorship.',
    deliverables: [
      'Live Industrial Codebases & Hardware Lab Access',
      '1-on-1 Senior Engineer Code & Design Reviews',
      'Verified Capstone Portfolio & ISO-Aligned Certification',
    ],
    href: '/internships',
    ctaLabel: 'Explore Internship Tracks',
    icon: GraduationCap,
    accentClass: 'text-indigo-600 dark:text-indigo-400',
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800/60',
    gridSpanClass: 'lg:col-span-3',
  },
];

export function ServicesSection() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const sectionTitle =
    settings?.services?.heroTitle || 'Core Engineering & Practice Areas';
  const sectionDescription =
    settings?.services?.heroSubtitle ||
    'Sricore Solutions operates across five integrated technical disciplines—combining commercial software engineering, custom embedded hardware, applied artificial intelligence, empirical research, and structured talent development.';

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="content-visibility-auto py-12 md:py-16 lg:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-10 md:mb-12">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
            <span style={{ color: primaryColor }}>05 Core Practice Areas</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span>End-to-End Execution</span>
          </div>
          <h2
            id="services-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3.5"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {sectionTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {sectionDescription}
          </p>
        </div>

        {/* 5-Card Asymmetric Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 md:gap-6">
          {CORE_SERVICES.map((service) => {
            const IconComponent = service.icon;
            return (
              <article
                key={service.id}
                className={`group relative flex flex-col justify-between rounded-xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 md:p-7 transition-all duration-200 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm ${service.gridSpanClass}`}
              >
                <div>
                  {/* Card Top Bar: Icon & Editorial Index */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div
                      className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${service.iconBgClass}`}
                    >
                      <IconComponent className={`w-5 h-5 ${service.accentClass}`} />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                      {service.index}
                    </span>
                  </div>

                  {/* Category Kicker & Service Title */}
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    {service.category}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2.5">
                    <Link to={service.href} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {service.title}
                    </Link>
                  </h3>

                  {/* Detailed Description */}
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                    {service.description}
                  </p>
                </div>

                <div>
                  {/* Key Technical Deliverables */}
                  <ul className="space-y-2 pt-4 mb-5 border-t border-slate-200/80 dark:border-slate-800">
                    {service.deliverables.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          style={{ color: primaryColor }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Footer */}
                  <div
                    className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors group-hover:underline"
                    style={{ color: primaryColor }}
                  >
                    <span>{service.ctaLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export { ServicesSection as Services };
export default ServicesSection;
