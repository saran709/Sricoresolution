export interface FormInternshipDomain {
  id: string;
  name: string; // Exact match to Google Form option
  category: 'Software & Engineering' | 'Design & Creative' | 'Business & Growth';
  tagline: string;
  duration: string;
  projectsCount: string;
  mode: string;
  description: string;
  technologies: string[];
  keyTopics: string[];
  projectExamples: string[];
  eligibility: string;
  perks: string[];
  gformUrl?: string;
  popular?: boolean;
}

export const GFORM_CONFIG = {
  url: 'https://forms.gle/StQmejms3z9voMMU7',
  embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScuN-J7t7_FFFotaQ3rnKVU2BVZVv1SSmGzaJv5CmEYq7zffg/viewform?embedded=true',
  title: 'INTERNSHIP REGISTRATION',
  type: 'Industrial Internship Program',
  offerLetterTime: '24 - 48 Hours',
  duration: '1 Month',
  projectsRequired: '2+ Industry Projects',
  certificates: [
    'Program Completion Certificate issued by Sricore Solutions',
    '1-Month Co-Branded Internship Certificate',
    'Letter of Recommendation (Performance-based)'
  ],
  perks: [
    'Mock Interview Preparation Tips & Technical Guidance',
    'Professional Resume & LinkedIn Profile Building Sessions',
    'Exclusive Access to Peer & Mentorship Growth Community',
    'Opportunity to Participate in Live Hackathons & Challenges',
    'Fast-track Offer Letter Delivery in 24 - 48 hours'
  ],
  requiredDetailsInForm: [
    'Full Name',
    'Contact Number (WhatsApp)',
    'Email Address',
    'College / University Name',
    'Gender',
    'Academic Qualification / Degree',
    'Selected Internship Domain',
    'LinkedIn Follow Status',
    'Telegram Community Join Status'
  ]
};

