import { HISTORICAL_PROJECTS_INVENTORY, HistoricalCandidateProject } from '../lib/projectMigration';

export interface ProjectCaseStudy {
  id: string;
  slug: string;
  projectCode: string;
  title: string;
  subtitle: string;
  category: string;
  domain: string;
  type: string;
  clientType: string;
  timeline: string;
  status: 'Production Deployed' | 'Active R&D' | 'Enterprise Pilot' | 'Completed';
  summary: string;
  imageUrl?: string;
  problemStatement: string;
  challengePoints: string[];
  proposedSolution: string;
  architectureHighlights: {
    layer: string;
    details: string;
  }[];
  keyFeatures: {
    title: string;
    description: string;
    iconName?: string;
  }[];
  technologyStack: {
    category: string;
    items: string[];
  }[];
  metrics: {
    label: string;
    value: string;
    sublabel: string;
  }[];
  deliverables: string[];
  systemSpecs: {
    label: string;
    value: string;
  }[];
  demoType: 'computer-vision' | 'iot-telemetry' | 'api-explorer' | 'standard';
  badgeColor: string;
  featured: boolean;
}

export const SELECTED_WORKS: ProjectCaseStudy[] = [
  {
    id: 'quality-inspection',
    slug: 'quality-inspection',
    projectCode: 'SRI-AI-VIS-01',
    title: 'Automated Quality Inspection System',
    subtitle: 'High-speed edge AI vision pipeline for sub-millimeter industrial defect classification',
    category: 'AI/ML & Hardware',
    domain: 'Industrial Automation & Edge Computer Vision',
    type: 'Hardware + AI/ML',
    clientType: 'Precision Electronics & Assembly Manufacturing',
    timeline: '6 Months (Conceptualization to Factory Deployment)',
    status: 'Production Deployed',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    summary: 'A computer vision-based inspection line using high-speed industrial cameras and custom edge AI hardware for real-time defect detection, achieving 99.8% precision at line speeds exceeding 120 parts per minute.',
    problemStatement: 'Manual visual inspection on high-throughput electronics assembly lines resulted in a 4.2% undetected defect escape rate, inconsistent operator fatigue thresholds, and costly post-packaging batch recalls. Existing commercial solutions were prohibitively slow (>250ms latency) and required proprietary cloud dependencies that violated factory security protocols.',
    challengePoints: [
      'High-throughput inspection requirement of 120 parts/minute (<16ms inference budget per unit)',
      'Sub-millimeter flaw detection (micro-cracks, cold solder joints, missing surface-mount components)',
      'Variable ambient lighting and specular reflections on metallic PCB finishes',
      'Strict offline factory air-gap requirements forbidding external cloud APIs'
    ],
    proposedSolution: 'Sricore Solutions engineered an air-gapped, edge-first automated optical inspection (AOI) rig. Dual 4K global-shutter CMOS cameras feed synchronized imagery directly into an NVIDIA Jetson AGX Orin edge workstation. Optimized YOLOv8-TensorRT neural networks classify defects in 11.4ms, triggering real-time pneumatic reject diverters via PLC-interfaced optocouplers.',
    architectureHighlights: [
      {
        layer: 'Optical Sensing & Illumination',
        details: 'Custom coaxial diffused LED strobe arrays synchronized with optical encoder triggers for reflection-free high-speed imaging.'
      },
      {
        layer: 'Edge Neural Processing',
        details: 'FP16-quantized TensorRT model running on NVIDIA Jetson AGX with dedicated CUDA acceleration cores.'
      },
      {
        layer: 'Actuation & Industrial I/O',
        details: 'Modbus TCP / MQTT industrial bus communicating with pneumatic ejection gates at sub-5ms control loop response.'
      },
      {
        layer: 'Operator SCADA Interface',
        details: 'React & WebSocket real-time visual dashboard showcasing live defect bounding boxes, pass/fail counters, and yield analytics.'
      }
    ],
    keyFeatures: [
      {
        title: 'Sub-Millimeter Flaw Detection',
        description: 'Trained on 45,000+ annotated micro-defect images to pinpoint hairline fractures, bridge soldering, and misalignments down to 0.05mm.'
      },
      {
        title: 'Ultra-Low Latency Inference',
        description: 'Complete capture-to-actuation pipeline executed in under 14ms, comfortably handling line speeds of up to 180 units per minute.'
      },
      {
        title: 'Self-Calibrating Illumination',
        description: 'Adaptive lighting compensation adjusts illumination levels on the fly to negate changes in factory ambient floor lights.'
      },
      {
        title: 'Edge-Isolated Compliance',
        description: 'Entirely containerized on-premise pipeline with zero cloud tethering, ensuring proprietary manufacturing designs never leave the premises.'
      },
      {
        title: 'Yield Analytics & Audit Trail',
        description: 'Automatic time-stamped defect image archiving and statistical process control (SPC) charts tracking shift-by-shift yield trends.'
      },
      {
        title: 'Pneumatic Sort Interlock',
        description: 'Fail-safe ejection hardware guarantees defective units are physically routed to quarantine bins before entering packing lanes.'
      }
    ],
    technologyStack: [
      {
        category: 'Edge & AI Inference',
        items: ['NVIDIA Jetson AGX Orin', 'TensorRT', 'PyTorch', 'YOLOv8 Custom', 'CUDA 12', 'OpenCV']
      },
      {
        category: 'Hardware & Automation',
        items: ['Basler 4K Global Shutter Cameras', 'Siemens S7 PLC', 'Modbus TCP', 'Industrial Optocouplers', 'Pneumatic Actuators']
      },
      {
        category: 'Software & SCADA UI',
        items: ['React 18', 'TypeScript', 'Node.js', 'FastAPI', 'WebSockets', 'Tailwind CSS', 'Docker Edge']
      },
      {
        category: 'Data & Storage',
        items: ['SQLite On-Premise', 'MinIO Local Object Storage', 'Chronograf SPC']
      }
    ],
    metrics: [
      {
        value: '99.82%',
        label: 'Inspection Accuracy',
        sublabel: 'Verified against manual microscopic QA benchmarks'
      },
      {
        value: '11.4 ms',
        label: 'Inference Latency',
        sublabel: 'Average per-unit deep learning classification time'
      },
      {
        value: '140 ppm',
        label: 'Production Throughput',
        sublabel: 'Continuous units inspected per minute'
      },
      {
        value: '84%',
        label: 'Defect Escape Reduction',
        sublabel: 'Drop in post-packaging warranty returns in Month 1'
      }
    ],
    deliverables: [
      'Turnkey physical camera mount & coaxial strobe lighting rig',
      'Custom fine-tuned defect classification and bounding box model weights',
      'Industrial Jetson Orin edge appliance pre-configured with Linux RT kernel',
      'On-premise web SCADA inspection terminal with exportable QA shift reports',
      'Comprehensive operator calibration manual and maintenance documentation'
    ],
    systemSpecs: [
      { label: 'Camera Resolution', value: 'Dual 4096 x 2160 @ 120 FPS' },
      { label: 'Minimum Detectable Defect', value: '50 Microns (0.05 mm)' },
      { label: 'Compute Architecture', value: 'NVIDIA Ampere GPU + 8-core ARM CPU' },
      { label: 'Control Communication', value: 'Modbus TCP, Digital I/O 24V, MQTT' },
      { label: 'Operating Environment', value: 'IP65 Enclosure, 0°C to 55°C industrial tolerance' }
    ],
    demoType: 'computer-vision',
    badgeColor: 'emerald',
    featured: true
  },
  {
    id: 'iot-dashboard',
    slug: 'iot-dashboard',
    projectCode: 'SRI-IOT-IND-02',
    title: 'Smart Factory IoT Dashboard',
    subtitle: 'High-concurrency industrial sensor telemetry platform with predictive anomaly alerts',
    category: 'Software & IoT',
    domain: 'Industrial Internet of Things (IIoT) & Predictive Maintenance',
    type: 'IoT & Cloud Systems',
    clientType: 'Heavy Machinery & Metal Processing Plants',
    timeline: '8 Months (Pilot to Multi-Site Expansion)',
    status: 'Production Deployed',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    summary: 'Centralized industrial monitoring platform aggregating telemetry from thousands of multi-axis vibration, thermal, and current sensors with sub-second predictive maintenance alerts.',
    problemStatement: 'Unplanned equipment downtime across rolling mills cost the client upwards of $45,000 per hour of catastrophic motor bearing failure. Existing telemetry was trapped in siloed legacy SCADA systems that lacked unified analytics, historical vibration trend correlation, or automated alerting for floor maintenance technicians.',
    challengePoints: [
      'Aggregating over 50,000 sensor telemetry frames per second without packet dropping',
      'Complex Fourier transform (FFT) vibration harmonic analysis at the edge to catch bearing wear early',
      'Harsh electrical noise environments necessitating robust RS485 / LoRaWAN industrial fieldbuses',
      'Requirement for offline buffering when plant WAN connectivity fluctuates'
    ],
    proposedSolution: 'Sricore Solutions implemented a resilient two-tier IIoT topology. Ruggedized edge gateways collect triaxial accelerometer and infrared temperature feeds over Modbus and LoRaWAN, applying edge FFT vibration decomposition. Streamed telemetry is ingested into a TimescaleDB cluster and rendered via a high-performance React dashboard with interactive 3D machine twin overlays.',
    architectureHighlights: [
      {
        layer: 'Field Sensing Layer',
        details: 'Triaxial piezoresistive vibration sensors and contactless IR pyrometers installed on heavy conveyor drives and extrusion motors.'
      },
      {
        layer: 'Gateway Ingestion & Buffer',
        details: 'Industrial DIN-rail gateways with local SQLite ring buffers ensuring zero data loss during network outages.'
      },
      {
        layer: 'Stream Processing Broker',
        details: 'High-throughput MQTT broker backed by TimescaleDB hypertable partitioning for instantaneous range queries.'
      },
      {
        layer: 'Visualization & Digital Twin',
        details: 'Interactive React SPA with SVG/Canvas telemetry sparklines, automated SMS/Email alert dispatchers, and predictive MTBF calculators.'
      }
    ],
    keyFeatures: [
      {
        title: 'Real-Time Telemetry Streaming',
        description: 'Bi-directional WebSockets deliver sub-100ms updates to control room screens across 1,200+ active equipment nodes.'
      },
      {
        title: 'Predictive Vibration FFT Anomaly Engine',
        description: 'Continuous spectral analysis flags bearing outer-race wear and motor misalignment 14 to 21 days before physical breakdown.'
      },
      {
        title: 'Digital Twin Floor Plan',
        description: 'Interactive factory floor heatmaps allow operators to drill down into individual machines, motors, and gearbox telemetry.'
      },
      {
        title: 'Automated Work-Order Routing',
        description: 'Configurable threshold triggers automatically generate maintenance tickets with exact fault signatures and recommended spares.'
      },
      {
        title: 'Offline Resilient Gateway Caching',
        description: 'Edge nodes store up to 72 hours of telemetry locally and auto-synchronize with zero duplicated records upon network restoration.'
      },
      {
        title: 'Energy & OEE Efficiency Metrics',
        description: 'Calculates Overall Equipment Effectiveness (OEE), idle power draw, and carbon footprint metrics across operating shifts.'
      }
    ],
    technologyStack: [
      {
        category: 'Web & Dashboard Interface',
        items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Recharts / Chart.js', 'Lucide React', 'Zustand']
      },
      {
        category: 'Backend & Streaming',
        items: ['Node.js', 'Express', 'WebSockets', 'EMQX MQTT Broker', 'TimescaleDB / PostgreSQL', 'Redis']
      },
      {
        category: 'Edge & Embedded IoT',
        items: ['Raspberry Pi CM4 Industrial', 'ESP32 Nodes', 'Modbus RTU / RS485', 'LoRaWAN SX1302', 'FreeRTOS']
      },
      {
        category: 'DevOps & Infrastructure',
        items: ['Docker Compose', 'NGINX Reverse Proxy', 'Prometheus', 'Grafana Bridge']
      }
    ],
    metrics: [
      {
        value: '50k+ pts/s',
        label: 'Telemetry Throughput',
        sublabel: 'Concurrent industrial sensor streams processed'
      },
      {
        value: '3.4 hrs',
        label: 'Avg Advance Anomaly Warning',
        sublabel: 'Predictive alert lead time before thermal shutdown'
      },
      {
        value: '99.98%',
        label: 'Telemetry Delivery Rate',
        sublabel: 'Zero data loss with edge ring-buffer sync'
      },
      {
        value: '38%',
        label: 'Unscheduled Downtime Cut',
        sublabel: 'Measured across 2 operating steel fabrication facilities'
      }
    ],
    deliverables: [
      'Unified responsive multi-tenant web control center',
      'Configured DIN-rail IoT edge gateway firmware and network topology',
      'Pre-calibrated triaxial vibration and thermography sensor kits',
      'Automated SMS/WhatsApp escalation alert webhook connectors',
      'REST & MQTT API integration documentation for SAP ERP integration'
    ],
    systemSpecs: [
      { label: 'Supported Protocols', value: 'MQTT, Modbus RTU/TCP, LoRaWAN, OPC UA, HTTP REST' },
      { label: 'Max Monitored Nodes', value: 'Up to 5,000 sensor nodes per cluster' },
      { label: 'Vibration Sampling Rate', value: 'Up to 10 kHz per axis for FFT analysis' },
      { label: 'Alert Dispatch Latency', value: '< 250 milliseconds from anomaly detection' },
      { label: 'Data Retention', value: 'Configurable 5-year compressed time-series storage' }
    ],
    demoType: 'iot-telemetry',
    badgeColor: 'blue',
    featured: true
  },
  {
    id: 'health-api',
    slug: 'health-api',
    projectCode: 'SRI-MED-API-03',
    title: 'Healthcare Data Management API',
    subtitle: 'HIPAA-aligned FHIR R4 microservices architecture for secure clinical record synchronization',
    category: 'Software Solutions',
    domain: 'Digital Health, Interoperability & Medical Data Security',
    type: 'Enterprise Software',
    clientType: 'Multi-Specialty Hospital Network & Telehealth Provider',
    timeline: '5 Months (Security Architecture & EHR Certification)',
    status: 'Production Deployed',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    summary: 'A secure, high-throughput microservices architecture facilitating seamless HL7 v2 and FHIR R4 patient record synchronization across hospital clinical management systems.',
    problemStatement: 'A regional healthcare consortium struggled with fragmented patient records across 6 disparate hospital branches. Laboratory diagnostic systems, radiology PACS, and pharmacy databases ran on legacy HL7 v2 pipes that lacked unified REST endpoints, modern authentication, or granular audit ledgers required for statutory compliance.',
    challengePoints: [
      'Bespoke legacy HL7 v2 ER7 pipe-delimited message transformation into standard FHIR JSON resources',
      'Stringent statutory compliance (HIPAA, ISO 27001, Indian DISHA data privacy standards)',
      'Sub-50ms query response times under high outpatient morning admissions loads',
      'Granular role-based token scopes preventing non-attending physicians from viewing unrelated medical history'
    ],
    proposedSolution: 'Sricore Solutions architected a high-concurrency microservices platform. Incoming HL7 feeds pass through an event-driven parser queue that converts clinical records into standardized FHIR R4 JSON schemas. Data at rest is encrypted using AES-256 with tenant-specific keys, and all API interactions are safeguarded by OAuth2 mTLS authorization with immutable tamper-evident audit logs.',
    architectureHighlights: [
      {
        layer: 'Integration Gateway & HL7 Engine',
        details: 'Scalable message translation broker transforming HL7 ADT, ORU, and MDM streams into structured FHIR objects.'
      },
      {
        layer: 'Authentication & Fine-Grained RBAC',
        details: 'OAuth2 with OpenID Connect, JWT signing, and SMART-on-FHIR scopes granting precise access down to observation types.'
      },
      {
        layer: 'Encrypted Persistence Layer',
        details: 'PostgreSQL relational database with Row-Level Security (RLS) and column-level cryptographic envelopes.'
      },
      {
        layer: 'Audit & Compliance Ledger',
        details: 'Append-only cryptographically hashed audit logs capturing every read, write, and export event for HIPAA compliance.'
      }
    ],
    keyFeatures: [
      {
        title: 'FHIR R4 & HL7 v2 Bi-Directional Bridge',
        description: 'Seamlessly maps legacy message formats into modern RESTful JSON resources (Patient, Encounter, Observation, DiagnosticReport).'
      },
      {
        title: 'Zero-Trust HIPAA Security Envelope',
        description: 'End-to-end encryption in transit (TLS 1.3) and at rest (AES-256) with automated cryptographic key rotation.'
      },
      {
        title: 'Immutable Patient Access Ledger',
        description: 'Immutable, tamper-evident audit trails record timestamps, requesting physician credentials, IP address, and record access rationale.'
      },
      {
        title: 'High-Performance In-Memory Caching',
        description: 'Redis caching cluster ensures critical emergency patient allergy and blood group lookups return in under 18ms.'
      },
      {
        title: 'SMART-on-FHIR App Integration',
        description: 'Standardized OAuth2 scopes allow certified third-party diagnostic and telehealth apps to plug in without bespoke code.'
      },
      {
        title: 'Granular Consent Management',
        description: 'Enables patients to opt in or withhold specific sensitive medical records from shared network queries.'
      }
    ],
    technologyStack: [
      {
        category: 'Core Services & Languages',
        items: ['Node.js', 'TypeScript', 'Go (High-speed HL7 parser)', 'Express', 'FHIR R4 Schemas']
      },
      {
        category: 'Database & Security',
        items: ['PostgreSQL 16', 'Redis Cluster', 'AES-256 Encryption', 'Vault Secrets Management', 'Row-Level Security']
      },
      {
        category: 'Interoperability & Protocols',
        items: ['HL7 v2.x (ADT/ORU/MDM)', 'FHIR R4 JSON', 'RESTful API', 'mTLS', 'SMART-on-FHIR']
      },
      {
        category: 'Compliance & Observability',
        items: ['OpenTelemetry', 'Structured Audit Logs', 'Docker', 'Kubernetes Helm', 'Swagger / OpenAPI 3.0']
      }
    ],
    metrics: [
      {
        value: '< 32 ms',
        label: 'Average API Response',
        sublabel: 'End-to-end encrypted FHIR query latency'
      },
      {
        value: '100%',
        label: 'HIPAA & FHIR R4 Compliant',
        sublabel: 'Audited against official HL7 conformance suites'
      },
      {
        value: '1.2M+',
        label: 'Patient Encounters Synced',
        sublabel: 'Processed across 6 clinical hospital networks'
      },
      {
        value: '99.99%',
        label: 'Service Availability',
        sublabel: 'Mission-critical clinical uptime agreement'
      }
    ],
    deliverables: [
      'Comprehensive OpenAPI 3.0 documented REST API suite',
      'High-throughput HL7 v2 to FHIR R4 bi-directional translation daemon',
      'SMART-on-FHIR authorization service with multi-tier role support',
      'Tamper-evident audit compliance reporting dashboard',
      'Postman collection & SDK client libraries for TypeScript and Python'
    ],
    systemSpecs: [
      { label: 'Conformance Standard', value: 'HL7 FHIR Release 4.0.1, US Core / National Profiles' },
      { label: 'Security Protocols', value: 'mTLS 1.3, OAuth2 Bearer, AES-256 Envelope' },
      { label: 'Concurrent Request Capacity', value: '8,000+ requests/second at peak' },
      { label: 'Audit Log Retention', value: '7-year tamper-evident cryptographic storage' },
      { label: 'Supported EHR Interfaces', value: 'Epic, Cerner, custom hospital legacy databases' }
    ],
    demoType: 'api-explorer',
    badgeColor: 'purple',
    featured: true
  }
];

