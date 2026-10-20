import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { useTheme } from '../../contexts/ThemeContext';

interface CTASectionProps {
  title: string;
  description: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  theme?: 'dark' | 'light';
}

export function CTASection({ title, description, primaryAction, secondaryAction, theme }: CTASectionProps) {
  const { isDark: contextIsDark } = useTheme();
  const isDark = theme !== undefined ? theme === 'dark' : contextIsDark;
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';
  
  return (
    <section className={`content-visibility-auto py-10 md:py-14 transition-colors ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900 border-t border-b border-slate-200'}`}>
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            {title}
          </h2>
          <p className={`text-sm md:text-base mb-6 max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {primaryAction.href.startsWith('/') ? (
              <Link 
                to={primaryAction.href}
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-md text-white transition-opacity hover:opacity-90 w-full sm:w-auto shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {primaryAction.label}
              </Link>
            ) : (
              <a
                href={primaryAction.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-md text-white transition-opacity hover:opacity-90 w-full sm:w-auto shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {primaryAction.label}
              </a>
            )}
            
            {secondaryAction && (
              <Link 
                to={secondaryAction.href}
                className={`inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-md border transition-colors w-full sm:w-auto ${
                  isDark 
                    ? 'border-slate-700 text-white hover:bg-slate-800' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {secondaryAction.label}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
