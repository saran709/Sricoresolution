import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

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

export function CTASection({ title, description, primaryAction, secondaryAction, theme = 'dark' }: CTASectionProps) {
  const isDark = theme === 'dark';
  
  return (
    <section className={`py-20 lg:py-24 ${isDark ? 'bg-slate-900 text-white' : 'bg-amber-50 text-slate-900'}`}>
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {title}
          </h2>
          <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to={primaryAction.href}
              className={`inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-md transition-colors w-full sm:w-auto ${
                isDark 
                  ? 'bg-amber-500 text-white hover:bg-amber-600' 
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {primaryAction.label}
            </Link>
            
            {secondaryAction && (
              <Link 
                to={secondaryAction.href}
                className={`inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-md border-2 transition-colors w-full sm:w-auto ${
                  isDark 
                    ? 'border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600' 
                    : 'border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300'
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
