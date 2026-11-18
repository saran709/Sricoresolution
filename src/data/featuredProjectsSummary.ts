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

export interface PublicShowcaseSeoEntry {
  id: string;
  slug: string;
  projectCode: string;
  title: string;
  category: string;
  domain: string;
  summary: string;
  imageUrl: string;
  technologies: string[];
}

/**
 * Complete catalog of all 18 verified public Sricore Solutions showcase projects
 * for SEO meta tags, OpenGraph/Twitter cards, Sitemap, and Schema.org ItemList structured data.
 */
export const PUBLIC_PORTFOLIO_SHOWCASE_CATALOG: PublicShowcaseSeoEntry[] = [
  {
    id: 'quality-inspection',
    slug: 'quality-inspection',
    projectCode: 'SRI-AI-VIS-01',
    title: 'Automated Quality Inspection System',
    category: 'AI/ML & Hardware',
    domain: 'Industrial Automation & Edge Computer Vision',
    summary:
      'Computer vision inspection line using dual 4K global-shutter cameras and NVIDIA Jetson AGX Orin edge AI hardware for real-time 0.05mm PCB defect detection at 140 parts per minute with 99.82% accuracy.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    technologies: ['NVIDIA Jetson AGX Orin', 'TensorRT', 'PyTorch', 'YOLOv8 Custom', 'CUDA 12', 'OpenCV', 'Siemens S7 PLC', 'Modbus TCP', 'React 18', 'TypeScript'],
  },
  {
    id: 'iot-dashboard',
    slug: 'iot-dashboard',
    projectCode: 'SRI-IOT-IND-02',
    title: 'Smart Factory IoT Dashboard',
    category: 'Software & IoT',
    domain: 'Industrial Internet of Things (IIoT) & Predictive Maintenance',
    summary:
      'Centralized industrial monitoring platform aggregating 50,000+ pts/sec telemetry from triaxial vibration, thermal, and current sensors over Modbus and LoRaWAN with sub-second predictive maintenance alerts.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    technologies: ['React 18', 'TypeScript', 'Node.js', 'EMQX MQTT Broker', 'TimescaleDB', 'Redis', 'ESP32', 'Modbus RTU', 'LoRaWAN', 'FreeRTOS'],
  },
  {
    id: 'health-api',
    slug: 'health-api',
    projectCode: 'SRI-MED-API-03',
    title: 'Healthcare Data Management API',
    category: 'Software Solutions',
    domain: 'Digital Health, Interoperability & Medical Data Security',
    summary:
      'HIPAA-aligned high-throughput microservices architecture facilitating seamless HL7 v2 and FHIR R4 clinical patient record synchronization with AES-256 encryption and mTLS 1.3 security.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    technologies: ['Node.js', 'TypeScript', 'Go', 'FHIR R4', 'HL7 v2', 'PostgreSQL 16', 'Redis Cluster', 'AES-256', 'OAuth2 mTLS', 'SMART-on-FHIR'],
  },
  {
    id: 'sri-nexushr',
    slug: 'nexushr-enterprise-hr-intelligence-platform',
    projectCode: 'SRI-PRJ-001',
    title: 'NexusHR — AI-Enabled Enterprise HR & Workforce Intelligence Platform',
    category: 'Enterprise Software & AI',
    domain: 'Enterprise Workforce Governance & HR Intelligence',
    summary:
      'Next-generation workforce intelligence platform combining AI-driven talent requisition matching, automated attendance ledgers, department productivity analytics, and multi-tier role-based access control.',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Firebase Firestore', 'Tailwind CSS'],
  },
  {
    id: 'sri-event-resource-allocation',
    slug: 'event-resource-allocation-management',
    projectCode: 'SRI-PRJ-003',
    title: 'Event Resource Allocation Management System',
    category: 'Enterprise Operations & Logistics',
    domain: 'Facility Scheduling & Asset Conflict Resolution',
    summary:
      'Automated campus and enterprise facility scheduling system preventing double-booking conflicts across conference halls, multimedia equipment, laboratories, and logistics personnel.',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    technologies: ['React', 'TypeScript', 'Firebase Firestore', 'Tailwind CSS', 'Date-fns'],
  },
  {
    id: 'sri-ai-adsorption-efficiency-heavy-metal',
    slug: 'ai-prediction-adsorption-efficiency-heavy-metal-removal',
    projectCode: 'SRI-PRJ-004',
    title: 'AI-Based Prediction of Adsorption Efficiency for Heavy Metal Removal Using Linear Regression',
    category: 'Environmental AI & Chemical Data Science',
    domain: 'Wastewater Treatment Modeling & Chemical Informatics',
    summary:
      'Environmental data science research framework applying multivariate linear regression and Langmuir/Freundlich chemical isotherm modeling to forecast heavy metal removal efficiency in industrial wastewater treatment.',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    technologies: ['Python', 'Scikit-Learn', 'Pandas', 'NumPy', 'Matplotlib', 'Streamlit'],
  },
  {
    id: 'sri-fake-review-detection',
    slug: 'fake-review-detection-system-ml-dl',
    projectCode: 'SRI-PRJ-005',
    title: 'Fake Review Detection System Using ML and DL',
    category: 'Natural Language Processing & Machine Learning',
    domain: 'E-Commerce Trust & Fraudulent Opinion Spam Detection',
    summary:
      'Natural Language Processing and deep learning system that analyzes consumer review texts, linguistic stylometry, and sentiment discrepancies to classify fraudulent opinion spam.',
    imageUrl: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=800&q=80',
    technologies: ['Python', 'TensorFlow', 'Keras', 'NLTK', 'Scikit-Learn', 'FastAPI', 'React'],
  },
  {
    id: 'sri-bioprint-ai',
    slug: 'bioprint-ai-waste-to-material-converter',
    projectCode: 'SRI-PRJ-006',
    title: 'BioPrint AI — Smart Waste-to-Material Converter for 3D Printing',
    category: 'Sustainable Hardware & Additive Manufacturing',
    domain: 'Circular Economy Hardware & Extrusion Control',
    summary:
      'Sustainable additive manufacturing hardware combining thermal plastic shredding, PID-controlled extrusion, and computer vision laser micrometer measurement to convert recyclable plastic waste into precision 1.75mm 3D printing filament.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    technologies: ['Python', 'OpenCV', 'Raspberry Pi', 'Arduino C++', 'PID Controllers', 'React Dashboard'],
  },
  {
    id: 'sri-ecobinx',
    slug: 'ecobinx-smart-ai-dustbin',
    projectCode: 'SRI-PRJ-007',
    title: 'EcoBinX — Smart AI Dustbin',
    category: 'IoT & Computer Vision Waste Management',
    domain: 'Smart City Waste Segregation & Edge Vision',
    summary:
      'IoT-enabled automated waste segregation bin utilizing onboard MobileNet edge computer vision and proximity sensors to classify deposited items into biodegradable, recyclable, and hazardous compartments.',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    technologies: ['Raspberry Pi', 'Edge TPU', 'MobileNet', 'Arduino', 'Ultrasonic Sensors', 'Servo Actuators', 'Firebase Realtime'],
  },
  {
    id: 'sri-low-cost-bioreactor',
    slug: 'low-cost-ai-enabled-3l-bioreactor-iot-process-control',
    projectCode: 'SRI-PRJ-008',
    title: 'Low-Cost AI-Enabled 3-Litre Bioreactor with IoT Multi-Parameter Monitoring & Predictive Process Control',
    category: 'Bio-Process Engineering & Embedded Systems',
    domain: 'Bioprocess Automation & Predictive Fermentation Control',
    summary:
      'Open-hardware 3-litre laboratory bench fermenter featuring continuous ESP32 IoT telemetry for pH, temperature, dissolved oxygen, and optical density coupled with Kalman Filter and LSTM predictive AI feeding regimens.',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    technologies: ['ESP32 Microcontroller', 'Embedded C++', 'Python', 'Kalman Filter', 'LSTM', 'pH & DO ADC Interfaces', 'React Control Panel'],
  },
  {
    id: 'sri-unified-health-env-platform',
    slug: 'unified-health-environmental-risk-prediction-platform',
    projectCode: 'SRI-PRJ-009',
    title: 'Unified Health and Environmental Risk Prediction Platform',
    category: 'HealthTech & Climate Informatics',
    domain: 'Geospatial Epidemiology & Environmental Telemetry',
    summary:
      'Geospatial public health informatics platform cross-correlating localized environmental sensor data (PM2.5, NO2, ozone, temperature) with epidemiological health metrics using XGBoost to forecast clinical risk surges.',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    technologies: ['React', 'TypeScript', 'Python', 'FastAPI', 'XGBoost', 'Leaflet GIS', 'AQI Telemetry APIs'],
  },
  {
    id: 'sri-smart-helmet-detection',
    slug: 'smart-helmet-detection-system',
    projectCode: 'SRI-PRJ-011',
    title: 'Smart Helmet Detection System',
    category: 'Computer Vision & Traffic Safety',
    domain: 'Intelligent Traffic Enforcement & ANPR Vision',
    summary:
      'Automated video analytics pipeline utilizing YOLOv8, PyTorch, and EasyOCR to identify motorcycle riders in CCTV feeds and detect helmet safety non-compliance in real time.',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    technologies: ['Python', 'OpenCV', 'YOLOv8', 'PyTorch', 'EasyOCR', 'Flask'],
  },
  {
    id: 'sri-smart-helmet-alcohol-drowsiness',
    slug: 'smart-helmet-alcohol-drowsiness-detection',
    projectCode: 'SRI-PRJ-012',
    title: 'Smart Helmet with Alcohol and Drowsiness Detection',
    category: 'IoT Wearables & Vehicle Safety',
    domain: 'Embedded Rider Safety & Ignition Interlock Systems',
    summary:
      'Wearable safety helmet equipped with an MQ-3 alcohol breath sensor, infrared eye-blink fatigue sensors, and 433MHz RF wireless relay interlocks preventing motorcycle ignition if the rider is impaired.',
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    technologies: ['Arduino ATmega328P', 'MQ-3 Alcohol Sensor', 'IR Eye-Blink Sensor', '433MHz RF Transceiver', 'Relay Ignition Interlock'],
  },
  {
    id: 'sri-thavam-skin-disease-scanner',
    slug: 'thavam-skin-disease-scanner',
    projectCode: 'SRI-PRJ-013',
    title: 'Thavam — AI Skin Disease Scanner',
    category: 'Mobile Health & Dermatological AI',
    domain: 'Teledermatology & Mobile CNN Diagnostics',
    summary:
      'Mobile and web teledermatology diagnostic application using TensorFlow Lite deep convolutional neural networks to classify dermal lesions and guide primary care patients toward verified specialists.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    technologies: ['Flutter', 'Android', 'Python', 'TensorFlow Lite', 'FastAPI', 'Firebase Firestore'],
  },
  {
    id: 'sri-traffic-signal-communication',
    slug: 'traffic-signal-communication-tsc',
    projectCode: 'SRI-PRJ-014',
    title: 'Traffic Signal Communication (TSC) Emergency Green Corridor',
    category: 'V2X Telematics & Intelligent Transportation',
    domain: 'Vehicle-to-Infrastructure (V2I) Emergency Preemption',
    summary:
      'Vehicle-to-Infrastructure (V2I) Zigbee/RF communication protocol dynamically establishing automated green corridors for approaching emergency ambulances at urban intersections.',
    imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80',
    technologies: ['Microchip PIC', 'Arduino', 'Zigbee RF Modules', 'LED Signal Controller', 'Embedded C'],
  },
  {
    id: 'sri-library-management-system',
    slug: 'library-management-system',
    projectCode: 'SRI-PRJ-015',
    title: 'Institutional Library & Barcode Circulation Management System',
    category: 'Institutional Software & Cataloging',
    domain: 'Academic Resource Cataloging & Barcode Automation',
    summary:
      'Comprehensive web-based institutional library catalog, circulation management, barcode checkout, and automated overdue fine calculation platform.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    technologies: ['PHP', 'MySQL', 'HTML5', 'CSS3', 'JavaScript', 'Barcode Scanner SDK'],
  },
  {
    id: 'sri-world-trivia-website',
    slug: 'world-trivia-website',
    projectCode: 'SRI-PRJ-016',
    title: 'World Trivia Interactive EdTech Platform',
    category: 'Web Applications & Interactive EdTech',
    domain: 'Gamified Learning & Assessment Web Applications',
    summary:
      'Interactive, responsive trivia web platform featuring multi-topic general knowledge quizzes, countdown timers, score multiplier streaks, and real-time progress analytics.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    technologies: ['JavaScript ES6+', 'HTML5', 'CSS3', 'Open Trivia REST API', 'LocalStorage'],
  },
  {
    id: 'sri-auto-water-tap-ir-loadcell',
    slug: 'automatic-water-tap-ir-sensor-load-cell',
    projectCode: 'SRI-PRJ-017',
    title: 'Automatic Water Tap Using IR Sensor and Load Cell',
    category: 'Embedded Systems & Water Conservation',
    domain: 'Smart Dispensing & Gravimetric Flow Control',
    summary:
      'Touchless hygiene water dispensing system utilizing infrared proximity sensing for hand washing combined with an HX711 load cell platform for automated volumetric container filling.',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    technologies: ['Arduino Uno', 'IR Proximity Sensor', 'HX711 Load Cell Amplifier', '12V Solenoid Valve', 'Embedded C'],
  },
];

