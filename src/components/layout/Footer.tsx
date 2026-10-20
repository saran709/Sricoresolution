import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { Mail, Phone, MapPin, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useWebsiteSettings();

  const brandName = settings?.brandName || 'Sricore Solutions';
  const tagline = settings?.brandTagline || 'Technology Solutions & Applied Research';
  const description = settings?.brandDescription || 'A premier engineering partner offering comprehensive solutions in software architecture, embedded IoT systems, artificial intelligence, and applied research services.';
  const contact = settings?.contact || {
    address: 'Namakkal - 637018, Tamil Nadu, India',
    primaryEmail: 'contact@sricoresolutions.com',
    primaryPhone: '+91 98402 34567'
  };

  return (
    <footer className="content-visibility-auto bg-slate-900 text-slate-300 py-12 md:py-16 border-t border-slate-800">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white p-1.5 rounded-lg inline-flex items-center justify-center shadow-md border border-slate-800">
                <img 
                  src={settings?.logoUrl || "/logo.png"} 
                  alt={brandName} 
                  className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white uppercase leading-tight">
                  {brandName}
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase mt-1">
                  {tagline}
                </span>
              </div>
            </Link>
            <p className="text-xs md:text-sm text-slate-400 max-w-xs leading-relaxed pt-1">
              {description}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO 9001:2015 Certified Practice</span>
            </div>
          </div>

          {/* Quick & Trust Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link to="/about" className="text-slate-400 hover:text-white transition-colors">About Sricore</Link></li>
              <li><Link to="/services" className="text-slate-400 hover:text-white transition-colors">Engineering Services</Link></li>
              <li><Link to="/projects" className="text-slate-400 hover:text-white transition-colors">Technical Portfolio & Case Studies</Link></li>
              <li><Link to="/internships" className="text-slate-400 hover:text-white transition-colors">Internship Curriculums</Link></li>
              <li><Link to="/careers" className="text-slate-400 hover:text-white transition-colors">Careers & Openings</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Engineering Team</Link></li>
            </ul>
          </div>

          {/* Solutions & Practices */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Practice Areas</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link to="/solutions/software" className="text-slate-400 hover:text-white transition-colors">Software Engineering</Link></li>
              <li><Link to="/solutions/hardware" className="text-slate-400 hover:text-white transition-colors">Hardware & IoT Systems</Link></li>
              <li><Link to="/solutions/ai-ml" className="text-slate-400 hover:text-white transition-colors">AI & Machine Learning</Link></li>
              <li><Link to="/services/research" className="text-slate-400 hover:text-white transition-colors">R&D & Algorithmic Validation</Link></li>
              <li><Link to="/editorial-policy" className="text-amber-400/90 hover:text-amber-300 transition-colors font-medium">Editorial & Publishing Standards</Link></li>
            </ul>
          </div>

          {/* Contact Coordinates */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact Coordinates</h3>
            <address className="not-italic space-y-2.5 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span>{contact.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`mailto:${contact.primaryEmail}`} className="hover:text-white transition-colors">
                  {contact.primaryEmail}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`tel:${contact.primaryPhone}`} className="hover:text-white transition-colors">
                  {contact.primaryPhone}
                </a>
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Mon - Sat: 9:00 AM - 6:30 PM (IST)
              </p>
            </address>
          </div>
        </div>

        {/* Legal & Compliance Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="hover:text-white transition-colors font-medium">
              Privacy Policy & Cookies
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white transition-colors font-medium">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link to="/editorial-policy" className="hover:text-white transition-colors font-medium">
              Editorial Policy
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white transition-colors font-medium">
              Support Desk
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-slate-500">
              {settings?.footerCopyright || `© ${currentYear} ${brandName}. ALL RIGHTS RESERVED.`}
            </span>
            <ThemeToggle variant="pill" />
          </div>
        </div>
      </Container>
    </footer>
  );
}
