import React from 'react';
import { firebaseService } from '../../lib/firebaseService';
import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useAuth } from '../../contexts/AuthContext';

import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { Search, ShieldCheck, Zap, Server } from 'lucide-react';
import { Link } from 'react-router-dom';


  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebaseService.create('technology_audits', {
        ...formData,
        userId: currentUser?.uid || null,
        status: 'NEW',
      });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

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
              <a href="#request-form">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                  Audit My Technology
                </Button>
              </a>
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
            <a href="#request-form">
              <Button size="lg">Request an Audit</Button>
            </a>
          </div>
        </Container>
      </section>
    
      {/* Request Form Section */}
      <section className="py-24 bg-white" id="request-form">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Request a Technology Audit</h2>
              <p className="text-lg text-slate-600">Ready to evaluate your system health? Provide some brief details and our engineering team will reach out to scope the audit.</p>
            </div>
            {success ? (
              <div className="bg-emerald-50 text-emerald-800 p-8 rounded-2xl text-center border border-emerald-200">
                <h3 className="text-2xl font-bold mb-2">Request Received</h3>
                <p>Our team will review your details and contact you shortly.</p>
                <Button className="mt-6" onClick={() => setSuccess(false)}>Submit Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Your Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <Input label="Email Address *" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Organization" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
                  <Input label="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <Textarea 
                  label="Project Details / Current Challenges *" 
                  required 
                  rows={5}
                  value={formData.details} 
                  onChange={e => setFormData({...formData, details: e.target.value})} 
                />
                <Button type="submit" size="lg" className="w-full text-lg h-14" isLoading={loading}>
                  Submit Request
                </Button>
              </form>
            )}
          </div>
        </Container>
      </section>
  </div>
  );
}
