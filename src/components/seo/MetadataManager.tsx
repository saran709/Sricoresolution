import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import {
  FEATURED_CASE_STUDIES,
  PUBLIC_PORTFOLIO_SHOWCASE_CATALOG,
  INTERNSHIP_SHOWCASE_CATALOG,
} from '../../data/featuredProjectsSummary';
import { resolveEngineeringServiceSchemaByPath } from './ServiceSchema';
import { resolveBreadcrumbsForPath } from '../ui/Breadcrumbs';

const FAQ_SCHEMA_ITEMS = [
  {
    question:
      'What types of software, hardware, and AI engineering projects does Sricore Solutions deliver?',
    answer:
      'We deliver end-to-end engineering systems across four technical tracks: (1) Enterprise web applications, SaaS platforms, and REST/GraphQL APIs built with React, TypeScript, and Node.js; (2) Custom multi-layer PCB design, STM32/ESP32 firmware, and industrial Modbus/LoRaWAN/MQTT telemetry gateways; (3) Computer vision quality inspection, predictive maintenance models, and domain-specific LLM/RAG pipelines; and (4) Scientific simulation, algorithm benchmarking, and technical documentation.',
  },
  {
    question:
      'How do intellectual property (IP) ownership, source code handover, and NDAs work for client projects?',
    answer:
      'Every commercial and research engagement begins with a mutual Non-Disclosure Agreement (NDA). Upon project completion and milestone sign-off, 100% of the custom source code, Gerber/schematic files, trained model weights, and system architecture documentation are transferred to your organization with no vendor lock-in.',
  },
  {
    question:
      'Can Sricore Solutions handle combined hardware-plus-software products from prototype to production?',
    answer:
      'Yes. Our cross-functional teams co-design embedded hardware and cloud software under one roof. We handle sensor interfacing, schematic capture, PCB layout, RTOS firmware, secure MQTT/WebSocket ingestion, and real-time React monitoring dashboards so your hardware and cloud layers work together seamlessly.',
  },
  {
    question:
      'What level of validation and documentation is included in your Research & Development services?',
    answer:
      'Our R&D division provides mathematical formulation, reproducible simulation environments (Python, MATLAB, NS-3, PyTorch), comparative baseline benchmarking, ablation studies, and publication-grade technical manuscripts formatted for IEEE, Springer, Elsevier, and Scopus-indexed venues.',
  },
  {
    question:
      'How are Sricore Solutions internship and industrial training programs structured?',
    answer:
      'Our internship cohorts are structured around hands-on engineering execution rather than passive lectures. Trainees select a specialized track—such as Full-Stack Web Development, Embedded Systems & IoT, Applied AI & Computer Vision, Python, Java, UI/UX Design, or Business Strategy—and build production-grade modules with weekly code and architecture reviews from senior engineers.',
  },
  {
    question:
      'Who is eligible to apply for the internship tracks, and what durations are available?',
    answer:
      'Undergraduate (B.E./B.Tech/B.Sc/BCA) and postgraduate (M.E./M.Tech/MCA/M.Sc/MBA) students as well as recent graduates in Computer Science, Electronics, Electrical, Mechatronics, and allied disciplines are eligible. We offer 1-month intensive industrial cohorts as well as 8-to-16-week semester capstone tracks.',
  },
  {
    question:
      'What credentials and portfolio outcomes do interns receive upon completing a cohort?',
    answer:
      'Graduating interns receive an ISO 9001:2015-aligned Internship Completion Certificate with a unique verification ID, a performance-based Letter of Recommendation (LOR), and a documented GitHub/hardware capstone portfolio demonstrating 2+ real engineering deliverables.',
  },
  {
    question:
      'How quickly can we initiate a new technical discovery call or project quote?',
    answer:
      'Once you submit your technical requirements through our Enquiry or Contact portal, a lead systems architect reviews your brief and responds within 24 business hours with a preliminary feasibility assessment, proposed architecture roadmap, and milestone estimate.',
  },
];

export interface RouteSeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  subject?: string;
  category?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  breadcrumbs: { name: string; path: string }[];
  serviceSchema?: {
    name: string;
    serviceType: string;
    category: string;
    description: string;
    deliverables: string[];
  };
  includeFaqSchema?: boolean;
  includeShowcaseCatalogSchema?: boolean;
  includeInternshipCatalogSchema?: boolean;
}

const SHOWCASE_PROJECT_KEYWORDS = PUBLIC_PORTFOLIO_SHOWCASE_CATALOG.flatMap((p) => [
  p.title,
  p.category,
  p.projectCode,
]);

const INTERNSHIP_TRACK_KEYWORDS = INTERNSHIP_SHOWCASE_CATALOG.map((i) => i.name);

