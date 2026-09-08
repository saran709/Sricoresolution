import React, { useState } from 'react';
import { ArrowRight, Cpu, Code, Network, BrainCircuit, Activity, Database } from 'lucide-react';
import { cn } from '../utils/cn';

type Category = 'All' | 'Software' | 'Hardware' | 'IoT' | 'AI / ML';

interface PortfolioItem {
  id: string;
  title: string;
  category: Category;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  metrics?: string;
}

const portfolioData: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Smart Factory IoT Gateway',
    category: 'IoT',
    description: 'Developed a ruggedized edge computing gateway that aggregates telemetry from legacy manufacturing equipment, reducing latency by 40%.',
    icon: <Network className="w-8 h-8 text-amber-600" />,
    tags: ['Edge Computing', 'MQTT', 'Industrial IoT'],
    metrics: '40% Latency Reduction'
  },
  {
    id: 'p2',
    title: 'Predictive Maintenance Vision AI',
    category: 'AI / ML',
    description: 'Implemented a computer vision model to detect micro-fractures in aerospace components on the assembly line in real-time.',
    icon: <BrainCircuit className="w-8 h-8 text-amber-600" />,
    tags: ['Computer Vision', 'PyTorch', 'Real-time Analytics'],
    metrics: '99.8% Detection Accuracy'
  },
  {
    id: 'p3',
    title: 'Enterprise Healthcare Portal',
    category: 'Software',
    description: 'Architected a HIPAA-compliant patient management system enabling seamless data sharing between specialized clinics and central hospitals.',
    icon: <Activity className="w-8 h-8 text-amber-600" />,
    tags: ['React', 'Node.js', 'HIPAA'],
    metrics: '2M+ Patient Records'
  },
  {
    id: 'p4',
    title: 'Autonomous Drone Flight Controller',
    category: 'Hardware',
    description: 'Designed a custom PCB and embedded firmware for an agricultural drone capable of autonomous crop spraying and mapping.',
    icon: <Cpu className="w-8 h-8 text-amber-600" />,
    tags: ['PCB Design', 'C++', 'RTOS'],
    metrics: 'Extended flight time by 25%'
  },
  {
    id: 'p5',
    title: 'Supply Chain Optimization Engine',
    category: 'Software',
    description: 'Built a full-stack dashboard predicting supply chain bottlenecks using historical shipping data and weather patterns.',
    icon: <Database className="w-8 h-8 text-amber-600" />,
    tags: ['PostgreSQL', 'Next.js', 'Analytics'],
    metrics: '15% Logistics Cost Saved'
  },
  {
    id: 'p6',
    title: 'Smart City Traffic Analyzer',
    category: 'AI / ML',
    description: 'Deployed machine learning models across city intersections to optimize traffic light timings and reduce average commute times.',
    icon: <Code className="w-8 h-8 text-amber-600" />,
    tags: ['TensorFlow', 'Smart City', 'Edge AI'],
    metrics: '18% Commute Time Reduced'
  }
];

const categories: Category[] = ['All', 'Software', 'Hardware', 'IoT', 'AI / ML'];

export function ProjectPortfolio() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredProjects = activeCategory === 'All' 
    ? portfolioData 
    : portfolioData.filter(p => p.category === activeCategory);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Featured Work</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore our latest engineering case studies spanning across multiple disciplines and industries.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === category
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300"
            >
              <div className="p-8 flex-1">
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {project.icon}
                </div>
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 block">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
                </div>
                <p className="text-slate-600 mb-6 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto">
                <span className="text-sm font-semibold text-slate-700">
                  {project.metrics}
                </span>
                <button className="text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-1 text-sm font-medium group-hover:underline">
                  Case Study <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
