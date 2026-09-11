import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';
import { Briefcase, Code, Cpu, Brain, ArrowRight } from 'lucide-react';
import { AVAILABLE_INTERNSHIPS } from '../data/internships';

export default function Internships() {
  const navigate = useNavigate();
  const programs = AVAILABLE_INTERNSHIPS;

  const domains = [
    { title: "Software Development", icon: <Code className="w-6 h-6" />, color: "bg-amber-50 text-amber-600" },
    { title: "Hardware & IoT", icon: <Cpu className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600" },
    { title: "AI & Machine Learning", icon: <Brain className="w-6 h-6" />, color: "bg-purple-50 text-purple-600" },
    { title: "Research & Analysis", icon: <Briefcase className="w-6 h-6" />, color: "bg-orange-50 text-orange-600" }
  ];

  const handleApply = (programId: string) => {
    navigate(`/internships/apply?program=${programId}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-20 lg:py-32">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Internships & Training
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
              Launch your technical career with Sricore Solutions. Gain hands-on experience working on real-world industry projects alongside experienced mentors and senior engineers.
            </p>
            <Link 
              to="#available-programs" onClick={(e) => { e.preventDefault(); document.getElementById("available-programs")?.scrollIntoView({ behavior: "smooth" }); }} 
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Apply for Internship
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-20 lg:py-32">
        <SectionHeader 
          title="Training Domains" 
          description="We offer comprehensive technical training and project-based learning across multiple engineering disciplines."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {domains.map((domain, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${domain.color}`}>
                {domain.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{domain.title}</h3>
            </div>
          ))}
        </div>
      </Container>

      <Container className="pb-20 lg:pb-32">
        <div id="available-programs" className="scroll-mt-24"></div>
        <SectionHeader 
          title="Available Programs" 
          description="Explore our currently open internship roles and apply to join our development teams."
        />
        
        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map(program => (
              <div key={program.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{program.title}</h3>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {program.duration}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-6 flex-grow">{program.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {program.technologies.slice(0, 4).map((tech, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-1 bg-amber-50 text-amber-700 rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">₹{program.fees.toLocaleString()}</span>
                  <button 
                    onClick={() => handleApply(program.id)} 
                    className="inline-flex items-center font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    Apply Now <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <CTASection 
        title="Ready to begin your journey?"
        description="Submit your application today. Our technical team will review your profile and reach out to you."
        primaryAction={{ label: "Apply Now", href: "/internships/apply" }}
      />
    </div>
  );
}
