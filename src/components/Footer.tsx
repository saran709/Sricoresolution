import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { Container } from './ui/Container';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { ThemeToggle } from './ui/ThemeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const { settings } = useWebsiteSettings();

  // Hide public Footer on Admin and User Dashboard Portal routes where workspace layouts manage their own shell
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const brandName = settings?.brandName || 'Sricore Solutions';
  const tagline = settings?.brandTagline || 'Technology Solutions & Applied Research';
  const description =
    settings?.brandDescription ||
    'A premier engineering partner delivering enterprise software architecture, industrial IoT embedded hardware, applied artificial intelligence, and scientific research services.';

  const officeAddress =
    settings?.contact?.address || 'Namakkal - 637018 & Chennai, Tamil Nadu, India';
  const contactEmail =
    settings?.contact?.primaryEmail || 'contact@sricoresolutions.com';
  const contactPhone = settings?.contact?.primaryPhone || '+91 98402 34567';
  const primaryColor = settings?.theme?.primary || '#d97706';

  return (
    <footer
      aria-label="Site Footer"
      className="content-visibility-auto bg-slate-900 text-slate-300 py-12 md:py-16 border-t border-slate-800"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          {/* Column 1: Brand Identity & Mission Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
              <div className="bg-white p-1.5 rounded-lg inline-flex items-center justify-center shadow-xs border border-slate-800">
                <img
                  src={settings?.logoUrl || '/logo.png'}
                  alt={brandName}
                  className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white uppercase leading-tight">
                  {brandName}
                </span>
                <span
                  className="text-[10px] font-bold tracking-wider uppercase mt-0.5"
                  style={{ color: primaryColor }}
                >
                  {tagline}
                </span>
              </div>
            </Link>

            <p className="text-xs md:text-sm text-slate-400 max-w-sm leading-relaxed">
              {description}
            </p>

            <div className="flex items-center gap-2 text-xs font-medium text-amber-400 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>ISO-Aligned Engineering & Research Practice</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-slate-400 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-slate-400 hover:text-white transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-slate-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Core Practice Areas (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              Core Practice Areas
            </h3>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <Link
                  to="/solutions/software"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Software Development
                </Link>
              </li>
              <li>
                <Link
                  to="/solutions/hardware"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Hardware & Industrial IoT
                </Link>
              </li>
              <li>
                <Link
                  to="/solutions/ai-ml"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link
                  to="/services/research"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Research & Development Services
                </Link>
              </li>
              <li>
                <Link
                  to="/internships"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Internship & Training Programs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Office Location Details & Contact Email (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              Office & Contact
            </h3>
            <address className="not-italic space-y-3 text-xs md:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-xs uppercase tracking-wider mb-0.5">
                    Registered Engineering Office
                  </div>
                  <span className="text-slate-400 leading-relaxed">{officeAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-xs uppercase tracking-wider mb-0.5">
                    Direct Email
                  </div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-slate-300 hover:text-white underline underline-offset-4 transition-colors break-all"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${contactPhone}`}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {contactPhone}
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-400 pt-0.5">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Mon – Sat · 9:00 AM – 6:30 PM IST</span>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar: Legal Links & Copyright Notice */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link to="/privacy" className="hover:text-white transition-colors font-medium">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <Link to="/terms" className="hover:text-white transition-colors font-medium">
              Terms & Conditions
            </Link>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <Link to="/editorial-policy" className="hover:text-white transition-colors font-medium">
              Editorial Policy
            </Link>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <Link to="/contact" className="hover:text-white transition-colors font-medium">
              Contact Support
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-400">
              {settings?.footerCopyright ||
                `© ${currentYear} ${brandName}. All rights reserved.`}
            </p>
            <ThemeToggle variant="pill" showLabel={false} />
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
