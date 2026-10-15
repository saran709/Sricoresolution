export interface JobOpening {
  id: string;
  title: string;
  department: string;
  category: 'Software & Engineering' | 'Hardware & IoT' | 'AI & Machine Learning' | 'Design & Creative' | 'Business & Growth';
  type: 'Full-Time' | 'Contract' | 'Hybrid';
  location: string;
  experience: string;
  salary: string;
  postedDate: string;
  openingsCount: number;
  overview: string;
  keyResponsibilities: string[];
  requirements: string[];
  technologies: string[];
  featured?: boolean;
}

export const OFFICIAL_JOB_OPENINGS: JobOpening[] = [
  {
    id: 'full-stack-engineer',
    title: 'Senior Full Stack Software Engineer',
    department: 'Software Engineering',
    category: 'Software & Engineering',
    type: 'Full-Time',
    location: 'Namakkal, TN (Hybrid / On-site)',
    experience: '2 - 5 Years',
    salary: '₹6,00,000 - ₹12,00,000 / year',
    postedDate: 'Actively Hiring',
    openingsCount: 2,
    overview: 'Lead the architecture and delivery of scalable enterprise web applications, real-time dashboards, and secure REST/GraphQL APIs for industrial and commercial clients.',
    keyResponsibilities: [
      'Architect robust web applications using React, TypeScript, Node.js, and modern databases.',
      'Collaborate with hardware and AI teams to build responsive telemetry and control dashboards.',
      'Design clean RESTful and WebSocket API endpoints with high availability and rigorous automated testing.',
      'Mentor junior engineers and interns through code reviews, design docs, and best practices.'
    ],
    requirements: [
      'Bachelor’s or Master’s in Computer Science, Information Technology, or equivalent experience.',
      'Strong proficiency in TypeScript, React, Node.js, and SQL / NoSQL database design.',
      'Hands-on experience with Git, Docker, cloud deployment pipelines, and Linux environments.',
      'Solid problem-solving mindset and clear technical communication.'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Git'],
    featured: true
  },
  {
    id: 'embedded-firmware-engineer',
    title: 'Embedded Systems & Firmware Engineer',
    department: 'Hardware & IoT',
    category: 'Hardware & IoT',
    type: 'Full-Time',
    location: 'Namakkal, TN (On-site Lab)',
    experience: '1 - 4 Years',
    salary: '₹5,00,000 - ₹10,00,000 / year',
    postedDate: 'Actively Hiring',
    openingsCount: 2,
    overview: 'Develop low-level firmware for connected microcontroller systems (ESP32, STM32, ARM Cortex-M) and bridge sensor telemetry with industrial edge gateways.',
    keyResponsibilities: [
      'Write highly optimized, low-power C/C++ firmware for ESP32, STM32, and Nordic microcontrollers.',
      'Implement IoT networking protocols including MQTT, BLE, Zigbee, LoRaWAN, and Modbus/CAN bus.',
      'Perform hardware bring-up, debugging with oscilloscopes, logic analyzers, and multimeters.',
      'Collaborate with PCB layout designers on schematic review and board verification.'
    ],
    requirements: [
      'Degree in Electronics & Communication, Electrical Engineering, or Mechatronics.',
      'Deep expertise in Embedded C/C++, FreeRTOS, and peripheral protocols (SPI, I2C, UART, ADC).',
      'Experience bringing up custom hardware boards and testing wireless RF modules.',
      'Familiarity with firmware OTA updates and secure bootloader implementations.'
    ],
    technologies: ['Embedded C', 'C++', 'FreeRTOS', 'ESP32 / ESP-IDF', 'STM32Cube', 'MQTT', 'BLE', 'Modbus'],
    featured: true
  },
  {
    id: 'applied-ai-ml-engineer',
    title: 'Applied AI & Machine Learning Engineer',
    department: 'AI & Data Science',
    category: 'AI & Machine Learning',
    type: 'Full-Time',
    location: 'Namakkal, TN (Hybrid / Remote Option)',
    experience: '1 - 3 Years',
    salary: '₹6,50,000 - ₹11,00,000 / year',
    postedDate: 'Actively Hiring',
    openingsCount: 1,
    overview: 'Train, fine-tune, and deploy predictive models, computer vision pipelines, and LLM-powered enterprise workflows for real-time industrial inspection and automation.',
    keyResponsibilities: [
      'Build and optimize computer vision models (YOLO, OpenCV) for defect detection and visual telemetry.',
      'Develop LLM pipelines, RAG systems, and semantic search interfaces for internal documentation.',
      'Deploy containerized ML models as high-throughput inference APIs using FastAPI and Triton/Docker.',
      'Partner with domain experts to label, clean, and augment proprietary dataset pipelines.'
    ],
    requirements: [
      'Degree in Computer Science, AI/Data Science, or Mathematics.',
      'Solid command of Python, PyTorch / TensorFlow, Scikit-Learn, and OpenCV.',
      'Understanding of modern NLP/LLM architectures, embeddings, vector databases, and quantization.',
      'Experience serving models behind REST APIs with Docker on GPU or edge runtimes.'
    ],
    technologies: ['Python', 'PyTorch', 'OpenCV', 'FastAPI', 'Hugging Face', 'Docker', 'Vector DBs', 'NumPy / Pandas'],
    featured: true
  },
  {
    id: 'hardware-pcb-designer',
    title: 'Hardware & PCB Design Engineer',
    department: 'Hardware & IoT',
    category: 'Hardware & IoT',
    type: 'Full-Time',
    location: 'Namakkal, TN (On-site Lab)',
    experience: '1 - 3 Years',
    salary: '₹4,50,000 - ₹8,50,000 / year',
    postedDate: 'New Opening',
    openingsCount: 1,
    overview: 'Design multi-layer schematics and PCB layouts for industrial IoT nodes, smart metering, sensor interfaces, and power regulation circuits.',
    keyResponsibilities: [
      'Design high-density multi-layer PCBs using KiCad / Altium Designer adhering to DFM/DFA standards.',
      'Select components, build BOMs, and manage prototype assembly with fabrication vendors.',
      'Conduct signal integrity, EMI/EMC compliance analysis, and power dissipation calculations.',
      'Build bench testing setups and validation test suites for pre-production prototypes.'
    ],
    requirements: [
      'Degree in EEE, ECE, or related hardware engineering field.',
      'Proven portfolio of manufactured PCBs (schematic + layout + assembled units).',
      'Knowledge of power supply topologies (buck, boost, LDO) and sensor signal conditioning.',
      'Soldering skills with fine-pitch SMD components for prototype assembly.'
    ],
    technologies: ['KiCad', 'Altium Designer', 'Circuit Simulation (SPICE)', 'BOM Management', 'Soldering & Bring-up', 'EMC/EMI'],
    featured: false
  },
  {
    id: 'ui-ux-frontend-designer',
    title: 'UI/UX Designer & Product Specialist',
    department: 'Product & Design',
    category: 'Design & Creative',
    type: 'Full-Time',
    location: 'Namakkal, TN (Hybrid)',
    experience: '1 - 3 Years',
    salary: '₹4,50,000 - ₹8,00,000 / year',
    postedDate: 'New Opening',
    openingsCount: 1,
    overview: 'Shape intuitive, beautiful digital experiences across our web platforms, telemetry monitors, mobile apps, and client portals.',
    keyResponsibilities: [
      'Create high-fidelity wireframes, interactive user flows, and Figma design tokens.',
      'Build comprehensive design systems with clear guidelines for typography, color, and spacing.',
      'Conduct usability tests and translate client feedback into refined UI components.',
      'Work closely with frontend engineers to ensure pixel-perfect fidelity in React and Tailwind CSS.'
    ],
    requirements: [
      'Strong portfolio demonstrating Web & Mobile UX/UI case studies.',
      'Mastery of Figma (auto-layout, components, variants, variables, prototyping).',
      'Understanding of modern frontend implementation (HTML, Tailwind CSS, component grids).',
      'Empathy for end users and ability to simplify complex data workflows.'
    ],
    technologies: ['Figma', 'Design Systems', 'Wireframing', 'User Research', 'Tailwind CSS', 'Prototyping'],
    featured: false
  },
  {
    id: 'cloud-devops-engineer',
    title: 'DevOps & Cloud Systems Engineer',
    department: 'Software Engineering',
    category: 'Software & Engineering',
    type: 'Full-Time',
    location: 'Namakkal, TN (Hybrid / Remote)',
    experience: '2 - 4 Years',
    salary: '₹6,00,000 - ₹11,00,000 / year',
    postedDate: 'Actively Hiring',
    openingsCount: 1,
    overview: 'Manage automated deployment pipelines, cloud infrastructure, container orchestration, and system reliability for client applications.',
    keyResponsibilities: [
      'Maintain CI/CD pipelines using GitHub Actions, Docker, and container registries.',
      'Manage cloud infrastructure on AWS / GCP / Cloud Run with Terraform or declarative configs.',
      'Set up observability, logging, and metrics alerting (Prometheus, Grafana, CloudWatch).',
      'Enforce cybersecurity best practices, SSL/TLS certificates, firewall rules, and secrets management.'
    ],
    requirements: [
      'Degree in Computer Science or proven DevOps engineering background.',
      'Strong Linux system administration and shell scripting skills (Bash, Python).',
      'Hands-on experience with Docker, Kubernetes or Cloud Run, and CI/CD automation.',
      'Understanding of network security, DNS, reverse proxies (Nginx), and backup strategies.'
    ],
    technologies: ['Docker', 'Kubernetes', 'GitHub Actions', 'AWS / GCP', 'Linux / Bash', 'Nginx', 'Terraform', 'PostgreSQL'],
    featured: false
  }
];
