import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Cpu,
  BrainCircuit,
  Microscope,
  GraduationCap,
  ArrowUpRight,
} from 'lucide-react';
import { Container } from './ui/Container';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export interface CoreServiceItem {
  id: string;
  index: string;
  offering: 'Software' | 'Hardware' | 'AI' | 'Research' | 'Internships';
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  href: string;
  ctaLabel: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  gridSpanClass: string;
}

export const CORE_SERVICES: CoreServiceItem[] = [
  {
    id: 'software',
    index: '01',
    offering: 'Software',
    title: 'Software Development',
    category: 'Enterprise Web & Cloud Systems',
    description:
      'Production-ready web platforms, distributed microservices, role-based enterprise portals, and secure REST/GraphQL APIs engineered for reliability and long-term maintainability.',
    deliverables: [
      'React, TypeScript & Node.js Architectures',
      'Multi-Tenant SaaS & Enterprise Portals',
      'Cloud Deployment & Automated CI/CD',
    ],
    href: '/solutions/software',
    ctaLabel: 'Explore Software',
    icon: Code2,
    gridSpanClass: 'lg:col-span-2',
  },
  {
    id: 'hardware',
    index: '02',
    offering: 'Hardware',
    title: 'Hardware & Industrial IoT',
    category: 'Embedded Systems & Edge Telemetry',
    description:
      'End-to-end embedded product engineering covering schematic capture, multi-layer PCB layout, real-time RTOS firmware for STM32/ESP32 microcontrollers, and industrial telemetry gateways.',
    deliverables: [
      'Schematic Capture & Multi-Layer PCB Layout',
      'Bare-Metal & FreeRTOS Embedded Firmware',
      'Modbus, LoRaWAN & MQTT Sensor Networks',
    ],
    href: '/solutions/hardware',
    ctaLabel: 'Explore Hardware',
    icon: Cpu,
    gridSpanClass: 'lg:col-span-2',
  },
  {
    id: 'ai',
    index: '03',
    offering: 'AI',
    title: 'AI & Machine Learning',
    category: 'Computer Vision & Applied Models',
    description:
      'Applied machine learning pipelines, automated optical defect inspection systems, domain-grounded RAG architectures, and quantized neural inference models tuned for edge hardware.',
    deliverables: [
      'Real-Time Computer Vision & Defect Inspection',
      'Domain-Grounded LLM & RAG Pipelines',
      'Predictive Maintenance & Time-Series Models',
    ],
    href: '/solutions/ai-ml',
    ctaLabel: 'Explore AI & ML',
    icon: BrainCircuit,
    gridSpanClass: 'lg:col-span-2',
  },
  {
    id: 'research',
    index: '04',
    offering: 'Research',
    title: 'Research & Development',
    category: 'Scientific Prototyping & Validation',
    description:
      'Bridging theoretical innovation and empirical proof through mathematical modeling, comparative algorithm benchmarking, hardware-in-the-loop simulation, and technical manuscripts.',
    deliverables: [
      'Algorithm Design & Empirical Benchmarking',
      'MATLAB, Python & NS-3 Simulation Studies',
      'IEEE / Scopus Manuscript & Patent Drafting',
    ],
    href: '/services/research',
    ctaLabel: 'Explore Research',
    icon: Microscope,
    gridSpanClass: 'lg:col-span-3',
  },
  {
    id: 'internships',
    index: '05',
    offering: 'Internships',
    title: 'Internship & Training Programs',
    category: 'Mentored Industrial Engineering Cohorts',
    description:
      'Structured, hands-on engineering cohorts where undergraduate and postgraduate trainees build commercial software, embedded IoT prototypes, and AI pipelines alongside senior engineers.',
    deliverables: [
      'Live Codebases & Dedicated Hardware Lab Access',
      'One-on-One Senior Engineer Design Reviews',
      'Verified Capstone Portfolio & Certification',
    ],
    href: '/internships',
    ctaLabel: 'Explore Internships',
    icon: GraduationCap,
    gridSpanClass: 'md:col-span-2 lg:col-span-3',
  },
];

export function ServicesSection() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const sectionTitle =
    settings?.services?.heroTitle &&
    settings.services.heroTitle !== 'Cutting-Edge Technical Capabilities'
      ? settings.services.heroTitle
      : 'Core Engineering & Practice Areas';

  const sectionDescription =
    settings?.services?.heroSubtitle ||
    'Sricore Solutions delivers integrated technical execution across five specialized disciplines—software systems, embedded IoT hardware, applied AI, empirical research, and mentored industrial training.';

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="content-visibility-auto py-12 md:py-16 lg:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              <span style={{ color: primaryColor }}>05 Practice Areas</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span>Software, Hardware, AI, Research &amp; Internships</span>
            </div>

            <h2
              id="services-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-3"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              {sectionTitle}
            </h2>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-[66ch]">
              {sectionDescription}
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] md:min-h-[40px] rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <span>View Full Capabilities</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Five Core Service Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 md:gap-6">
          {CORE_SERVICES.map((service) => {
            const IconComponent = service.icon;
            return (
              <article
                key={service.id}
                className={`group relative flex flex-col justify-between rounded-xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 md:p-7 transition-colors duration-200 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 focus-within:ring-2 focus-within:ring-amber-500/40 ${service.gridSpanClass}`}
              >
                <div>
                  {/* Card Top Bar: Icon Frame & Tabular Index */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center shrink-0">
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                      {service.index}
                    </span>
                  </div>

                  {/* Unboxed Category Metadata & Primary Offering Title */}
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <span>{service.offering}</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span className="truncate">{service.category}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2.5">
                    <Link
                      to={service.href}
                      className="focus:outline-none"
                    >
                      <span className="absolute inset-0" aria-hidden="true" />
                      {service.title}
                    </Link>
                  </h3>

                  {/* Outcome-Focused Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                    {service.description}
                  </p>
                </div>

                <div>
                  {/* Clean Editorial Deliverables List */}
                  <ul className="divide-y divide-slate-200/70 dark:divide-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 mb-4">
                    {service.deliverables.map((item, idx) => (
                      <li
                        key={idx}
                        className="py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Action Affordance */}
                  <div
                    className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-colors group-hover:underline"
                    style={{ color: primaryColor }}
                  >
                    <span>{service.ctaLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

export default ServicesSection;
