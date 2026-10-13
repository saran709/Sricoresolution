import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export default function Services() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#2563eb';
  const brandName = settings?.brandName || 'Sricore Solutions';
  const servicesContent = settings?.services;

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
      <div className="bg-slate-900 text-white py-6 md:py-8">
        <Container>
          <div className="max-w-3xl">
            <div 
              className="inline-block py-0.5 px-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2 bg-slate-800"
              style={{ color: primaryColor }}
            >
              Engineering Capabilities
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              {servicesContent?.heroTitle || 'Our Services'}
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {servicesContent?.introDescription || `${brandName} delivers comprehensive technology services spanning software, hardware, artificial intelligence, and deep technical research. We engineer solutions that drive operational excellence.`}
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-6 md:py-8">
        <SectionHeader 
          title="Capabilities Overview" 
          description="Explore our specialized practice areas. Our cross-functional teams work collaboratively to deliver integrated end-to-end solutions."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mt-4 md:mt-5">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow">{service.description}</p>
              
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Core Focus Areas</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <a 
                href={service.link} 
                className="inline-flex items-center font-semibold transition-colors mt-auto hover:underline"
                style={{ color: primaryColor }}
              >
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
