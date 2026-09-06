import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';
import { Users, Code, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Careers() {
  const benefits = [
    { title: "Technical Excellence", desc: "Work alongside senior engineers on complex, intellectually stimulating projects.", icon: <Code className="w-6 h-6" /> },
    { title: "Continuous Growth", desc: "Dedicated budgets for certifications, conferences, and technical workshops.", icon: <Zap className="w-6 h-6" /> },
    { title: "Collaborative Culture", desc: "A flat engineering structure that values good ideas over hierarchy.", icon: <Users className="w-6 h-6" /> },
    { title: "Flexible Environment", desc: "Hybrid work models designed to support deep focus and team collaboration.", icon: <Globe className="w-6 h-6" /> }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-20 lg:py-32">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Careers at Sricore
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
              Join a team of dedicated engineers, researchers, and technologists building robust solutions for complex industrial problems.
            </p>
            <a href="#open-roles" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              View Open Roles
            </a>
          </div>
        </Container>
      </div>

      <Container className="py-20 lg:py-32">
        <SectionHeader 
          title="Why Join Us?" 
          description="Sricore Solutions is committed to fostering an environment of technical rigor, continuous learning, and professional excellence."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-slate-100 text-slate-700">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </Container>

      <div id="open-roles" className="pb-20 lg:pb-32 bg-slate-50">
        <Container>
          <SectionHeader 
            title="Open Positions" 
            description="Currently available roles across our engineering and operations departments."
          />
          
          <div className="mt-16 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-center p-12">
            <div className="max-w-md mx-auto">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Open Engineering Roles</h3>
              <p className="text-slate-500 mb-6">We are not actively hiring for full-time engineering positions at this moment. However, we are always looking for talented individuals.</p>
              <Link to="/contact">
                <button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors border border-slate-300">
                  Send Speculative Application
                </button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <CTASection 
        title="Looking for an Internship?"
        description="We offer comprehensive training and project-based learning for students and recent graduates."
        primaryAction={{ label: "View Internship Programs", href: "/internships" }}
      />
    </div>
  );
}
