import React from 'react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, CheckCircle, Activity, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectRescue() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm font-semibold mb-6 border border-red-500/30">
              <ShieldAlert className="w-4 h-4" />
              SRICORE PROJECT RESCUE™
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Turn failing technology into successful solutions.
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              We recover incomplete software, broken applications, and underperforming AI/IoT prototypes. Let our senior engineering team audit, repair, and deploy your critical systems.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tell-us-your-problem">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white border-0">
                  Rescue My Project
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Symptoms */}
      <section className="py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">When to use Project Rescue</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Common scenarios where organizations bring us in to recover their technology investments.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Abandoned Development</h3>
              <p className="text-slate-600">Your previous vendor or developer left midway, leaving you with an unfinished, undocumented codebase.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Poor Performance</h3>
              <p className="text-slate-600">The application frequently crashes, scales poorly, or fails to handle real-world operational loads.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Broken Prototypes</h3>
              <p className="text-slate-600">Your IoT or AI prototype worked in the lab but fails to function in a production environment.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="py-24 bg-white border-t border-slate-200">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our Recovery Methodology</h2>
            
            <div className="space-y-8">
              {[
                { step: '1', title: 'Technical Audit', desc: 'We conduct a deep analysis of code quality, architecture, security, and infrastructure.' },
                { step: '2', title: 'Problem Identification', desc: 'We identify root causes of failures, bottlenecks, and missing components.' },
                { step: '3', title: 'Recovery Plan', desc: 'We present a transparent roadmap detailing exactly what can be salvaged and what needs rebuilding.' },
                { step: '4', title: 'Repair & Rebuild', desc: 'Our senior engineers refactor, rewrite, and stabilize the system.' },
                { step: '5', title: 'Testing & Deployment', desc: 'Rigorous testing followed by secure deployment to production.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
