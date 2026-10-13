import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export default function About() {
  const { settings } = useWebsiteSettings();
  const about = settings?.about;
  const brandName = settings?.brandName || 'Sricore Solutions';
  const primaryColor = settings?.theme?.primary || '#2563eb';

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="py-5 md:py-6 bg-slate-900 text-white">
        <Container>
          <div className="max-w-3xl">
            <div 
              className="inline-block py-0.5 px-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-1.5 bg-slate-800"
              style={{ color: primaryColor }}
            >
              Who We Are
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-1.5">
              {about?.heroTitle || `About ${brandName}`}
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {about?.heroSubtitle || 'We are a team of dedicated engineers, researchers, and technologists committed to solving complex industrial challenges through innovative technical solutions.'}
            </p>
          </div>
        </Container>
      </section>

      {/* Story, Mission & Vision */}
      <section className="py-4 md:py-6 bg-white">
        <Container>
          {about?.story && (
            <div className="max-w-4xl mx-auto mb-4 p-4 md:p-6 rounded-xl bg-slate-50 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-1.5">Our Background & Genesis</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {about.story}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 md:p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div 
                className="w-10 h-1 rounded mb-3"
                style={{ backgroundColor: primaryColor }}
              ></div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {about?.mission || 'To empower organizations by delivering robust, scalable, and cutting-edge technology solutions that drive efficiency and growth. We strive to bridge the gap between academic research and industrial application.'}
              </p>
            </div>
            <div className="p-5 md:p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div 
                className="w-10 h-1 rounded mb-3"
                style={{ backgroundColor: primaryColor }}
              ></div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {about?.vision || 'To be the premier technology partner recognized globally for excellence in software engineering, embedded systems, artificial intelligence, and applied research.'}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Dynamic Core Values */}
      <section className="py-4 md:py-6 bg-slate-50 border-t border-slate-200">
        <Container>
          <SectionHeader 
            title="Core Values" 
            description="The principles that guide our work, our decisions, and our relationships with clients, interns, and partners."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(about?.coreValues && about.coreValues.length > 0 ? about.coreValues : [
              { id: '1', title: 'Engineering Excellence', description: 'We maintain the highest standards in our technical architecture, code quality, and system design.' },
              { id: '2', title: 'Innovation First', description: 'We continuously explore emerging technologies to provide forward-thinking solutions that keep our clients ahead.' },
              { id: '3', title: 'Integrity & Trust', description: 'We maintain absolute transparency with our stakeholders, adhering to strict data confidentiality.' }
            ]).map((val) => (
              <div key={val.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div 
                  className="w-2.5 h-2.5 rounded-full mb-4"
                  style={{ backgroundColor: primaryColor }}
                ></div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{val.title}</h3>
                <p className="text-slate-600 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
