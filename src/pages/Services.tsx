import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';

export default function Services() {
  const services = [
    {
      title: "Software Solutions",
      description: "Custom enterprise software, robust web applications, and scalable cloud architectures built with modern technology stacks.",
      link: "/solutions/software",
      features: ["Full-Stack Development", "Cloud Architecture", "API Integration", "Legacy Modernization"]
    },
    {
      title: "Hardware & IoT",
      description: "End-to-end hardware development, from embedded systems and PCB design to connected Internet of Things (IoT) platforms.",
      link: "/solutions/hardware",
      features: ["Embedded Systems", "PCB Design", "IoT Platforms", "Industrial Automation"]
    },
    {
      title: "AI & Machine Learning",
      description: "Intelligent systems that automate processes, generate insights, and solve complex computational challenges.",
      link: "/solutions/ai-ml",
      features: ["Predictive Analytics", "Computer Vision", "Natural Language Processing", "Process Automation"]
    },
    {
      title: "Research & Technical Services",
      description: "Comprehensive support for academic and industrial research, including technical documentation and journal preparation.",
      link: "/services/research",
      features: ["Technical Documentation", "Journal Preparation", "Algorithm Development", "Proof of Concept"]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-20 lg:py-32">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Our Services
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Sricore Solutions delivers comprehensive technology services spanning software, hardware, artificial intelligence, and deep technical research. We engineer solutions that drive operational excellence.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-20 lg:py-32">
        <SectionHeader 
          title="Capabilities Overview" 
          description="Explore our specialized practice areas. Our cross-functional teams work collaboratively to deliver integrated end-to-end solutions."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
              <p className="text-slate-600 mb-8 flex-grow">{service.description}</p>
              
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Core Focus Areas</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <a href={service.link} className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors mt-auto">
                Explore {service.title} <span className="ml-2">→</span>
              </a>
            </div>
          ))}
        </div>
      </Container>

      <CTASection 
        title="Ready to Start Your Project?"
        description="Schedule a consultation with our engineering team to discuss your technical requirements and objectives."
        primaryAction={{ label: "Request a Quote", href: "/enquiry" }}
        secondaryAction={{ label: "Contact Us", href: "/contact" }}
      />
    </div>
  );
}
