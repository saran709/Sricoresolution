import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { 
  GFORM_CONFIG, 
  OFFICIAL_GFORM_INTERNSHIPS 
} from '../data/internshipsData';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { 
  GraduationCap, 
  ExternalLink, 
  CheckCircle2, 
  Award, 
  Clock, 
  ArrowRight, 
  FileText, 
  Laptop, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InternshipRegistration() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  return (
    <div className="py-10 md:py-16 bg-slate-50 min-h-screen">
      <Container>
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-md border border-slate-700 mb-8 relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-4 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Registration Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
              {GFORM_CONFIG.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Welcome to the official Sricore Solutions Industrial Internship Application. Review the 7 open domains below and complete your registration via our official Google Form. Your verified Offer Letter will be issued within <strong>24 to 48 hours</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={GFORM_CONFIG.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Apply for Internship</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                to="/internships"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition-colors"
              >
                <span>View Full Syllabus & FAQs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Form Embed on Left, Domain Selection & Details on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Embedded Google Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Live Application Form</h3>
                <p className="text-[11px] text-slate-500">Fill in directly or tap open in new tab</p>
              </div>
              <a
                href={GFORM_CONFIG.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                <span>Direct Window</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="w-full flex justify-center bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
              <iframe
                src={GFORM_CONFIG.embedUrl}
                width="100%"
                height="950"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Sricore Internship Google Form"
                className="w-full"
              >
                Loading Google Form…
              </iframe>
            </div>
          </div>

          {/* Right Sidebar: 7 Internship Domains & Requirements */}
          <div className="lg:col-span-5 space-y-6">
            {/* Open Domains in the Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span>Choose Your Domain in the Form</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  7 Options
                </span>
              </div>

              <div className="space-y-3">
                {OFFICIAL_GFORM_INTERNSHIPS.map((dom, idx) => (
                  <div key={dom.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {idx + 1}. {dom.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
                        {dom.duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {dom.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dom.technologies.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white text-slate-600 rounded border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Program Completion Deliverables */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Certification & Benefits</span>
              </h4>

              <ul className="space-y-2.5 text-xs">
                {GFORM_CONFIG.certificates.map((cert, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </li>
                ))}
                {GFORM_CONFIG.perks.map((perk, i) => (
                  <li key={`p-${i}`} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Helper Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs">
              <h5 className="font-bold mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Important Note on Offer Letters</span>
              </h5>
              <p className="text-amber-800/90 leading-relaxed">
                Ensure your Email Address and WhatsApp contact number are entered correctly in the Google Form. All credentials, project repositories, and offer letters are dispatched electronically.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