const DEFAULT_KEYWORDS = [
  'Sricore Solutions',
  'Sri core solutions',
  'Sricore Solutions Pvt Ltd',
  'Enterprise Software Development',
  'Custom Web Application Development',
  'React TypeScript Node.js Development',
  'Industrial IoT Solutions',
  'IIoT Predictive Maintenance Dashboard',
  'Embedded Systems Engineering',
  'STM32 ESP32 FreeRTOS Firmware',
  'Multi-Layer PCB Design Services India',
  'AI ML Solutions',
  'Computer Vision Defect Detection YOLOv8 TensorRT',
  'Enterprise RAG & LLM Pipelines',
  'Applied Research and Development Services',
  'IEEE Scopus Springer Research Support',
  'MATLAB Python NS-3 Simulation Benchmarking',
  'Automated Quality Inspection System',
  'Smart Factory IoT Dashboard',
  'Healthcare Data Management FHIR R4 HL7 API',
  'NexusHR Workforce Intelligence Platform',
  'BioPrint AI 3D Printing Filament Extruder',
  'EcoBinX Smart AI Dustbin',
  'AI-Enabled 3L Bioreactor IoT Process Control',
  'Thavam AI Skin Disease Scanner',
  'Smart Helmet Detection & Ignition Interlock',
  'Traffic Signal Communication V2X Green Corridor',
  'Engineering Internships Tamil Nadu India',
  'IT & R&D Consulting Namakkal Chennai',
];

