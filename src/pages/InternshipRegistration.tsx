import React, { useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { ExternalLink, ArrowRight, GraduationCap } from 'lucide-react';

const GOOGLE_FORM_URL = 'https://forms.gle/StQmejms3z9voMMU7';

export default function InternshipRegistration() {
  useEffect(() => {
    // Automatically redirect to the official Google Form application
    window.location.href = GOOGLE_FORM_URL;
  }, []);

  return (
    <div className="py-3 md:py-5 bg-slate-50 min-h-[60vh] flex items-center justify-center">
      <Container className="max-w-xl text-center">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-lg">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Redirecting to Application Form
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            You are being redirected to the official Sricore Solutions Internship Application Form on Google Forms.
          </p>

          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-6 py-3.5 text-base font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all gap-2"
          >
            <span>Open Application Form</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center gap-4 text-sm text-slate-500">
            <a href="/" className="hover:text-blue-600 transition-colors">
              Return Home
            </a>
            <span>•</span>
            <a href="/internships" className="hover:text-blue-600 transition-colors">
              Internship Info
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
