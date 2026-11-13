import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { FEATURED_CASE_STUDIES } from '../../data/featuredProjectsSummary';

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
      'Our internship cohorts are structured around hands-on engineering execution rather than passive lectures. Trainees select a specialized track—such as Full-Stack Web Development, Embedded Systems & IoT, Applied AI & Computer Vision, Cloud & DevOps, or Cybersecurity—and build production-grade modules with weekly code and architecture reviews from senior engineers.',
  },
  {
    question:
      'Who is eligible to apply for the internship tracks, and what durations are available?',
    answer:
      'Undergraduate (B.E./B.Tech/B.Sc/BCA) and postgraduate (M.E./M.Tech/MCA/M.Sc) students as well as recent graduates in Computer Science, Electronics, Electrical, Mechatronics, and allied disciplines are eligible. We offer flexible 4-week, 8-week, and 12-to-16-week semester capstone tracks in both hybrid and remote formats.',
  },
  {
    question:
      'What credentials and portfolio outcomes do interns receive upon completing a cohort?',
    answer:
      'Graduating interns receive an ISO-aligned Internship Completion Certificate with a unique verification ID, a detailed project evaluation report, and a documented GitHub/hardware capstone portfolio demonstrating real engineering deliverables to prospective employers.',
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
}

const DEFAULT_KEYWORDS = [
  'Sricore Solutions',
  'Sri core solutions',
  'Enterprise Software Development',
  'Custom Web Application Development',
  'Industrial IoT Solutions',
  'Embedded Systems Engineering',
  'STM32 ESP32 Firmware',
  'PCB Design Services India',
  'AI ML Solutions',
  'Computer Vision Defect Detection',
  'Applied Research and Development',
  'IEEE Scopus Research Support',
  'Engineering Internships Tamil Nadu',
  'IT Consulting Chennai Namakkal',
];

const ROUTE_METADATA_MAP: Record<string, RouteSeoMetadata> = {
  '/': {
    title: 'Sricore Solutions – Software, IoT, AI & Research Experts',
    description:
      'Build scalable enterprise software, industrial IoT hardware, applied AI vision systems, and validated research prototypes with Sricore Solutions.',
    keywords: DEFAULT_KEYWORDS,
    ogType: 'website',
    breadcrumbs: [{ name: 'Home', path: '/' }],
    includeFaqSchema: true,
  },
  '/services': {
    title: 'Engineering & R&D Services | Sricore Solutions',
    description:
      'Explore Sricore Solutions engineering services across custom software, embedded IoT hardware, applied AI/ML, scientific research, and mentored internships.',
    keywords: [
      ...DEFAULT_KEYWORDS,
      'Engineering Services',
      'End-to-End Product Development',
      'Technical Consulting Services',
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ],
    includeFaqSchema: true,
  },
  '/solutions/software': {
    title: 'Custom Enterprise Software Development | Sricore Solutions',
    description:
      'Architect resilient full-stack web apps, cloud microservices, multi-tenant SaaS portals, and high-throughput APIs with Sricore Solutions.',
    keywords: [
      'Custom Software Development',
      'Enterprise Web Applications',
      'React TypeScript Node.js Development',
      'SaaS Architecture',
      'Cloud Microservices',
      'REST GraphQL API Engineering',
      'Sricore Solutions Software',
    ],
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
      'Multi-Layer PCB Design',
      'STM32 ESP32 RTOS Firmware',
      'Modbus MQTT LoRaWAN Gateways',
      'Edge Telemetry Systems',
      'Sricore Solutions Hardware',
    ],
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
      'Industrial Computer Vision',
      'Automated Optical Defect Inspection',
      'Edge AI TensorRT Inference',
      'Custom LLM RAG Pipelines',
      'Predictive Maintenance Analytics',
      'Sricore Solutions AI',
    ],
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
      'Scientific Prototyping',
      'Algorithm Benchmarking',
      'MATLAB Python NS3 Simulation',
      'IEEE Scopus Research Documentation',
      'Industrial R&D Partner India',
      'Sricore Solutions Research',
    ],
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
      'Embedded Systems IoT Internship',
      'AI Machine Learning Internship',
      'Industrial Training Programs Tamil Nadu',
      'ISO Certified Tech Internship',
      'Sricore Solutions Internships',
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Internships', path: '/internships' },
    ],
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
      'Sricore Internship Registration',
      'Student Industrial Training Application',
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Internships', path: '/internships' },
      { name: 'Apply', path: '/internships/apply' },
    ],
  },
  '/projects': {
    title: 'Engineering Case Studies & Portfolio | Sricore Solutions',
    description:
      'Review verified Sricore Solutions engineering case studies across enterprise software, industrial IoT telemetry, and edge AI computer vision deployments.',
    keywords: [
      'Engineering Case Studies',
      'Software Portfolio',
      'Industrial IoT Deployments',
      'Computer Vision Case Study',
      'Sricore Solutions Projects',
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Case Studies', path: '/projects' },
    ],
  },
  '/about': {
    title: 'About Us – Engineering & R&D Partner | Sricore Solutions',
    description:
      'Learn how Sricore Solutions bridges academic research and industrial engineering across custom software, embedded hardware, and applied AI.',
    keywords: [
      'About Sricore Solutions',
      'Technology Partner India',
      'Engineering Leadership',
      'Software Hardware AI Company',
    ],
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
      'Software Engineer Jobs Tamil Nadu',
      'Embedded Systems Jobs',
      'AI Engineer Careers',
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Careers', path: '/careers' },
    ],
  },
  '/contact': {
    title: 'Contact Our Engineering Desk | Sricore Solutions',
    description:
      'Connect with Sricore Solutions architects in Namakkal and Chennai for custom software, industrial IoT, AI solutions, or research collaborations.',
    keywords: [
      'Contact Sricore Solutions',
      'Engineering Consultation',
      'Software IoT AI Quote India',
    ],
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
      'Request Software Quote',
      'IoT Hardware Prototyping Enquiry',
      'AI Project Consultation',
      'Sricore Solutions Enquiry',
    ],
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
    keywords: ['Privacy Policy', 'Data Protection', 'Sricore Solutions Privacy'],
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
    keywords: ['Terms and Conditions', 'Service Agreement', 'Sricore Solutions Terms'],
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
    keywords: ['Editorial Policy', 'Engineering Documentation Standards', 'Sricore Solutions'],
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

