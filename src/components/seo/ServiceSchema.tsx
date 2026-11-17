import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';

export type EngineeringServiceKey =
  | 'services-hub'
  | 'software-solutions'
  | 'hardware-solutions'
  | 'ai-solutions'
  | 'research-services'
  | 'internship-programs';

export interface SubServiceOfferingSchema {
  name: string;
  description: string;
  serviceOutput: string[];
}

export interface ServiceWorkflowStepSchema {
  position: number;
  name: string;
  description: string;
}

export interface EngineeringServiceSchemaDefinition {
  key: EngineeringServiceKey;
  path: string;
  name: string;
  alternateName: string[];
  serviceType: string;
  category: string;
  description: string;
  audienceType: string;
  serviceOutput: string[];
  knowsAbout: string[];
  offerings: SubServiceOfferingSchema[];
  workflowName?: string;
  workflowSteps?: ServiceWorkflowStepSchema[];
}

export const ENGINEERING_SERVICE_SCHEMAS: Record<
  EngineeringServiceKey,
  EngineeringServiceSchemaDefinition
> = {
  'services-hub': {
    key: 'services-hub',
    path: '/services',
    name: 'Sricore Solutions Engineering & R&D Services',
    alternateName: [
      'Full-Lifecycle Technology Engineering Services',
      'Software, Hardware, AI & Research Consulting',
    ],
    serviceType: 'End-to-End Software, Embedded Hardware, AI/ML & Scientific R&D Engineering',
    category: 'Multidisciplinary Engineering & Technology Services',
    description:
      'Comprehensive technology engineering services spanning enterprise software development, embedded hardware & industrial IoT, applied artificial intelligence, scientific R&D, and mentored internship cohorts.',
    audienceType: 'Enterprises, Industrial Manufacturers, Startups, R&D Labs, and Universities',
    serviceOutput: [
      'Production Cloud & Web Applications',
      'Multi-Layer PCBs & Embedded RTOS Firmware',
      'Quantized Edge AI & Computer Vision Pipelines',
      'Empirical Simulation Testbeds & IEEE/Scopus Technical Manuscripts',
      'ISO-Aligned Mentored Engineering Capstone Portfolios',
    ],
    knowsAbout: [
      'Full-Stack Web & Cloud Architecture',
      'Embedded Systems & Industrial IoT',
      'Computer Vision & Retrieval-Augmented Generation (RAG)',
      'Algorithmic Benchmarking & Scientific Simulation',
      'Industrial Engineering Mentorship',
    ],
    offerings: [
      {
        name: 'Custom Enterprise Software Development',
        description:
          'Architecting resilient full-stack web platforms, distributed microservices, role-based enterprise portals, and secure REST/GraphQL APIs.',
        serviceOutput: [
          'React, TypeScript & Node.js Architectures',
          'Multi-Tenant SaaS & RBAC Portals',
          'Cloud-Native Deployment & CI/CD Pipelines',
        ],
      },
      {
        name: 'Hardware & Industrial IoT Engineering',
        description:
          'End-to-end embedded product engineering covering multi-layer PCB layout, real-time RTOS firmware for STM32/ESP32 microcontrollers, and industrial sensor networks.',
        serviceOutput: [
          'Schematic Capture & Multi-Layer PCB Design',
          'Bare-Metal & FreeRTOS Embedded Firmware',
          'Industrial Telemetry & Edge Gateways',
        ],
      },
      {
        name: 'AI & Machine Learning Solutions',
        description:
          'Designing production-ready machine learning pipelines, automated optical defect inspection systems, domain-grounded RAG architectures, and quantized edge models.',
        serviceOutput: [
          'Real-Time Computer Vision & Defect Detection',
          'Custom LLM Workflows & RAG Knowledge Engines',
          'Predictive Maintenance & Time-Series Modeling',
        ],
      },
      {
        name: 'Scientific Research & Development Services',
        description:
          'Bridging theoretical innovation and empirical proof through mathematical modeling, comparative algorithm benchmarking, simulation design, and publication-grade manuscripts.',
        serviceOutput: [
          'Algorithm Design & Empirical Benchmarking',
          'Simulation Environments & Hardware-in-the-Loop',
          'IEEE / Scopus Manuscript & Patent Documentation',
        ],
      },
      {
        name: 'Industrial Engineering Internship & Training Programs',
        description:
          'Structured, hands-on engineering cohorts where undergraduate and postgraduate trainees build production software, embedded IoT prototypes, and AI pipelines.',
        serviceOutput: [
          'Live Industrial Codebases & Hardware Lab Access',
          '1-on-1 Senior Engineer Code & Design Reviews',
          'Verified Capstone Portfolio & ISO-Aligned Certification',
        ],
      },
    ],
  },

  'software-solutions': {
    key: 'software-solutions',
    path: '/solutions/software',
    name: 'Custom Enterprise Software & Cloud Architecture Services',
    alternateName: [
      'Full-Stack Web & Microservices Engineering',
      'Enterprise SaaS & API Development',
    ],
    serviceType: 'Enterprise Web Application, Cloud Microservices & API Software Engineering',
    category: 'Software Engineering',
    description:
      'Full-lifecycle architecture and development of fault-tolerant React 19 / TypeScript web applications, distributed Node.js/Go backend APIs, cloud-native Kubernetes infrastructure, and cross-platform mobile systems.',
    audienceType: 'Enterprise CTOs, SaaS Product Teams, FinTech, Healthcare, and Industrial Operations',
    serviceOutput: [
      'Multi-Tenant React & TypeScript Web Applications',
      'RESTful, GraphQL & gRPC Backend Microservices',
      'Terraform & Kubernetes CI/CD Cloud Infrastructure',
      'Offline-First Cross-Platform Mobile Apps',
      'OWASP-Audited Zero-Trust Authentication & RBAC Systems',
    ],
    knowsAbout: [
      'React 19',
      'TypeScript',
      'Next.js',
      'Node.js',
      'PostgreSQL',
      'GraphQL & gRPC',
      'Docker & Kubernetes',
      'Terraform Infrastructure as Code',
      'Role-Based Access Control (RBAC)',
    ],
    offerings: [
      {
        name: 'Enterprise Web Applications',
        description:
          'Robust, multi-tenant, and fault-tolerant web applications engineered using TypeScript, React 19, Next.js, and Node.js microservices with sub-second API latencies.',
        serviceOutput: [
          'Micro-frontends & SSR',
          'Role-Based Access Control (RBAC)',
          'Real-time WebSockets',
          'Progressive Web App (PWA)',
        ],
      },
      {
        name: 'Distributed Backend & API Engineering',
        description:
          'Scalable RESTful, gRPC, and GraphQL API architectures with message brokering (Kafka/RabbitMQ) and distributed caching (Redis).',
        serviceOutput: [
          'Clean Architecture & CQRS',
          'Rate Limiting & Token Bucket',
          'Database Sharding & Read Replicas',
          'OpenAPI 3.0 Documentation',
        ],
      },
      {
        name: 'Cloud Infrastructure & DevOps Automation',
        description:
          'Automated Infrastructure as Code (Terraform, Pulumi) deploying containerized applications (Docker, Kubernetes) to AWS, Google Cloud, and Azure.',
        serviceOutput: [
          'Zero-Downtime Blue/Green Deploys',
          'CI/CD GitHub Actions Pipelines',
          'Prometheus & Grafana Telemetry',
          'SOC 2 Compliance Guardrails',
        ],
      },
      {
        name: 'Cross-Platform Mobile Applications',
        description:
          'High-performance native and cross-platform mobile apps engineered with React Native and Kotlin/Swift, featuring offline-first local synchronization.',
        serviceOutput: [
          'Offline SQLite/WatermelonDB Sync',
          'Biometric Authentication',
          'Push Notification Gateways',
          'Smooth 60/120 FPS UI',
        ],
      },
      {
        name: 'Legacy Monolith Modernization',
        description:
          'Strangler-pattern migration of legacy monolithic codebases into decoupled, resilient cloud-native services with zero operational disruption.',
        serviceOutput: [
          'Dependency Graph Decoupling',
          'Incremental Strangler Migrations',
          'Database Schema De-normalization',
          'Automated Regression Harnesses',
        ],
      },
      {
        name: 'Application Security & Zero-Trust Auditing',
        description:
          'End-to-end security audits including SAST/DAST scanning, OWASP Top 10 mitigation, OAuth 2.0 / OIDC integrations, and cryptographic key rotation.',
        serviceOutput: [
          'OWASP ASVS Verification',
          'AES-256 / ChaCha20 Encryption',
          'Automated Penetration Testing',
          'Audit Event Immutability',
        ],
      },
    ],
    workflowName: 'Sricore Software Engineering Architecture Standards',
    workflowSteps: [
      {
        position: 1,
        name: 'Domain-Driven Design (DDD)',
        description:
          'Structuring domain models, bounded contexts, and aggregates to align code directly with complex business logic.',
      },
      {
        position: 2,
        name: 'Asynchronous Event-Driven Decoupling',
        description:
          'Utilizing pub/sub patterns and durable queues to prevent cascading failures and guarantee high write throughput.',
      },
      {
        position: 3,
        name: 'Zero-Trust Perimeter Security',
        description:
          'Authenticating and authorizing every API call with short-lived JWT tokens, HMAC signature verification, and least-privilege IAM roles.',
      },
      {
        position: 4,
        name: 'Comprehensive Automated Testing',
        description:
          'Enforcing minimum 85% test coverage through unit tests, integration tests, and end-to-end browser journeys.',
      },
    ],
  },

  'hardware-solutions': {
    key: 'hardware-solutions',
    path: '/solutions/hardware',
    name: 'Embedded Hardware, PCB Layout & Industrial IoT Engineering',
    alternateName: [
      'Industrial IoT Telemetry & Edge Gateway Engineering',
      'Custom Multi-Layer PCB & RTOS Firmware Design',
    ],
    serviceType: 'Embedded Systems, Multi-Layer PCB Design & Industrial IoT Telemetry Engineering',
    category: 'Hardware & IoT Engineering',
    description:
      'Design, prototyping, and manufacturing of durable physical and embedded systems including 4-to-8 layer PCBs, deterministic FreeRTOS/Zephyr firmware for STM32/ESP32, Modbus/CAN/LoRaWAN edge gateways, and NVIDIA Jetson edge AI vision rigs.',
    audienceType: 'Industrial Automation Plants, OEMs, Hardware Startups, Smart Grid & AgTech Providers',
    serviceOutput: [
      'Altium & KiCad Schematic Capture, BOM & Fabrication Gerbers',
      'Deterministic C/C++ & Rust RTOS Firmware Binaries',
      'Modbus RTU/TCP, CAN Bus, LoRaWAN & MQTT/TLS Edge Gateways',
      'Low-Power Vibrational & Environmental Sensor Nodes',
      'PLC / SCADA Industrial Control Panels & Edge AI Vision Rigs',
    ],
    knowsAbout: [
      'STM32 ARM Cortex-M',
      'ESP32 & Nordic nRF52',
      'FreeRTOS & Zephyr RTOS',
      'Altium Designer & KiCad PCB Layout',
      'Modbus RTU/TCP & CAN 2.0B',
      'LoRaWAN & NB-IoT',
      'MQTT over TLS 1.3',
      'NVIDIA Jetson Edge AI Acceleration',
    ],
    offerings: [
      {
        name: 'Embedded Firmware & RTOS Development',
        description:
          'Low-level firmware development in C/C++ and Rust for ARM Cortex-M (STM32, NXP), ESP32, and Nordic nRF series running FreeRTOS and Zephyr.',
        serviceOutput: [
          'Deterministic FreeRTOS & Zephyr',
          'DMA & Hardware Interrupt Drivers',
          'Ultra-Low Power Sleep Profiles',
          'Secure Boot & OTA Firmware Updates',
        ],
      },
      {
        name: 'Custom PCB Design & Rapid Prototyping',
        description:
          'Multi-layer PCB schematic design, high-speed trace routing, impedance matching, thermal dissipation modeling, and fabrication gerbers (Altium/KiCad).',
        serviceOutput: [
          '4 to 8 Layer High-Density Interconnects',
          'Controlled Impedance Differential Pairs',
          'EMI / EMC Compliance Pre-Scans',
          'SMD Assembly & Stencil Verification',
        ],
      },
      {
        name: 'Industrial IoT & Telemetry Gateways',
        description:
          'Edge computing gateways translating industrial protocols (Modbus RTU/TCP, CAN bus, Profinet) into secure cloud telemetry via MQTT/TLS and HTTPS.',
        serviceOutput: [
          'RS-485 / Modbus Isolation',
          'CAN 2.0B / J1939 Telematics',
          '4G LTE-M / NB-IoT / LoRaWAN',
          'TLS 1.3 Hardware Cryptography',
        ],
      },
      {
        name: 'Sensor Network Engineering',
        description:
          'Design of distributed environmental and vibrational sensor nodes with sub-microamp sleep currents for condition-based machinery monitoring.',
        serviceOutput: [
          'Tri-axial Accelerometer Sampling',
          'Precision ADC Calibration',
          'Energy Harvesting Circuits',
          'Long-Range Mesh Topologies',
        ],
      },
      {
        name: 'Industrial Automation & PLC Integration',
        description:
          'Commissioning programmable logic controllers, industrial relay racks, pneumatic diverters, and SCADA human-machine interfaces.',
        serviceOutput: [
          'Siemens & Allen-Bradley Ladders',
          'Optocoupled 24V Industrial I/O',
          'Emergency Stop Safety Relays',
          'Factory Floor SCADA Dashboards',
        ],
      },
      {
        name: 'Edge AI Hardware Acceleration',
        description:
          'Integration of dedicated neural accelerator chips (NVIDIA Jetson, Coral Edge TPU, Hailo) for real-time edge computer vision and defect classification.',
        serviceOutput: [
          'TensorRT FP16 Acceleration',
          'Global Shutter Camera Interfaces',
          'Sub-15ms Inference Latencies',
          'Passive Heat Pipe Enclosures',
        ],
      },
    ],
    workflowName: 'End-to-End Industrial IoT Stack Architecture',
    workflowSteps: [
      {
        position: 1,
        name: 'Sensing & Actuation Layer',
        description:
          'Microcontrollers (STM32/ESP32) reading analog/digital sensors via I2C, SPI, and UART with hardware interrupts and ADC oversampling.',
      },
      {
        position: 2,
        name: 'Secure Edge Gateway Layer',
        description:
          'Local data aggregation, JSON/Protobuf serialization, and edge filtering to suppress noise and conserve bandwidth.',
      },
      {
        position: 3,
        name: 'Resilient Wireless Transport',
        description:
          'Transmission across cellular 4G/NB-IoT, LoRaWAN, or WiFi with automatic offline queueing and exponential backoff retry logic.',
      },
      {
        position: 4,
        name: 'Cloud Ingestion & Real-Time Telemetry',
        description:
          'Broker ingestion via MQTT over TLS into TimescaleDB and real-time visualization on WebSocket telemetry dashboards.',
      },
    ],
  },

  'ai-solutions': {
    key: 'ai-solutions',
    path: '/solutions/ai-ml',
    name: 'Applied Artificial Intelligence, Computer Vision & Enterprise RAG Solutions',
    alternateName: [
      'Industrial Computer Vision & Edge AI Engineering',
      'Custom LLM, RAG & Predictive Maintenance Analytics',
    ],
    serviceType: 'Computer Vision Defect Inspection, Generative AI RAG Pipelines & MLOps Engineering',
    category: 'Artificial Intelligence & Machine Learning',
    description:
      'Engineering empirical AI and machine learning systems including sub-millimeter YOLOv8/TensorRT optical defect inspection, enterprise Retrieval-Augmented Generation (RAG) knowledge pipelines, predictive maintenance time-series models, and quantized edge inference.',
    audienceType: 'Manufacturing Quality Assurance Teams, Enterprise Knowledge Operations, Healthcare & Logistics',
    serviceOutput: [
      'TensorRT & ONNX Quantized Computer Vision Models',
      'Enterprise RAG Pipelines with Vector Search & Verifiable Citations',
      'Predictive Maintenance & Remaining Useful Life (RUL) Forecasting Engines',
      'Custom NLP Entity Extraction & Document Classification Models',
      'DVC Versioned Datasets & MLflow Governance Pipelines',
    ],
    knowsAbout: [
      'PyTorch & TensorFlow',
      'YOLOv8 & OpenCV Computer Vision',
      'NVIDIA TensorRT & ONNX Quantization',
      'Retrieval-Augmented Generation (RAG)',
      'Pinecone, ChromaDB & pgvector',
      'Predictive Maintenance LSTM & XGBoost',
      'MLflow & DVC MLOps',
    ],
    offerings: [
      {
        name: 'Edge Computer Vision & Defect Classification',
        description:
          'Sub-millimeter automated optical inspection (AOI) utilizing custom-trained YOLOv8 and TensorRT-quantized CNN models executing under 14ms on NVIDIA Jetson edge silicon.',
        serviceOutput: [
          'Surface Defect Segmentation',
          'Thermal Anomaly Mapping',
          'Facial Biometrics & Liveness',
          'High-Speed Strobe Synchronization',
        ],
      },
      {
        name: 'Generative AI & Enterprise RAG Pipelines',
        description:
          'Retrieval-Augmented Generation (RAG) architectures with hybrid dense/sparse vector search (Pinecone, ChromaDB, pgvector) and local/cloud LLMs with verifiable grounding.',
        serviceOutput: [
          'Vector Embeddings & Semantic Search',
          'Deterministic Guardrails & Citations',
          'Multi-Agent Workflow Orchestration',
          'On-Premises LLM Fine-Tuning',
        ],
      },
      {
        name: 'Predictive Analytics & Industrial Telemetry',
        description:
          'Time-series forecasting models (LSTM, Prophet, XGBoost) trained on vibrational, thermal, and electrical telemetry to predict equipment failure prior to breakdown.',
        serviceOutput: [
          'Remaining Useful Life (RUL) Estimation',
          'Anomaly Detection in High-Hz Data',
          'Demand & Inventory Forecasting',
          'Automated Root-Cause Diagnosis',
        ],
      },
      {
        name: 'Natural Language Processing & Speech',
        description:
          'Custom NLP pipelines for multi-lingual sentiment analysis, entity extraction, automated contract parsing, and domain-specialized technical agents.',
        serviceOutput: [
          'Named Entity Recognition (NER)',
          'Document Parsing & Classification',
          'Audio Transcription & Diarization',
          'Zero-Shot Text Summarization',
        ],
      },
      {
        name: 'Data Engineering & Feature Stores',
        description:
          'Building production-grade ETL/ELT data pipelines with automated schema validation, drift detection, and reproducible dataset versioning (DVC).',
        serviceOutput: [
          'Distributed Ingestion Pipelines',
          'Data Drift & Concept Drift Tracking',
          'Automated Data Annotation Workflows',
          'Parquet / Delta Lake Storage',
        ],
      },
      {
        name: 'Model Governance, MLOps & Quantization',
        description:
          'End-to-end model deployment lifecycles using MLflow, Docker, ONNX runtime, and INT8/FP16 post-training quantization for low-power edge deployment.',
        serviceOutput: [
          'INT8 / FP16 Model Quantization',
          'Prometheus Inference Latency Metrics',
          'A/B Testing & Shadow Deployments',
          'Regulatory Model Explainability',
        ],
      },
    ],
    workflowName: 'Production Machine Learning Lifecycle',
    workflowSteps: [
      {
        position: 1,
        name: 'Data Ingestion & Sanitization',
        description:
          'Collecting empirical telemetry or image samples, stripping noise, balancing class representations, and validating ground-truth annotations.',
      },
      {
        position: 2,
        name: 'Architecture Selection & Training',
        description:
          'Transfer learning on state-of-the-art backbones, tuning hyper-parameters via Bayesian optimization, and tracking loss convergence.',
      },
      {
        position: 3,
        name: 'Optimization & Quantization',
        description:
          'Pruning redundant weights, compiling models with NVIDIA TensorRT or OpenVINO, reducing memory footprints by up to 70% without precision loss.',
      },
      {
        position: 4,
        name: 'Real-Time Inference & Monitoring',
        description:
          'Deploying containerized micro-services with sub-20ms SLAs, continuous logging of confidence scores, and automated alerting on dataset drift.',
      },
    ],
  },

  'research-services': {
    key: 'research-services',
    path: '/services/research',
    name: 'Scientific Research, Algorithm Benchmarking & Technical Documentation Services',
    alternateName: [
      'Applied R&D & Proof-of-Concept Prototyping',
      'IEEE, ACM, Springer & Elsevier Manuscript & Simulation Support',
    ],
    serviceType: 'Scientific Research & Development, Mathematical Modeling & PoC Engineering',
    category: 'Research & Development',
    description:
      'Rigorous scientific research, mathematical modeling, algorithm complexity optimization, reproducible Python/MATLAB/NS-3 simulation benchmarking, patent prior-art documentation, and publication-grade LaTeX manuscript preparation.',
    audienceType: 'Corporate R&D Divisions, Deep-Tech Startups, University Research Labs & Doctoral Scholars',
    serviceOutput: [
      'IEEE-Standardized Architecture Blueprints & Protocol Specifications',
      'LaTeX / Overleaf Manuscripts for IEEE, ACM, Springer & Elsevier Venues',
      'Mathematical Proofs & Asymptotic Complexity Benchmarks',
      'Reproducible Python, MATLAB, PyTorch & NS-3 Simulation Suites',
      'Hardware-in-the-Loop Proof of Concept (PoC) Prototypes & Patent Disclosures',
    ],
    knowsAbout: [
      'Algorithm Design & Big-O Complexity Analysis',
      'LaTeX & IEEE/ACM/Springer Typesetting',
      'Python, NumPy, SciPy & MATLAB Simulation',
      'NS-3 & OMNeT++ Network Simulation',
      'Statistical Hypothesis & Ablation Testing',
      'Patent Claim Structuring & Prior Art Analysis',
    ],
    offerings: [
      {
        name: 'Technical Documentation & System Specs',
        description:
          'Creation of precise, IEEE-standardized technical manuals, API documentation, architectural blueprints, and protocol specifications.',
        serviceOutput: [
          'Architecture Blueprints',
          'Swagger / OpenAPI 3.0 Specs',
          'Component Schematics',
          'Compliance Audits',
        ],
      },
      {
        name: 'Journal & Conference Paper Preparation',
        description:
          'Comprehensive assistance with research paper formatting, citation graphs, algorithmic validation, and LaTeX typesetting for high-impact IEEE, ACM, Springer, and Elsevier publications.',
        serviceOutput: [
          'LaTeX / Overleaf Typesetting',
          'Literature Reviews',
          'Experimental Visualization',
          'Plagiarism Pre-Screening',
        ],
      },
      {
        name: 'Algorithm Design & Complexity Optimization',
        description:
          'Design, computational complexity analysis (Big-O bounds), and numerical benchmarking of novel algorithms across computer vision, cryptography, and graph theory.',
        serviceOutput: [
          'Mathematical Proofs',
          'Python / NumPy Testbeds',
          'Asymptotic Profiling',
          'Hardware Accel Mapping',
        ],
      },
      {
        name: 'Proof of Concept (PoC) Engineering',
        description:
          'Rapid software and hardware prototyping to validate theoretical hypotheses before capital allocation and industrial production.',
        serviceOutput: [
          'Hardware Breadboards',
          'Benchmarked Software Prototypes',
          'Empirical Test Reports',
          'Feasibility Analyses',
        ],
      },
      {
        name: 'Academic & Institutional R&D Mentorship',
        description:
          'Technical guidance, code auditing, and experimental rigor support for postgraduate researchers, doctoral candidates, and university labs.',
        serviceOutput: [
          'Experimental Design',
          'Data Cleansing Pipelines',
          'Statistical Validation',
          'Review Defense Coaching',
        ],
      },
      {
        name: 'Patent Drafting & Technical Prior Art Review',
        description:
          'Technical claim structuring, flowcharts, block diagrams, and prior art novelty analysis for patent disclosures in software and embedded technologies.',
        serviceOutput: [
          'Method Flowcharts',
          'Independent Claim Diagrams',
          'Prior Art Matrices',
          'Specification Writeups',
        ],
      },
    ],
    workflowName: '5-Stage Scientific Research & Empirical Validation Methodology',
    workflowSteps: [
      {
        position: 1,
        name: 'Literature Review & Problem Formulation',
        description:
          'Systematic review of existing state-of-the-art literature, identifying performance gaps, edge cases, and formulating clear testable hypotheses.',
      },
      {
        position: 2,
        name: 'Mathematical & Algorithmic Modeling',
        description:
          'Formalizing mathematical representations, objective loss functions, computational constraints, and pseudo-code definitions.',
      },
      {
        position: 3,
        name: 'Sandbox Simulation & Benchmarking',
        description:
          'Implementing reproducible simulations in Python/SciPy, MATLAB, or C++ with controlled synthetic and empirical test datasets.',
      },
      {
        position: 4,
        name: 'Statistical Significance Testing',
        description:
          'Conducting multi-run confidence interval tests, ablation studies, latency distributions, and p-value statistical significance verification.',
      },
      {
        position: 5,
        name: 'Formal Documentation & Peer-Review Package',
        description:
          'Generating clean LaTeX manuscripts, vector graphics diagrams, open-source code archives, and reproducible artifact repositories.',
      },
    ],
  },

  'internship-programs': {
    key: 'internship-programs',
    path: '/internships',
    name: 'Mentored Industrial Engineering Internship & Capstone Training Programs',
    alternateName: [
      'Sricore Solutions Technical Internship Cohorts',
      'Hands-On Software, Embedded IoT & AI Industrial Training',
    ],
    serviceType: 'Mentored Industrial Engineering Cohorts & Technical Capstone Training',
    category: 'Technical Education & Engineering Training',
    description:
      'Practice-oriented industrial internship cohorts in Full-Stack Web Development, Embedded Systems & IoT, Applied AI & Computer Vision, Cloud & DevOps, and Cybersecurity with weekly senior engineer code reviews and ISO-aligned certification.',
    audienceType: 'Undergraduate (B.E./B.Tech/B.Sc/BCA) and Postgraduate (M.E./M.Tech/MCA/M.Sc) Engineering Students',
    serviceOutput: [
      'Production-Grade GitHub & Hardware Capstone Portfolios',
      'Weekly Senior Engineer Code & Architecture Review Evaluations',
      'ISO-Aligned Internship Completion Certificate with Verification ID',
    ],
    knowsAbout: [
      'Full-Stack Web Development Training',
      'Embedded Firmware & IoT Hardware Training',
      'Applied AI & Computer Vision Mentorship',
      'Cloud & DevOps Engineering Cohorts',
    ],
    offerings: [
      {
        name: 'Full-Stack Web & Cloud Engineering Track',
        description:
          'Hands-on training in React, TypeScript, Node.js, REST/GraphQL APIs, relational/NoSQL databases, and cloud CI/CD deployment.',
        serviceOutput: [
          'Production Full-Stack Web App Capstone',
          'REST API & RBAC Security Implementation',
          'Senior Engineer Code Review Report',
        ],
      },
      {
        name: 'Embedded Systems, PCB & Industrial IoT Track',
        description:
          'Practical embedded engineering with STM32/ESP32 microcontrollers, FreeRTOS, schematic capture, PCB layout, and MQTT/Modbus telemetry.',
        serviceOutput: [
          'Custom PCB Schematic & Layout Files',
          'STM32/ESP32 Firmware & Sensor Telemetry Node',
          'Hardware Lab Evaluation & Certificate',
        ],
      },
      {
        name: 'Applied AI, Machine Learning & Computer Vision Track',
        description:
          'Building and deploying computer vision models, predictive analytics pipelines, and Retrieval-Augmented Generation (RAG) applications.',
        serviceOutput: [
          'Trained & Benchmarked ML/Vision Model',
          'Containerized Inference API or Edge Deployment',
          'Empirical Model Evaluation Report',
        ],
      },
    ],
  },
};

