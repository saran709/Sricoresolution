import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ChevronRight } from 'lucide-react';
import { Container } from './Container';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { findProjectBySlugOrId } from '../../data/projectsData';
import { FEATURED_CASE_STUDIES } from '../../data/featuredProjectsSummary';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

const STATIC_BREADCRUMB_HIERARCHY: Record<string, BreadcrumbItem[]> = {
  '/': [{ name: 'Home', path: '/' }],
  '/services': [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ],
  '/services/research': [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Research & Development', path: '/services/research' },
  ],
  '/solutions/software': [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Software Engineering', path: '/solutions/software' },
  ],
  '/solutions/hardware': [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Hardware & Industrial IoT', path: '/solutions/hardware' },
  ],
  '/solutions/ai-ml': [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'AI & Machine Learning', path: '/solutions/ai-ml' },
  ],
  '/projects': [
    { name: 'Home', path: '/' },
    { name: 'Case Studies', path: '/projects' },
  ],
  '/internships': [
    { name: 'Home', path: '/' },
    { name: 'Internships', path: '/internships' },
  ],
  '/internships/apply': [
    { name: 'Home', path: '/' },
    { name: 'Internships', path: '/internships' },
    { name: 'Apply for Internship', path: '/internships/apply' },
  ],
  '/about': [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
  ],
  '/careers': [
    { name: 'Home', path: '/' },
    { name: 'Careers', path: '/careers' },
  ],
  '/career': [
    { name: 'Home', path: '/' },
    { name: 'Careers', path: '/careers' },
  ],
  '/contact': [
    { name: 'Home', path: '/' },
    { name: 'Contact Us', path: '/contact' },
  ],
  '/enquiry': [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Request a Quote', path: '/enquiry' },
  ],
  '/privacy': [
    { name: 'Home', path: '/' },
    { name: 'Privacy Policy', path: '/privacy' },
  ],
  '/terms': [
    { name: 'Home', path: '/' },
    { name: 'Terms & Conditions', path: '/terms' },
  ],
  '/editorial-policy': [
    { name: 'Home', path: '/' },
    { name: 'Editorial & Quality Policy', path: '/editorial-policy' },
  ],
};

const SEGMENT_LABELS: Record<string, string> = {
  services: 'Services',
  solutions: 'Services',
  software: 'Software Engineering',
  hardware: 'Hardware & Industrial IoT',
  'ai-ml': 'AI & Machine Learning',
  research: 'Research & Development',
  projects: 'Case Studies',
  internships: 'Internships',
  apply: 'Apply for Internship',
  about: 'About Us',
  careers: 'Careers',
  career: 'Careers',
  contact: 'Contact Us',
  enquiry: 'Request a Quote',
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  'editorial-policy': 'Editorial & Quality Policy',
  admin: 'Admin Console',
  dashboard: 'Workspace Dashboard',
};

function formatSegmentLabel(segment: string): string {
  const clean = decodeURIComponent(segment).trim();
  if (SEGMENT_LABELS[clean.toLowerCase()]) {
    return SEGMENT_LABELS[clean.toLowerCase()];
  }
  return clean
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Dynamically resolves the full breadcrumb trail for any application pathname.
 */
export function resolveBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const normalized =
    !pathname || pathname === '/'
      ? '/'
      : pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  if (STATIC_BREADCRUMB_HIERARCHY[normalized]) {
    return STATIC_BREADCRUMB_HIERARCHY[normalized];
  }

  // Dynamic Project Case Study Route (/projects/:slug)
  if (normalized.startsWith('/projects/')) {
    const slug = normalized.replace('/projects/', '').trim();
    const matchedCaseStudy =
      findProjectBySlugOrId(slug) ||
      FEATURED_CASE_STUDIES.find((p) => p.slug === slug);

    const projectLabel = matchedCaseStudy
      ? matchedCaseStudy.title
      : formatSegmentLabel(slug);

    return [
      { name: 'Home', path: '/' },
      { name: 'Case Studies', path: '/projects' },
      { name: projectLabel, path: normalized },
    ];
  }

  // Dynamic fallback for any multi-segment path
  const segments = normalized.split('/').filter(Boolean);
  const trail: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
  let accumulatedPath = '';

  segments.forEach((seg) => {
    accumulatedPath += `/${seg}`;
    // Map '/solutions' virtual parent segment to '/services' so parent link resolves to a real route
    const targetPath = accumulatedPath === '/solutions' ? '/services' : accumulatedPath;
    const label = formatSegmentLabel(seg);

    // Avoid consecutive duplicate parent crumbs if /solutions mapped to Services
    if (trail[trail.length - 1]?.path !== targetPath) {
      trail.push({
        name: label,
        path: targetPath,
      });
    }
  });

  return trail;
}

