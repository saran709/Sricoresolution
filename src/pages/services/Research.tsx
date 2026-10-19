import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CTASection } from '../../components/ui/CTASection';
import { AdUnit } from '../../components/ui/AdUnit';
import { 
  BookOpen, 
  FileText, 
  FlaskConical, 
  Lightbulb, 
  GraduationCap, 
  PenTool, 
  CheckCircle2, 
  Binary, 
  ShieldCheck, 
  Workflow, 
  Database,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResearchServices() {
  const offerings = [
    {
      title: "Technical Documentation & System Specs",
      description: "Creation of precise, IEEE-standardized technical manuals, API documentation, architectural blueprints, and protocol specifications.",
      icon: <FileText className="w-6 h-6" />,
      deliverables: ["Architecture Blueprints", "Swagger / OpenAPI 3.0 Specs", "Component Schematics", "Compliance Audits"]
    },
    {
      title: "Journal & Conference Paper Preparation",
      description: "Comprehensive assistance with research paper formatting, citation graphs, algorithmic validation, and LaTeX typesetting for high-impact IEEE, ACM, Springer, and Elsevier publications.",
      icon: <BookOpen className="w-6 h-6" />,
      deliverables: ["LaTeX / Overleaf Typesetting", "Literature Reviews", "Experimental Visualization", "Plagiarism Pre-Screening"]
    },
    {
      title: "Algorithm Design & Complexity Optimization",
      description: "Design, computational complexity analysis (Big-O bounds), and numerical benchmarking of novel algorithms across computer vision, cryptography, and graph theory.",
      icon: <Binary className="w-6 h-6" />,
      deliverables: ["Mathematical Proofs", "Python / NumPy Testbeds", "Asymptotic Profiling", "Hardware Accel Mapping"]
    },
    {
      title: "Proof of Concept (PoC) Engineering",
      description: "Rapid software and hardware prototyping to validate theoretical hypotheses before capital allocation and industrial production.",
      icon: <FlaskConical className="w-6 h-6" />,
      deliverables: ["Hardware Breadboards", "Benchmarked Software Prototypes", "Empirical Test Reports", "Feasibility Analyses"]
    },
    {
      title: "Academic & Institutional R&D Mentorship",
      description: "Technical guidance, code auditing, and experimental rigor support for postgraduate researchers, doctoral candidates, and university labs.",
      icon: <GraduationCap className="w-6 h-6" />,
      deliverables: ["Experimental Design", "Data Cleansing Pipelines", "Statistical Validation", "Review Defense Coaching"]
    },
    {
      title: "Patent Drafting & Technical Prior Art Review",
      description: "Technical claim structuring, flowcharts, block diagrams, and prior art novelty analysis for patent disclosures in software and embedded technologies.",
      icon: <PenTool className="w-6 h-6" />,
      deliverables: ["Method Flowcharts", "Independent Claim Diagrams", "Prior Art Matrices", "Specification Writeups"]
    }
  ];

  const methodologies = [
    {
      phase: "01. Literature Review & Problem Formulation",
      summary: "Systematic review of existing state-of-the-art literature, identifying performance gaps, edge cases, and formulating clear testable hypotheses."
    },
    {
      phase: "02. Mathematical & Algorithmic Modeling",
      summary: "Formalizing mathematical representations, objective loss functions, computational constraints, and pseudo-code definitions."
    },
    {
      phase: "03. Sandbox Simulation & Benchmarking",
      summary: "Implementing reproducible simulations in Python/SciPy, MATLAB, or C++ with controlled synthetic and empirical test datasets."
    },
    {
      phase: "04. Statistical Significance Testing",
      summary: "Conducting multi-run confidence interval tests, ablation studies, latency distributions, and p-value statistical significance verification."
    },
    {
      phase: "05. Formal Documentation & Peer-Review Package",
      summary: "Generating clean LaTeX manuscripts, vector graphics diagrams, open-source code archives, and reproducible artifact repositories."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 md:py-18">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3.5 border border-amber-500/30">
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" /> Research & Applied Science
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3.5">
              Research & Technical Engineering Services
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              We bridge the gap between academic research rigor and industry execution. Our research scientists provide mathematical algorithm validation, empirical benchmarking, LaTeX paper preparation, and reproducible Proof of Concepts.
            </p>
          </div>
        </Container>
      </div>

      {/* Main Capabilities Grid */}
      <Container className="py-12 md:py-16">
        <SectionHeader 
          title="R&D Capabilities & Methodological Rigor" 
          description="Sricore Solutions supports researchers, corporate R&D divisions, and university laboratories in formulating, implementing, and documenting reproducible technological innovations."
          badge="Specialized Services"
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Core Deliverables:</span>
                <ul className="space-y-1">
                  {offering.deliverables.map((deliv, dIdx) => (
                    <li key={dIdx} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {deliv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Policy-Compliant In-Content Ad Placement on Substantive Content */}
      <Container>
        <AdUnit className="my-6" />
      </Container>

      {/* Research Methodology Walkthrough */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-200">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Framework</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1 mb-3">
                Our 5-Stage Scientific Research Workflow
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                All research support and algorithmic prototyping follows rigorous scientific methodology adhering to IEEE, ACM, and international peer-review standards.
              </p>
            </div>

            <div className="space-y-4">
              {methodologies.map((item, i) => (
                <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    0{i + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{item.phase}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Standards & Ethics Commitment */}
      <section className="py-10 bg-slate-100 border-t border-slate-200">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Academic Integrity & Ethical Standards</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sricore Solutions enforces strict research ethics. We provide technical advisory, algorithm validation, and typesetting support. We strictly prohibit essay-mill practices, contract cheating, or data fabrication. All work adheres to our{' '}
                  <Link to="/editorial-policy" className="text-blue-600 font-semibold hover:underline">
                    Editorial Standards Policy
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTASection 
        title="Require Specialized R&D Collaboration?"
        description="Connect directly with our research coordinators to discuss your publication milestones, algorithm validation, or Proof of Concept scoping."
        primaryAction={{ label: "Submit Research Enquiry", href: "/enquiry" }}
        secondaryAction={{ label: "View Technical Case Studies", href: "/projects" }}
      />
    </div>
  );
}
