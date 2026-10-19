import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CTASection } from '../../components/ui/CTASection';
import { AdUnit } from '../../components/ui/AdUnit';
import { 
  Monitor, 
  Server, 
  Cloud, 
  Code, 
  Shield, 
  Smartphone, 
  Layers, 
  Cpu, 
  GitBranch, 
  Database, 
  Zap, 
  Terminal,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SoftwareSolutions() {
  const offerings = [
    {
      title: "Enterprise Web Applications",
      description: "Robust, multi-tenant, and fault-tolerant web applications engineered using TypeScript, React 19, Next.js, and Node.js microservices with sub-second API latencies.",
      icon: <Monitor className="w-6 h-6" />,
      features: ["Micro-frontends & SSR", "Role-Based Access Control (RBAC)", "Real-time WebSockets", "Progressive Web App (PWA)"]
    },
    {
      title: "Distributed Backend & API Engineering",
      description: "Developing scalable RESTful, gRPC, and GraphQL API architectures with message brokering (Kafka/RabbitMQ) and distributed caching (Redis).",
      icon: <Server className="w-6 h-6" />,
      features: ["Clean Architecture & CQRS", "Rate Limiting & Token Bucket", "Database Sharding & Read Replicas", "OpenAPI 3.0 Documentation"]
    },
    {
      title: "Cloud Infrastructure & DevOps Automation",
      description: "Automated Infrastructure as Code (Terraform, Pulumi) deploying containerized applications (Docker, Kubernetes) to AWS, Google Cloud, and Azure.",
      icon: <Cloud className="w-6 h-6" />,
      features: ["Zero-Downtime Blue/Green Deploys", "CI/CD GitHub Actions Pipelines", "Prometheus & Grafana Telemetry", "SOC 2 Compliance Guardrails"]
    },
    {
      title: "Cross-Platform Mobile Applications",
      description: "High-performance native and cross-platform mobile apps engineered with React Native and Kotlin/Swift, featuring offline-first local synchronization.",
      icon: <Smartphone className="w-6 h-6" />,
      features: ["Offline SQLite/WatermelonDB Sync", "Biometric Authentication", "Push Notification Gateways", "Smooth 60/120 FPS UI"]
    },
    {
      title: "Legacy Monolith Modernization",
      description: "Strangler-pattern migration of legacy monolithic codebases into decoupled, resilient cloud-native services with zero operational disruption.",
      icon: <Layers className="w-6 h-6" />,
      features: ["Dependency Graph Decoupling", "Incremental Strangler Migrations", "Database Schema De-normalization", "Automated Regression Harnesses"]
    },
    {
      title: "Application Security & Zero-Trust Auditing",
      description: "End-to-end security audits including SAST/DAST scanning, OWASP Top 10 mitigation, OAuth 2.0 / OIDC integrations, and cryptographic key rotation.",
      icon: <Shield className="w-6 h-6" />,
      features: ["OWASP ASVS Verification", "AES-256 / ChaCha20 Encryption", "Automated Penetration Testing", "Audit Event Immutability"]
    }
  ];

  const architecturalPrinciples = [
    {
      title: "Domain-Driven Design (DDD)",
      description: "Structuring domain models, bounded contexts, and aggregates to align code directly with complex business logic."
    },
    {
      title: "Asynchronous Event-Driven Decoupling",
      description: "Utilizing pub/sub patterns and durable queues to prevent cascading failures and guarantee high write throughput."
    },
    {
      title: "Zero-Trust Perimeter Security",
      description: "Authenticating and authorizing every API call with short-lived JWT tokens, HMAC signature verification, and least-privilege IAM roles."
    },
    {
      title: "Comprehensive Automated Testing",
      description: "Enforcing minimum 85% test coverage through unit tests (Vitest/Jest), integration tests, and end-to-end browser journeys (Playwright)."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 md:py-18">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3.5 border border-amber-500/30">
              <Code className="w-3.5 h-3.5 text-amber-400" /> Engineering Practice
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3.5">
              Software Engineering & Architecture
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              We design and engineer resilient, high-performance software systems. From distributed backend architectures to intuitive web and mobile interfaces, our engineering practices prioritize scalability, security, and developer ergonomics.
            </p>
          </div>
        </Container>
      </div>

      {/* Capabilities Grid */}
      <Container className="py-12 md:py-16">
        <SectionHeader 
          title="Full-Lifecycle Software Capabilities" 
          description="Sricore Solutions utilizes modern cloud architectures and rigorous agile engineering to build mission-critical enterprise platforms."
          badge="Core Services"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
          {offerings.map((offering, index) => (
            <div key={index} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
                {offering.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{offering.title}</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4 flex-grow">{offering.description}</p>
              
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Key Features:</span>
                <ul className="space-y-1">
                  {offering.features.map((feat, fIdx) => (
                    <li key={fIdx} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Policy Compliant AdSense Slot */}
      <Container>
        <AdUnit className="my-6" />
      </Container>

      {/* Architectural Pillars Section */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-200">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Engineering Rigor</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1 mb-3">
                Our System Architecture Principles
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Every line of production code adheres to architectural blueprints designed for long-term maintainability, high availability, and rapid disaster recovery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {architecturalPrinciples.map((pillar, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>

            {/* Tech Stack Matrix */}
            <div className="mt-10 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
                Verified Production Tech Stacks
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <p className="font-bold text-white mb-1">Frontend</p>
                  <p className="text-[11px] text-slate-400">React 19, TypeScript, Tailwind CSS, Vite, Next.js</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <p className="font-bold text-white mb-1">Backend</p>
                  <p className="text-[11px] text-slate-400">Node.js, Express, Go, Python FastAPI, gRPC</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <p className="font-bold text-white mb-1">Data & Storage</p>
                  <p className="text-[11px] text-slate-400">PostgreSQL, Firestore, Redis, TimescaleDB, S3</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <p className="font-bold text-white mb-1">DevOps</p>
                  <p className="text-[11px] text-slate-400">Docker, Kubernetes, GitHub Actions, Terraform</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTASection 
        title="Ready to Build Your Next Production Platform?"
        description="Schedule a technical discovery session with our software engineering leads to review architecture, scalability requirements, and milestone delivery."
        primaryAction={{ label: "Inquire About Software Services", href: "/contact?service=software" }}
        secondaryAction={{ label: "Browse Production Case Studies", href: "/projects" }}
      />
    </div>
  );
}
