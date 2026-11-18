import React from 'react';
import { Container } from '../components/ui/Container';
import { CTASection } from '../components/ui/CTASection';
import { ServicesSection } from '../components/ServicesSection';
import { ServiceSchema } from '../components/seo/ServiceSchema';
import { ServiceFAQSection } from '../components/seo/FAQSchema';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export default function Services() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';
  const brandName = settings?.brandName || 'Sricore Solutions';
  const servicesContent = settings?.services;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <ServiceSchema serviceKey="services-hub" />
      <div className="bg-slate-900 text-white py-10 md:py-16">
        <Container>
          <div className="max-w-3xl">
            <div 
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: primaryColor }}
            >
              Engineering Capabilities · 5 Core Practice Areas
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              {servicesContent?.heroTitle || 'Our Services'}
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {servicesContent?.introDescription || `${brandName} delivers comprehensive technology services spanning software development, embedded hardware & IoT, artificial intelligence, scientific R&D, and mentored internship programs.`}
            </p>
          </div>
        </Container>
      </div>

      <ServicesSection />

      <ServiceFAQSection serviceKey="services-hub" />

      <CTASection 
        title="Ready to Start Your Project?"
        description="Schedule a consultation with our engineering team to discuss your technical requirements and objectives."
        primaryAction={{ label: "Request a Quote", href: "/enquiry" }}
        secondaryAction={{ label: "Contact Us", href: "/contact" }}
      />
    </div>
  );
}
