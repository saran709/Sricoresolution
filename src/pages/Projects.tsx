import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProjectCard } from '../components/ui/ProjectCard';
import { CTASection } from '../components/ui/CTASection';

export default function Projects() {
  const projects = [
    {
      title: "Enterprise Resource Planner",
      category: "Software Development",
      description: "A comprehensive ERP system designed for manufacturing operations, featuring real-time inventory tracking, supply chain analytics, and automated reporting.",
      href: "/contact"
    },
    {
      title: "Smart Grid IoT Monitoring",
      category: "Hardware & IoT",
      description: "An end-to-end IoT solution deploying edge sensors across power grids to monitor structural integrity and predict equipment failure.",
      href: "/contact"
    },
    {
      title: "Diagnostic Imaging AI",
      category: "AI & Machine Learning",
      description: "A computer vision model trained to identify anomalies in medical diagnostic imaging, achieving 98.4% accuracy in preliminary clinical trials.",
      href: "/contact"
    },
    {
      title: "Autonomous Delivery Drone OS",
      category: "Hardware & Software Integration",
      description: "Custom real-time operating system (RTOS) and flight controller logic tailored for long-range autonomous delivery applications.",
      href: "/contact"
    },
    {
      title: "FinTech Transaction Engine",
      category: "Software Architecture",
      description: "A scalable microservices architecture built to process high-frequency financial transactions with zero downtime and strict ACID compliance.",
      href: "/contact"
    },
    {
      title: "Predictive Maintenance System",
      category: "AI & Machine Learning",
      description: "Machine learning pipeline analyzing acoustic and vibration data from industrial turbines to predict mechanical failures before they occur.",
      href: "/contact"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-20 lg:py-32">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Featured Projects
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Explore a selection of our engineering case studies. We deliver robust, scalable solutions across software, hardware, and artificial intelligence domains.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-20 lg:py-32">
        <SectionHeader 
          title="Our Portfolio" 
          description="A curated overview of successful implementations and technical systems developed by Sricore Solutions."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {projects.map((project, index) => (
            <ProjectCard 
              key={index}
              title={project.title}
              category={project.category}
              description={project.description}
              href={project.href}
            />
          ))}
        </div>
      </Container>

      <CTASection 
        title="Ready to build something impactful?"
        description="Share your technical requirements with our engineering team to explore how we can architect your next solution."
        primaryAction={{ label: "Start a Project", href: "/enquiry" }}
      />
    </div>
  );
}
