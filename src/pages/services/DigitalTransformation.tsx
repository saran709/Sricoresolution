import React from 'react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { Layers, ArrowRight, Smartphone, Laptop, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DigitalTransformation() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm font-semibold mb-6 border border-amber-500/30">
              <Layers className="w-4 h-4" />
              SRICORE DIGITAL TRANSFORMATION
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Replace paper and spreadsheets with intelligent systems.
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              We help organizations eliminate manual workflows, disconnected systems, and operational bottlenecks by designing custom digital ecosystems.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tell-us-your-problem">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white border-0">
                  Transform My Process
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Target Audience */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Are your operations holding you back?</h2>
              <p className="text-lg text-slate-600 mb-8">
                Many organizations rely on fragile, disconnected processes. We target environments that are dependent on:
              </p>
              <ul className="space-y-4">
                {['Paper forms and physical registers', 'Complex, error-prone Excel spreadsheets', 'WhatsApp-based team workflows', 'Disconnected legacy systems', 'Manual data entry and reporting'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <span className="text-xs">✕</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">The Sricore Alternative</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Centralized Data</h4>
                    <p className="text-sm text-slate-600">A single source of truth for your entire organization.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Automated Workflows</h4>
                    <p className="text-sm text-slate-600">Custom applications that guide employees and automate approvals.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Real-time Analytics</h4>
                    <p className="text-sm text-slate-600">Live dashboards replacing week-old manual reports.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Workflow */}
      <section className="py-24 bg-amber-900 text-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Transformation Journey</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="p-4">
              <div className="font-bold text-amber-300 mb-2">01</div>
              <h3 className="font-semibold">Process Analysis</h3>
            </div>
            <ArrowRight className="hidden md:block w-6 h-6 text-amber-500" />
            <div className="p-4">
              <div className="font-bold text-amber-300 mb-2">02</div>
              <h3 className="font-semibold">Digitalization Plan</h3>
            </div>
            <ArrowRight className="hidden md:block w-6 h-6 text-amber-500" />
            <div className="p-4">
              <div className="font-bold text-amber-300 mb-2">03</div>
              <h3 className="font-semibold">Application Build</h3>
            </div>
            <ArrowRight className="hidden md:block w-6 h-6 text-amber-500" />
            <div className="p-4">
              <div className="font-bold text-amber-300 mb-2">04</div>
              <h3 className="font-semibold">Deployment & Support</h3>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
