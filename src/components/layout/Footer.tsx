import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { APP_CONFIG } from '../../config';
import { NewsletterSignup } from '../NewsletterSignup';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rotate-45"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SRICORE<span className="text-amber-500">SOLUTIONS</span></span>
            </Link>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-3">Advanced Engineering Hub</p>
            <p className="text-sm text-slate-400 max-w-xs">
              {APP_CONFIG.company.tagline}. {APP_CONFIG.company.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/internships" className="text-sm hover:text-white transition-colors">Internships</Link></li>
              <li><Link to="/projects" className="text-sm hover:text-white transition-colors">Projects</Link></li>
              <li><Link to="/careers" className="text-sm hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/solutions/software" className="text-sm hover:text-white transition-colors">Software Development</Link></li>
              <li><Link to="/solutions/hardware" className="text-sm hover:text-white transition-colors">Hardware & IoT</Link></li>
              <li><Link to="/solutions/ai-ml" className="text-sm hover:text-white transition-colors">AI/ML Solutions</Link></li>
              <li><Link to="/services/research" className="text-sm hover:text-white transition-colors">Research & Documentation</Link></li>
              <li><Link to="/internships" className="text-sm hover:text-white transition-colors">Training</Link></li>
            </ul>
          </div>

                    {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <address className="not-italic space-y-2 text-sm">
              <p>{APP_CONFIG.company.contact.address}</p>
              <p>
                <a href={`mailto:${APP_CONFIG.company.contact.email}`} className="hover:text-white transition-colors">
                  {APP_CONFIG.company.contact.email}
                </a>
              </p>
            </address>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <NewsletterSignup className="max-w-none text-slate-300" />
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
          <p>
            &copy; {currentYear} SRICORE SOLUTIONS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-4">
            <span className="hidden md:inline-block">ISO 9001:2015 CERTIFIED ORGANIZATION</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