/**
 * Determines whether the visual breadcrumb bar should be hidden on a route
 * (e.g. root homepage, authentication screens, and standalone workspace layouts).
 */
export function shouldHideVisualBreadcrumbs(pathname: string): boolean {
  const normalized =
    !pathname || pathname === '/'
      ? '/'
      : pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  return (
    normalized === '/' ||
    normalized === '/login' ||
    normalized === '/register' ||
    normalized === '/setup' ||
    normalized === '/forgot-password' ||
    normalized === '/unauthorized' ||
    normalized.startsWith('/admin') ||
    normalized.startsWith('/dashboard')
  );
}

/**
 * Builds a Schema.org `BreadcrumbList` JSON-LD node.
 */
export function buildBreadcrumbJsonLd(
  breadcrumbs: BreadcrumbItem[],
  origin: string,
  canonicalUrl: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb-list`,
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: `${origin}${crumb.path === '/' ? '/' : crumb.path}`,
    })),
  };
}

export interface BreadcrumbsProps {
  /** Optional custom breadcrumb items override */
  items?: BreadcrumbItem[];
  /** Optional label override for the active (last) breadcrumb item */
  currentLabel?: string;
  /** Whether to inject standalone Schema.org BreadcrumbList JSON-LD */
  includeSchema?: boolean;
  /** Optional additional class names for the wrapper */
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  currentLabel,
  includeSchema = true,
  className,
}) => {
  const location = useLocation();
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const resolvedCrumbs = useMemo(() => {
    const base =
      items && items.length > 0
        ? items
        : resolveBreadcrumbsForPath(location.pathname);

    if (!currentLabel || base.length === 0) {
      return base;
    }

    return base.map((crumb, index) =>
      index === base.length - 1 ? { ...crumb, name: currentLabel } : crumb
    );
  }, [items, location.pathname, currentLabel]);

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.sricoresolutions.com';

  const normalizedPath =
    !location.pathname || location.pathname === '/'
      ? '/'
      : location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname;

  const canonicalUrl = `${origin}${normalizedPath}`;

  const jsonLd = useMemo(
    () => buildBreadcrumbJsonLd(resolvedCrumbs, origin, canonicalUrl),
    [resolvedCrumbs, origin, canonicalUrl]
  );

  if (
    (!items && shouldHideVisualBreadcrumbs(location.pathname)) ||
    resolvedCrumbs.length <= 1
  ) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs transition-colors',
        className
      )}
    >
      {includeSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
      )}
      <Container>
        <nav aria-label="Breadcrumb" className="py-2.5">
          <ol
            itemScope
            itemType="https://schema.org/BreadcrumbList"
            className="flex items-center flex-wrap gap-1.5 text-xs"
          >
            {resolvedCrumbs.map((crumb, index) => {
              const isFirst = index === 0;
              const isLast = index === resolvedCrumbs.length - 1;
              const itemUrl = `${origin}${crumb.path === '/' ? '/' : crumb.path}`;

              return (
                <li
                  key={`${crumb.path}-${index}`}
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                  className="inline-flex items-center gap-1.5 min-w-0"
                >
                  {index > 0 && (
                    <ChevronRight
                      className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  {isLast ? (
                    <span
                      aria-current="page"
                      itemProp="name"
                      className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md"
                      style={{ color: primaryColor }}
                    >
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      itemProp="item"
                      className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {isFirst && (
                        <Home
                          className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400"
                          aria-hidden="true"
                        />
                      )}
                      <span itemProp="name" className="hover:underline underline-offset-4">
                        {crumb.name}
                      </span>
                    </Link>
                  )}

                  {isLast && <link itemProp="item" href={itemUrl} />}
                  <meta itemProp="position" content={String(index + 1)} />
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>
    </div>
  );
};

export default Breadcrumbs;
