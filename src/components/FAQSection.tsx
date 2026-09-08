import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFaqs: FAQItem[] = [
  {
    question: "What specific services does Sricore Solutions provide?",
    answer: "We offer end-to-end engineering solutions spanning custom Software Development, Hardware Engineering, Internet of Things (IoT) integrations, and Artificial Intelligence & Machine Learning (AI/ML) implementations."
  },
  {
    question: "How do you approach a new client project?",
    answer: "Our process begins with a deep-dive discovery phase to understand your core challenges. From there, we develop a tailored architectural blueprint, establish clear milestones, and build iterative prototypes before moving into full-scale production."
  },
  {
    question: "What is the typical timeline for project delivery?",
    answer: "Timelines are highly dependent on project scope. A proof-of-concept (PoC) or basic MVP can often be delivered in 4-8 weeks. Comprehensive enterprise software or hardware ecosystems generally require 3-6 months from conception to deployment."
  },
  {
    question: "Do you offer post-deployment maintenance and support?",
    answer: "Yes, we provide robust SLA-backed post-launch support. This includes regular security patches, performance monitoring, scaling assistance, and feature enhancements to ensure your solution grows alongside your business."
  },
  {
    question: "How can I get started or request a quote?",
    answer: "You can initiate a project by navigating to our 'Tell Us Your Problem' page. Submit your challenge context, timeline, and budget, and our engineering team will promptly review it and schedule a discovery call."
  }
];

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
  className?: string;
}

export function FAQSection({ 
  title = "Frequently Asked Questions", 
  subtitle = "Everything you need to know about partnering with Sricore Solutions.",
  faqs = defaultFaqs,
  className
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
        {subtitle && <p className="text-lg text-slate-600">{subtitle}</p>}
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={cn(
                "border rounded-xl overflow-hidden transition-colors duration-200",
                isOpen ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
              >
                <span className={cn(
                  "font-semibold text-lg transition-colors",
                  isOpen ? "text-amber-700" : "text-slate-900"
                )}>
                  {faq.question}
                </span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-300", 
                    isOpen ? "rotate-180 text-amber-600" : "text-slate-400"
                  )} 
                />
              </button>
              
              <div 
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
