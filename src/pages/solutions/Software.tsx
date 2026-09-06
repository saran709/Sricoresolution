import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CTASection } from '../../components/ui/CTASection';
import { Monitor, Server, Cloud, Code, Shield, Smartphone } from 'lucide-react';

export default function SoftwareSolutions() {
  const offerings = [
    {
      title: "Enterprise Web Applications",
      description: "Robust, scalable, and secure web applications built using modern frameworks like React, Node.js, and advanced cloud architectures.",
      icon: <Monitor className="w-6 h-6" />
    },
    {
      title: "Mobile App Development",
      description: "Native and cross-platform mobile applications engineered for high performance, intuitive UX, and seamless backend integration.",
      icon: <Smartphone className="w-6 h-6" />
    },
    {
      title: "Cloud Infrastructure & DevOps",
      description: "Designing and deploying resilient cloud architectures on AWS, Google Cloud, and Azure with continuous integration and delivery.",
      icon: <Cloud className="w-6 h-6" />
    },
    {
      title: "API Design & Integration",
      description: "Developing secure RESTful and GraphQL APIs to connect disparate systems and enable seamless data exchange across enterprise environments.",
      icon: <Server className="w-6 h-6" />
    },
    {
      title: "Legacy System Modernization",
      description: "Upgrading legacy software systems to modern architectures to improve maintainability, performance, and security.",
      icon: <Code className="w-6 h-6" />
    },
    {
      title: "Security & Auditing",
      description: "Comprehensive code reviews, vulnerability assessments, and implementation of security best practices in application development.",
      icon: <Shield className="w-6 h-6" />
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-20 lg:py-32">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold mb-6 border border-blue-500/30">
              <Code className="w-4 h-4" /> Solutions
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Software Engineering
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              We design and engineer bespoke software solutions that drive operational efficiency, enhance user experiences, and scale seamlessly with your organizational needs.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-20 lg:py-32">
        <SectionHeader 
          title="Our Software Capabilities" 
          description="Sricore Solutions utilizes modern tech stacks and agile methodologies to deliver software that meets strict enterprise standards."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {offerings.map((offering, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                {offering.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{offering.title}</h3>
              <p className="text-slate-600 leading-relaxed">{offering.description}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="pb-20 lg:pb-32">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
          <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Development Process</h2>
            <div className="space-y-6">
              {[
                { step: "01", title: "Discovery & Architecture", desc: "Analyzing requirements and designing scalable system architecture." },
                { step: "02", title: "Agile Development", desc: "Iterative development cycles ensuring continuous delivery and feedback." },
                { step: "03", title: "Quality Assurance", desc: "Rigorous automated and manual testing to ensure reliability." },
                { step: "04", title: "Deployment & Maintenance", desc: "Smooth rollout and ongoing technical support for sustained operations." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="font-mono text-sm font-bold text-blue-600 mt-1">{item.step}</div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-100 lg:w-1/2 p-8 lg:p-12 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200">
            <div className="grid grid-cols-2 gap-4 w-full">
              {['React', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'Firebase'].map((tech, i) => (
                <div key={i} className="bg-white py-4 px-6 rounded-lg text-center font-medium text-slate-700 shadow-sm border border-slate-200">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <CTASection 
        title="Ready to build your next application?"
        description="Connect with our software engineering team to discuss architecture, timelines, and technical feasibility."
        primaryAction={{ label: "Request a Technical Consultation", href: "/enquiry" }}
      />
    </div>
  );
}
