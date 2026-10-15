import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { APP_CONFIG } from '../config';
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { ContactForm } from '../components/forms/ContactForm';
import { Link } from 'react-router-dom';

export default function Contact() {
  const { settings } = useWebsiteSettings();
  const contact = settings?.contact || APP_CONFIG.company.contact;
  const primaryColor = settings?.theme?.primary || '#d97706';

  return (
    <div className="py-10 md:py-16 bg-slate-50 min-h-screen">
      <Container>
        {/* Section Header */}
        <SectionHeader 
          title="Connect with Our Engineering Team"
          description="Inquire about custom software development, artificial intelligence systems, or hardware and IoT solutions. Our team provides comprehensive technical reviews and preliminary architecture roadmaps."
          badge="Client Inquiries"
        />

        {/* Quick Service Direct Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/contact?service=software"
            className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block mb-0.5">Software Track</span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Web, Mobile & Cloud Engineering</h4>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            to="/contact?service=ai"
            className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block mb-0.5">AI Track</span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Generative AI, Vision & ML Models</h4>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            to="/contact?service=hardware"
            className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block mb-0.5">Hardware Track</span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">IoT, Embedded Systems & PCB</h4>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column: Responsive Contact Form */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <ContactForm />
          </div>

          {/* Sidebar Column: Contact Coordinates & Guarantees */}
          <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
            {/* Direct Contact Coordinates */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Direct Contact Channels</span>
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-xs font-bold text-slate-900">Email Inquiries</h4>
                    <a 
                      href={`mailto:${contact.primaryEmail || APP_CONFIG.company.contact.email}`} 
                      className="text-xs text-slate-600 hover:underline hover:text-amber-700 transition-colors block break-all font-medium mt-0.5"
                    >
                      {contact.primaryEmail || APP_CONFIG.company.contact.email}
                    </a>
                    {contact.supportEmail && contact.supportEmail !== contact.primaryEmail && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Technical Support: <a href={`mailto:${contact.supportEmail}`} className="hover:underline text-slate-600">{contact.supportEmail}</a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-xs font-bold text-slate-900">Direct Line</h4>
                    <a 
                      href={`tel:${contact.primaryPhone || APP_CONFIG.company.contact.phone}`} 
                      className="text-xs text-slate-600 hover:underline hover:text-amber-700 transition-colors block font-medium mt-0.5"
                    >
                      {contact.primaryPhone || APP_CONFIG.company.contact.phone}
                    </a>
                    {contact.altPhone && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Alternate: <a href={`tel:${contact.altPhone}`} className="hover:underline text-slate-600">{contact.altPhone}</a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Office Location */}
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-xs font-bold text-slate-900">Engineering Office</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                      {contact.address || APP_CONFIG.company.contact.address}
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-xs font-bold text-slate-900">Working Hours</h4>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      {contact.workingHours || "Mon - Sat: 9:00 AM - 6:30 PM (IST)"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Timezone: UTC+05:30</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Guarantee & NDA */}
            <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl shadow-xs border border-slate-800">
              <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Our Client Commitments</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Mutual NDA Security:</strong> We execute non-disclosure agreements prior to reviewing proprietary designs or datasets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Full IP Ownership:</strong> 100% of custom source code, schematics, and model weights are transferred to you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Transparent Milestone Scoping:</strong> Transparent deliverables with clear milestones, unit testing, and post-deployment warranties.</span>
                </li>
              </ul>
            </div>

            {/* Quote / Formal RFP Box */}
            <div 
              className="p-6 rounded-2xl shadow-xs text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <h3 className="text-base font-bold mb-2">Need a Formal RFP / Quote?</h3>
              <p className="text-white/90 mb-4 text-xs leading-relaxed">
                If you already have a detailed Request for Proposal (RFP), budget allocation, or research documentation, access our multi-step RFP portal.
              </p>
              <Link 
                to="/enquiry" 
                className="inline-block px-5 py-2.5 bg-white text-xs rounded-xl font-bold hover:bg-slate-50 transition-colors w-full text-center shadow-xs"
                style={{ color: primaryColor }}
              >
                Go to Structured RFP Form
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