const ROUTE_METADATA_MAP: Record<string, RouteSeoMetadata> = {
  '/': {
    title: 'Sricore Solutions – Software, IoT, AI & Research Experts',
    description:
      'Build scalable enterprise software, industrial IoT hardware, applied AI vision systems, and validated research prototypes with Sricore Solutions.',
    keywords: [
      ...DEFAULT_KEYWORDS,
      ...SHOWCASE_PROJECT_KEYWORDS.slice(0, 18),
      ...INTERNSHIP_TRACK_KEYWORDS,
    ],
    subject:
      'Enterprise Software Development, Industrial IoT & Embedded Hardware, Applied AI/ML Computer Vision, Scientific R&D, and Mentored Engineering Internships',
    category: 'Technology, Software Engineering, Industrial IoT, Artificial Intelligence & R&D',
    ogType: 'website',
    breadcrumbs: [{ name: 'Home', path: '/' }],
    includeFaqSchema: true,
    includeShowcaseCatalogSchema: true,
    includeInternshipCatalogSchema: true,
  },
  '/services': {
    title: 'Engineering & R&D Services | Sricore Solutions',
    description:
      'Explore Sricore Solutions engineering services across custom software, embedded IoT hardware, applied AI/ML, scientific research, and mentored internships.',
    keywords: [
      ...DEFAULT_KEYWORDS,
      'Engineering Services India',
      'End-to-End Product Development',
      'Technical Consulting Services',
      'Custom SaaS & Microservices Architecture',
      'Altium KiCad PCB Prototyping',
      'Edge AI TensorRT Deployment',
    ],
    subject: 'Full-Lifecycle Software, Embedded Hardware, AI/ML & Scientific R&D Services',
    category: 'Engineering & Technology Consulting Services',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ],
    includeFaqSchema: true,
    includeShowcaseCatalogSchema: true,
  },
  '/solutions/software': {
    title: 'Custom Enterprise Software Development | Sricore Solutions',
    description:
      'Architect resilient full-stack web apps, cloud microservices, multi-tenant SaaS portals, and high-throughput APIs with Sricore Solutions.',
    keywords: [
      'Custom Software Development',
      'Enterprise Web Applications',
      'React 19 TypeScript Node.js Development',
      'Multi-Tenant SaaS Architecture',
      'Cloud Microservices Docker Kubernetes',
      'REST GraphQL gRPC API Engineering',
      'Healthcare FHIR R4 HL7 API Development',
      'NexusHR Enterprise HR Platform',
      'Event Resource Allocation Software',
      'Legacy Monolith Modernization',
      'Zero-Trust RBAC Security Auditing',
      'Sricore Solutions Software',
    ],
    subject: 'Custom Enterprise Web, Cloud Microservices, API & Mobile Software Engineering',
    category: 'Software Engineering & Cloud Architecture',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Software Development', path: '/solutions/software' },
    ],
    serviceSchema: {
      name: 'Custom Enterprise Software Development',
      serviceType: 'Enterprise Web, Cloud & API Software Engineering',
      category: 'Software Engineering',
      description:
        'Full-lifecycle architecture and development of scalable React/TypeScript web applications, Node.js microservices, role-based enterprise portals, and secure cloud APIs.',
      deliverables: [
        'React, TypeScript & Node.js Full-Stack Architectures',
        'Multi-Tenant SaaS & Role-Based Access Control (RBAC) Portals',
        'High-Throughput REST & GraphQL APIs with Cloud CI/CD',
      ],
    },
  },
  '/solutions/hardware': {
    title: 'Hardware & Industrial IoT Solutions | Sricore Solutions',
    description:
      'Design multi-layer PCBs, real-time STM32/ESP32 firmware, and Modbus/LoRaWAN/MQTT industrial IoT telemetry systems with Sricore Solutions.',
    keywords: [
      'Industrial IoT Solutions',
      'Embedded Hardware Engineering',
      'Multi-Layer PCB Design Altium KiCad',
      'STM32 ESP32 FreeRTOS Zephyr Firmware',
      'Modbus RTU TCP MQTT LoRaWAN Gateways',
      'Smart Factory IoT Telemetry Dashboard',
      'AI-Enabled 3L Bioreactor IoT Control',
      'BioPrint AI Extruder Hardware',
      'Smart Helmet Alcohol Drowsiness Ignition Interlock',
      'Traffic Signal V2X RF Communication',
      'Automatic Water Tap IR Load Cell Controller',
      'Sricore Solutions Hardware',
    ],
    subject: 'Embedded Systems, Multi-Layer PCB Layout, RTOS Firmware & Industrial IoT Gateways',
    category: 'Hardware Engineering & Industrial IoT (IIoT)',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Hardware & Industrial IoT', path: '/solutions/hardware' },
    ],
    serviceSchema: {
      name: 'Hardware & Industrial IoT Engineering',
      serviceType: 'Embedded Systems, PCB Layout & Edge IoT Telemetry',
      category: 'Hardware & IoT Engineering',
      description:
        'End-to-end embedded product engineering covering schematic capture, multi-layer PCB layout, FreeRTOS/bare-metal firmware for STM32 and ESP32, and industrial sensor telemetry networks.',
      deliverables: [
        'Schematic Capture & Multi-Layer PCB Layout',
        'Bare-Metal & FreeRTOS Embedded Firmware',
        'Modbus, LoRaWAN & MQTT Industrial Edge Gateways',
      ],
    },
  },
  '/solutions/ai-ml': {
    title: 'Applied AI, ML & Computer Vision | Sricore Solutions',
    description:
      'Deploy real-time computer vision inspection, predictive maintenance models, custom RAG workflows, and edge AI inference with Sricore Solutions.',
    keywords: [
      'AI and Machine Learning Services',
      'Industrial Computer Vision YOLOv8 OpenCV',
      'Automated Optical Defect Inspection System',
      'Edge AI NVIDIA Jetson TensorRT Inference',
      'Custom LLM & Enterprise RAG Pipelines',
      'Predictive Maintenance LSTM XGBoost Analytics',
      'Fake Review Detection NLP Deep Learning',
      'EcoBinX Smart AI Waste Segregation Vision',
      'Thavam AI Skin Disease CNN Scanner',
      'Smart Helmet CCTV Detection YOLOv8',
      'Heavy Metal Adsorption Linear Regression AI',
      'Sricore Solutions AI',
    ],
    subject: 'Applied Artificial Intelligence, Edge Computer Vision, Predictive Analytics & RAG Systems',
    category: 'Artificial Intelligence & Machine Learning',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'AI & Machine Learning', path: '/solutions/ai-ml' },
    ],
    serviceSchema: {
      name: 'Applied Artificial Intelligence & Machine Learning Solutions',
      serviceType: 'Computer Vision, Edge AI & Custom LLM/RAG Systems',
      category: 'Artificial Intelligence',
      description:
        'Design and deployment of automated optical defect inspection lines, quantized edge neural networks, predictive maintenance models, and domain-grounded RAG architectures.',
      deliverables: [
        'Real-Time Computer Vision & Defect Detection',
        'Custom LLM Workflows & RAG Knowledge Engines',
        'Predictive Maintenance & Time-Series Forecasting',
      ],
    },
  },
  '/services/research': {
    title: 'Scientific R&D & Prototyping Services | Sricore Solutions',
    description:
      'Accelerate R&D with mathematical modeling, algorithm benchmarking, MATLAB/Python simulation, and IEEE/Scopus manuscript support from Sricore Solutions.',
    keywords: [
      'Research and Development Services',
      'Scientific Proof of Concept Prototyping',
      'Algorithm Design & Complexity Benchmarking',
      'MATLAB Python SciPy PyTorch NS-3 Simulation',
      'IEEE ACM Springer Elsevier Scopus Manuscript Support',
      'LaTeX Overleaf Technical Documentation',
      'Patent Prior Art & Claim Drafting',
      'Heavy Metal Adsorption Isotherm Modeling',
      'Bioreactor Kalman Filter LSTM Process Control',
      'Environmental & Epidemiological Risk Prediction',
      'Sricore Solutions Research',
    ],
    subject: 'Scientific R&D, Mathematical Modeling, Simulation Benchmarking & Technical Documentation',
    category: 'Scientific Research & Development (R&D)',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Research & Development', path: '/services/research' },
    ],
    serviceSchema: {
      name: 'Scientific Research & Development (R&D) Services',
      serviceType: 'Mathematical Modeling, Simulation & Empirical Benchmarking',
      category: 'Research & Development',
      description:
        'Bridging theoretical innovation and empirical validation through algorithm design, reproducible simulation environments, hardware-in-the-loop testing, and technical manuscript preparation.',
      deliverables: [
        'Algorithm Formulation & Comparative Benchmarking',
        'MATLAB, Python, PyTorch & NS-3 Simulation Environments',
        'Publication-Grade Technical Manuscripts & Patent Dossiers',
      ],
    },
  },
  '/internships': {
    title: 'Engineering Internships & Training | Sricore Solutions',
    description:
      'Join Sricore Solutions mentored internship cohorts in Full-Stack Software, Embedded IoT, Applied AI, and Cloud Engineering with live project experience.',
    keywords: [
      'Engineering Internships India',
      'Full Stack Web Development Internship',
      'Embedded Systems & IoT Engineering Internship',
      'Artificial Intelligence & Machine Learning Internship',
      'Python Programming Internship',
      'Java Programming Internship',
      'Frontend React Development Internship',
      'Backend Node.js API Internship',
      'UI UX Figma Design Internship',
      'Business & Marketing Strategy Internship',
      '1 Month Industrial Training Certificate Tamil Nadu',
      'ISO 9001:2015 Certified Tech Internship',
      'Sricore Solutions Internships',
    ],
    subject: 'Mentored Industrial Engineering Internships & Live Capstone Training Cohorts',
    category: 'Technical Education, Industrial Training & Engineering Internships',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Internships', path: '/internships' },
    ],
    includeInternshipCatalogSchema: true,
    serviceSchema: {
      name: 'Industrial Engineering Internship & Training Programs',
      serviceType: 'Mentored Technical Cohorts & Capstone Training',
      category: 'Technical Education & Training',
      description:
        'Hands-on engineering cohorts where undergraduate and postgraduate trainees build production software, embedded IoT hardware, and AI pipelines under senior engineer mentorship.',
      deliverables: [
        'Live Industrial Codebases & Hardware Lab Access',
        'Weekly 1-on-1 Senior Engineer Architecture Reviews',
        'Verified Capstone Portfolio & ISO-Aligned Certification',
      ],
    },
  },
  '/internships/apply': {
    title: 'Apply for Engineering Internships | Sricore Solutions',
    description:
      'Submit your application for Sricore Solutions hands-on engineering internships in Software Development, IoT, Embedded Systems, and AI/ML.',
    keywords: [
      'Apply Engineering Internship',
      'Sricore Internship Registration Portal',
      'Student Industrial Training Application',
      ...INTERNSHIP_TRACK_KEYWORDS,
    ],
    subject: 'Online Registration for Sricore Solutions Engineering Internship Cohorts',
    category: 'Engineering Internship Registration',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Internships', path: '/internships' },
      { name: 'Apply', path: '/internships/apply' },
    ],
    includeInternshipCatalogSchema: true,
  },
  '/projects': {
    title: 'Engineering Case Studies & Portfolio | Sricore Solutions',
    description:
      'Review verified Sricore Solutions engineering case studies across enterprise software, industrial IoT telemetry, and edge AI computer vision deployments.',
    keywords: [
      'Engineering Case Studies',
      'Sricore Solutions Project Portfolio',
      'Software & AI Showcase',
      'Industrial IoT Deployments',
      'Computer Vision Defect Detection Case Study',
      ...SHOWCASE_PROJECT_KEYWORDS,
    ],
    subject:
      'Verified Production Case Studies & R&D Prototypes in Software, Industrial IoT, Embedded Hardware, and AI/ML',
    category: 'Engineering Portfolio & Technical Case Studies',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Case Studies', path: '/projects' },
    ],
    includeShowcaseCatalogSchema: true,
  },
  '/about': {
    title: 'About Us – Engineering & R&D Partner | Sricore Solutions',
    description:
      'Learn how Sricore Solutions bridges academic research and industrial engineering across custom software, embedded hardware, and applied AI.',
    keywords: [
      'About Sricore Solutions',
      'Sri core solutions Company Profile',
      'Technology & R&D Partner India',
      'Engineering Leadership Namakkal Chennai',
      'Software Hardware AI Company Tamil Nadu',
    ],
    subject: 'About Sricore Solutions Pvt Ltd – Multidisciplinary Engineering & R&D Organization',
    category: 'Corporate Profile & Engineering Governance',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' },
    ],
  },
  '/careers': {
    title: 'Careers & Engineering Opportunities | Sricore Solutions',
    description:
      'Build your career at Sricore Solutions. Explore open engineering roles, research fellowships, and mentored industrial internship cohorts.',
    keywords: [
      'Sricore Solutions Careers',
      'Full-Stack Software Engineer Jobs Tamil Nadu',
      'Embedded Systems & IoT Engineer Jobs',
      'AI ML Computer Vision Engineer Careers',
      ...INTERNSHIP_TRACK_KEYWORDS,
    ],
    subject: 'Full-Time Engineering Careers & Mentored Industrial Internships at Sricore Solutions',
    category: 'Technology Careers & Recruitment',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Careers', path: '/careers' },
    ],
    includeInternshipCatalogSchema: true,
  },
  '/contact': {
    title: 'Contact Our Engineering Desk | Sricore Solutions',
    description:
      'Connect with Sricore Solutions architects in Namakkal and Chennai for custom software, industrial IoT, AI solutions, or research collaborations.',
    keywords: [
      'Contact Sricore Solutions',
      'Engineering Consultation India',
      'Software IoT AI Quote Namakkal Chennai',
      'Technical Discovery Call',
    ],
    subject: 'Contact Sricore Solutions Engineering & R&D Desk',
    category: 'Customer Support & Technical Consultation',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ],
  },
  '/enquiry': {
    title: 'Request a Custom Project Quote | Sricore Solutions',
    description:
      'Submit your technical requirements to Sricore Solutions and receive a feasibility assessment and architecture proposal within 24 hours.',
    keywords: [
      'Request Custom Software Quote',
      'IoT Hardware Prototyping Enquiry',
      'AI & Computer Vision Project Consultation',
      'R&D Simulation Proposal',
      'Sricore Solutions Enquiry',
    ],
    subject: 'Custom Engineering Project Quote & Architecture Feasibility Request',
    category: 'Project Proposal & Technical Enquiry',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Project Enquiry', path: '/enquiry' },
    ],
  },
  '/privacy': {
    title: 'Privacy Policy & Data Protection | Sricore Solutions',
    description:
      'Read Sricore Solutions privacy policy detailing how we safeguard client intellectual property, personal data, and session security.',
    keywords: ['Privacy Policy', 'Data Protection', 'NDA & IP Security', 'Sricore Solutions Privacy'],
    subject: 'Data Privacy, Security & Intellectual Property Protection Policy',
    category: 'Legal & Compliance',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy' },
    ],
  },
  '/terms': {
    title: 'Terms & Conditions of Service | Sricore Solutions',
    description:
      'Review the terms and conditions governing Sricore Solutions commercial software, hardware engineering, research services, and training cohorts.',
    keywords: ['Terms and Conditions', 'Master Service Agreement', 'Sricore Solutions Terms'],
    subject: 'Terms and Conditions of Service & Intellectual Property Assignment',
    category: 'Legal & Compliance',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms & Conditions', path: '/terms' },
    ],
  },
  '/editorial-policy': {
    title: 'Technical Editorial & Quality Policy | Sricore Solutions',
    description:
      'Examine Sricore Solutions editorial standards, peer-review workflow, and empirical verification practices for published case studies and documentation.',
    keywords: [
      'Editorial Policy',
      'Engineering Documentation Standards',
      'Peer Review & Verification',
      'Sricore Solutions',
    ],
    subject: 'Technical Editorial Standards, Architecture Peer Review & Empirical Verification Policy',
    category: 'Editorial Governance & Quality Assurance',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Editorial Policy', path: '/editorial-policy' },
    ],
  },
};

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const cleaned = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (cleaned === '/career') return '/careers';
  return cleaned;
}

