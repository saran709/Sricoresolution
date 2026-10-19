import React from 'react';
import { Container } from '../components/ui/Container';
import { ShieldCheck, Lock, Eye, Cookie, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <Container>
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-12 rounded-2xl border border-slate-200 shadow-xs">
          {/* Header */}
          <div className="border-b border-slate-100 pb-6 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-semibold mb-3 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Data Protection & Privacy Governance
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Privacy Policy & Cookie Disclosures
            </h1>
            <p className="text-xs text-slate-500">
              Last Updated: October 2024 • Version 2.4 (Google AdSense & GDPR / CCPA Compliant)
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm leading-relaxed">
            <p className="lead text-base text-slate-800 font-medium">
              Sricore Solutions ("we," "our," or "us") is dedicated to upholding the highest standards of data integrity, confidentiality, and transparency. This Privacy Policy details how we handle information collected through our website (<a href="https://www.sricoresolutions.com" className="text-blue-600 hover:underline">www.sricoresolutions.com</a>), our services, client portals, and online educational and internship platforms.
            </p>

            {/* Section 1 */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-8 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> 1. Information We Collect
              </h2>
              <p>We collect information only when reasonably necessary to provide engineering services, process applications, or enhance site performance:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Directly Provided Information:</strong> Full name, institutional or company affiliation, email address, phone number, project specifications, and resume details submitted via our contact, internship, and project enquiry forms.</li>
                <li><strong>Automated Device & Usage Information:</strong> Internet Protocol (IP) addresses, browser type, operating system, referring URLs, pages visited, and interaction timestamps.</li>
                <li><strong>Authentication & Profile Data:</strong> For registered employees, clients, or interns, encrypted credentials, role permissions, and access logs within Firebase Authentication.</li>
              </ul>
            </div>

            {/* Section 2 - CRITICAL GOOGLE ADSENSE DISCLOSURE */}
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 my-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-amber-700" /> 2. Google AdSense & Third-Party Advertising Disclosures
              </h2>
              <p className="text-slate-800 mb-3">
                In strict adherence to Google Publisher Policies, we provide the following explicit disclosures regarding third-party advertising partners, cookies, and user opt-out options:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-800">
                <li>
                  <strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including <strong>Google LLC</strong>, use cookies to serve advertisements based on a user's prior visits to our website or other websites across the Internet.
                </li>
                <li>
                  <strong>Personalized Advertising:</strong> Google's use of advertising cookies (such as the DoubleClick cookie) enables it and its partners to serve ads to users based on their visits to our site and/or other sites on the Internet.
                </li>
                <li>
                  <strong>User Opt-Out of Personalized Ads:</strong> Users may opt out of personalized advertising by visiting the official <strong><a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">Google Ads Settings (https://www.google.com/settings/ads)</a></strong>.
                </li>
                <li>
                  <strong>Industry-Wide Opt-Out Tools:</strong> Alternatively, users can opt out of a third-party vendor's use of cookies for personalized advertising by visiting the Digital Advertising Alliance Consumer Choice tool at <strong><a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">www.aboutads.info/choices</a></strong> or the Network Advertising Initiative (NAI) opt-out page at <strong><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">optout.networkadvertising.org</a></strong>.
                </li>
                <li>
                  <strong>Zero Ads on Sensitive Screens:</strong> In accordance with Google AdSense policy, Google-served advertisements are strictly restricted to eligible public content pages and are <em>never</em> served on login screens, registration pages, private dashboards, admin consoles, or checkout/payment screens.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-8 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" /> 3. How We Protect and Use Your Data
              </h2>
              <p>We process personal data for legitimate business interests, including:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Evaluating project requests and formulating technical Statements of Work (SoW).</li>
                <li>Verifying applicant qualifications for engineering internship cohorts.</li>
                <li>Ensuring security, monitoring uptime, preventing fraudulent access, and enforcing role-based access controls.</li>
              </ul>
              <p className="mt-3">
                <strong>We never sell, rent, or trade your Personally Identifiable Information (PII) to data brokers or unrelated third parties.</strong>
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-8 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" /> 4. Your Privacy Rights (GDPR & CCPA / CPRA)
              </h2>
              <p>Depending on your jurisdiction, you possess the following enforceable data rights:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Right to Access:</strong> You may request copies of any personal records maintained by Sricore Solutions.</li>
                <li><strong>Right to Rectification:</strong> You may request correction of inaccurate or incomplete contact or technical information.</li>
                <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You may request permanent deletion of your account or form submissions where statutory retention obligations do not apply.</li>
                <li><strong>Right to Restrict or Object to Processing:</strong> You may object at any time to marketing communications or analytics tracking.</li>
                <li><strong>Non-Discrimination:</strong> We will never discriminate against you (in pricing, service quality, or access) for exercising your privacy rights.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-8 mb-3">5. Data Retention & Security Architecture</h2>
              <p>
                All data transmitted to Sricore Solutions is protected using Transport Layer Security (TLS 1.3 / SSL). Database records are stored within Google Cloud Platform / Firebase infrastructure with AES-256 encryption at rest and strict Firestore security rules preventing unauthorized reads or cross-tenant leaks. Data is retained only for the duration required to satisfy contractual, academic, or legal requirements.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-8 mb-3">6. Children's Online Privacy Protection (COPPA)</h2>
              <p>
                Our services, technical portfolio, and professional internship programs are strictly directed to individuals aged 16 and older. We do not knowingly solicit or collect personal identifiable information from children under the age of 13. If you believe a child has provided us with personal information, please contact us immediately for prompt deletion.
              </p>
            </div>

            {/* Section 7 - Contact */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 mt-10">
              <h2 className="text-lg font-bold mb-2">7. Data Protection Officer & Privacy Inquiries</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                If you have questions regarding this Privacy Policy, wish to exercise your data rights, or have questions about our advertising practices, please contact our Data Governance Officer:
              </p>
              <div className="text-xs space-y-1 text-slate-200">
                <p><strong>Entity:</strong> Sricore Solutions</p>
                <p><strong>Email:</strong> <a href="mailto:contact@sricoresolutions.com" className="text-amber-400 hover:underline">contact@sricoresolutions.com</a></p>
                <p><strong>Physical Address:</strong> Namakkal - 637018, Tamil Nadu, India</p>
                <p><strong>Telephone:</strong> +91-98402-34567</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
