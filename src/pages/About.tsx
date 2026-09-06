import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { APP_CONFIG } from '../config';

export default function About() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="py-20 bg-slate-900 text-white">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              About {APP_CONFIG.company.name}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              We are a team of dedicated engineers, researchers, and technologists committed to solving complex industrial challenges through innovative technical solutions.
            </p>
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                To empower organizations by delivering robust, scalable, and cutting-edge technology solutions that drive efficiency and growth. We strive to bridge the gap between academic research and industrial application.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Vision</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To be the premier technology partner recognized globally for excellence in software engineering, embedded systems, artificial intelligence, and applied research.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-slate-50">
        <Container>
          <SectionHeader 
            title="Core Values" 
            description="The principles that guide our work, our decisions, and our relationships with clients and partners."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Engineering Excellence</h3>
              <p className="text-slate-600">We maintain the highest standards in our technical architecture, code quality, and system design.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Innovation First</h3>
              <p className="text-slate-600">We continuously explore emerging technologies to provide forward-thinking solutions that keep our clients ahead.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Integrity & Trust</h3>
              <p className="text-slate-600">We build transparent, honest relationships and deliver on our promises with accountability.</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