export interface InternshipSeoEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  technologies: string[];
}

export const INTERNSHIP_SHOWCASE_CATALOG: InternshipSeoEntry[] = [
  {
    id: 'python-programming',
    name: 'Python Programming Internship',
    category: 'Software & Engineering',
    description: '1-Month mentored industrial internship covering Python 3 OOP, data structures, REST API automation, and 2+ live capstone projects.',
    technologies: ['Python 3', 'OOP', 'REST APIs', 'PyTest', 'Automation'],
  },
  {
    id: 'java-programming',
    name: 'Java Programming Internship',
    category: 'Software & Engineering',
    description: '1-Month mentored industrial internship covering Java 17/21 OOP, Collections Framework, Multithreading, and JDBC/MySQL persistence.',
    technologies: ['Java 17/21', 'OOP', 'Collections', 'Multithreading', 'JDBC', 'MySQL'],
  },
  {
    id: 'frontend-development',
    name: 'Frontend Web Development Internship',
    category: 'Software & Engineering',
    description: '1-Month mentored industrial internship in HTML5, CSS3, Tailwind CSS, Modern ES6+ JavaScript, and React component architecture.',
    technologies: ['React.js', 'TypeScript', 'Tailwind CSS', 'HTML5', 'CSS3', 'Vite'],
  },
  {
    id: 'backend-development',
    name: 'Backend & API Engineering Internship',
    category: 'Software & Engineering',
    description: '1-Month mentored industrial internship in Node.js, Express, RESTful API design, JWT authentication, and PostgreSQL/MongoDB.',
    technologies: ['Node.js', 'Express.js', 'REST APIs', 'PostgreSQL', 'MongoDB', 'JWT'],
  },
  {
    id: 'full-stack-web-development',
    name: 'Full Stack Web Development Internship',
    category: 'Software & Engineering',
    description: '1-Month end-to-end full-stack engineering internship connecting React client interfaces with Node.js/Express cloud APIs and databases.',
    technologies: ['React.js', 'Node.js', 'Express', 'Firestore', 'MongoDB', 'Tailwind CSS'],
  },
  {
    id: 'embedded-systems-iot',
    name: 'Embedded Systems & Industrial IoT Internship',
    category: 'Software & Engineering',
    description: '1-Month hands-on embedded firmware and IoT internship covering ESP32/STM32, FreeRTOS, I2C/SPI sensor drivers, and MQTT cloud telemetry.',
    technologies: ['Embedded C/C++', 'ESP32', 'STM32', 'FreeRTOS', 'MQTT', 'IoT Dashboards'],
  },
  {
    id: 'ai-machine-learning',
    name: 'Artificial Intelligence & Machine Learning Internship',
    category: 'Software & Engineering',
    description: '1-Month practical AI/ML internship covering Python, PyTorch, scikit-learn, OpenCV computer vision, and FastAPI model deployment.',
    technologies: ['Python', 'PyTorch', 'scikit-learn', 'OpenCV', 'FastAPI', 'Pandas'],
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Product Design Internship',
    category: 'Design & Creative',
    description: '1-Month product design internship covering user research, wireframing, Figma auto-layout design systems, and interactive prototyping.',
    technologies: ['Figma', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing'],
  },
  {
    id: 'business-and-marketing-strategy',
    name: 'Business & Growth Marketing Strategy Internship',
    category: 'Business & Growth',
    description: '1-Month tech commercialization internship covering market analysis, SEO/SEM funnels, B2B SaaS positioning, and growth analytics.',
    technologies: ['Market Research', 'SEO & SEM', 'Growth Analytics', 'Funnel Optimization'],
  },
];