export function resolveEngineeringServiceSchemaByPath(
  pathname: string
): EngineeringServiceSchemaDefinition | null {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  switch (normalized) {
    case '/services':
      return ENGINEERING_SERVICE_SCHEMAS['services-hub'];
    case '/solutions/software':
      return ENGINEERING_SERVICE_SCHEMAS['software-solutions'];
    case '/solutions/hardware':
      return ENGINEERING_SERVICE_SCHEMAS['hardware-solutions'];
    case '/solutions/ai-ml':
      return ENGINEERING_SERVICE_SCHEMAS['ai-solutions'];
    case '/services/research':
      return ENGINEERING_SERVICE_SCHEMAS['research-services'];
    case '/internships':
      return ENGINEERING_SERVICE_SCHEMAS['internship-programs'];
    default:
      return null;
  }
}

export function buildServiceJsonLdNodes(
  schemaDef: EngineeringServiceSchemaDefinition,
  origin: string,
  brandName: string,
  contactEmail: string,
  contactPhone: string
): Record<string, unknown>[] {
  const canonicalUrl = `${origin}${schemaDef.path}`;
  const orgId = `${origin}/#organization`;
  const serviceId = `${canonicalUrl}#engineering-service`;
  const catalogId = `${canonicalUrl}#offer-catalog`;

  const nodes: Record<string, unknown>[] = [
    {
      '@type': 'Service',
      '@id': serviceId,
      name: schemaDef.name,
      alternateName: schemaDef.alternateName,
      serviceType: schemaDef.serviceType,
      category: schemaDef.category,
      description: schemaDef.description,
      url: canonicalUrl,
      mainEntityOfPage: {
        '@id': `${canonicalUrl}#webpage`,
      },
      provider: {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': orgId,
        name: brandName,
        url: origin,
        email: contactEmail,
        telephone: contactPhone,
      },
      brand: {
        '@type': 'Brand',
        name: brandName,
      },
      areaServed: [
        { '@type': 'Country', name: 'India' },
        { '@type': 'Country', name: 'United States' },
        { '@type': 'Country', name: 'United Kingdom' },
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'Singapore' },
      ],
      audience: {
        '@type': 'Audience',
        audienceType: schemaDef.audienceType,
      },
      knowsAbout: schemaDef.knowsAbout,
      serviceOutput: schemaDef.serviceOutput.map((output) => ({
        '@type': 'Thing',
        name: output,
      })),
      termsOfService: `${origin}/terms`,
      availableChannel: {
        '@type': 'ServiceChannel',
        name: `${brandName} Technical Discovery & Quote Desk`,
        serviceUrl: `${origin}/enquiry`,
        servicePhone: contactPhone,
        availableLanguage: ['English', 'Tamil'],
      },
      potentialAction: {
        '@type': 'AskAction',
        name: `Request a ${schemaDef.name} Consultation`,
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${origin}/enquiry`,
          inLanguage: 'en-IN',
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform',
          ],
        },
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        '@id': catalogId,
        name: `${schemaDef.name} – Specialized Engineering Offerings`,
        itemListElement: schemaDef.offerings.map((offering, index) => ({
          '@type': 'Offer',
          position: index + 1,
          itemOffered: {
            '@type': 'Service',
            '@id': `${canonicalUrl}#offering-${index + 1}`,
            name: offering.name,
            description: offering.description,
            category: schemaDef.category,
            provider: { '@id': orgId },
            serviceOutput: offering.serviceOutput.map((deliverable) => ({
              '@type': 'Thing',
              name: deliverable,
            })),
          },
        })),
      },
    },
  ];

  // Add HowTo / Engineering Process Schema when the service page defines an engineering methodology
  if (schemaDef.workflowName && schemaDef.workflowSteps && schemaDef.workflowSteps.length > 0) {
    nodes.push({
      '@type': 'HowTo',
      '@id': `${canonicalUrl}#engineering-methodology`,
      name: schemaDef.workflowName,
      description: `Step-by-step engineering workflow and quality architecture for ${schemaDef.name} at ${brandName}.`,
      step: schemaDef.workflowSteps.map((step) => ({
        '@type': 'HowToStep',
        position: step.position,
        name: step.name,
        text: step.description,
        url: `${canonicalUrl}#step-${step.position}`,
      })),
    });
  }

  return nodes;
}

export interface ServiceSchemaProps {
  serviceKey: EngineeringServiceKey;
}

/**
 * Injects dedicated Schema.org Service & HowTo JSON-LD structured data for a specific
 * Sricore Solutions engineering service page.
 */
export const ServiceSchema: React.FC<ServiceSchemaProps> = ({ serviceKey }) => {
  const { settings } = useWebsiteSettings();
  const schemaDef = ENGINEERING_SERVICE_SCHEMAS[serviceKey];

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.sricoresolutions.com';

  const brandName = settings?.brandName || 'Sricore Solutions';
  const contactEmail = settings?.contact?.primaryEmail || 'contact@sricoresolutions.com';
  const contactPhone = settings?.contact?.primaryPhone || '+91-98402-34567';

  const jsonLdPayload = useMemo(() => {
    const nodes = buildServiceJsonLdNodes(
      schemaDef,
      origin,
      brandName,
      contactEmail,
      contactPhone
    );
    return {
      '@context': 'https://schema.org',
      '@graph': nodes,
    };
  }, [schemaDef, origin, brandName, contactEmail, contactPhone]);

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLdPayload)}</script>
    </Helmet>
  );
};

export default ServiceSchema;
