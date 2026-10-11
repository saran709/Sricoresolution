import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, ProjectType, ProjectOwnershipType, ProjectStatus, DataVerificationStatus } from '../types';

export interface HistoricalCandidateProject {
  canonicalId: string;
  projectCode: string;
  projectTitle: string;
  projectSlug: string;
  projectDescription: string;
  problemStatement: string;
  proposedSolution: string;
  projectCategory: string;
  projectType: ProjectType;
  ownershipType: ProjectOwnershipType;
  clientId: string;
  clientNameSnapshot: string;
  employerId: string;
  employerNameSnapshot: string;
  projectManagerId: string;
  teamMemberIds: string[];
  departmentId: string;
  technologyStack: string[];
  features: string[];
  objectives: string[];
  scope: string;
  deliverables: string[];
  startDate: string | null;
  expectedEndDate: string | null;
  actualEndDate: string | null;
  budget: number | null;
  currency: string;
  paymentStatus: string;
  projectStatus: ProjectStatus;
  projectStage: string;
  progressPercentage: number;
  repositoryUrl: string;
  demoUrl: string;
  documentationPath: string;
  portfolioVisibility: boolean;
  featured: boolean;
  sourceReferences: string[];
  dataVerificationStatus: DataVerificationStatus;
  verificationNotes: string;
  missingInformationFlags: string[];
}

