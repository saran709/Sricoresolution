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
      <div className="bg-slate-900 text-white py-20 lg:py-32">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-semibold mb-6 border border-purple-500/30">
              <Brain className="w-4 h-4" /> Solutions
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Artificial Intelligence & ML
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              We leverage advanced artificial intelligence to unlock data insights, automate complex workflows, and build systems capable of intelligent decision-making.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-20 lg:py-32">
        <SectionHeader 
          title="AI & Data Capabilities" 
          description="Sricore Solutions designs highly optimized AI models and data pipelines that transform raw information into strategic business value."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {offerings.map((offering, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
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
        primaryAction={{ label: "Request AI Consultation", href: "/enquiry" }}
      />
    </div>
  );
}
