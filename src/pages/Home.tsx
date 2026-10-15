import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ServiceCard } from '../components/ui/ServiceCard';
import { ProjectCard } from '../components/ui/ProjectCard';
import { CTASection } from '../components/ui/CTASection';
import { Code, Cpu, BrainCircuit, Microscope, ArrowRight, CheckCircle2, Award, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export default function Home() {
  const { settings } = useWebsiteSettings();
  const hero = settings?.hero;
  const primaryColor = settings?.theme?.primary || '#d97706';
  const metrics = settings?.metrics || [];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-slate-50 border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs">
            <div className="flex flex-col gap-3.5">
              <div 
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider w-fit"
                style={{ 
                  backgroundColor: `${primaryColor}15`, 
                  color: primaryColor 
                }}
              >
                {hero?.badge || 'Professional Technology Services'}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {hero?.title || 'Engineering Enterprise'}{' '}
                <br />
                <span style={{ color: primaryColor }}>
                  {hero?.titleHighlight || 'Digital Foundations'}
                </span>
              </h1>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-md">
                {hero?.description || 'Sricore Solutions delivers high-performance software development, industrial IoT, and AI-driven research services. We bridge the gap between academic innovation and commercial engineering excellence.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link 
                  to={hero?.primaryCtaLink || "/enquiry"} 
                  className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold rounded text-white shadow-xs w-fit transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {hero?.primaryCtaText || 'Get a Project Quote'}
                </Link>
                {hero?.secondaryCtaLink?.startsWith('http') ? (
                  <a 
                    href={hero.secondaryCtaLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold rounded border transition-colors w-fit hover:bg-slate-50"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    {hero?.secondaryCtaText || 'Apply for Internship'}
                  </a>
                ) : (
                  <Link 
                    to={hero?.secondaryCtaLink || "/career"} 
                    className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold rounded border transition-colors w-fit hover:bg-slate-50"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    {hero?.secondaryCtaText || 'Explore Careers'}
                  </Link>
                )}
              </div>

              {/* Stats badges under Hero */}
              <div className="flex flex-wrap gap-3.5 mt-3 border-t border-slate-100 pt-3">
                {(hero?.statsBadges && hero.statsBadges.length > 0 ? hero.statsBadges : ['ISO Standards', 'Industrial IoT', 'AI Certified']).map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative h-full min-h-[260px] lg:min-h-[320px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
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
              <div className="absolute inset-0 flex flex-col p-6 justify-end bg-gradient-to-t from-slate-900/40 to-transparent">
                 <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/50 w-full max-w-xs">
                   <div 
                     className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                     style={{ color: primaryColor }}
                   >
                     {hero?.monitorLabel || 'Live Monitoring Interface'}
                   </div>
                   <div className="h-1.5 bg-slate-200 rounded-full w-full mb-2 overflow-hidden">
                     <div 
                       className="h-1.5 rounded-full" 
                       style={{ width: hero?.cpuLoad || '74%', backgroundColor: primaryColor }}
                     ></div>
                   </div>
                   <div className="flex justify-between text-[11px] text-slate-500 font-mono font-medium">
                     <span>CPU Load: {hero?.cpuLoad || '74%'}</span>
                     <span>Uptime: {hero?.uptime || '99.9%'}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Dynamic Key Metrics & Milestones */}
      {metrics && metrics.length > 0 && (
        <section className="py-5 md:py-7 bg-white border-b border-slate-200">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {metrics.map((metric) => (
                <div key={metric.id} className="p-4 md:p-5 rounded-lg bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center hover:shadow-xs transition-shadow">
                  <div 
                    className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight mb-1"
                    style={{ color: primaryColor }}
                  >
                    {metric.value}
                  </div>
                  <div className="font-semibold text-slate-900 text-[11px] md:text-xs mb-1">
                    {metric.label}
                  </div>
                  {metric.description && (
                    <div className="text-[10px] md:text-[11px] text-slate-500 max-w-xs">
                      {metric.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Core Services Section */}
      <section className="py-10 md:py-14 bg-white">
        <Container>
          <SectionHeader 
            title={settings?.services?.heroTitle || "Comprehensive Technical Solutions"} 
            description={settings?.services?.heroSubtitle || "We provide end-to-end technical expertise across multiple domains, supporting organizations from conceptualization to deployment and maintenance."}
            badge="Our Capabilities"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
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
      <section className="py-10 md:py-14 bg-slate-50 border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div>
              <SectionHeader 
                title="Built on Engineering Excellence" 
                align="left"
                badge={`Why ${settings?.brandName || 'Sricore Solutions'}`}
                className="mb-3 md:mb-4"
              />
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                We bridge the gap between academic research and industrial application. Our team of experienced engineers and domain experts deliver solutions that are not only technologically advanced but also practically viable and commercially scalable.
              </p>
              
              <ul className="space-y-2.5">
                {[
                  'Integrated approach combining software, hardware, and AI',
                  'Rigorous research-backed development methodologies',
                  'End-to-end project lifecycle support and maintenance',
                  'Dedicated training and mentorship programs',
                  'Focus on scalable and secure architectures'
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                    <span className="text-slate-700 text-xs md:text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Our Workflow</h3>
              <div className="space-y-3.5">
                {[
                  { step: '01', title: 'Analysis & Research', desc: 'Thorough requirement gathering and technical feasibility studies.' },
                  { step: '02', title: 'Architecture & Design', desc: 'Scalable system design encompassing software, hardware, and data flows.' },
                  { step: '03', title: 'Development & Integration', desc: 'Agile development with continuous integration and rigorous testing.' },
                  { step: '04', title: 'Deployment & Support', desc: 'Seamless transition to production with ongoing maintenance and updates.' },
                ].map((phase, i) => (
                  <div key={i} className="flex gap-3">
                    <div 
                      className="text-base font-bold font-mono opacity-60"
                      style={{ color: primaryColor }}
                    >
                      {phase.step}
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 mb-0.5">{phase.title}</h4>
                      <p className="text-slate-600 text-xs">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Internships & Training Highlight */}
      <section className="py-10 md:py-14 bg-white">
        <Container>
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <span 
                  className="inline-block py-0.5 px-2.5 rounded-full text-[11px] font-semibold tracking-wide w-fit mb-2.5 bg-slate-800"
                  style={{ color: primaryColor }}
                >
                  Education & Growth
                </span>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2.5">
                  Launch Your Career with Practical Training
                </h2>
                <p className="text-slate-300 text-xs md:text-sm mb-5 leading-relaxed">
                  {settings?.brandName || 'Sricore Solutions'} offers paid internships and specialized practical training programs. Work on live industrial projects, receive mentorship from senior engineers, and build a portfolio that stands out.
                </p>
                <Link 
                  to="/careers?type=internships" 
                  className="inline-flex items-center font-semibold transition-colors text-sm hover:underline"
                  style={{ color: primaryColor }}
                >
                  Explore Jobs & Internship Programs <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
              <div className="bg-slate-800 relative hidden lg:block">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(${primaryColor} 2px, transparent 2px)`, backgroundSize: '24px 24px' }}></div>
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full h-full border border-slate-700 rounded-xl bg-slate-900/50 backdrop-blur-sm p-4 flex flex-col gap-2.5">
                    <div className="h-2.5 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-2.5 w-3/4 bg-slate-700 rounded"></div>
                    <div className="h-2.5 w-2/3 bg-slate-700 rounded"></div>
                    <div className="h-2.5 w-1/2 bg-slate-700 rounded"></div>
                    <div className="mt-auto flex justify-between items-end">
                      <div className="h-7 w-16 rounded" style={{ backgroundColor: primaryColor }}></div>
                      <div className="h-7 w-7 bg-slate-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Selected Projects */}
      <section className="py-10 md:py-14 bg-slate-50">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-end mb-6">
            <SectionHeader 
              title="Selected Works" 
              description="A glimpse into our recent industrial and academic project implementations."
              align="left"
              className="mb-0 max-w-2xl"
              badge="Portfolio"
            />
            <Link 
              to="/projects" 
              className="hidden md:inline-flex items-center text-xs font-semibold transition-colors"
              style={{ color: primaryColor }}
            >
              View all projects <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard 
              title="Automated Quality Inspection System"
              category="AI/ML & Hardware"
              description="A computer vision-based inspection line using high-speed cameras and custom edge AI hardware for real-time defect detection."
              imageUrl="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
              href="/projects/quality-inspection"
              code="SRI-AI-VIS-01"
              tags={['YOLOv8', 'TensorRT', 'Jetson AGX', 'Basler 4K']}
              metrics="99.8% Acc • 11ms"
            />
            <ProjectCard 
              title="Smart Factory IoT Dashboard"
              category="Software & IoT"
              description="Centralized monitoring platform aggregating data from thousands of industrial sensors with predictive maintenance alerts."
              imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
              href="/projects/iot-dashboard"
              code="SRI-IOT-IND-02"
              tags={['React', 'WebSockets', 'TimescaleDB', 'LoRaWAN']}
              metrics="50k pts/s • Real-time"
            />
            <ProjectCard 
              title="Healthcare Data Management API"
              category="Software Solutions"
              description="Secure, compliant microservices architecture for managing patient records and integrating with legacy hospital systems."
              imageUrl="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
              href="/projects/health-api"
              code="SRI-MED-API-03"
              tags={['FHIR R4', 'HL7 v2', 'TypeScript', 'OAuth2']}
              metrics="HIPAA / DISHA • <32ms"
            />
          </div>
          
          <div className="mt-4 text-center md:hidden">
            <Link 
              to="/projects" 
              className="inline-flex items-center text-xs font-semibold transition-colors"
              style={{ color: primaryColor }}
            >
              View all projects <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <CTASection 
        title="Ready to transform your ideas into reality?"
        description={`Connect with the ${settings?.brandName || 'Sricore Solutions'} technical team to discuss your project requirements or inquire about our services.`}
        primaryAction={{ label: "Contact Us Today", href: "/contact" }}
        secondaryAction={{ label: "View Our Services", href: "/services" }}
      />
    </div>
  );
}