export const HISTORICAL_PROJECTS_INVENTORY: HistoricalCandidateProject[] = [
  {
    canonicalId: 'sri-nexushr',
    projectCode: 'SRI-PRJ-001',
    projectTitle: 'NexusHR — AI-Enabled Enterprise HR & Workforce Intelligence Platform',
    projectSlug: 'nexushr-enterprise-hr-intelligence-platform',
    projectDescription: 'Next-generation workforce intelligence platform combining AI-driven talent requisition matching, automated attendance ledgers, department productivity analytics, and multi-tier role-based access control.',
    problemStatement: 'Modern distributed enterprises face fragmented HR management, cumbersome onboarding paperwork, inaccurate attendance verification, and absence of predictive staff attrition or workload analytics.',
    proposedSolution: 'A centralized enterprise workforce intelligence suite unifying recruitment tracking, automated daily attendance logs, leave management workflows, and AI-powered applicant skill gap analysis.',
    projectCategory: 'Enterprise Software & AI',
    projectType: 'software',
    ownershipType: 'internal',
    clientId: '',
    clientNameSnapshot: '',
    employerId: 'sricore-solutions',
    employerNameSnapshot: 'Sricore Solutions (Internal Platform)',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Software Engineering',
    technologyStack: ['React', 'TypeScript', 'Node.js', 'Express', 'Firebase Firestore', 'Tailwind CSS', 'Google Gemini API'],
    features: [
      'Role-based access control (Admin, Employee, Mentor, Intern, Client, Candidate)',
      'Automated daily attendance logging and check-in geolocation tracking',
      'Leave requisition approval workflows with manager routing',
      'AI-powered resume and candidate qualification screening',
      'Departmental operational metrics and real-time audit event ledger'
    ],
    objectives: [
      'Consolidate internal HR operations into a single performant SPA',
      'Automate time-consuming employee onboarding and documentation steps',
      'Deliver real-time visibility into active project staffing and leave balances'
    ],
    scope: 'Enterprise workforce governance, internship lifecycle tracking, payroll preparation, and internal communications for technology consultancies.',
    deliverables: [
      'Full-stack web application dashboard',
      'Secure Firestore security rules architecture',
      'Audit logging and activity tracking module',
      'Automated notification and invitation dispatch system'
    ],
    startDate: '2024-01-10',
    expectedEndDate: '2024-08-30',
    actualEndDate: null,
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'in_progress',
    projectStage: 'development',
    progressPercentage: 82,
    repositoryUrl: 'https://github.com/sricoresolutions/nexushr-core',
    demoUrl: '/admin/dashboard',
    documentationPath: 'docs/projects/nexushr-specification.md',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Sricore Solutions Architecture Blueprint 2024',
      'NexusHR Role-Based Access Control Spec v2.1'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Flagship internal product actively serving current admin dashboard workflows. No external commercial client.',
    missingInformationFlags: ['budget_internal', 'project_manager_unassigned']
  },
  {
    canonicalId: 'sri-hackerrank-campus-crew',
    projectCode: 'SRI-PRJ-002',
    projectTitle: 'HackerRank Campus Crew — Paavai Engineering College Platform',
    projectSlug: 'hackerrank-campus-crew-paavai',
    projectDescription: 'Collegiate competitive coding and campus crew portal designed to coordinate student coding sprints, track algorithmic milestone leaderboards, and prepare candidates for technical placement interviews.',
    problemStatement: 'Undergraduate engineering students lacked structured peer accountability, regular problem-solving practice benchmarks, and a localized leaderboard to encourage algorithmic problem mastery.',
    proposedSolution: 'A localized campus club platform integrating competitive coding challenges, weekly contest leaderboards, solution discussions, and mentor code reviews tailored for college students.',
    projectCategory: 'Campus EdTech & Competitive Programming',
    projectType: 'academic',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: 'Paavai Engineering College (Campus Chapter)',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Research & Academic Training',
    technologyStack: ['React', 'Node.js', 'HackerRank Open API', 'Tailwind CSS', 'Firebase Firestore'],
    features: [
      'Campus crew member registry and progress badging',
      'Automated contest leaderboard scraping and aggregation',
      'Weekly algorithmic problem curation by faculty and senior mentors',
      'Peer code review threads and time complexity analysis notes'
    ],
    objectives: [
      'Elevate student technical problem-solving scores in campus recruitment drives',
      'Create an active, student-led developer community within Paavai Engineering College',
      'Reward consistent coding habit streaks and peer mentorship'
    ],
    scope: 'Paavai Engineering College computer science, information technology, and engineering student clubs.',
    deliverables: [
      'Campus crew web portal and leaderboard dashboard',
      'Student onboarding handbook for competitive programming',
      'Contest archive and interview problem curated repository'
    ],
    startDate: '2023-08-01',
    expectedEndDate: '2024-03-31',
    actualEndDate: '2024-04-15',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/paavai-crew/hackerrank-campus-platform',
    demoUrl: '',
    documentationPath: 'docs/projects/hackerrank-campus-crew-report.pdf',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Paavai Engineering College Campus Chapter Archives 2023-2024',
      'HackerRank Student Chapter Leaderboard Records'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Academic student community initiative. Paavai Engineering College is the academic host institution, not a paying commercial client.',
    missingInformationFlags: ['non_commercial_academic_entity']
  },
  {
    canonicalId: 'sri-event-resource-allocation',
    projectCode: 'SRI-PRJ-003',
    projectTitle: 'Event Resource Allocation Management System',
    projectSlug: 'event-resource-allocation-management',
    projectDescription: 'Automated campus and enterprise facility scheduling system preventing double-booking conflicts across conference halls, multimedia equipment, laboratories, and logistics personnel.',
    problemStatement: 'Manual paper-based requisition and informal scheduling of auditoriums and AV gear during collegiate conferences led to recurring venue clashes and equipment shortages.',
    proposedSolution: 'A digital booking and conflict resolution engine featuring interactive venue occupancy calendars, multi-tier faculty/admin approval chains, and digital pass generation.',
    projectCategory: 'Enterprise Operations & Logistics',
    projectType: 'software',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: 'Paavai Engineering College (Campus Operations)',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Software Engineering',
    technologyStack: ['React', 'TypeScript', 'Firebase Firestore', 'Tailwind CSS', 'Date-fns'],
    features: [
      'Dynamic venue availability calendar with real-time slot locking',
      'Hardware and audiovisual asset checkout/checkin logs',
      'Automated conflict detection blocking conflicting bookings',
      'Dean / Administrator approval and rejection workflow with digital status notifications'
    ],
    objectives: [
      'Eliminate 100% of double-booking incidents across campus facilities',
      'Accelerate event proposal approvals from days to minutes',
      'Maintain an unalterable digital audit trail of equipment custody'
    ],
    scope: 'Campus convention centres, seminar halls, departmental computer labs, and project demonstration rooms.',
    deliverables: [
      'Web-based scheduling application',
      'Administrator approval console',
      'Booking PDF confirmation pass generation module'
    ],
    startDate: '2023-09-15',
    expectedEndDate: '2024-02-28',
    actualEndDate: '2024-03-10',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/event-resource-allocator',
    demoUrl: '',
    documentationPath: 'docs/projects/event-resource-allocation-srs.pdf',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: [
      'College Operations Resource Requisition Protocol',
      'System Requirements Specification (SRS) - Event Allocator v1.0'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Institutional internal software created for campus facility operations.',
    missingInformationFlags: ['budget_unfunded_internal']
  },
  {
    canonicalId: 'sri-ai-adsorption-efficiency-heavy-metal',
    projectCode: 'SRI-PRJ-004',
    projectTitle: 'AI-Based Prediction of Adsorption Efficiency for Heavy Metal Removal Using Linear Regression',
    projectSlug: 'ai-prediction-adsorption-efficiency-heavy-metal-removal',
    projectDescription: 'Environmental data science research framework applying multivariate linear regression and chemical isotherm modeling to forecast heavy metal removal percentages in industrial wastewater treatment.',
    problemStatement: 'Laboratory bench experimental optimization of heavy metal adsorption (e.g. Lead, Cadmium, Chromium) requires weeks of repetitive wet-chemical assays with expensive reagent consumption.',
    proposedSolution: 'A machine learning regression pipeline correlating solution pH, adsorbent dosage, initial ion concentration, contact time, and temperature to predict final removal efficiency with high statistical confidence.',
    projectCategory: 'Environmental AI & Chemical Data Science',
    projectType: 'research',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: 'Paavai Engineering College (Department of Chemical/Biotech)',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'AI & Data Science',
    technologyStack: ['Python', 'Scikit-Learn', 'Pandas', 'NumPy', 'Matplotlib', 'Streamlit'],
    features: [
      'Multi-variable linear regression model with R² validation (>0.91)',
      'Langmuir and Freundlich adsorption isotherm curve fitting',
      'Interactive Streamlit UI for immediate efficiency estimation from chemical inputs',
      'Parametric sensitivity analysis plots demonstrating pH vs dosage trade-offs'
    ],
    objectives: [
      'Cut empirical laboratory optimization time by 70%',
      'Deliver actionable chemical dosage recommendations for water purification',
      'Provide published data science methodology for heavy metal remediation'
    ],
    scope: 'Industrial effluent treatment, chemical engineering laboratory research, biosorption studies.',
    deliverables: [
      'Trained Scikit-Learn regression model binaries',
      'Complete Jupyter data science exploratory and modeling notebooks',
      'Streamlit web calculator application',
      'Research findings technical report with correlation coefficient charts'
    ],
    startDate: '2023-11-01',
    expectedEndDate: '2024-04-30',
    actualEndDate: '2024-05-10',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/adsorption-efficiency-ml',
    demoUrl: '',
    documentationPath: 'docs/research/heavy-metal-adsorption-paper.pdf',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Chemical & Environmental Engineering Laboratory Project Dossier',
      'Adsorption Isotherm Experimental Dataset 2023-2024'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Academic research project. Validated model outputs against physical laboratory test data.',
    missingInformationFlags: ['commercial_sponsor_none']
  },
  {
    canonicalId: 'sri-fake-review-detection',
    projectCode: 'SRI-PRJ-005',
    projectTitle: 'Fake Review Detection System Using ML and DL',
    projectSlug: 'fake-review-detection-system-ml-dl',
    projectDescription: 'Natural Language Processing and deep learning system that analyzes consumer review texts, linguistic stylometry, and sentiment discrepancies to classify fraudulent opinion spam.',
    problemStatement: 'E-commerce and hospitality platforms suffer from orchestrated fake positive/negative review campaigns that deceive consumers and skew commercial ratings.',
    proposedSolution: 'A dual-engine classification model combining syntactic feature extractors (TF-IDF, n-grams, sentiment polarity) with LSTM recurrent neural networks to flag suspicious review patterns.',
    projectCategory: 'Natural Language Processing & Machine Learning',
    projectType: 'ai_ml',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'AI & Data Science',
    technologyStack: ['Python', 'TensorFlow', 'Keras', 'NLTK', 'Scikit-Learn', 'FastAPI', 'React'],
    features: [
      'Text pre-processing, stop-word removal, and POS-tagging pipeline',
      'LSTM deep learning sequence classifier alongside SVM baseline',
      'Deceptive review probability score with highlight of influential tokens',
      'FastAPI REST endpoint accepting raw review strings for real-time inference'
    ],
    objectives: [
      'Attain >88% classification accuracy on benchmark Yelp and Amazon deception datasets',
      'Expose deceptive linguistic cues such as hyperbolic sentiment and lacking first-person specifics',
      'Provide an embeddable API for review integrity verification'
    ],
    scope: 'Online product listings, hospitality review feeds, e-commerce consumer feedback.',
    deliverables: [
      'Trained LSTM and Random Forest models',
      'FastAPI classification server',
      'React testing demo interface',
      'Comprehensive comparative analysis report'
    ],
    startDate: '2023-10-15',
    expectedEndDate: '2024-03-31',
    actualEndDate: '2024-04-05',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/fake-review-detection-nlp',
    demoUrl: '',
    documentationPath: 'docs/projects/fake-review-detection-report.pdf',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: [
      'Machine Learning Capstone Project Report 2024',
      'Yelp Deceptive Opinion Spam Benchmark Dataset'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Undergraduate capstone machine learning implementation.',
    missingInformationFlags: ['client_not_applicable']
  },
  {
    canonicalId: 'sri-bioprint-ai',
    projectCode: 'SRI-PRJ-006',
    projectTitle: 'BioPrint AI — Smart Waste-to-Material Converter for 3D Printing',
    projectSlug: 'bioprint-ai-waste-to-material-converter',
    projectDescription: 'Sustainable additive manufacturing hardware combining thermal plastic shredding, controlled extrusion, and computer vision laser micrometer measurement to convert recyclable plastic waste into precision 1.75mm 3D printing filament.',
    problemStatement: 'Prototyping facilities produce high volumes of discarded plastic waste while commercial 3D printer filaments remain expensive and environmentally taxing.',
    proposedSolution: 'A closed-loop smart extrusion apparatus utilizing PID-controlled heater bands, continuous optical filament diameter tracking, and edge AI error detection to produce standardized, high-quality recycled filament.',
    projectCategory: 'Sustainable Hardware & Additive Manufacturing',
    projectType: 'innovation',
    ownershipType: 'collaboration',
    clientId: '',
    clientNameSnapshot: '',
    employerId: 'sricore-solutions',
    employerNameSnapshot: 'Sricore Solutions Innovation Lab',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Embedded Systems & IoT',
    technologyStack: ['Python', 'OpenCV', 'Raspberry Pi', 'Arduino / C++', 'PID Controllers', 'React Dashboard'],
    features: [
      'Closed-loop stepper motor puller synchronized with optical diameter sensor',
      'Dual-zone PID temperature regulation keeping nozzle within ±1°C target',
      'Computer vision inspection identifying filament surface bubbles and ovality defects',
      'IoT telemetry dashboard displaying extrusion speed, cumulative filament weight, and energy use'
    ],
    objectives: [
      'Achieve 1.75mm ±0.05mm filament tolerance using post-consumer PET/PLA plastics',
      'Reduce raw material filament costs for student makerspaces by over 80%',
      'Promote sustainable circular economy practices in rapid prototyping'
    ],
    scope: 'Academic makerspaces, industrial rapid prototyping workshops, green technology initiatives.',
    deliverables: [
      'Functional mechanical extruder and spooler assembly',
      'Arduino and Raspberry Pi embedded firmware',
      'React calibration and monitoring user interface',
      'Mechanical CAD blueprints and fabrication guide'
    ],
    startDate: '2024-02-01',
    expectedEndDate: '2024-11-30',
    actualEndDate: null,
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'in_progress',
    projectStage: 'development',
    progressPercentage: 70,
    repositoryUrl: 'https://github.com/sricoresolutions/bioprint-ai-hardware',
    demoUrl: '',
    documentationPath: 'docs/hardware/bioprint-ai-spec.pdf',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Sricore Solutions Innovation Challenge Dossier',
      'BioPrint AI Mechanical & Firmware Blueprint v1.2'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Active collaborative R&D prototype under ongoing physical testing.',
    missingInformationFlags: ['testing_cycle_ongoing']
  },
  {
    canonicalId: 'sri-ecobinx',
    projectCode: 'SRI-PRJ-007',
    projectTitle: 'EcoBinX — Smart AI Dustbin',
    projectSlug: 'ecobinx-smart-ai-dustbin',
    projectDescription: 'IoT-enabled automated waste segregation bin utilizing onboard computer vision and proximity sensors to classify deposited items into biodegradable, recyclable, and hazardous compartments.',
    problemStatement: 'Source segregation of municipal solid waste suffers from human neglect and confusion, leading to landfill cross-contamination and hazardous sorting conditions for sanitation workers.',
    proposedSolution: 'A smart autonomous bin equipped with an aperture camera running edge MobileNet classification that automatically pivots internal servo flaps to guide items into their correct compartments while transmitting bin fill-levels via IoT.',
    projectCategory: 'IoT & Computer Vision Waste Management',
    projectType: 'iot',
    ownershipType: 'internal',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Embedded Systems & IoT',
    technologyStack: ['Raspberry Pi', 'Edge TPU / MobileNet', 'Arduino', 'Ultrasonic Sensors', 'Servo Actuators', 'Firebase Realtime'],
    features: [
      'Real-time object classification at the bin drop zone (Plastic, Paper, Organic, Metal)',
      'Dual-axis high-torque servo mechanism for mechanical compartment flap routing',
      'Ultrasonic distance sensors continuously computing fill volume percentage',
      'Cloud telemetry alerts notifying municipal facility staff when capacity reaches 85%'
    ],
    objectives: [
      'Automate 90%+ accurate waste separation without user intervention',
      'Prevent street and campus bin overflow through proactive dispatch notifications',
      'Reduce municipal sorting facility processing overhead'
    ],
    scope: 'Smart university campuses, corporate IT parks, airports, and public transit terminals.',
    deliverables: [
      'Working physical bin prototype with motorized sorting mechanism',
      'Trained MobileNet edge model optimized for Raspberry Pi',
      'Web-based sanitation route monitoring dashboard'
    ],
    startDate: '2023-07-15',
    expectedEndDate: '2023-12-20',
    actualEndDate: '2024-01-15',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/ecobinx-smart-waste',
    demoUrl: '',
    documentationPath: 'docs/hardware/ecobinx-hardware-report.pdf',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Smart Campus Innovation Project Submission',
      'EcoBinX Embedded Circuit Schematics & BOM'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Completed physical prototype demonstration verified during collegiate technology expo.',
    missingInformationFlags: ['commercial_licensing_pending']
  },
  {
    canonicalId: 'sri-low-cost-bioreactor',
    projectCode: 'SRI-PRJ-008',
    projectTitle: 'Development of a Low-Cost AI-Enabled 3-Litre Small-Scale Bioreactor with IoT-Based Multi-Parameter Monitoring and Predictive Process Control',
    projectSlug: 'low-cost-ai-enabled-3l-bioreactor-iot-process-control',
    projectDescription: 'Open-hardware 3-litre laboratory bench fermenter featuring continuous IoT telemetry for pH, temperature, dissolved oxygen, and optical density coupled with predictive AI feeding regimens.',
    problemStatement: 'Commercial benchtop fermenters cost upwards of $10,000 to $25,000, severely limiting biotechnology experimentation, student hands-on bioprocess training, and startup pilot testing.',
    proposedSolution: 'A precision 3-litre borosilicate glass bioreactor driven by an ESP32 microcontroller, industrial sensor probes, automated peristaltic dosing pumps, and predictive batch growth curves for automated nutrient replenishment.',
    projectCategory: 'Bio-Process Engineering & Embedded Systems',
    projectType: 'research',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: 'Paavai Engineering College (Biotechnology Department)',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Embedded Systems & IoT',
    technologyStack: ['ESP32 Microcontroller', 'C++', 'Python', 'Kalman Filter / LSTM', 'pH & DO Probe ADC Interfaces', 'React Control Panel'],
    features: [
      'Continuous telemetry of pH, dissolved oxygen (DO), temperature, and magnetic stirrer RPM',
      'Precision stepper peristaltic pump control for acid, base, antifoam, and nutrient feeds',
      'Predictive microbial growth model forecasting stationary phase and optimal harvest time',
      'Real-time WebSocket connection to web monitoring portal with emergency fail-safes'
    ],
    objectives: [
      'Construct a functional 3L fermenter at less than 10% the cost of commercial equivalents',
      'Maintain tight bioprocess tolerances (pH ±0.1, Temp ±0.2°C)',
      'Deliver automated telemetry graphs during 72-hour bacterial fermentation runs'
    ],
    scope: 'Academic biotechnology laboratories, microbial culture research, biofuel synthesis pilots.',
    deliverables: [
      'Complete mechanical and electronics fabrication schematics',
      'Embedded ESP32 C++ firmware with PID regulation',
      'React bioprocess live visualization dashboard',
      'E. coli batch growth calibration and validation report'
    ],
    startDate: '2023-08-10',
    expectedEndDate: '2024-03-30',
    actualEndDate: '2024-04-12',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/iot-bioreactor-3l',
    demoUrl: '',
    documentationPath: 'docs/research/bioreactor-design-and-validation.pdf',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Biotechnology Final Year Research Project Report',
      'Bioreactor Sensor Calibration & Microbial Batch Protocol'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Empirically tested and verified through multi-day laboratory batch fermentation runs.',
    missingInformationFlags: ['academic_research_budget_only']
  },
  {
    canonicalId: 'sri-unified-health-env-platform',
    projectCode: 'SRI-PRJ-009',
    projectTitle: 'Unified Health and Environmental Risk Prediction Platform',
    projectSlug: 'unified-health-environmental-risk-prediction-platform',
    projectDescription: 'Geospatial public health informatics platform cross-correlating localized environmental sensor data (PM2.5, NO2, ozone, temperature) with epidemiological health metrics to forecast clinical risk surges.',
    problemStatement: 'Healthcare providers and environmental regulators operate in silos, preventing early warnings for respiratory and cardiovascular emergencies during acute industrial or seasonal smog episodes.',
    proposedSolution: 'A unified informatics pipeline ingesting air quality index (AQI) telemetry and historical clinical admission records to train gradient-boosted trees that predict regional hospital surge risks 48 hours in advance.',
    projectCategory: 'HealthTech & Climate Informatics',
    projectType: 'ai_ml',
    ownershipType: 'collaboration',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'AI & Data Science',
    technologyStack: ['React', 'TypeScript', 'Python', 'FastAPI', 'XGBoost', 'Leaflet / Mapbox GIS', 'OpenWeather / AQI APIs'],
    features: [
      'Interactive GIS geographic mapping of pollution sensor feeds and vulnerability zones',
      'XGBoost predictive scoring for daily respiratory emergency probability',
      'Surge warning notification system for municipal clinics and emergency services',
      'Citizens personal risk assessment calculator based on pre-existing conditions'
    ],
    objectives: [
      'Bridge the analytical gap between micro-climate pollution spikes and hospital admissions',
      'Provide healthcare administrators 48-hour advance notice to adjust emergency staffing',
      'Offer localized public safety advisory alerts'
    ],
    scope: 'Municipal healthcare authorities, environmental protection agencies, urban planning boards.',
    deliverables: [
      'GIS interactive analytics web platform',
      'Machine learning model training and inference pipeline',
      'Automated email and webhook alert dispatch service',
      'Technical architecture and epidemiological validation report'
    ],
    startDate: '2024-03-01',
    expectedEndDate: '2024-10-31',
    actualEndDate: null,
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'in_progress',
    projectStage: 'model_development',
    progressPercentage: 65,
    repositoryUrl: 'https://github.com/sricoresolutions/unified-health-env-risk',
    demoUrl: '',
    documentationPath: 'docs/research/health-environmental-prediction-spec.pdf',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Health Informatics R&D Proposal 2024',
      'Geospatial Environmental Risk Correlation Model Design'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Ongoing research project integrating real-time open AQI feeds.',
    missingInformationFlags: ['clinical_data_anonymization_review']
  },
  {
    canonicalId: 'sri-paavai-bloodconnect',
    projectCode: 'SRI-PRJ-010',
    projectTitle: 'Paavai BloodConnect',
    projectSlug: 'paavai-bloodconnect',
    projectDescription: 'Emergency donor coordination and life-saving blood bank registry connecting college student donors, voluntary youth, and local Namakkal hospital blood banks in critical urgent situations.',
    problemStatement: 'Severe regional blood shortages frequently encounter life-threatening matching delays due to fragmented contact lists and unavailability of rare blood group donors during night emergencies.',
    proposedSolution: 'A responsive real-time web portal that indexes verified student and faculty donors with blood group filters, automated 90-day cooldown period tracking, emergency SOS broadcasts, and direct hospital coordination.',
    projectCategory: 'Social Good & Emergency Healthcare Tech',
    projectType: 'software',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: 'Paavai Engineering College (Youth Red Cross Chapter)',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Software Engineering',
    technologyStack: ['React', 'Firebase Firestore', 'Firebase Authentication', 'Twilio / SMS Gateway', 'Tailwind CSS'],
    features: [
      'Verified donor directory categorized by blood group (including rare groups AB-, O-)',
      'Instant emergency SOS broadcast sending SMS alerts to active local donors',
      'Automated donor eligibility tracker calculating 90-day donation intervals',
      'Confidential phone brokering protecting donor contact privacy'
    ],
    objectives: [
      'Shorten emergency donor response time from hours to under 15 minutes',
      'Mobilize an active, recurring voluntary donor pool within the campus community',
      'Support regional rural healthcare centers with rapid blood bank inventory connections'
    ],
    scope: 'Paavai institutional campus community, Namakkal and Salem district hospitals.',
    deliverables: [
      'Emergency donor web portal',
      'Student volunteer onboarding portal',
      'Hospital blood requisition verification dashboard'
    ],
    startDate: '2023-06-01',
    expectedEndDate: '2023-11-15',
    actualEndDate: '2023-11-20',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/paavai-crew/paavai-bloodconnect',
    demoUrl: '',
    documentationPath: 'docs/projects/paavai-bloodconnect-guide.pdf',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Paavai Youth Red Cross (YRC) Community Project Records',
      'BloodConnect Deployment and Impact Report'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Voluntary social initiative coordinated by Paavai student teams. Paavai Engineering College is community host, not a commercial client.',
    missingInformationFlags: ['non_commercial_community_service']
  },
  {
    canonicalId: 'sri-smart-helmet-detection',
    projectCode: 'SRI-PRJ-011',
    projectTitle: 'Smart Helmet Detection System',
    projectSlug: 'smart-helmet-detection-system',
    projectDescription: 'Automated video analytics pipeline utilizing YOLOv8 and computer vision to identify motorcycle riders in CCTV feeds and detect non-compliance with helmet safety regulations in real time.',
    problemStatement: 'Unhelmeted two-wheeler riding is the primary cause of fatal head trauma in traffic accidents, while manual enforcement by traffic police at busy intersections is dangerous and sporadic.',
    proposedSolution: 'A computer vision processing pipeline that detects moving motorcycles, crops rider regions of interest, classifies helmet presence using fine-tuned neural network heads, and logs violation snapshots with OCR timestamping.',
    projectCategory: 'Computer Vision & Traffic Safety',
    projectType: 'ai_ml',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'AI & Data Science',
    technologyStack: ['Python', 'OpenCV', 'YOLOv8', 'PyTorch', 'EasyOCR', 'Flask'],
    features: [
      'Multi-class object detection (Motorcycle, Rider, Helmet, Non-Helmet)',
      'Automated bounding box tracking across sequential video frames',
      'Violation evidence capture with date, time, and camera location watermark',
      'Integrated optical character recognition (OCR) parsing vehicle registration plates'
    ],
    objectives: [
      'Achieve real-time inference (>25 FPS) on roadside edge hardware',
      'Maintain >92% helmet detection precision across varying daylight and weather conditions',
      'Deliver automated PDF traffic violation incident reports'
    ],
    scope: 'Urban intersection CCTV streams, institutional campus entry gates, toll plazas.',
    deliverables: [
      'Fine-tuned YOLOv8 custom weights and configuration files',
      'Video inference pipeline script with video stream ingestion',
      'Violation audit log web review interface'
    ],
    startDate: '2023-09-01',
    expectedEndDate: '2024-02-28',
    actualEndDate: '2024-03-05',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/smart-helmet-detection-yolo',
    demoUrl: '',
    documentationPath: 'docs/projects/smart-helmet-detection-report.pdf',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: [
      'Computer Vision Engineering Final Capstone Project Report',
      'Traffic Safety Helmet Annotation Benchmark Dataset'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Undergraduate computer vision implementation tested on synthetic and real campus gate feeds.',
    missingInformationFlags: ['commercial_deployment_none']
  },
  {
    canonicalId: 'sri-smart-helmet-alcohol-drowsiness',
    projectCode: 'SRI-PRJ-012',
    projectTitle: 'Smart Helmet with Alcohol and Drowsiness Detection',
    projectSlug: 'smart-helmet-alcohol-drowsiness-detection',
    projectDescription: 'Wearable safety helmet equipped with an MQ-3 alcohol breath sensor, infrared eye-blink fatigue sensors, and RF wireless relay interlocks preventing motorcycle ignition if rider is impaired.',
    problemStatement: 'Drunk driving and micro-sleep fatigue among two-wheeler riders remain major contributors to highway fatalities that cannot be prevented by post-accident airbags.',
    proposedSolution: 'A preventive smart helmet that performs mandatory breath alcohol sampling and chin-strap buckle verification before enabling motorcycle ignition via an RF interlock module, while monitoring eye blink rates during transit.',
    projectCategory: 'IoT Wearables & Vehicle Safety',
    projectType: 'iot',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Embedded Systems & IoT',
    technologyStack: ['Arduino / ATmega328P', 'MQ-3 Alcohol Sensor', 'IR Eye-Blink Sensor', '433MHz RF Transceiver Modules', 'Relay Ignition Circuit'],
    features: [
      'MQ-3 breathalyzer evaluating blood alcohol concentration prior to ignition start',
      'Infrared blink sensor triggering loud buzzer alerts if eyelid closure exceeds 2.5 seconds',
      'Wireless RF 433MHz communication linking helmet sensor package to motorcycle ignition relay',
      'Safety mechanical buckle switch ensuring helmet is secured to the rider head'
    ],
    objectives: [
      'Disallow vehicle startup if alcohol breath reading exceeds statutory thresholds',
      'Prevent riders from simply carrying the helmet without wearing it properly',
      'Issue immediate acoustic feedback when fatigue or micro-sleep is detected'
    ],
    scope: 'Personal two-wheeler safety, commercial motorcycle delivery fleets, teen rider safety.',
    deliverables: [
      'Working helmet hardware prototype with embedded sensors',
      'Motorcycle engine ignition relay module',
      'Arduino C++ firmware source code',
      'Circuit schematics and safety validation report'
    ],
    startDate: '2023-08-20',
    expectedEndDate: '2024-01-30',
    actualEndDate: '2024-02-15',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/smart-helmet-hardware',
    demoUrl: '',
    documentationPath: 'docs/hardware/smart-helmet-alcohol-drowsiness.pdf',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: [
      'Embedded Systems Capstone Project Documentation',
      'Hardware Prototype Wiring Diagrams and Sensor Calibration Logs'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Constructed working physical prototype demonstrated in engineering hardware exhibitions.',
    missingInformationFlags: ['automotive_certification_untested']
  },
  {
    canonicalId: 'sri-thavam-skin-disease-scanner',
    projectCode: 'SRI-PRJ-013',
    projectTitle: 'Thavam — Skin Disease Scanner',
    projectSlug: 'thavam-skin-disease-scanner',
    projectDescription: 'Mobile and web teledermatology diagnostic application using deep convolutional neural networks to classify dermal lesions and guide primary care patients toward verified specialists.',
    problemStatement: 'Shortages of certified dermatologists in rural and semi-urban communities cause delay in early detection of melanoma, fungal infections, eczema, and psoriasis, allowing treatable conditions to become chronic.',
    proposedSolution: 'A mobile smartphone scanner enabling patients and community health workers to capture photos of affected skin patches, receive instantaneous multi-class condition probabilities, and locate regional specialists.',
    projectCategory: 'Mobile Health & Dermatological AI',
    projectType: 'ai_ml',
    ownershipType: 'internal',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'AI & Data Science',
    technologyStack: ['Flutter / Android', 'Python', 'TensorFlow Lite', 'FastAPI', 'Firebase Firestore'],
    features: [
      'Smartphone camera lesion alignment overlay with illumination check',
      'On-device TensorFlow Lite model inference for low-bandwidth rural clinics',
      'Differential probability outputs across 8 dermatological skin classes',
      'Patient symptom history timeline and nearby clinic referral directory'
    ],
    objectives: [
      'Provide rapid, accessible first-line dermatological triage for underserved populations',
      'Deliver >89% top-2 classification accuracy on clinical benchmark skin images',
      'Preserve patient health data privacy with edge-based processing'
    ],
    scope: 'Rural primary health centers (PHCs), telehealth services, public wellness initiatives.',
    deliverables: [
      'Mobile application APK bundle with bundled TFLite weights',
      'FastAPI cloud backend and patient history database schema',
      'Medical validation testing and dataset ethics report'
    ],
    startDate: '2023-09-01',
    expectedEndDate: '2024-03-15',
    actualEndDate: '2024-03-25',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/thavam-skin-scanner',
    demoUrl: '',
    documentationPath: 'docs/projects/thavam-skin-scanner-dossier.pdf',
    portfolioVisibility: true,
    featured: true,
    sourceReferences: [
      'Thavam Telehealth Innovation Dossier',
      'ISIC Skin Lesion Dataset Neural Network Evaluation Results'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Completed innovation prototype. Clinically informational triage tool, not an FDA/CDSCO certified medical device.',
    missingInformationFlags: ['clinical_trial_clearance_required']
  },
  {
    canonicalId: 'sri-traffic-signal-communication',
    projectCode: 'SRI-PRJ-014',
    projectTitle: 'Traffic Signal Communication (TSC)',
    projectSlug: 'traffic-signal-communication-tsc',
    projectDescription: 'Vehicle-to-Infrastructure (V2I) RF communication protocol dynamically establishing green corridors for approaching emergency ambulances at urban intersections.',
    problemStatement: 'Ambulances and fire engines often get stranded in dense traffic signal backlogs, causing critical delays during cardiac arrest and trauma emergencies.',
    proposedSolution: 'A dedicated RF/Zigbee transmitter installed on emergency response vehicles that broadcasts authenticated priority beacons, commanding roadside intersection controllers to clear ahead lanes.',
    projectCategory: 'V2X Telematics & Intelligent Transportation',
    projectType: 'iot',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Embedded Systems & IoT',
    technologyStack: ['Microchip PIC / Arduino', 'Zigbee / RF Modules', 'LED Signal Array Controller', 'Embedded C'],
    features: [
      'Secure RF authentication handshake between ambulance unit and roadside master controller',
      'Automatic lane transition to green corridor with pedestrian clearance buffer',
      'Fail-safe timer reverting signal to standard schedule if vehicle departs',
      'Traffic queue density override mode utilizing IR road sensors'
    ],
    objectives: [
      'Reduce emergency transit delay at multi-way junctions by over 60%',
      'Eliminate danger of cross-traffic intersection collisions during emergency transits',
      'Provide a low-cost retrofit module compatible with existing municipal traffic lights'
    ],
    scope: 'Urban arterial road junctions, hospital corridor routes, smart city municipal transport.',
    deliverables: [
      'Hardware intersection simulator with full signal sequence controls',
      'Vehicle-mounted transmitter beacon hardware',
      'Embedded C firmware code with safety timer interrupts',
      'Hardware communication protocol specification document'
    ],
    startDate: '2023-08-15',
    expectedEndDate: '2024-01-20',
    actualEndDate: '2024-02-10',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/traffic-signal-communication',
    demoUrl: '',
    documentationPath: 'docs/hardware/traffic-signal-communication-report.pdf',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: [
      'Telematics & Transportation Engineering Capstone Project Report',
      'TSC Hardware Architecture and Signal Sequence Flowchart'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Demonstrated on a scale junction test bench with RF transceivers.',
    missingInformationFlags: ['municipal_pilot_uninitiated']
  },
  {
    canonicalId: 'sri-library-management-system',
    projectCode: 'SRI-PRJ-015',
    projectTitle: 'Library Management System',
    projectSlug: 'library-management-system',
    projectDescription: 'Comprehensive web-based institutional library catalog, circulation management, barcode checkout, and overdue fine calculation platform.',
    problemStatement: 'Manual paper registers and legacy desktop software make circulation tracking, multi-copy inventory checks, and student book reservations slow and prone to errors.',
    proposedSolution: 'A relational web application enabling ISBN book cataloging, barcode circulation check-in/out, automated overdue fine calculation, and student OPAC search.',
    projectCategory: 'Institutional Software & Cataloging',
    projectType: 'software',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Software Engineering',
    technologyStack: ['PHP / MySQL', 'HTML5 / CSS3', 'JavaScript', 'Bootstrap', 'Barcode Scanner SDK'],
    features: [
      'Book inventory cataloging with Dewey Decimal Classification and ISBN lookup',
      'Member registration and circulation limits for students vs faculty',
      'Automated daily overdue fine calculation with receipt generation',
      'Barcode scanner integration for check-out and return workflows'
    ],
    objectives: [
      'Streamline library circulation desk operations',
      'Provide online searchable public catalog accessible from student phones',
      'Maintain reliable records of lost books and penalty collections'
    ],
    scope: 'College departmental and central libraries, school learning resource centers.',
    deliverables: [
      'Web application code and database schema migration scripts',
      'Librarian administrative user manual',
      'Barcode reader setup and integration documentation'
    ],
    startDate: '2023-06-01',
    expectedEndDate: '2023-10-15',
    actualEndDate: '2023-10-30',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/library-management-system',
    demoUrl: '',
    documentationPath: 'docs/projects/library-management-manual.pdf',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: [
      'Academic Software Project Submission Archive',
      'Library Management System Functional Specification'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Completed software utility for academic department library usage.',
    missingInformationFlags: ['commercial_client_none']
  },
  {
    canonicalId: 'sri-world-trivia-website',
    projectCode: 'SRI-PRJ-016',
    projectTitle: 'World Trivia Website',
    projectSlug: 'world-trivia-website',
    projectDescription: 'Interactive, responsive trivia web platform featuring multi-topic general knowledge quizzes, countdown timers, score multiplier streaks, and animated progress tracking.',
    problemStatement: 'Learners and students seeking general knowledge revision lack fun, lightweight, mobile-responsive gamified quiz apps with instant explanations and category selection.',
    proposedSolution: 'A fast-loading client-side SPA integrating trivia questions across geography, history, science, and world pop culture with difficulty tiers and streak bonuses.',
    projectCategory: 'Web Applications & Interactive EdTech',
    projectType: 'software',
    ownershipType: 'personal',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Software Engineering',
    technologyStack: ['JavaScript', 'HTML5', 'CSS3', 'Open Trivia Database API', 'LocalStorage'],
    features: [
      'Topic categories: Geography, World History, Science & Nature, Technology',
      'Timed quiz rounds with customizable seconds per question',
      'Score multiplier combos for consecutive correct answers',
      'Local storage leaderboard saving personal best performances'
    ],
    objectives: [
      'Deliver zero-latency, enjoyable general knowledge gameplay in modern web browsers',
      'Demonstrate clean DOM manipulation, asynchronous API handling, and responsive CSS',
      'Support mobile touch devices flawlessly'
    ],
    scope: 'Casual learning, classroom trivia, general knowledge training.',
    deliverables: [
      'Production single page web application',
      'Open Trivia Database integration layer',
      'Curated offline fallback question bank'
    ],
    startDate: '2023-05-01',
    expectedEndDate: '2023-07-15',
    actualEndDate: '2023-07-20',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/world-trivia-app',
    demoUrl: '',
    documentationPath: 'docs/projects/world-trivia-readme.md',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: [
      'Frontend Development Project Portfolio Snapshot',
      'World Trivia Web Application Git Archive'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Personal frontend development showcase project.',
    missingInformationFlags: ['personal_project_unfunded']
  },
  {
    canonicalId: 'sri-auto-water-tap-ir-loadcell',
    projectCode: 'SRI-PRJ-017',
    projectTitle: 'Automatic Water Tap Using IR Sensor and Load Cell',
    projectSlug: 'automatic-water-tap-ir-sensor-load-cell',
    projectDescription: 'Touchless hygiene water dispensing system utilizing infrared proximity for hand washing combined with an HX711 load cell platform for automated volumetric container filling.',
    problemStatement: 'Manual tap handles in communal bathrooms spread microbial pathogens, while container filling without automated shutoffs causes continuous water wastage in hostels and labs.',
    proposedSolution: 'A dual-mode microcontroller water tap: infrared detection triggers instant flow for hygienic hand-washing, while placing a bottle or vessel on the load cell initiates filling up to a preset tare weight before automatically shutting off the solenoid valve.',
    projectCategory: 'Embedded Systems & Water Conservation',
    projectType: 'iot',
    ownershipType: 'academic',
    clientId: '',
    clientNameSnapshot: '',
    employerId: '',
    employerNameSnapshot: '',
    projectManagerId: '',
    teamMemberIds: [],
    departmentId: 'Embedded Systems & IoT',
    technologyStack: ['Arduino Uno', 'IR Proximity Sensor', 'HX711 Load Cell Amplifier', '12V Solenoid Valve', 'Embedded C'],
    features: [
      'Infrared hand proximity sensing for touch-free hand washing flow',
      'HX711 5kg load cell platform evaluating vessel gross weight',
      'Automatic 12V DC solenoid valve cutoff preventing vessel overflow',
      'LED status indicators displaying standby, dispensing, and capacity limits'
    ],
    objectives: [
      'Prevent cross-contamination of contact bacteria in public restrooms',
      'Eliminate water spillage during container filling operations',
      'Provide a simple, low-cost retrofit kit for institutional plumbing'
    ],
    scope: 'Institutional hostels, chemistry laboratories, public transit washrooms, drinking water kiosks.',
    deliverables: [
      'Working plumbing and electronics demonstration rig',
      'Arduino microcontroller embedded source code',
      'Wiring schematic diagram and sensor calibration guidelines'
    ],
    startDate: '2023-07-01',
    expectedEndDate: '2023-11-30',
    actualEndDate: '2023-12-10',
    budget: null,
    currency: 'INR',
    paymentStatus: 'not_applicable',
    projectStatus: 'completed',
    projectStage: 'completion',
    progressPercentage: 100,
    repositoryUrl: 'https://github.com/sricoresolutions/auto-water-tap-iot',
    demoUrl: '',
    documentationPath: 'docs/hardware/auto-water-tap-report.pdf',
    portfolioVisibility: true,
    featured: false,
    sourceReferences: [
      'Embedded Automation Capstone Project Report',
      'Hardware Wiring & HX711 Load Cell Calibration Manual'
    ],
    dataVerificationStatus: 'verified',
    verificationNotes: 'Constructed physical prototype verified with calibrated weights and water containers.',
    missingInformationFlags: ['plumbing_enclosure_waterproofing_refinement']
  }
];

export interface ReconciliationItemResult {
  candidateId: string;
  projectCode: string;
  projectTitle: string;
  action: 'CREATE' | 'UPDATE' | 'MATCHED' | 'CONFLICT' | 'SKIPPED';
  existingDocId?: string;
  matchReason?: string;
  changesSummary?: string[];
  warnings?: string[];
  verificationStatus: DataVerificationStatus;
}

export interface MigrationSummaryReport {
  timestamp: string;
  isDryRun: boolean;
  totalCandidates: number;
  existingProjectsInDb: number;
  matchedExisting: number;
  newProjectsToCreate: number;
  duplicatesDetected: number;
  conflictsFlagged: number;
  projectsRequiringReview: number;
  projectsMissingClient: number;
  projectsMissingEmployer: number;
  projectsMissingDates: number;
  projectsVerifiedCompleted: number;
  projectsApprovedPortfolio: number;
  itemizedResults: ReconciliationItemResult[];
  errors: string[];
}

/**
 * Normalizes title for bullet-proof duplicate matching:
 * trims, lowercases, replaces em-dashes and underscores with spaces, removes punctuation.
 */
export function normalizeTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[—–_]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts key identity tokens from title to detect near-duplicates
 */
export function extractKeyTokens(title: string): string[] {
  const norm = normalizeTitle(title);
  const stopWords = new Set(['and', 'or', 'the', 'for', 'a', 'an', 'in', 'of', 'using', 'system', 'platform']);
  return norm.split(' ').filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Calculates similarity between two titles (Jaccard similarity on tokens)
 */
export function titleSimilarity(titleA: string, titleB: string): number {
  const tokensA = new Set(extractKeyTokens(titleA));
  const tokensB = new Set(extractKeyTokens(titleB));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  let intersection = 0;
  tokensA.forEach(t => {
    if (tokensB.has(t)) intersection++;
  });
  
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Performs audit and dry-run or live reconciliation
 */
export async function auditAndReconcileProjects(options: { 
  dryRun: boolean; 
  userUid?: string;
  departmentMap?: Record<string, string>;
}): Promise<MigrationSummaryReport> {
  const { dryRun, userUid = 'system-migration', departmentMap = {} } = options;
  const errors: string[] = [];
  const itemizedResults: ReconciliationItemResult[] = [];

  let existingDocs: { id: string; data: any }[] = [];
  try {
    const snap = await getDocs(collection(db, 'projects'));
    existingDocs = snap.docs.map(d => ({ id: d.id, data: d.data() }));
  } catch (err: any) {
    console.warn("Could not read projects collection directly in client:", err);
    errors.push(`Firestore read notice: ${err?.message || 'Access restricted by rules or offline'}`);
  }

  let matchedExistingCount = 0;
  let newProjectsToCreateCount = 0;
  let duplicatesDetectedCount = 0;
  let conflictsFlaggedCount = 0;
  let requiringReviewCount = 0;
  let missingClientCount = 0;
  let missingEmployerCount = 0;
  let missingDatesCount = 0;
  let verifiedCompletedCount = 0;
  let approvedPortfolioCount = 0;

  for (const candidate of HISTORICAL_PROJECTS_INVENTORY) {
    const normCandidateTitle = normalizeTitle(candidate.projectTitle);
    
    // Check for existing document:
    // 1. Direct ID match
    // 2. Normalized title match
    // 3. Project code match
    // 4. Slug match
    let match = existingDocs.find(e => e.id === candidate.canonicalId);
    let matchReason = match ? 'Exact Document ID Match' : '';

    if (!match) {
      match = existingDocs.find(e => {
        const eTitle = e.data.projectTitle || e.data.name || '';
        return normalizeTitle(eTitle) === normCandidateTitle;
      });
      if (match) matchReason = 'Normalized Project Title Match';
    }

    if (!match) {
      match = existingDocs.find(e => e.data.projectCode && e.data.projectCode === candidate.projectCode);
      if (match) matchReason = 'Project Code Match';
    }

    if (!match) {
      match = existingDocs.find(e => e.data.projectSlug && e.data.projectSlug === candidate.projectSlug);
      if (match) matchReason = 'Project Slug Match';
    }

    // Check for potential fuzzy duplicate
    let potentialDuplicateMatch = null;
    if (!match) {
      for (const e of existingDocs) {
        const eTitle = e.data.projectTitle || e.data.name || '';
        const sim = titleSimilarity(candidate.projectTitle, eTitle);
        if (sim >= 0.75) {
          potentialDuplicateMatch = { doc: e, similarity: sim };
          break;
        }
      }
    }

    // Track metadata metrics
    if (candidate.clientId === '') missingClientCount++;
    if (candidate.employerId === '') missingEmployerCount++;
    if (!candidate.startDate || !candidate.actualEndDate) missingDatesCount++;
    if (candidate.projectStatus === 'completed') verifiedCompletedCount++;
    if (candidate.portfolioVisibility) approvedPortfolioCount++;
    if (candidate.dataVerificationStatus === 'needs_review') requiringReviewCount++;

    if (potentialDuplicateMatch) {
      duplicatesDetectedCount++;
      conflictsFlaggedCount++;
      itemizedResults.push({
        candidateId: candidate.canonicalId,
        projectCode: candidate.projectCode,
        projectTitle: candidate.projectTitle,
        action: 'CONFLICT',
        existingDocId: potentialDuplicateMatch.doc.id,
        matchReason: `High Title Similarity (${Math.round(potentialDuplicateMatch.similarity * 100)}%) with existing doc "${potentialDuplicateMatch.doc.data.name || potentialDuplicateMatch.doc.data.projectTitle}"`,
        warnings: ['Flagged for Administrator manual review to avoid unintentional duplicate creation'],
        verificationStatus: candidate.dataVerificationStatus
      });
      continue;
    }

    if (match) {
      matchedExistingCount++;
      
      // Determine field-level merge
      const changes: string[] = [];
      const updatedFields: Record<string, any> = {};

      // Fill in enriched fields if missing in existing doc
      const ex = match.data;
      if (!ex.projectCode) { updatedFields.projectCode = candidate.projectCode; changes.push('Added projectCode'); }
      if (!ex.projectTitle) { updatedFields.projectTitle = candidate.projectTitle; changes.push('Added projectTitle'); }
      if (!ex.projectSlug) { updatedFields.projectSlug = candidate.projectSlug; changes.push('Added projectSlug'); }
      if (!ex.problemStatement) { updatedFields.problemStatement = candidate.problemStatement; changes.push('Added problemStatement'); }
      if (!ex.proposedSolution) { updatedFields.proposedSolution = candidate.proposedSolution; changes.push('Added proposedSolution'); }
      if (!ex.projectCategory) { updatedFields.projectCategory = candidate.projectCategory; changes.push('Added projectCategory'); }
      if (!ex.ownershipType) { updatedFields.ownershipType = candidate.ownershipType; changes.push('Added ownershipType'); }
      if (!ex.technologyStack || ex.technologyStack.length === 0) { updatedFields.technologyStack = candidate.technologyStack; changes.push('Added technologyStack'); }
      if (!ex.features || ex.features.length === 0) { updatedFields.features = candidate.features; changes.push('Added features'); }
      if (!ex.objectives || ex.objectives.length === 0) { updatedFields.objectives = candidate.objectives; changes.push('Added objectives'); }
      if (!ex.deliverables || ex.deliverables.length === 0) { updatedFields.deliverables = candidate.deliverables; changes.push('Added deliverables'); }
      if (!ex.sourceReferences) { updatedFields.sourceReferences = candidate.sourceReferences; changes.push('Added sourceReferences'); }
      if (!ex.dataVerificationStatus) { updatedFields.dataVerificationStatus = candidate.dataVerificationStatus; changes.push('Added dataVerificationStatus'); }
      if (ex.portfolioVisibility === undefined) { updatedFields.portfolioVisibility = candidate.portfolioVisibility; changes.push('Set portfolioVisibility'); }
      if (ex.featured === undefined) { updatedFields.featured = candidate.featured; changes.push('Set featured'); }

      if (changes.length > 0 && !dryRun) {
        try {
          await setDoc(doc(db, 'projects', match.id), {
            ...updatedFields,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e: any) {
          errors.push(`Failed to update ${match.id}: ${e.message}`);
        }
      }

      itemizedResults.push({
        candidateId: candidate.canonicalId,
        projectCode: candidate.projectCode,
        projectTitle: candidate.projectTitle,
        action: changes.length > 0 ? 'UPDATE' : 'MATCHED',
        existingDocId: match.id,
        matchReason,
        changesSummary: changes.length > 0 ? changes : ['All fields up to date in existing record'],
        verificationStatus: candidate.dataVerificationStatus
      });

    } else {
      // Missing project - to be created
      newProjectsToCreateCount++;

      const mappedDeptId = departmentMap[candidate.departmentId] || candidate.departmentId;

      const projectDocPayload: Project = {
        id: candidate.canonicalId,
        projectId: candidate.canonicalId,
        projectCode: candidate.projectCode,
        projectTitle: candidate.projectTitle,
        projectSlug: candidate.projectSlug,
        name: candidate.projectTitle, // Backwards compatibility alias
        description: candidate.projectDescription, // Backwards compatibility alias
        projectDescription: candidate.projectDescription,
        problemStatement: candidate.problemStatement,
        proposedSolution: candidate.proposedSolution,
        projectCategory: candidate.projectCategory,
        projectType: candidate.projectType,
        ownershipType: candidate.ownershipType,
        clientId: candidate.clientId,
        clientNameSnapshot: candidate.clientNameSnapshot,
        employerId: candidate.employerId,
        employerNameSnapshot: candidate.employerNameSnapshot,
        projectManagerId: candidate.projectManagerId,
        teamMemberIds: candidate.teamMemberIds,
        assignedEmployees: [],
        assignedInterns: [],
        departmentId: mappedDeptId,
        technologyStack: candidate.technologyStack,
        features: candidate.features,
        objectives: candidate.objectives,
        scope: candidate.scope,
        deliverables: candidate.deliverables,
        startDate: candidate.startDate,
        expectedEndDate: candidate.expectedEndDate,
        actualEndDate: candidate.actualEndDate,
        budget: candidate.budget,
        currency: candidate.currency,
        paymentStatus: candidate.paymentStatus,
        projectStatus: candidate.projectStatus,
        status: candidate.projectStatus === 'in_progress' ? 'active' : (candidate.projectStatus as any),
        stage: candidate.projectStage,
        projectStage: candidate.projectStage,
        progressPercentage: candidate.progressPercentage,
        repositoryUrl: candidate.repositoryUrl,
        demoUrl: candidate.demoUrl,
        documentationPath: candidate.documentationPath,
        portfolioVisibility: candidate.portfolioVisibility,
        featured: candidate.featured,
        sourceReferences: candidate.sourceReferences,
        dataVerificationStatus: candidate.dataVerificationStatus,
        verificationNotes: candidate.verificationNotes,
        missingInformationFlags: candidate.missingInformationFlags,
        createdBy: userUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (!dryRun) {
        try {
          await setDoc(doc(db, 'projects', candidate.canonicalId), projectDocPayload);
        } catch (err: any) {
          console.error(`Failed to write project ${candidate.canonicalId}:`, err);
          errors.push(`Error writing ${candidate.canonicalId}: ${err.message}`);
        }
      }

      itemizedResults.push({
        candidateId: candidate.canonicalId,
        projectCode: candidate.projectCode,
        projectTitle: candidate.projectTitle,
        action: 'CREATE',
        existingDocId: candidate.canonicalId,
        matchReason: 'Missing in Firestore, added with stable canonical ID',
        changesSummary: [
          `Created with code ${candidate.projectCode}`,
          `Type: ${candidate.projectType}`,
          `Ownership: ${candidate.ownershipType}`,
          `Verification: ${candidate.dataVerificationStatus}`
        ],
        verificationStatus: candidate.dataVerificationStatus
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    isDryRun: dryRun,
    totalCandidates: HISTORICAL_PROJECTS_INVENTORY.length,
    existingProjectsInDb: existingDocs.length,
    matchedExisting: matchedExistingCount,
    newProjectsToCreate: newProjectsToCreateCount,
    duplicatesDetected: duplicatesDetectedCount,
    conflictsFlagged: conflictsFlaggedCount,
    projectsRequiringReview: requiringReviewCount,
    projectsMissingClient: missingClientCount,
    projectsMissingEmployer: missingEmployerCount,
    projectsMissingDates: missingDatesCount,
    projectsVerifiedCompleted: verifiedCompletedCount,
    projectsApprovedPortfolio: approvedPortfolioCount,
    itemizedResults,
    errors
  };
}