export function resolveRouteMetadata(pathname: string): RouteSeoMetadata {
  const normalized = normalizePath(pathname);

  if (ROUTE_METADATA_MAP[normalized]) {
    return ROUTE_METADATA_MAP[normalized];
  }

  // Dynamic Project Case Study Route (/projects/:slug)
  if (normalized.startsWith('/projects/')) {
    const slug = normalized.replace('/projects/', '').trim();
    const matched = FEATURED_CASE_STUDIES.find((p) => p.slug === slug);
    if (matched) {
      const stackKeywords =
        matched.technologyStack?.flatMap((group) => group.items) || [];
      return {
        title: `${matched.title} – Case Study | Sricore Solutions`,
        description:
          matched.summary.length > 158
            ? `${matched.summary.slice(0, 155)}...`
            : matched.summary,
        keywords: [
          matched.title,
          matched.category,
          matched.domain,
          'Sricore Solutions Case Study',
          ...stackKeywords,
        ],
        ogType: 'article',
        ogImage: matched.imageUrl,
        ogImageAlt: `${matched.title} – Sricore Solutions Engineering Case Study`,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Case Studies', path: '/projects' },
          { name: matched.title, path: normalized },
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
        alternateName: ['Sri core solutions', 'Sricore'],
        url: origin,
        logo: {
          '@type': 'ImageObject',
          url: defaultLogoUrl,
        },
        image: socialImage,
        description:
          settings?.brandDescription ||
          'Sricore Solutions is a premier engineering and applied research company specializing in custom enterprise software development, industrial IoT hardware, AI/ML computer vision, and mentored internship cohorts.',
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
          'Full-Stack Web Development',
          'Industrial Internet of Things (IIoT)',
          'Embedded Systems & PCB Layout',
          'Artificial Intelligence & Machine Learning',
          'Computer Vision Quality Inspection',
          'Scientific Research & Simulation Benchmarking',
          'Industrial Engineering Internships',
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
        name: `${brandName} Engineering Portal`,
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
        '@type': 'WebPage',
        '@id': webpageId,
        url: canonicalUrl,
        name: meta.title,
        description: meta.description,
        isPartOf: { '@id': websiteId },
        about: { '@id': orgId },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: meta.breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: `${origin}${crumb.path === '/' ? '/' : crumb.path}`,
        })),
      },
    ];

    if (meta.serviceSchema) {
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
      const matched = FEATURED_CASE_STUDIES.find((p) => p.slug === slug);
      if (matched) {
        graphNodes.push({
          '@type': 'TechArticle',
          '@id': `${canonicalUrl}#article`,
          headline: matched.title,
          description: matched.summary,
          image: matched.imageUrl || socialImage,
          author: { '@id': orgId },
          publisher: { '@id': orgId },
          mainEntityOfPage: { '@id': webpageId },
          about: matched.domain,
          keywords: matched.technologyStack
            ?.flatMap((g) => g.items)
            .join(', '),
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
      <meta name="author" content={brandName} />
      <meta name="publisher" content={brandName} />
      <meta name="application-name" content={brandName} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="bingbot" content={robotsContent} />
      <meta name="format-detection" content="telephone=yes, email=yes, address=yes" />

      {/* Geographic & Local Search Discovery Tags */}
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content="Namakkal, Chennai, Tamil Nadu, India" />
      <meta name="geo.position" content="11.2189;78.1674" />
      <meta name="ICBM" content="11.2189, 78.1674" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="General" />

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
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:secure_url" content={socialImage} />
      <meta property="og:image:alt" content={socialImageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter / X Large Summary Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@sricoresolutions" />
      <meta name="twitter:creator" content="@sricoresolutions" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={socialImage} />
      <meta name="twitter:image:alt" content={socialImageAlt} />

      {/* Comprehensive Schema.org JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredDataGraph)}</script>
    </Helmet>
  );
}

export default MetadataManager;
