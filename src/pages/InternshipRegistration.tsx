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
    <div className="py-24 lg:py-36 bg-slate-50 min-h-[75vh] flex items-center justify-center">
      <Container className="max-w-xl text-center">
        <div className="bg-white p-10 md:p-12 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <GraduationCap className="w-8 h-8" />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Redirecting to Application Form
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
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