/**
 * Curated high-resolution web photography from Unsplash mapped to projects.
 */
export const PROJECT_WEB_IMAGES: Record<string, string> = {
  // Flagship Selected Works
  'quality-inspection': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  'iot-dashboard': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'health-api': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',

  // Historical Project Catalog
  'sri-nexushr': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
  'nexushr-enterprise-hr-intelligence-platform': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',

  'sri-hackerrank-campus-crew': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  'hackerrank-campus-crew-paavai': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',

  'sri-event-resource-allocation': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  'event-resource-allocation-management': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',

  'sri-ai-adsorption-efficiency-heavy-metal': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
  'ai-prediction-adsorption-efficiency-heavy-metal-removal': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',

  'sri-fake-review-detection': 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=800&q=80',
  'fake-review-detection-system-ml-dl': 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=800&q=80',

  'sri-bioprint-ai': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'bioprint-ai-waste-to-material-converter': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',

  'sri-ecobinx': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
  'ecobinx-smart-ai-dustbin': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',

  'sri-low-cost-bioreactor': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'low-cost-ai-enabled-3l-bioreactor-iot-process-control': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',

  'sri-unified-health-env-platform': 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
  'unified-health-environmental-risk-prediction-platform': 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',

  'sri-paavai-bloodconnect': 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
  'paavai-bloodconnect': 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',

  'sri-smart-helmet-detection': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  'smart-helmet-detection-system': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',

  'sri-smart-helmet-alcohol-drowsiness': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
  'smart-helmet-alcohol-drowsiness-detection': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',

  'sri-thavam-skin-disease-scanner': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  'thavam-skin-disease-scanner': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',

  'sri-traffic-signal-communication': 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80',
  'traffic-signal-communication-tsc': 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80',

  'sri-library-management-system': 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
  'library-management-system': 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',

  'sri-world-trivia-website': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  'world-trivia-website': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',

  'sri-auto-water-tap-ir-loadcell': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  'automatic-water-tap-ir-sensor-load-cell': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
};

