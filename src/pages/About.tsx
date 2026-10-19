import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { 
  ShieldCheck, 
  Award, 
  MapPin, 
  Users, 
  Code, 
  Cpu, 
  Brain, 
  FlaskConical, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const { settings } = useWebsiteSettings();
  const brandName = settings?.brandName || 'Sricore Solutions';
  const primaryColor = settings?.theme?.primary || '#d97706';

  const operationalPillars = [
    {
      title: "ISO 9001:2015 Quality Management",
      description: "Our software development, hardware prototyping, and training workflows adhere to internationally recognized ISO 9001:2015 quality assurance frameworks.",
      icon: <Award className="w-6 h-6 text-amber-600" />
    },
    {
      title: "Full-Stack & Hardware Labs",
      description: "Equipped with dedicated testing benches for multi-layer PCB analysis, RF spectrum characterization, and edge AI compute clusters (NVIDIA Jetson, Coral).",
      icon: <Cpu className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Academic & Industry Synergy",
      description: "Bridging the gap between peer-reviewed academic computer science research and enterprise-ready commercial production systems.",
      icon: <FlaskConical className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Editorial & Ethical Publishing",
      description: "Committed to verifiable, reproducible technical literature, transparent source code attribution, and human-verified engineering case studies.",
      icon: <FileText className="w-6 h-6 text-purple-600" />
    }
  ];

  const engineeringTeams = [
    {
      department: "Software Systems Engineering",
      focus: "Distributed Cloud Architectures, Multi-tenant Web Apps, Microservices, REST/GraphQL APIs",
      stack: "React, Node.js, TypeScript, PostgreSQL, Docker, AWS"
    },
    {
      department: "Embedded Systems & IoT Practice",
      focus: "Firmware Development, FreeRTOS, Multi-layer PCB Layouts, Modbus & Industrial Telemetry",
      stack: "C/C++, STM32, ESP32, KiCad, LoRaWAN, MQTT"
    },
    {
      department: "Applied AI & Computer Vision",
      focus: "Edge Neural Inference, Automated Optical Inspection, Predictive Maintenance, Enterprise RAG",
      stack: "Python, PyTorch, TensorRT, OpenCV, FastAPI"
    },
    {
      department: "Scientific Research & Documentation",
      focus: "Algorithm Complexity Profiling, LaTeX Manuscript Preparation, Proof of Concept Verification",
      stack: "LaTeX, MATLAB, SciPy, IEEE/ACM Standards"
    }
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-18 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div 
              className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 bg-slate-800 border border-amber-500/30"
              style={{ color: primaryColor }}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Organizational Profile & Engineering Pedigree
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3.5">
              Engineering Practical Technology Systems
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Sricore Solutions is a specialized technology and applied research consultancy. We engineer production software, hardware IoT platforms, edge AI systems, and provide rigorous research mentorship to students and organizations globally.
            </p>
          </div>
        </Container>
      </section>

      {/* Corporate Story & Background */}
      <section className="py-12 md:py-16 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto mb-12 p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3">Our Genesis & Operational Mission</h2>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4">
              Founded in Tamil Nadu, India, Sricore Solutions was established by a core group of practicing software architects, embedded systems engineers, and academic researchers with a unified goal: eliminate the friction between academic theory and enterprise engineering execution.
            </p>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
              Today, our cross-functional teams build high-availability software platforms, prototype multi-layer IoT sensor hardware, deploy sub-millimeter computer vision models for factory automation, and mentor thousands of engineering graduates through structured, ISO-certified industrial internship curriculums.
            </p>
          </div>

          {/* Operational Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {operationalPillars.map((pillar, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Engineering Practice Divisions */}
      <section className="py-12 md:py-16 bg-slate-50 border-t border-slate-200">
        <Container>
          <SectionHeader 
            title="Our Engineering Practice Divisions" 
            description="Our organizational structure comprises specialized technical departments delivering peer-reviewed and field-tested solutions."
            badge="Engineering Structure"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-6">
            {engineeringTeams.map((team, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900">{team.department}</h3>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Active Practice
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{team.focus}</p>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Key Technologies:</span>
                  <p className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {team.stack}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Transparency & Physical Coordinates */}
      <section className="py-12 bg-white border-t border-slate-200">
        <Container>
          <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Headquarters & Labs</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Namakkal, Tamil Nadu, India</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Operational labs, testing facilities, and technical coordination desk situated at Namakkal - 637018. Open for institutional inquiries, client consultations, and verified academic partnerships.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link 
                to="/editorial-policy" 
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-700 text-center"
              >
                Editorial Standards
              </Link>
              <Link 
                to="/contact" 
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors text-center"
              >
                Contact Engineers
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
