import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CTASection } from '../../components/ui/CTASection';
import { Brain, Sparkles, Database, Network, Eye, LineChart } from 'lucide-react';

export default function AISolutions() {
  const offerings = [
    {
      title: "Machine Learning Models",
      description: "Custom supervised and unsupervised learning models tailored to your specific datasets and business objectives.",
      icon: <Network className="w-6 h-6" />
    },
    {
      title: "Generative AI Integration",
      description: "Implementation of advanced LLMs and generative AI architectures to automate content, support, and complex reasoning tasks.",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "Computer Vision",
      description: "Image classification, object detection, and facial recognition systems for security, quality control, and automation.",
      icon: <Eye className="w-6 h-6" />
    },
    {
      title: "Predictive Analytics",
      description: "Time-series forecasting and behavioral prediction models to optimize supply chains, inventory, and financial planning.",
      icon: <LineChart className="w-6 h-6" />
    },
    {
      title: "Natural Language Processing",
      description: "Sentiment analysis, entity extraction, and intelligent chatbots to enhance customer service and automate document processing.",
      icon: <Brain className="w-6 h-6" />
    },
    {
      title: "Data Engineering",
      description: "Structuring, cleaning, and pipelining large-scale data to ensure high-quality inputs for AI/ML training and inference.",
      icon: <Database className="w-6 h-6" />
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-10 md:py-16">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-semibold mb-3 border border-purple-500/30">
              <Brain className="w-3.5 h-3.5" /> Solutions
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2.5">
              Artificial Intelligence & ML
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              We leverage advanced artificial intelligence to unlock data insights, automate complex workflows, and build systems capable of intelligent decision-making.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-10 md:py-16">
        <SectionHeader 
          title="AI & Data Capabilities" 
          description="Sricore Solutions designs highly optimized AI models and data pipelines that transform raw information into strategic business value."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
          {offerings.map((offering, index) => (
            <div key={index} className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                {offering.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{offering.title}</h3>
              <p className="text-slate-600 leading-relaxed">{offering.description}</p>
            </div>
          ))}
        </div>
      </Container>

      <CTASection 
        title="Ready to integrate AI into your operations?"
        description="Our AI architects can evaluate your data readiness and propose high-ROI machine learning implementations."
        primaryAction={{ label: "Inquire About AI Solutions", href: "/contact?service=ai" }}
        secondaryAction={{ label: "Request Structured Quote", href: "/enquiry" }}
      />
    </div>
  );
}
