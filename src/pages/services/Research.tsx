import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CTASection } from '../../components/ui/CTASection';
import { BookOpen, FileText, FlaskConical, Lightbulb, GraduationCap, PenTool } from 'lucide-react';

export default function ResearchServices() {
  const offerings = [
    {
      title: "Technical Documentation",
      description: "Creation of precise, standardized technical manuals, API documentation, and system architecture blueprints.",
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: "Journal & Paper Preparation",
      description: "Comprehensive assistance with research paper formatting, proofreading, and structuring for high-impact IEEE, ACM, and Springer journals.",
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      title: "Algorithm Development",
      description: "Design and optimization of complex computational algorithms for specialized research applications.",
      icon: <Lightbulb className="w-6 h-6" />
    },
    {
      title: "Proof of Concept (PoC)",
      description: "Rapid prototyping and feasibility studies to validate novel research ideas before full-scale implementation.",
      icon: <FlaskConical className="w-6 h-6" />
    },
    {
      title: "Academic Project Support",
      description: "Guidance, mentorship, and implementation assistance for complex undergraduate and postgraduate technical projects.",
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      title: "Patent Drafting Assistance",
      description: "Technical drafting and diagrammatic support for defining the scope and technical claims of software and hardware patents.",
      icon: <PenTool className="w-6 h-6" />
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-20 lg:py-32">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm font-semibold mb-6 border border-orange-500/30">
              <FlaskConical className="w-4 h-4" /> Services
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Research & Technical Services
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              We bridge the gap between academic research and industry execution. Our experts provide rigorous technical documentation, publication support, and algorithm validation.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-20 lg:py-32">
        <SectionHeader 
          title="Research Capabilities" 
          description="Sricore Solutions supports researchers, academics, and R&D departments in formalizing, testing, and documenting their innovations."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {offerings.map((offering, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                {offering.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{offering.title}</h3>
              <p className="text-slate-600 leading-relaxed">{offering.description}</p>
            </div>
          ))}
        </div>
      </Container>

      <CTASection 
        title="Require R&D Support?"
        description="Contact our research coordinators to discuss your publication goals, documentation needs, or PoC requirements."
        primaryAction={{ label: "Submit Research Enquiry", href: "/enquiry" }}
      />
    </div>
  );
}