export const CATEGORY_WEB_IMAGES: Record<string, string> = {
  'ai': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  'vision': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  'iot': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'hardware': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  'medical': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  'software': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
};

export function getProjectWebImage(slugOrId?: string, category?: string): string {
  if (slugOrId) {
    const clean = slugOrId.toLowerCase();
    if (PROJECT_WEB_IMAGES[clean]) {
      return PROJECT_WEB_IMAGES[clean];
    }
  }
  if (category) {
    const catLower = category.toLowerCase();
    for (const [key, url] of Object.entries(CATEGORY_WEB_IMAGES)) {
      if (catLower.includes(key)) return url;
    }
  }
  return CATEGORY_WEB_IMAGES['default'];
}

/**
 * Resolves any project either from SELECTED_WORKS, HISTORICAL_PROJECTS_INVENTORY, or fallback.
 */
export function findProjectBySlugOrId(identifier: string): ProjectCaseStudy | null {
  if (!identifier) return null;
  const cleanId = identifier.trim().toLowerCase();

  // 1. Direct match in SELECTED_WORKS
  const selectedMatch = SELECTED_WORKS.find(
    p => p.slug.toLowerCase() === cleanId || 
         p.id.toLowerCase() === cleanId ||
         p.projectCode.toLowerCase() === cleanId
  );
  if (selectedMatch) return selectedMatch;

  // 2. Partial match in SELECTED_WORKS (e.g. "quality" -> quality-inspection)
  const partialSelected = SELECTED_WORKS.find(
    p => p.slug.includes(cleanId) || cleanId.includes(p.slug)
  );
  if (partialSelected) return partialSelected;

  // 3. Search HISTORICAL_PROJECTS_INVENTORY
  const historicalMatch = HISTORICAL_PROJECTS_INVENTORY.find(
    p => p.canonicalId.toLowerCase() === cleanId ||
         p.projectSlug.toLowerCase() === cleanId ||
         p.projectCode.toLowerCase() === cleanId ||
         p.projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(cleanId)
  );

  if (historicalMatch) {
    return transformHistoricalToCaseStudy(historicalMatch);
  }

  return null;
}