function isPrivateOrAuthPath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/setup' ||
    pathname === '/forgot-password' ||
    pathname === '/unauthorized'
  );
}

function findShowcaseEntry(slugOrId: string) {
  const clean = slugOrId.trim().toLowerCase();
  return (
    PUBLIC_PORTFOLIO_SHOWCASE_CATALOG.find(
      (p) =>
        p.slug.toLowerCase() === clean ||
        p.id.toLowerCase() === clean ||
        p.projectCode.toLowerCase() === clean
    ) ||
    PUBLIC_PORTFOLIO_SHOWCASE_CATALOG.find(
      (p) => p.slug.includes(clean) || clean.includes(p.slug)
    )
  );
}

export function resolveRouteMetadata(pathname: string): RouteSeoMetadata {
  const normalized = normalizePath(pathname);

  if (ROUTE_METADATA_MAP[normalized]) {
    return ROUTE_METADATA_MAP[normalized];
  }

  // Dynamic Project Case Study Route (/projects/:slug) across all 18 showcase projects
  if (normalized.startsWith('/projects/')) {
    const slug = normalized.replace('/projects/', '').trim();
    const matched = findShowcaseEntry(slug);
    if (matched) {
      const conciseTitle =
        matched.title.length > 44
          ? `${matched.title.split('—')[0].trim()} | Sricore Solutions`
          : `${matched.title} – Case Study | Sricore Solutions`;
      return {
        title: conciseTitle,
        description:
          matched.summary.length > 158
            ? `${matched.summary.slice(0, 155)}...`
            : matched.summary,
        keywords: [
          matched.title,
          matched.projectCode,
          matched.category,
          matched.domain,
          'Sricore Solutions Case Study',
          'Engineering Architecture Blueprint',
          ...matched.technologies,
        ],
        subject: `${matched.title} (${matched.projectCode}) – ${matched.domain}`,
        category: matched.category,
        ogType: 'article',
        ogImage: matched.imageUrl,
        ogImageAlt: `${matched.title} – Sricore Solutions Engineering Case Study`,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Case Studies', path: '/projects' },
          { name: matched.title, path: `/projects/${matched.slug}` },
        ],
      };
    }

    const formattedSlug = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return {
      title: `${formattedSlug} – Engineering Case Study | Sricore Solutions`,
      description:
        'Explore full architecture specifications, technical stack benchmarks, and deployment metrics for this Sricore Solutions engineering case study.',
      keywords: [formattedSlug, 'Engineering Case Study', ...DEFAULT_KEYWORDS],
      subject: `${formattedSlug} – Sricore Solutions Engineering Case Study`,
      category: 'Engineering Case Study',
      ogType: 'article',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Case Studies', path: '/projects' },
        { name: formattedSlug, path: normalized },
      ],
    };
  }

  // Private or Authentication Routes (noindex, nofollow)
  if (isPrivateOrAuthPath(normalized)) {
    const titleLabel = normalized.startsWith('/admin')
      ? 'Admin Management Console | Sricore Solutions'
      : normalized.startsWith('/dashboard')
        ? 'Engineering Workspace Portal | Sricore Solutions'
        : 'Workspace Authentication | Sricore Solutions';

    return {
      title: titleLabel,
      description:
        'Secure role-based engineering workspace and project management portal for Sricore Solutions clients, staff, mentors, and interns.',
      keywords: ['Sricore Solutions Portal', 'Engineering Workspace'],
      subject: 'Sricore Solutions Internal Operations Workspace',
      category: 'Enterprise Portal',
      ogType: 'website',
      noIndex: true,
      breadcrumbs: [{ name: 'Home', path: '/' }],
    };
  }

  return ROUTE_METADATA_MAP['/'];
}

