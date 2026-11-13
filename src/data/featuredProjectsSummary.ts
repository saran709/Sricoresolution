export interface FeaturedProjectSummary {
  id: string;
  slug: string;
  projectCode: string;
  title: string;
  category: string;
  domain: string;
  type: string;
  clientType: string;
  status: string;
  summary: string;
  imageUrl?: string;
  metrics: {
    label: string;
    value: string;
    sublabel: string;
  }[];
  technologyStack: {
    category: string;
    items: string[];
  }[];
}

/**
 * Lightweight summary catalog for the Home page `FeaturedProjects` section.
 * Keeps `projectMigration.ts` (~53 KB) and full `projectsData.ts` (~26 KB)
 * out of the initial landing bundle until `/projects` or a case study route is opened.
 */
export const FEATURED_CASE_STUDIES: FeaturedProjectSummary[] = [
  {
    id: 'quality-inspection',
    slug: 'quality-inspection',
    projectCode: 'SRI-AI-VIS-01',
    title: 'Automated Quality Inspection System',
    category: 'AI/ML & Hardware',
    domain: 'Industrial Automation & Edge Computer Vision',
    type: 'Hardware + AI/ML',
    clientType: 'Precision Electronics & Assembly Manufacturing',
    status: 'Production Deployed',
    imageUrl:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    summary:
      'A computer vision-based inspection line using high-speed industrial cameras and custom edge AI hardware for real-time defect detection, achieving 99.8% precision at line speeds exceeding 120 parts per minute.',
    metrics: [
      {
        value: '99.82%',
        label: 'Inspection Accuracy',
        sublabel: 'Verified against manual microscopic QA benchmarks',
      },
      {
        value: '11.4 ms',
        label: 'Inference Latency',
        sublabel: 'Average per-unit deep learning classification time',
      },
      {
        value: '140 ppm',
        label: 'Production Throughput',
        sublabel: 'Continuous units inspected per minute',
      },
    ],
    technologyStack: [
      {
        category: 'Edge & AI Inference',
        items: ['NVIDIA Jetson AGX Orin', 'TensorRT', 'PyTorch', 'YOLOv8 Custom', 'CUDA 12', 'OpenCV'],
      },
    ],
  },
  {
    id: 'iot-dashboard',
    slug: 'iot-dashboard',
    projectCode: 'SRI-IOT-IND-02',
    title: 'Smart Factory IoT Dashboard',
    category: 'Software & IoT',
    domain: 'Industrial Internet of Things (IIoT) & Predictive Maintenance',
    type: 'IoT & Cloud Systems',
    clientType: 'Heavy Machinery & Metal Processing Plants',
    status: 'Production Deployed',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    summary:
      'Centralized industrial monitoring platform aggregating telemetry from thousands of multi-axis vibration, thermal, and current sensors with sub-second predictive maintenance alerts.',
    metrics: [
      {
        value: '50k+ pts/s',
        label: 'Telemetry Throughput',
        sublabel: 'Concurrent industrial sensor streams processed',
      },
      {
        value: '3.4 hrs',
        label: 'Avg Advance Anomaly Warning',
        sublabel: 'Predictive alert lead time before thermal shutdown',
      },
      {
        value: '99.98%',
        label: 'Telemetry Delivery Rate',
        sublabel: 'Zero data loss with edge ring-buffer sync',
      },
    ],
    technologyStack: [
      {
        category: 'Web & Dashboard Interface',
        items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Recharts / Chart.js', 'Lucide React', 'Zustand'],
      },
    ],
  },
  {
    id: 'health-api',
    slug: 'health-api',
    projectCode: 'SRI-MED-API-03',
    title: 'Healthcare Data Management API',
    category: 'Software Solutions',
    domain: 'Digital Health, Interoperability & Medical Data Security',
    type: 'Enterprise Software',
    clientType: 'Multi-Specialty Hospital Network & Telehealth Provider',
    status: 'Production Deployed',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    summary:
      'A secure, high-throughput microservices architecture facilitating seamless HL7 v2 and FHIR R4 patient record synchronization across hospital clinical management systems.',
    metrics: [
      {
        value: '< 32 ms',
        label: 'Average API Response',
        sublabel: 'End-to-end encrypted FHIR query latency',
      },
      {
        value: '100%',
        label: 'HIPAA & FHIR R4 Compliant',
        sublabel: 'Audited against official HL7 conformance suites',
      },
      {
        value: '1.2M+',
        label: 'Patient Encounters Synced',
        sublabel: 'Processed across 6 clinical hospital networks',
      },
    ],
    technologyStack: [
      {
        category: 'Core Services & Languages',
        items: ['Node.js', 'TypeScript', 'Go (High-speed HL7 parser)', 'Express', 'FHIR R4 Schemas'],
      },
    ],
  },
  {
    id: 'sri-nexushr',
    slug: 'nexushr-enterprise-hr-intelligence-platform',
    projectCode: 'SRI-PRJ-001',
    title: 'NexusHR — AI-Enabled Enterprise HR & Workforce Intelligence Platform',
    category: 'Enterprise Software & AI',
    domain: 'Enterprise Software & AI',
    type: 'SOFTWARE',
    clientType: 'Sricore Solutions Engineering Research',
    status: 'Active R&D',
    imageUrl:
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    summary:
      'Next-generation workforce intelligence platform combining AI-driven talent requisition matching, automated attendance ledgers, department productivity analytics, and multi-tier role-based access control.',
    metrics: [
      {
        value: '82%',
        label: 'Milestone Progress',
        sublabel: 'Status: in_progress',
      },
      {
        value: 'Verified',
        label: 'Audit Status',
        sublabel: 'Flagship internal product actively serving',
      },
      {
        value: '5+',
        label: 'Key Modules',
        sublabel: 'Integrated functional systems',
      },
    ],
    technologyStack: [
      {
        category: 'Technologies & Frameworks',
        items: ['React', 'TypeScript', 'Node.js', 'Express', 'Firebase Firestore', 'Tailwind CSS', 'Google Gemini API'],
      },
    ],
  },
  {
    id: 'sri-event-resource-allocation',
    slug: 'event-resource-allocation-management',
    projectCode: 'SRI-PRJ-003',
    title: 'Event Resource Allocation Management System',
    category: 'Enterprise Operations & Logistics',
    domain: 'Enterprise Operations & Logistics',
    type: 'SOFTWARE',
    clientType: 'Collegiate / Institutional Innovation',
    status: 'Completed',
    imageUrl:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    summary:
      'Automated campus and enterprise facility scheduling system preventing double-booking conflicts across conference halls, multimedia equipment, laboratories, and logistics personnel.',
    metrics: [
      {
        value: '100%',
        label: 'Milestone Progress',
        sublabel: 'Status: completed',
      },
      {
        value: 'Verified',
        label: 'Audit Status',
        sublabel: 'Institutional internal software created for',
      },
      {
        value: '4+',
        label: 'Key Modules',
        sublabel: 'Integrated functional systems',
      },
    ],
    technologyStack: [
      {
        category: 'Technologies & Frameworks',
        items: ['React', 'TypeScript', 'Firebase Firestore', 'Tailwind CSS', 'Date-fns'],
      },
    ],
  },
  {
    id: 'sri-ai-adsorption-efficiency-heavy-metal',
    slug: 'ai-prediction-adsorption-efficiency-heavy-metal-removal',
    projectCode: 'SRI-PRJ-004',
    title: 'AI-Based Prediction of Adsorption Efficiency for Heavy Metal Removal Using Linear Regression',
    category: 'Environmental AI & Chemical Data Science',
    domain: 'Environmental AI & Chemical Data Science',
    type: 'RESEARCH',
    clientType: 'Collegiate / Institutional Innovation',
    status: 'Completed',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    summary:
      'Environmental data science research framework applying multivariate linear regression and chemical isotherm modeling to forecast heavy metal removal percentages in industrial wastewater treatment.',
    metrics: [
      {
        value: '100%',
        label: 'Milestone Progress',
        sublabel: 'Status: completed',
      },
      {
        value: 'Verified',
        label: 'Audit Status',
        sublabel: 'Academic research project. Validated model',
      },
      {
        value: '4+',
        label: 'Key Modules',
        sublabel: 'Integrated functional systems',
      },
    ],
    technologyStack: [
      {
        category: 'Technologies & Frameworks',
        items: ['Python', 'Scikit-Learn', 'Pandas', 'NumPy', 'Matplotlib', 'Streamlit'],
      },
    ],
  },
];
