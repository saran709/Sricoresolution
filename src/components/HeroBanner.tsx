import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from './ui/Container';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { cn } from '../utils/cn';

export interface HeroBannerProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function HeroBanner({
  eyebrow = 'End-to-End Engineering Delivery',
  headline = 'Turn Complex Technical Requirements Into Production Systems',
  subheadline = 'Partner with Sricore Solutions across software architecture, embedded IoT hardware, applied AI, scientific research, and mentored engineering cohorts.',
  ctaLabel = 'Get Started',
  ctaHref = '/enquiry',
  className,
}: HeroBannerProps) {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';
  const brandName = settings?.brandName || 'Sricore Solutions';

  return (
    <section
      aria-labelledby="hero-banner-heading"
      className={cn(
        'py-10 md:py-14 bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 transition-colors',
        className
      )}
    >
      <Container>
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              <span style={{ color: primaryColor }}>{brandName}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span>{eyebrow}</span>
            </div>

            <h2
              id="hero-banner-heading"
              className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-3"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              {headline}
            </h2>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-[64ch]">
              {subheadline}
            </p>
          </div>

          <div className="flex items-center shrink-0">
            <Link
              to={ctaHref}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[44px] text-sm font-semibold text-white rounded-lg transition-opacity duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 w-full sm:w-auto"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default HeroBanner;
