import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useWebsiteSettings();

  const brandName = settings?.brandName || 'Sricore Solutions';
  const tagline = settings?.brandTagline || 'Technology Solutions & Services';
  const description = settings?.brandDescription || 'A premier technology partner offering comprehensive solutions in software, hardware, AI/ML, and research.';
  const contact = settings?.contact || {
    address: 'Namakkal - 637018, Tamil Nadu, India',
    primaryEmail: 'contact@sricoresolutions.com',
    primaryPhone: '+91 98402 34567'
  };
  const primaryColor = settings?.theme?.primary || '#d97706';

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
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
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed pt-1">
              {description}
            </p>
            {settings?.socials && (
              <div className="flex items-center gap-3 pt-2">
                {settings.socials.linkedin && (
                  <a href={settings.socials.linkedin} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white transition-colors">
                    LinkedIn
                  </a>
                )}
                {settings.socials.github && (
                  <a href={settings.socials.github} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white transition-colors">
                    GitHub
                  </a>
                )}
                {settings.socials.twitter && (
                  <a href={settings.socials.twitter} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white transition-colors">
                    Twitter
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/career" className="text-sm hover:text-white transition-colors">Career</Link></li>
              <li><Link to="/career?type=internships" className="text-sm hover:text-white transition-colors">Internships (Google Form)</Link></li>
              <li><Link to="/projects" className="text-sm hover:text-white transition-colors">Projects</Link></li>
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
              <li><Link to="/career?type=internships" className="text-sm hover:text-white transition-colors">Internship Programs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <address className="not-italic space-y-2 text-sm text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
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
              {contact.workingHours && (
                <p className="text-xs text-slate-400 pt-1">
                  Hours: {contact.workingHours}
                </p>
              )}
            </address>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
          <p>
            {settings?.footerCopyright || `© ${currentYear} ${brandName.toUpperCase()}. ALL RIGHTS RESERVED.`}
          </p>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-block">ISO 9001:2015 CERTIFIED ORGANIZATION</span>
            <ThemeToggle variant="pill" />
          </div>
        </div>
      </Container>
    </footer>
  );
}