export const OFFICIAL_GFORM_INTERNSHIPS: FormInternshipDomain[] = [
  {
    id: 'python-programming',
    name: 'Python Programming',
    category: 'Software & Engineering',
    tagline: 'Master Python syntax, OOP, automation scripts, and foundational data structures.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'Learn modern Python programming from fundamental syntax to Object-Oriented Design, file automation, API consumption, and modular coding practices required by software enterprises.',
    technologies: ['Python 3', 'OOP Concepts', 'Data Structures', 'File I/O & Automation', 'Requests / APIs', 'PyTest'],
    keyTopics: [
      'Core syntax, data types, collections (lists, tuples, dicts, sets)',
      'Object-Oriented Programming (Classes, Inheritance, Polymorphism)',
      'Modular code design, package management (pip/virtualenv)',
      'Working with JSON, CSV, and RESTful API consumption',
      'Automated script development and error handling'
    ],
    projectExamples: [
      'Automated Multi-Source Web Scraper & Data Digest Generator',
      'CLI-Based Task Management & Workflow Automation System'
    ],
    eligibility: 'Open to all students with basic algorithmic thinking. No prior advanced programming required.',
    perks: ['Verified 1-Month Certificate', 'Code Review from Mentors', 'Fast Offer Letter'],
    gformUrl: 'https://forms.gle/StQmejms3z9voMMU7',
    popular: true
  },
  {
    id: 'java-programming',
    name: 'Java Programming',
    category: 'Software & Engineering',
    tagline: 'Robust enterprise-grade OOP, Collections Framework, multithreading, and JDBC.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'Deep dive into industry-standard Java development. Master Object-Oriented principles, memory management, the Collections Framework, multithreading, and SQL database persistence using JDBC.',
    technologies: ['Java 17/21', 'OOP & Design Patterns', 'Collections Framework', 'Multithreading', 'JDBC / MySQL', 'Maven'],
    keyTopics: [
      'JVM architecture, memory management, and clean code practices',
      'Deep OOP principles: Abstraction, Encapsulation, Polymorphism, Interfaces',
      'Advanced Collections (Lists, Sets, Maps, Comparators, Generics)',
      'Exception handling, Java I/O streams, and NIO',
      'Connecting Java to relational databases via JDBC'
    ],
    projectExamples: [
      'Banking & Account Transaction Engine with ACID guarantees',
      'Student Information & Attendance Management System with JDBC'
    ],
    eligibility: 'Suitable for engineering, BCA, MCA, and CS/IT students wanting to build strong Java foundations.',
    perks: ['Verified 1-Month Certificate', 'Interview OOP QA Sheet', 'Fast Offer Letter']
  },
  {
    id: 'frontend-development',
    name: 'Frontend Development',
    category: 'Software & Engineering',
    tagline: 'Craft responsive, pixel-perfect user interfaces with HTML5, CSS3, modern JS & React.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'Transform design mockups into blazing-fast, responsive web applications. Master modern semantic HTML5, CSS Flexbox/Grid, Tailwind styling, JavaScript DOM manipulation, and React component architecture.',
    technologies: ['HTML5', 'CSS3 / Tailwind', 'Modern ES6+ JS', 'React.js', 'Vite', 'Git / GitHub'],
    keyTopics: [
      'Modern semantic HTML and accessibility (a11y) standards',
      'Responsive design with Flexbox, CSS Grid, and utility classes',
      'JavaScript event loop, async/await, Fetch API, and DOM manipulation',
      'React component lifecycle, hooks (useState, useEffect, useMemo)',
      'State management, component reusability, and deployment on Vercel/Netlify'
    ],
    projectExamples: [
      'Interactive E-Commerce Product Catalog with Cart & Checkout UI',
      'Live Weather & Global Time Dashboard with Third-Party API Integration'
    ],
    eligibility: 'Passionate learners interested in web design, frontend engineering, and UI development.',
    perks: ['Live GitHub Portfolio Piece', 'Verified 1-Month Certificate', 'Resume Review'],
    popular: true
  },
  {
    id: 'backend-development',
    name: 'Backend Development',
    category: 'Software & Engineering',
    tagline: 'Architect scalable server backends, RESTful APIs, databases, and authentication.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'Learn the engine that powers modern applications. Build secure Node.js/Express servers, design REST APIs, handle JSON payloads, implement JWT authentication, and manage SQL/NoSQL databases.',
    technologies: ['Node.js', 'Express.js', 'REST APIs', 'PostgreSQL / MongoDB', 'JWT Auth', 'Postman'],
    keyTopics: [
      'Node.js runtime, asynchronous event-driven architecture, and NPM modules',
      'Express routing, middleware architecture, request validation, and error handling',
      'Database schema design, queries, and Object-Relational/Document mapping',
      'User authentication, password hashing (bcrypt), and stateless JWT tokens',
      'API testing with Postman and deploying servers to cloud containers'
    ],
    projectExamples: [
      'Secure User Authentication & Role-Based Access Control API',
      'Content Management & Blogging RESTful Backend with Search & Filtering'
    ],
    eligibility: 'Basic knowledge of any programming language (JavaScript or Python preferred).',
    perks: ['Verified 1-Month Certificate', 'Postman Collection Guide', 'Offer Letter in 24-48h']
  },
  {
    id: 'full-stack-web-development',
    name: 'Full Stack Web Development',
    category: 'Software & Engineering',
    tagline: 'End-to-end web engineering bridging dynamic client interfaces with cloud APIs.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'The complete software engineering experience. Connect modern frontend interfaces with resilient backend APIs and databases to deploy full-stack production-ready applications from scratch.',
    technologies: ['React.js', 'Node.js', 'Express', 'MongoDB / Firestore / SQL', 'Tailwind CSS', 'Git & CI/CD'],
    keyTopics: [
      'End-to-end application lifecycle from architecture to production launch',
      'Client-server HTTP communication, CORS, headers, and security practices',
      'Building responsive React client integrated with Express REST APIs',
      'Full CRUD operations, persistent database storage, and indexing',
      'Environment variables, cloud deployment, and Git version control'
    ],
    projectExamples: [
      'Full-Stack Freelance / Job Marketplace Portal with User Dashboards',
      'Collaborative Project & Issue Tracker with Real-Time Status Updates'
    ],
    eligibility: 'Students with familiarity with basic HTML/CSS and programming basics.',
    perks: ['Complete End-to-End Portfolio Project', '1-Month Co-Branded Certificate', 'Recommendation Letter'],
    popular: true
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    category: 'Design & Creative',
    tagline: 'User research, wireframing, high-fidelity Figma prototyping, and design systems.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'Learn the craft of modern digital product design. Conduct user research, define user personas and journey maps, create low-to-high fidelity wireframes, build design systems, and present interactive Figma prototypes.',
    technologies: ['Figma', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research', 'Usability Testing'],
    keyTopics: [
      'Design thinking methodology: Empathize, Define, Ideate, Prototype, Test',
      'Information architecture, user flows, and wireframe creation',
      'Visual design fundamentals: Typography, color theory, layout grids, spacing',
      'Figma auto-layout, interactive components, variants, and design tokens',
      'Conducting heuristic evaluations and usability feedback sessions'
    ],
    projectExamples: [
      'Mobile Banking / Fintech App UX Overhaul with Interactive Figma Prototype',
      'SaaS Dashboard & Design System with Component Library'
    ],
    eligibility: 'Creative thinkers, developers wanting UI skills, and aspiring product designers.',
    perks: ['Behance/Figma Portfolio Case Study', 'Verified Certificate', 'Interview Prep Tips']
  },
  {
    id: 'business-and-marketing-strategy',
    name: 'Business and Marketing Strategy',
    category: 'Business & Growth',
    tagline: 'Digital marketing funnels, market research, SEO/SEM, analytics, and brand positioning.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'Learn how technology products scale in competitive markets. Master market analysis, customer acquisition funnels, digital content marketing, SEO/SEM principles, performance analytics, and strategic positioning.',
    technologies: ['Market Research', 'SEO & SEM', 'Growth Analytics', 'Content Strategy', 'Funnel Optimization', 'Pitch Decks'],
    keyTopics: [
      'Market opportunity analysis, competitor benchmarking, and value propositions',
      'Inbound and outbound customer acquisition channels (SEO, Social, Email)',
      'Designing conversion funnels and key metric tracking (CAC, LTV, Churn, ROI)',
      'B2B and B2C positioning strategies and content distribution',
      'Building data-driven growth pitch presentations and campaign roadmaps'
    ],
    projectExamples: [
      'Comprehensive Go-To-Market (GTM) Strategy for a B2B SaaS Product',
      'Digital Growth & Content Marketing Campaign with ROI Metric Tracking'
    ],
    eligibility: 'Students from MBA, BBA, B.Com, Engineering, or anyone passionate about business growth and tech commercialization.',
    perks: ['Verified 1-Month Certificate', 'Executive Pitch Deck Case Study', 'Fast Offer Letter']
  },
  {
    id: 'embedded-systems-iot',
    name: 'Embedded Systems & IoT Engineering',
    category: 'Software & Engineering',
    tagline: 'Microcontroller programming (ESP32/STM32), sensor telemetry, FreeRTOS, and MQTT cloud gateways.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'Bridge hardware and software. Learn embedded C/C++ firmware engineering, GPIO/I2C/SPI sensor drivers, FreeRTOS multitasking, and connecting edge devices to cloud IoT dashboards via MQTT and WiFi.',
    technologies: ['Embedded C/C++', 'ESP32 / Arduino', 'FreeRTOS', 'MQTT', 'I2C/SPI', 'IoT Dashboards'],
    keyTopics: [
      'Microcontroller architecture, registers, timers, and hardware interrupts',
      'Interfacing digital/analog sensors (temperature, vibration, optical)',
      'FreeRTOS task scheduling, queues, and mutex synchronization',
      'Wireless telemetry protocols (MQTT over TLS, HTTP POST, WebSockets)',
      'Building web-based live telemetry dashboards for sensor monitoring'
    ],
    projectExamples: [
      'Smart Industrial Telemetry Node with Multi-Sensor Sampling and MQTT Ingestion',
      'Connected Home Automation Controller with Fail-Safe Watchdog and Web Dashboard'
    ],
    eligibility: 'ECE, EEE, CSE, IT or Mechatronics students with basic C programming knowledge.',
    perks: ['Hardware Portfolio Demonstration', 'ISO 9001:2015 Certificate', 'Mentor Code Audits'],
    popular: true
  },
  {
    id: 'ai-machine-learning',
    name: 'Artificial Intelligence & Machine Learning',
    category: 'Software & Engineering',
    tagline: 'Python, PyTorch, computer vision, supervised learning, and real-time model deployment.',
    duration: '1 Month',
    projectsCount: '2+ Projects',
    mode: 'Online (Self-Paced & Mentor Support)',
    description: 'Master practical machine learning engineering. Train supervised and unsupervised models using scikit-learn and PyTorch, process image datasets with OpenCV, and deploy models as REST APIs using FastAPI and Docker.',
    technologies: ['Python', 'PyTorch', 'scikit-learn', 'OpenCV', 'FastAPI', 'Pandas/NumPy'],
    keyTopics: [
      'Exploratory data analysis, feature engineering, and data normalization',
      'Supervised regression and classification algorithms with cross-validation',
      'Convolutional neural networks (CNNs) for computer vision and image classification',
      'Model evaluation metrics (ROC-AUC, Precision, Recall, F1-Score)',
      'Packaging and deploying models as production REST APIs with FastAPI'
    ],
    projectExamples: [
      'Automated Visual Defect Classifier with Custom-Trained Convolutional Neural Network',
      'Predictive Equipment Maintenance Regression Engine with REST API Inference'
    ],
    eligibility: 'Students with Python knowledge and foundational linear algebra/calculus concepts.',
    perks: ['GitHub Portfolio ML Project', '1-Month Verified Certificate', 'Letter of Recommendation'],
    popular: true
  }
];
