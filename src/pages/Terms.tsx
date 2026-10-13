import React from 'react';
import { Container } from '../components/ui/Container';

export default function Terms() {
  return (
    <div className="bg-slate-50 min-h-screen py-2.5 md:py-3.5">
      <Container>
        <div className="max-w-4xl mx-auto bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">Terms & Conditions</h1>
          <p className="text-slate-500 text-[11px] mb-3">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-slate max-w-none">
            <p className="lead text-base text-slate-700 mb-3">
              Please read these terms and conditions carefully before using the services provided by Sricore Solutions.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-700 mb-6">
              By accessing our website and utilizing our services, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Intellectual Property Rights</h2>
            <p className="text-slate-700 mb-6">
              Unless otherwise indicated, the Site and our services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Client Projects and Deliverables</h2>
            <p className="text-slate-700 mb-4">
              For clients engaging our software, hardware, AI, or research services:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-2">
              <li>Project scope, deliverables, timelines, and costs will be defined in a separate binding Statement of Work (SoW) or formal contract.</li>
              <li>Sricore Solutions retains intellectual property rights over pre-existing frameworks and tools used during development unless explicitly transferred in the SoW.</li>
              <li>Clients must provide necessary technical requirements and approvals in a timely manner.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Internship Programs</h2>
            <p className="text-slate-700 mb-4">
              For candidates applying to or participating in our internship programs:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-2">
              <li>Application submission does not guarantee selection into the program.</li>
              <li>Interns must adhere to Sricore Solutions' internal confidentiality, code of conduct, and intellectual property agreements.</li>
              <li>Any intellectual property developed during the course of the internship remains the sole property of Sricore Solutions.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
            <p className="text-slate-700 mb-6">
              In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site or our services.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Modifications and Interruptions</h2>
            <p className="text-slate-700 mb-6">
              We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of our services without notice at any time.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Contact Us</h2>
            <p className="text-slate-700 mb-6">
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us using the information provided on our Contact Us page.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
