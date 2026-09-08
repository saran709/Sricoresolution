import React from 'react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { Search, ShieldCheck, Zap, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TechnologyAudit() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold mb-6 border border-emerald-500/30">
              <Search className="w-4 h-4" />
              SRICORE TECHNOLOGY AUDIT™
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Evaluate the health of your digital infrastructure.
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              We provide comprehensive evaluations of existing software, databases, AI models, and infrastructure to identify vulnerabilities and bottlenecks before they impact your business.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tell-us-your-problem">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                  Audit My Technology
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What We Evaluate</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our deep-dive architectural review covers all critical vectors of your application.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <Server className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Architecture & Codebase</h3>
              <p className="text-slate-600">We analyze your codebase for maintainability, technical debt, framework lifecycle, and structural integrity.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Security & Data Privacy</h3>
              <p className="text-slate-600">We inspect authentication flows, database rules, data encryption, and potential vulnerability exposure.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <Zap className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Performance & Scalability</h3>
              <p className="text-slate-600">We evaluate database indexing, query efficiency, server load capacity, and client-side rendering speed.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <Search className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI / ML Health</h3>
              <p className="text-slate-600">For AI systems, we check model drift, inference latency, data pipeline integrity, and overall accuracy constraints.</p>
            </div>
          </div>
        </Container>
      </section>
      
      <section className="py-24 bg-white border-t border-slate-200">
        <Container>
          <div className="bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-200 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">The Output: Technology Audit Report</h2>
            <p className="text-lg text-slate-600 mb-8">
              You will receive a professional, actionable report categorizing findings by Priority (Low, Medium, High, Critical) along with precise technical recommendations and a remediation roadmap.
            </p>
            <Link to="/tell-us-your-problem">
              <Button size="lg">Request an Audit</Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
