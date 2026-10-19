import React from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ShieldCheck, CheckCircle2, FileCode, Users, RefreshCw, AlertCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EditorialPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-xs mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold mb-3 border border-amber-500/20">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Editorial Standards & Transparency
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              Editorial & Publishing Policy
            </h1>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              At Sricore Solutions, we are committed to delivering authentic, technically rigorous, and reproducible documentation, engineering case studies, and curriculum materials. This policy outlines our standards for content integrity, factual verification, authorship, and editorial independence.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
              <span><strong>Effective Date:</strong> January 2024</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> October 2024</span>
              <span>•</span>
              <span><strong>Review Cycle:</strong> Bi-Annual</span>
            </div>
          </div>

          {/* Core Principles */}
          <div className="space-y-6">
            {/* Principle 1 */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">1. Technical Accuracy & Verification Protocol</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    Every technical case study, system architecture blueprint, and research summary published on Sricore Solutions is subjected to rigorous engineering verification prior to public release:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                    <li><strong>Code Verification:</strong> Code snippets, API interfaces, and hardware register configurations are executed and validated in sandbox testbeds before publication.</li>
                    <li><strong>Hardware & Circuit Validation:</strong> PCB layouts, microcontroller pinouts, and sensor telemetry configurations are cross-referenced with manufacturer datasheets (e.g. TI, Espressif, Microchip).</li>
                    <li><strong>Empirical Metrics:</strong> Performance benchmarks (inference latency, power consumption, network throughput) reflect empirical measurement from our development lab rather than theoretical estimates.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Principle 2 */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-1">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">2. Originality & Anti-Plagiarism Policy</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    We maintain a zero-tolerance policy against plagiarism, content scraping, and deceptive spinning. All articles, project documentation, and training syllabi are created internally by our practicing engineers and domain specialists.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    External research papers, industry standards (IEEE, ACM, ISO/IEC), and open-source libraries referenced in our technical literature are attributed with citations and canonical references.
                  </p>
                </div>
              </div>
            </div>

            {/* Principle 3 */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-1">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">3. Human Engineering Authorship & AI Transparency</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    We believe high-value technical content requires verified domain expertise:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                    <li><strong>Human Oversight:</strong> We do not publish automated, mass-generated AI content. While AI-based tools may assist in syntax verification, formatting, or language editing, all substantive technical claims, architecture diagrams, and conclusions are authored and vetted by human technical staff.</li>
                    <li><strong>Author Attribution:</strong> Major publications, research papers, and technical whitepapers clearly identify contributing engineers, research mentors, and their respective practice departments.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Principle 4 */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">4. Corrections, Updates & Versioning</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    Technology evolves rapidly. When APIs update, hardware components become obsolete, or dependencies change:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                    <li>We update project documentation and curriculum modules promptly to reflect stable versions.</li>
                    <li>If a factual or technical error is identified in our technical documentation, we correct it transparently with an update notice.</li>
                    <li>Readers and community members may submit corrections or suggestions directly to our editorial desk at <a href="mailto:contact@sricoresolutions.com" className="text-blue-600 font-semibold hover:underline">contact@sricoresolutions.com</a>.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Principle 5 */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-1">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">5. Advertising & Editorial Independence</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    Sricore Solutions maintains complete separation between advertising operations and editorial / technical evaluations:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                    <li>Third-party advertisers, including Google AdSense partners, have no input into our research findings, technical conclusions, project case studies, or hiring decisions.</li>
                    <li>Advertisements are strictly segregated from editorial content and always carry prominent labels ("ADVERTISEMENT" or "SPONSORED").</li>
                    <li>We never accept paid reviews for software or hardware tools without clear, explicit disclosure.</li>
                    <li>Advertising is restricted strictly to eligible content pages and is never displayed on login screens, dashboards, administrative consoles, or transaction pages.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Editorial Desk */}
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Feedback or Corrections?</h3>
                <p className="text-xs text-slate-300">
                  Our engineering and editorial review board reviews all technical queries within 48 business hours.
                </p>
              </div>
              <Link 
                to="/contact" 
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
              >
                Contact Editorial Board
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
