import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';
import { 
  OFFICIAL_GFORM_INTERNSHIPS, 
  GFORM_CONFIG, 
  FormInternshipDomain 
} from '../data/internshipsData';
import { 
  GraduationCap, 
  BookOpen, 
  Code, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Award, 
  Terminal, 
  Users, 
  Sparkles, 
  Cpu, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Internships() {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('full-stack-web');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Software & Engineering', 'Design & Creative', 'Business & Growth'];

  const filteredDomains = OFFICIAL_GFORM_INTERNSHIPS.filter(d => 
    activeCategory === 'all' || d.category === activeCategory
  );

  const activeDomain: FormInternshipDomain = 
    OFFICIAL_GFORM_INTERNSHIPS.find(d => d.id === selectedDomainId) || 
    OFFICIAL_GFORM_INTERNSHIPS[0];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 md:py-18 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3.5 border border-amber-500/30">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              Industry-Aligned Technical Training & Internship Programs
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Hands-On Engineering Internships
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6">
              Accelerate your engineering career through mentor-guided, production-grade technical internships. Build real software systems, write production code, integrate IoT hardware, and master industry workflows.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-[11px]">Program Duration</p>
                <p className="text-white font-bold text-sm mt-0.5">{GFORM_CONFIG.duration}</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-[11px]">Projects Required</p>
                <p className="text-white font-bold text-sm mt-0.5">{GFORM_CONFIG.projectsRequired}</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-[11px]">Offer Verification</p>
                <p className="text-white font-bold text-sm mt-0.5">{GFORM_CONFIG.offerLetterTime}</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-[11px]">Accreditation</p>
                <p className="text-amber-400 font-bold text-sm mt-0.5">ISO 9001:2015</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Domain Directory & Curriculum Deep-Dive */}
      <Container className="py-12 md:py-16">
        <SectionHeader 
          title="Curriculum Tracks & Technical Specializations"
          description="Select an engineering track below to review the structured syllabus, mandatory capstone deliverables, and prerequisite tech stack."
          badge="Specialized Tracks"
        />

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-3 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-400 mr-2">Discipline:</span>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? `All Disciplines (${OFFICIAL_GFORM_INTERNSHIPS.length})` : cat}
            </button>
          ))}
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Track Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Available Internship Domains</h3>
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredDomains.map((track) => {
                const isSelected = track.id === activeDomain.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedDomainId(track.id)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all text-left ${
                      isSelected
                        ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {track.category}
                      </span>
                      {track.popular && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" /> High Demand
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{track.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{track.tagline}</p>
                    <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {track.duration}</span>
                      <span>•</span>
                      <span>{track.projectsCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Track Detailed Syllabus & Deliverables */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
            <div className="border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">{activeDomain.category}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {activeDomain.mode}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{activeDomain.name}</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{activeDomain.description}</p>
            </div>

            {/* Core Syllabus & Topics */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                Technical Curriculum Modules
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeDomain.keyTopics.map((topic, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-600" />
                Tools & Technologies Practiced
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeDomain.technologies.map((tech, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Sample Capstone Projects */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-600" />
                Mandatory Project Deliverables
              </h4>
              <div className="space-y-2">
                {activeDomain.projectExamples.map((ex, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60 text-xs text-slate-800">
                    <span className="font-bold text-amber-900 block mb-0.5">Capstone Assignment #{i + 1}</span>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility & Action */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Candidate Eligibility</p>
                <p className="text-xs font-semibold text-slate-700">{activeDomain.eligibility}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/internships/apply"
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs text-center flex items-center justify-center gap-1.5"
                >
                  Register in Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={GFORM_CONFIG.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1"
                >
                  Google Form <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Program Benefits & Certification Standards */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-200">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Standardized Evaluation & Certification Framework
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every internship candidate undergoes a structured 4-phase learning and evaluation model conforming to industry software engineering workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-xs font-bold text-amber-600 block mb-2">PHASE 01</span>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Foundation & Tooling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setup of IDEs, Git CLI workflows, environment variables, and foundational architectural design patterns.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-xs font-bold text-blue-600 block mb-2">PHASE 02</span>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Sprint-Based Execution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Developing primary application logic, writing modular functions, API schemas, and schema validation.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-xs font-bold text-purple-600 block mb-2">PHASE 03</span>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Code Review & Auditing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peer reviews, security vulnerability scanning, automated test writing, and performance profiling.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-xs font-bold text-emerald-600 block mb-2">PHASE 04</span>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Evaluation & Credentialing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submission of public GitHub repo, technical walkthrough video, and issuance of verified QR-coded certificate.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-12 md:py-16 bg-slate-50 border-t border-slate-200">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2">How long is the internship program?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The standard curriculum spans 1 month (4 weeks), with options for students needing a 2-month or 3-month tenure for academic credit upon request during registration.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Is the certificate valid for university placement credit?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yes. Certificates are issued by Sricore Solutions (an ISO 9001:2015 certified technology firm) complete with unique verification serial IDs, project titles, and mentor sign-offs accepted by major colleges and engineering universities.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Can I register through both the website portal and Google Form?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Both submission channels synchronize to our candidate ledger. You may either register directly via our secure web application or complete the Google Form. Offer letters are dispatched within 24 to 48 business hours.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CTASection 
        title="Ready to Elevate Your Engineering Portfolio?"
        description="Join thousands of students and recent graduates who have built verified projects through Sricore Solutions."
        primaryAction={{ label: "Register in Portal", href: "/internships/apply" }}
        secondaryAction={{ label: "Browse Technical Case Studies", href: "/projects" }}
      />
    </div>
  );
}