export function MetadataManager() {
  const location = useLocation();
  const { settings } = useWebsiteSettings();

  const normalizedPath = normalizePath(location.pathname);
  const meta = useMemo(() => resolveRouteMetadata(normalizedPath), [normalizedPath]);

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.sricoresolutions.com';

  const canonicalUrl = `${origin}${normalizedPath === '/' ? '/' : normalizedPath}`;
  const brandName = settings?.brandName || 'Sricore Solutions';
  const contactEmail = settings?.contact?.primaryEmail || 'contact@sricoresolutions.com';
  const contactPhone = settings?.contact?.primaryPhone || '+91-98402-34567';
  const addressText =
    settings?.contact?.address || 'Namakkal - 637018 & Chennai, Tamil Nadu, India';

  const defaultOgImage = `${origin}/og-image.jpg`;
  const defaultLogoUrl = settings?.logoUrl?.startsWith('http')
    ? settings.logoUrl
    : `${origin}${settings?.logoUrl || '/logo.png'}`;

  const socialImage = meta.ogImage || defaultOgImage;
  const socialImageAlt =
    meta.ogImageAlt ||
    `${brandName} – Enterprise Software, Industrial IoT, AI/ML & Research Services`;

  const robotsContent = meta.noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  const subjectContent =
    meta.subject ||
    'Enterprise Software Development, Hardware & Industrial IoT, Applied AI/ML, Scientific R&D & Engineering Internships';
  const categoryContent =
    meta.category ||
    'Technology Solutions, Software Engineering, Industrial IoT, Artificial Intelligence & Research';

  const structuredDataGraph = useMemo(() => {
    const orgId = `${origin}/#organization`;
    const websiteId = `${origin}/#website`;
    const webAppId = `${origin}/#webapplication`;
    const catalogId = `${origin}/#service-catalog`;
    const webpageId = `${canonicalUrl}#webpage`;

    const sameAsLinks = [
      settings?.socials?.linkedin || 'https://www.linkedin.com/company/sricore-solutions',
      settings?.socials?.twitter || 'https://twitter.com/sricoresolutions',
      settings?.socials?.github || 'https://github.com/sricore-solutions',
      settings?.socials?.instagram,
      settings?.socials?.youtube,
    ].filter(Boolean);

    const coreServicesList = [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${origin}/solutions/software#service`,
          name: 'Custom Enterprise Software Development',
          serviceType: 'Enterprise Web, Cloud & API Software Engineering',
          category: 'Software Development',
          url: `${origin}/solutions/software`,
          provider: { '@id': orgId },
          areaServed: ['IN', 'US', 'GB', 'AE', 'SG'],
          description:
            'Full-stack React, TypeScript, and Node.js web platforms, distributed cloud microservices, multi-tenant SaaS portals, and secure REST/GraphQL APIs.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${origin}/solutions/hardware#service`,
          name: 'Hardware & Industrial IoT Engineering',
          serviceType: 'Embedded Systems, Multi-Layer PCB Design & Edge Telemetry',
          category: 'Hardware & IoT',
          url: `${origin}/solutions/hardware`,
          provider: { '@id': orgId },
          areaServed: ['IN', 'US', 'GB', 'AE', 'SG'],
          description:
            'Custom schematic capture, multi-layer PCB layout, real-time STM32/ESP32 firmware, and industrial sensor networks over Modbus, LoRaWAN, and MQTT.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${origin}/solutions/ai-ml#service`,
          name: 'Applied AI, Machine Learning & Computer Vision',
          serviceType: 'Computer Vision Defect Inspection, Edge AI & Custom RAG Systems',
          category: 'Artificial Intelligence',
          url: `${origin}/solutions/ai-ml`,
          provider: { '@id': orgId },
          areaServed: ['IN', 'US', 'GB', 'AE', 'SG'],
          description:
            'Production-ready machine learning pipelines, automated optical defect inspection systems, domain-grounded LLM/RAG architectures, and quantized edge inference.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${origin}/services/research#service`,
          name: 'Scientific Research & Development (R&D) Services',
          serviceType: 'Mathematical Modeling, Algorithm Benchmarking & Simulation',
          category: 'Research & Development',
          url: `${origin}/services/research`,
          provider: { '@id': orgId },
          areaServed: ['IN', 'US', 'GB', 'AE', 'SG'],
          description:
            'Mathematical modeling, comparative algorithm benchmarking, reproducible simulation environments (MATLAB/Python/NS-3), and IEEE/Scopus technical documentation.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${origin}/internships#service`,
          name: 'Industrial Engineering Internship & Training Programs',
          serviceType: 'Mentored Software, IoT, Embedded & AI Training Cohorts',
          category: 'Technical Training & Internships',
          url: `${origin}/internships`,
          provider: { '@id': orgId },
          areaServed: 'IN',
          description:
            'Hands-on industrial engineering cohorts with 1-on-1 senior engineer code reviews, live project execution, and ISO-aligned completion certification.',
        },
      },
    ];

    const graphNodes: Record<string, unknown>[] = [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': orgId,
        name: brandName,
        legalName: 'Sricore Solutions Pvt Ltd',
        alternateName: ['Sri core solutions', 'Sricore', 'Sricore Engineering & R&D'],
        url: origin,
        logo: {
          '@type': 'ImageObject',
          url: defaultLogoUrl,
        },
        image: socialImage,
        description:
          settings?.brandDescription ||
          'Sricore Solutions is a premier engineering and applied research company specializing in custom enterprise software development, industrial IoT hardware, AI/ML computer vision, scientific R&D, and mentored internship cohorts.',
        email: contactEmail,
        telephone: contactPhone,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: addressText,
          addressLocality: 'Namakkal & Chennai',
          postalCode: '637018',
          addressRegion: 'Tamil Nadu',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 11.2189,
          longitude: 78.1674,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '18:30',
          },
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: contactPhone,
            contactType: 'customer service',
            email: contactEmail,
            areaServed: ['IN', 'US', 'GB', 'AE', 'SG'],
            availableLanguage: ['English', 'Tamil'],
          },
          {
            '@type': 'ContactPoint',
            telephone: contactPhone,
            contactType: 'technical support',
            email: settings?.contact?.supportEmail || 'support@sricoresolutions.com',
            areaServed: 'IN',
            availableLanguage: ['English', 'Tamil'],
          },
        ],
        knowsAbout: [
          'Enterprise Software Architecture',
          'Full-Stack React, TypeScript & Node.js Development',
          'Industrial Internet of Things (IIoT) & Edge Gateways',
          'Embedded Systems, STM32/ESP32 Firmware & Multi-Layer PCB Layout',
          'Artificial Intelligence, Machine Learning & Deep Learning',
          'Computer Vision Automated Optical Inspection (YOLOv8 / TensorRT)',
          'Retrieval-Augmented Generation (RAG) & Custom LLM Pipelines',
          'HL7 v2 & FHIR R4 Healthcare Interoperability APIs',
          'Scientific Research, MATLAB/Python/NS-3 Simulation & IEEE/Scopus Documentation',
          'Industrial Engineering Internships & Technical Mentorship',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          '@id': catalogId,
          name: 'Sricore Solutions Engineering & R&D Services',
          itemListElement: coreServicesList,
        },
        sameAs: sameAsLinks,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: origin,
        name: brandName,
        alternateName: 'Sri core solutions',
        publisher: { '@id': orgId },
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${origin}/projects?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': webAppId,
        name: `${brandName} Engineering & R&D Portal`,
        url: origin,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript and modern HTML5 browser',
        provider: { '@id': orgId },
        description: meta.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      },
      {
        '@type': normalizedPath === '/projects' ? ['WebPage', 'CollectionPage'] : 'WebPage',
        '@id': webpageId,
        url: canonicalUrl,
        name: meta.title,
        description: meta.description,
        keywords: meta.keywords.join(', '),
        isPartOf: { '@id': websiteId },
        about: { '@id': orgId },
        ...(resolveEngineeringServiceSchemaByPath(normalizedPath)
          ? { mainEntity: { '@id': `${canonicalUrl}#engineering-service` } }
          : normalizedPath === '/projects'
            ? { mainEntity: { '@id': `${origin}/#project-showcase-catalog` } }
            : {}),
        inLanguage: 'en-IN',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: resolveBreadcrumbsForPath(normalizedPath).map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: `${origin}${crumb.path === '/' ? '/' : crumb.path}`,
        })),
      },
    ];

    if (meta.serviceSchema && !resolveEngineeringServiceSchemaByPath(normalizedPath)) {
      graphNodes.push({
        '@type': 'Service',
        '@id': `${canonicalUrl}#featured-service`,
        name: meta.serviceSchema.name,
        serviceType: meta.serviceSchema.serviceType,
        category: meta.serviceSchema.category,
        description: meta.serviceSchema.description,
        url: canonicalUrl,
        provider: { '@id': orgId },
        areaServed: ['IN', 'US', 'GB', 'AE', 'SG'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${meta.serviceSchema.name} Deliverables`,
          itemListElement: meta.serviceSchema.deliverables.map((item) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: item,
            },
          })),
        },
      });
    }

    // Emit the full 18-project showcase ItemList on Home, Projects, and Services pages
    if (meta.includeShowcaseCatalogSchema) {
      graphNodes.push({
        '@type': 'ItemList',
        '@id': `${origin}/#project-showcase-catalog`,
        name: 'Sricore Solutions Verified Engineering Case Studies & Project Showcase',
        description:
          'Complete portfolio of production software platforms, industrial IoT telemetry systems, embedded hardware prototypes, and applied AI/ML case studies engineered by Sricore Solutions.',
        numberOfItems: PUBLIC_PORTFOLIO_SHOWCASE_CATALOG.length,
        itemListElement: PUBLIC_PORTFOLIO_SHOWCASE_CATALOG.map((proj, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${origin}/projects/${proj.slug}`,
          item: {
            '@type': 'TechArticle',
            '@id': `${origin}/projects/${proj.slug}#case-study`,
            headline: proj.title,
            name: proj.title,
            identifier: proj.projectCode,
            articleSection: proj.category,
            about: proj.domain,
            description: proj.summary,
            image: proj.imageUrl,
            url: `${origin}/projects/${proj.slug}`,
            author: { '@id': orgId },
            publisher: { '@id': orgId },
            keywords: proj.technologies.join(', '),
          },
        })),
      });
    }

    // Emit the full 9-track Internship & Industrial Training ItemList on Home, Internships, and Careers pages
    if (meta.includeInternshipCatalogSchema) {
      graphNodes.push({
        '@type': 'ItemList',
        '@id': `${origin}/#internship-programs-catalog`,
        name: 'Sricore Solutions Mentored Engineering Internship & Industrial Training Tracks',
        description:
          'Official 1-month and semester capstone industrial internship tracks across Software, Full-Stack Web, Embedded Systems & IoT, Artificial Intelligence & ML, UI/UX Design, and Business Strategy.',
        numberOfItems: INTERNSHIP_SHOWCASE_CATALOG.length,
        itemListElement: INTERNSHIP_SHOWCASE_CATALOG.map((track, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${origin}/internships#${track.id}`,
          item: {
            '@type': 'Course',
            '@id': `${origin}/internships#${track.id}`,
            name: track.name,
            courseCode: track.id.toUpperCase(),
            description: track.description,
            provider: { '@id': orgId },
            educationalCredentialAwarded:
              'ISO 9001:2015 Aligned Internship Completion Certificate & Performance LOR',
            teaches: track.technologies,
            hasCourseInstance: {
              '@type': 'CourseInstance',
              courseMode: ['online', 'blended'],
              courseWorkload: 'P1M',
            },
          },
        })),
      });
    }

    if (meta.includeFaqSchema && FAQ_SCHEMA_ITEMS.length > 0) {
      graphNodes.push({
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    if (normalizedPath.startsWith('/projects/')) {
      const slug = normalizedPath.replace('/projects/', '').trim();
      const matched =
        findShowcaseEntry(slug) ||
        FEATURED_CASE_STUDIES.find((p) => p.slug === slug);
      if (matched) {
        const keywordsList =
          'technologies' in matched
            ? matched.technologies
            : matched.technologyStack?.flatMap((g) => g.items) || [];
        graphNodes.push({
          '@type': ['TechArticle', 'CreativeWork'],
          '@id': `${canonicalUrl}#article`,
          headline: matched.title,
          name: matched.title,
          identifier: matched.projectCode,
          articleSection: matched.category,
          description: matched.summary,
          image: matched.imageUrl || socialImage,
          author: { '@id': orgId },
          publisher: { '@id': orgId },
          mainEntityOfPage: { '@id': webpageId },
          about: matched.domain,
          keywords: keywordsList.join(', '),
        });
      }
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graphNodes,
    };
  }, [
    addressText,
    brandName,
    canonicalUrl,
    contactEmail,
    contactPhone,
    defaultLogoUrl,
    meta,
    normalizedPath,
    origin,
    settings?.brandDescription,
    settings?.contact?.supportEmail,
    settings?.socials?.github,
    settings?.socials?.instagram,
    settings?.socials?.linkedin,
    settings?.socials?.twitter,
    settings?.socials?.youtube,
    socialImage,
  ]);

  return (
    <Helmet prioritizeSeoTags>
      {/* Primary Search Engine Meta Tags */}
      <title>{meta.title}</title>
      <meta name="title" content={meta.title} />
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords.join(', ')} />
      <meta name="subject" content={subjectContent} />
      <meta name="topic" content={subjectContent} />
      <meta name="summary" content={meta.description} />
      <meta name="Classification" content={categoryContent} />
      <meta name="category" content={categoryContent} />
      <meta name="author" content={brandName} />
      <meta name="publisher" content={brandName} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${brandName} Pvt Ltd`} />
      <meta name="application-name" content={brandName} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="bingbot" content={robotsContent} />
      <meta name="slurp" content={robotsContent} />
      <meta name="duckduckbot" content={robotsContent} />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      <meta name="format-detection" content="telephone=yes, email=yes, address=yes" />

      {/* Geographic & Local Search Discovery Tags */}
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content="Namakkal, Chennai, Tamil Nadu, India" />
      <meta name="geo.position" content="11.2189;78.1674" />
      <meta name="ICBM" content="11.2189, 78.1674" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="3 days" />
      <meta name="rating" content="General" />

      {/* Dublin Core Academic & R&D Indexing Meta Tags */}
      <meta name="DC.title" content={meta.title} />
      <meta name="DC.description" content={meta.description} />
      <meta name="DC.subject" content={subjectContent} />
      <meta name="DC.creator" content={brandName} />
      <meta name="DC.publisher" content={brandName} />
      <meta name="DC.type" content={meta.ogType === 'article' ? 'Text.Article' : 'InteractiveResource'} />
      <meta name="DC.language" content="en-IN" />
      <meta name="DC.coverage" content="Namakkal, Chennai, Tamil Nadu, India & Global" />

      {/* Canonical & Language Alternates */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en-in" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph / Facebook / LinkedIn / WhatsApp / Slack Rich Cards */}
      <meta property="og:type" content={meta.ogType || 'website'} />
      <meta property="og:site_name" content={brandName} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="en_GB" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:secure_url" content={socialImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={socialImageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {meta.ogType === 'article' && (
        <>
          <meta property="article:publisher" content={origin} />
          <meta property="article:section" content={categoryContent} />
          {meta.keywords.slice(0, 6).map((kw) => (
            <meta key={kw} property="article:tag" content={kw} />
          ))}
        </>
      )}

      {/* Twitter / X Large Summary Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@sricoresolutions" />
      <meta name="twitter:creator" content="@sricoresolutions" />
      <meta name="twitter:domain" content="sricoresolutions.com" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={socialImage} />
      <meta name="twitter:image:alt" content={socialImageAlt} />
      <meta name="twitter:label1" content="Practice Areas" />
      <meta name="twitter:data1" content="Software, Industrial IoT, AI/ML & R&D" />
      <meta name="twitter:label2" content="Headquarters" />
      <meta name="twitter:data2" content="Namakkal & Chennai, Tamil Nadu, India" />

      {/* Comprehensive Schema.org JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredDataGraph)}</script>
    </Helmet>
  );
}

export default MetadataManager;
