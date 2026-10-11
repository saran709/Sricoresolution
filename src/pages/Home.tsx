import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ServiceCard } from '../components/ui/ServiceCard';
import { ProjectCard } from '../components/ui/ProjectCard';
import { CTASection } from '../components/ui/CTASection';
import { Code, Cpu, BrainCircuit, Microscope, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider w-fit">
                Professional Technology Services
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Engineering Enterprise <br/>
                <span className="text-blue-600">Digital Foundations</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                Sricore Solutions delivers high-performance software development, industrial IoT, and AI-driven research services. We bridge the gap between academic innovation and commercial engineering excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link to="/enquiry" className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm w-fit">
                  Get a Project Quote
                </Link>
                <a 
                  href="https://forms.gle/StQmejms3z9voMMU7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors w-fit"
                >
                  Apply for Internship
                </a>
              </div>

              <div className="flex gap-6 mt-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">ISO Standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Industrial IoT</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-full min-h-[320px] lg:min-h-[400px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                 <div className="grid grid-cols-6 gap-2 w-full px-6">
                   <div className="h-40 bg-slate-900 rounded"></div>
                   <div className="h-28 bg-slate-900 rounded self-center"></div>
                   <div className="h-48 bg-slate-900 rounded self-end"></div>
                   <div className="h-36 bg-slate-900 rounded"></div>
                   <div className="h-20 bg-slate-900 rounded"></div>
                   <div className="h-32 bg-slate-900 rounded self-center"></div>
                 </div>
              </div>
              <div className="absolute inset-0 flex flex-col p-8 justify-end bg-gradient-to-t from-slate-900/40 to-transparent">
                 <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg shadow-xl border border-white/50 w-full max-w-xs">
                   <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2">Live Monitoring Interface</div>
                   <div className="h-2 bg-slate-200 rounded-full w-full mb-3 overflow-hidden">
                     <div className="h-2 bg-blue-600 rounded-full w-3/4"></div>
                   </div>
                   <div className="flex justify-between text-xs text-slate-500 font-mono font-medium">
                     <span>CPU Load: 74%</span>
                     <span>Uptime: 99.9%</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Services Section */}
      <section className="py-24 bg-white">
        <Container>
          <SectionHeader 
            title="Comprehensive Technical Solutions" 
            description="We provide end-to-end technical expertise across multiple domains, supporting organizations from conceptualization to deployment and maintenance."
            badge="Our Expertise"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ServiceCard 
              title="Software Systems"
              description="Full-stack React & TypeScript architectures with robust Cloud integration."
              icon={<Code className="h-6 w-6" />}
              href="/solutions/software"
              colorScheme="blue"
            />
            <ServiceCard 
              title="Hardware & IoT"
              description="Industrial sensor networks and custom embedded hardware prototyping."
              icon={<Cpu className="h-6 w-6" />}
              href="/solutions/hardware"
              colorScheme="emerald"
            />
            <ServiceCard 
              title="AI & ML Solutions"
              description="Predictive modeling and neural network applications for enterprise data."
              icon={<BrainCircuit className="h-6 w-6" />}
              href="/solutions/ai-ml"
              colorScheme="purple"
            />
            <ServiceCard 
              title="Research Services"
              description="Technical documentation, journal preparation, and academic project support."
              icon={<Microscope className="h-6 w-6" />}
              href="/services/research"
              colorScheme="orange"
            />
          </div>
        </Container>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader 
                title="Built on Engineering Excellence" 
                align="left"
                badge="Why Sricore Solutions"
                className="mb-8"
              />
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We bridge the gap between academic research and industrial application. Our team of experienced engineers and domain experts deliver solutions that are not only technologically advanced but also practically viable and commercially scalable.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Integrated approach combining software, hardware, and AI',
                  'Rigorous research-backed development methodologies',
                  'End-to-end project lifecycle support and maintenance',
                  'Dedicated training and mentorship programs',
                  'Focus on scalable and secure architectures'
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Our Workflow</h3>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Analysis & Research', desc: 'Thorough requirement gathering and technical feasibility studies.' },
                  { step: '02', title: 'Architecture & Design', desc: 'Scalable system design encompassing software, hardware, and data flows.' },
                  { step: '03', title: 'Development & Integration', desc: 'Agile development with continuous integration and rigorous testing.' },
                  { step: '04', title: 'Deployment & Support', desc: 'Seamless transition to production with ongoing maintenance and updates.' },
                ].map((phase, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-xl font-bold text-blue-300 font-mono">{phase.step}</div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{phase.title}</h4>
                      <p className="text-slate-600">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Internships & Training Highlight */}
      <section className="py-24 bg-white">
        <Container>
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-center">
                <span className="inline-block py-1 px-3 rounded-full bg-slate-800 text-blue-300 text-sm font-semibold tracking-wide w-fit mb-6">
                  Education & Growth
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Launch Your Career with Practical Training
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Sricore Solutions offers paid internships and specialized practical training programs. Work on live industrial projects, receive mentorship from senior engineers, and build a portfolio that stands out.
                </p>
                <Link to="/internships" className="inline-flex items-center text-blue-300 font-semibold hover:text-blue-200 transition-colors text-lg">
                  Explore Internship Opportunities <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="bg-slate-800 relative hidden lg:block">
                {/* Abstract pattern placeholder */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#2563eb 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="w-full h-full border border-slate-700 rounded-2xl bg-slate-900/50 backdrop-blur-sm p-8 flex flex-col gap-4">
                    <div className="h-4 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                    <div className="h-4 w-2/3 bg-slate-700 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-700 rounded"></div>
                    <div className="mt-auto flex justify-between items-end">
                      <div className="h-10 w-24 bg-blue-600 rounded"></div>
                      <div className="h-10 w-10 bg-slate-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Selected Projects */}
      <section className="py-24 bg-slate-50">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <SectionHeader 
              title="Selected Works" 
              description="A glimpse into our recent industrial and academic project implementations."
              align="left"
              className="mb-0 max-w-2xl"
              badge="Portfolio"
            />
            <Link to="/projects" className="hidden md:inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View all projects <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProjectCard 
              title="Automated Quality Inspection System"
              category="AI/ML & Hardware"
              description="A computer vision-based inspection line using high-speed cameras and custom edge AI hardware for real-time defect detection."
              href="/projects/quality-inspection"
            />
            <ProjectCard 
              title="Smart Factory IoT Dashboard"
              category="Software & IoT"
              description="Centralized monitoring platform aggregating data from thousands of industrial sensors with predictive maintenance alerts."
              href="/projects/iot-dashboard"
            />
            <ProjectCard 
              title="Healthcare Data Management API"
              category="Software Solutions"
              description="Secure, compliant microservices architecture for managing patient records and integrating with legacy hospital systems."
              href="/projects/health-api"
            />
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/projects" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View all projects <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <CTASection 
        title="Ready to transform your ideas into reality?"
        description="Connect with our technical team to discuss your project requirements or inquire about our services."
        primaryAction={{ label: "Contact Us Today", href: "/contact" }}
        secondaryAction={{ label: "View Our Services", href: "/services" }}
      />
    </div>
  );
}