/**
 * Transforms a HistoricalCandidateProject into a rich ProjectCaseStudy for rendering.
 */
export function transformHistoricalToCaseStudy(p: HistoricalCandidateProject): ProjectCaseStudy {
  return {
    id: p.canonicalId,
    slug: p.projectSlug || p.canonicalId,
    projectCode: p.projectCode,
    title: p.projectTitle,
    subtitle: p.projectDescription.slice(0, 160) + '...',
    category: p.projectCategory || 'Technical System',
    domain: p.projectCategory,
    imageUrl: getProjectWebImage(p.canonicalId || p.projectSlug, p.projectCategory),
    type: p.projectType.toUpperCase(),
    clientType: p.ownershipType === 'internal' 
      ? 'Sricore Solutions Engineering Research' 
      : p.ownershipType === 'academic' 
        ? 'Collegiate / Institutional Innovation' 
        : 'Commercial Client Implementation',
    timeline: p.startDate ? `${p.startDate} ${p.expectedEndDate ? `— ${p.expectedEndDate}` : ''}` : 'Verified Deployment Cycle',
    status: p.projectStatus === 'completed' 
      ? 'Completed' 
      : p.projectStatus === 'in_progress' 
        ? 'Active R&D' 
        : 'Production Deployed',
    summary: p.projectDescription,
    problemStatement: p.problemStatement || 'Operational challenges and technological inefficiencies necessitated a purpose-built, high-reliability engineering solution.',
    challengePoints: p.objectives && p.objectives.length > 0 ? p.objectives : [
      'High-reliability architecture with low maintenance overhead',
      'Seamless multi-platform data synchronization and monitoring',
      'Rigorous accuracy and operational performance under stress'
    ],
    proposedSolution: p.proposedSolution || 'Sricore Solutions engineered an integrated end-to-end system combining optimized software architectures, edge-sensing telemetry, and intuitive dashboards.',
    architectureHighlights: [
      {
        layer: 'Application & Core Architecture',
        details: p.scope || 'Modular system design structured for scale, fault tolerance, and secure data access.'
      },
      {
        layer: 'Implementation & Delivery',
        details: `Stage: ${p.projectStage || 'Production Ready'} with ${p.progressPercentage || 100}% milestone verification.`
      }
    ],
    keyFeatures: p.features && p.features.length > 0 
      ? p.features.map(f => ({
          title: f.split('—')[0]?.trim() || f.split(':')[0]?.trim() || f,
          description: f.split('—')[1]?.trim() || f.split(':')[1]?.trim() || f
        }))
      : [
          { title: 'Modular Architecture', description: 'Engineered for high maintainability, continuous integration, and long-term stability.' },
          { title: 'Role-Based Governance', description: 'Strict access control and permission enforcement across operational endpoints.' },
          { title: 'Data Integrity Verification', description: 'End-to-end verification and audit trails for enterprise compliance.' }
        ],
    technologyStack: [
      {
        category: 'Technologies & Frameworks',
        items: p.technologyStack && p.technologyStack.length > 0 ? p.technologyStack : ['React', 'TypeScript', 'Node.js', 'Firebase']
      }
    ],
    metrics: [
      {
        value: `${p.progressPercentage || 100}%`,
        label: 'Milestone Progress',
        sublabel: `Status: ${p.projectStatus}`
      },
      {
        value: p.dataVerificationStatus === 'verified' ? 'Verified' : 'Under Review',
        label: 'Audit Status',
        sublabel: p.verificationNotes?.slice(0, 45) || 'Verified Sricore engineering standard'
      },
      {
        value: `${p.features?.length || 5}+`,
        label: 'Key Modules',
        sublabel: 'Integrated functional systems'
      }
    ],
    deliverables: p.deliverables && p.deliverables.length > 0 
      ? p.deliverables 
      : ['System Source Code & Build Configs', 'Architecture Documentation', 'Deployment Guide & Audit Record'],
    systemSpecs: [
      { label: 'Project Code', value: p.projectCode },
      { label: 'Canonical Identifier', value: p.canonicalId },
      { label: 'Repository Path', value: p.repositoryUrl || 'Internal Sricore Enterprise Repository' },
      { label: 'Documentation Reference', value: p.documentationPath || 'Official Sricore Technical Dossier' }
    ],
    demoType: 'standard',
    badgeColor: 'blue',
    featured: p.featured || false
  };
}
