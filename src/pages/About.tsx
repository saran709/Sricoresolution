import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export default function About() {
  const { settings } = useWebsiteSettings();
  const about = settings?.about;
  const brandName = settings?.brandName || 'Sricore Solutions';
  const primaryColor = settings?.theme?.primary || '#d97706';

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="py-10 md:py-16 bg-slate-900 text-white">
        <Container>
          <div className="max-w-3xl">
            <div 
              className="inline-block py-0.5 px-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2 bg-slate-800"
              style={{ color: primaryColor }}
            >
              Who We Are
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              {about?.heroTitle || `About ${brandName}`}
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {about?.heroSubtitle || 'We are a team of dedicated engineers, researchers, and technologists committed to solving complex industrial challenges through innovative technical solutions.'}
            </p>
          </div>
        </Container>
      </section>

      {/* Story, Mission & Vision */}
      <section className="py-10 md:py-16 bg-white">
        <Container>
          {about?.story && (
            <div className="max-w-4xl mx-auto mb-8 p-6 md:p-8 rounded-xl bg-slate-50 border border-slate-200">
              <h2 className="text-base md:text-lg font-bold text-slate-900 mb-2">Our Background & Genesis</h2>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                {about.story}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-6 md:p-8 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div 
                className="w-8 h-1 rounded mb-3"
                style={{ backgroundColor: primaryColor }}
              ></div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {about?.mission || 'To empower organizations by delivering robust, scalable, and cutting-edge technology solutions that drive efficiency and growth. We strive to bridge the gap between academic research and industrial application.'}
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div 
                className="w-8 h-1 rounded mb-3"
                style={{ backgroundColor: primaryColor }}
              ></div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Our Vision</h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {about?.vision || 'To be the premier technology partner recognized globally for excellence in software engineering, embedded systems, artificial intelligence, and applied research.'}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Dynamic Core Values */}
      <section className="py-10 md:py-16 bg-slate-50 border-t border-slate-200">
        <Container>
          <SectionHeader 
            title="Core Values" 
            description="The principles that guide our work, our decisions, and our relationships with clients, interns, and partners."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {(about?.coreValues && about.coreValues.length > 0 ? about.coreValues : [
              { id: '1', title: 'Engineering Excellence', description: 'We maintain the highest standards in our technical architecture, code quality, and system design.' },
              { id: '2', title: 'Innovation First', description: 'We continuously explore emerging technologies to provide forward-thinking solutions that keep our clients ahead.' },
              { id: '3', title: 'Integrity & Trust', description: 'We maintain absolute transparency with our stakeholders, adhering to strict data confidentiality.' }
            ]).map((val) => (
              <div key={val.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-shadow">
                <div 
                  className="w-2.5 h-2.5 rounded-full mb-3"
                  style={{ backgroundColor: primaryColor }}
                ></div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{val.title}</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
