import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon, ArrowRight } from 'lucide-react';
import { Container } from './ui/Container';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { useWebsiteSettings, formatBrandParts } from '../contexts/WebsiteSettingsContext';
import { normalizeToCanonicalRole } from '../lib/rbac';
import { prefetchDashboardForRole } from '../hooks/useDashboardQueries';

export interface NavItem {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

export const PRIMARY_NAV_LINKS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  {
    name: 'Solutions',
    href: '/solutions/software',
    children: [
      { name: 'Software Solutions', href: '/solutions/software' },
      { name: 'Hardware & IoT', href: '/solutions/hardware' },
      { name: 'AI/ML Solutions', href: '/solutions/ai-ml' },
      { name: 'Research Services', href: '/services/research' },
    ],
  },
  { name: 'Projects', href: '/projects' },
  { name: 'Internships', href: '/internships' },
  { name: 'Careers', href: '/careers' },
  { name: 'Contact', href: '/contact' },
];

const preloadedPublicRoutes = new Set<string>();

export function preloadPublicRoute(href: string) {
  if (!href || preloadedPublicRoutes.has(href)) return;
  preloadedPublicRoutes.add(href);

  const warm = (loader: () => Promise<unknown>) => {
    void loader().catch(() => {
      preloadedPublicRoutes.delete(href);
    });
  };

  switch (href) {
    case '/':
      return warm(() => import('../pages/Home'));
    case '/services':
      return warm(() => import('../pages/Services'));
    case '/about':
      return warm(() => import('../pages/About'));
    case '/solutions/software':
      return warm(() => import('../pages/solutions/Software'));
    case '/solutions/hardware':
      return warm(() => import('../pages/solutions/Hardware'));
    case '/solutions/ai-ml':
      return warm(() => import('../pages/solutions/AI'));
    case '/services/research':
      return warm(() => import('../pages/services/Research'));
    case '/projects':
      return warm(() => import('../pages/Projects'));
    case '/internships':
      return warm(() => import('../pages/Internships'));
    case '/internships/apply':
      return warm(() => import('../pages/InternshipRegistration'));
    case '/careers':
    case '/career':
      return warm(() => import('../pages/Careers'));
    case '/contact':
      return warm(() => import('../pages/Contact'));
    case '/enquiry':
      return warm(() => import('../pages/Enquiry'));
    case '/login':
      return warm(() => import('../pages/auth/Login'));
  }
}

export const Navbar = React.memo(function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { settings } = useWebsiteSettings();

  // Hide public Navbar on Admin and User Dashboard Portal routes where workspace layouts manage their own header
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const primaryColor = settings?.theme?.primary || '#d97706';
  const announcement = settings?.announcement;

  const isRouteActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    if (href === '/careers' || href === '/career') {
      return location.pathname === '/careers' || location.pathname === '/career';
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Optional Top Announcement Bar */}
      {announcement?.enabled && announcement?.text && (
        <div
          className="w-full text-xs py-1.5 px-3 transition-colors"
          style={{
            backgroundColor: announcement.bgColor || primaryColor,
            color: announcement.textColor || '#ffffff',
          }}
        >
          <Container>
            <div className="flex items-center justify-center gap-2 text-center flex-wrap font-medium">
              <span>{announcement.text}</span>
              {announcement.linkText && (
                <Link
                  to={announcement.linkUrl || '/careers'}
                  onMouseEnter={() => preloadPublicRoute(announcement.linkUrl || '/careers')}
                  className="underline underline-offset-4 font-bold inline-flex items-center gap-1 hover:opacity-90 transition-opacity ml-1"
                >
                  {announcement.linkText}
                  <ArrowRight className="w-3.5 h-3.5 inline" />
                </Link>
              )}
            </div>
          </Container>
        </div>
      )}

      <header className="sticky top-0 left-0 right-0 z-50 w-full max-w-[100vw] border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
        <Container>
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4 min-w-0">
            {/* Brand Identity Lockup */}
            <div className="flex items-center min-w-0 flex-1 md:flex-initial">
              <Link
                to="/"
                onMouseEnter={() => preloadPublicRoute('/')}
                className="flex items-center gap-2 sm:gap-2.5 focus:outline-none min-w-0"
                onClick={closeMobileMenu}
              >
                <img
                  src={settings?.logoUrl || '/logo.png'}
                  alt={settings?.brandName || 'Sricore Solutions Logo'}
                  className="h-8 sm:h-9 w-auto object-contain shrink-0"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1 min-w-0 truncate">
                  {(() => {
                    const { primary, accent } = formatBrandParts(settings?.brandName);
                    return (
                      <>
                        <span className="truncate">{primary}</span>
                        {accent && (
                          <span className="truncate" style={{ color: primaryColor }}>{accent}</span>
                        )}
                      </>
                    );
                  })()}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links (Home, Services, About, Contact & Practice Areas) */}
            <nav
              aria-label="Primary Navigation"
              className="hidden md:flex items-center space-x-1 lg:space-x-2"
            >
              {PRIMARY_NAV_LINKS.map((item) => {
                if (item.children) {
                  const isChildActive = item.children.some(
                    (child) => location.pathname === child.href
                  );
                  return (
                    <div
                      key={item.name}
                      className="relative group"
                      onMouseEnter={() =>
                        item.children?.forEach((c) => preloadPublicRoute(c.href))
                      }
                    >
                      <button
                        type="button"
                        className={cn(
                          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isChildActive
                            ? 'font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        )}
                        style={{
                          color: isChildActive ? primaryColor : undefined,
                        }}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4 opacity-75" />
                      </button>
                      <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                        <div className="py-1.5">
                          {item.children.map((child) => {
                            const active = location.pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                to={child.href}
                                onMouseEnter={() => preloadPublicRoute(child.href)}
                                onFocus={() => preloadPublicRoute(child.href)}
                                className={cn(
                                  'block px-4 py-2 text-sm transition-colors',
                                  active
                                    ? 'font-semibold bg-slate-50 dark:bg-slate-800'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                )}
                                style={{
                                  color: active ? primaryColor : undefined,
                                }}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                const isActive = isRouteActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onMouseEnter={() => preloadPublicRoute(item.href)}
                    onFocus={() => preloadPublicRoute(item.href)}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'font-semibold border-b-2 rounded-none'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                    style={{
                      color: isActive ? primaryColor : undefined,
                      borderColor: isActive ? primaryColor : undefined,
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Utility & Auth Actions */}
            <div className="hidden md:flex items-center space-x-3 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onMouseEnter={() =>
                        void prefetchDashboardForRole({
                          role: 'ADMIN',
                          actualRole: 'ADMIN',
                          userProfile: userProfile as any,
                        })
                      }
                      onFocus={() =>
                        void prefetchDashboardForRole({
                          role: 'ADMIN',
                          actualRole: 'ADMIN',
                          userProfile: userProfile as any,
                        })
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-600 text-white uppercase tracking-wider transition-colors shadow-xs"
                    >
                      Admin Portal
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onMouseEnter={() => {
                      const canonical = normalizeToCanonicalRole(userProfile?.role);
                      void prefetchDashboardForRole({
                        role: canonical,
                        actualRole: canonical,
                        userProfile: userProfile as any,
                      });
                    }}
                    onFocus={() => {
                      const canonical = normalizeToCanonicalRole(userProfile?.role);
                      void prefetchDashboardForRole({
                        role: canonical,
                        actualRole: canonical,
                        userProfile: userProfile as any,
                      });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>{userProfile?.firstName || 'Dashboard'}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-semibold rounded text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/enquiry"
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md text-white shadow-xs transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Get a Quote
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle Controls */}
            <div className="flex md:hidden items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="inline-flex items-center justify-center min-h-[42px] min-w-[42px] p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </Container>

        {/* Responsive Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="px-4 pt-3 pb-5 space-y-1 max-h-[82vh] overflow-y-auto">
              {PRIMARY_NAV_LINKS.map((item) => (
                <React.Fragment key={item.name}>
                  {item.children ? (
                    <div className="space-y-1 pt-1">
                      <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {item.name}
                      </div>
                      <div className="pl-3 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-3">
                        {item.children.map((child) => {
                          const active = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={closeMobileMenu}
                              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                              style={{
                                color: active ? primaryColor : undefined,
                                fontWeight: active ? 600 : undefined,
                              }}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={closeMobileMenu}
                      className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                      style={{
                        color: isRouteActive(item.href) ? primaryColor : undefined,
                        fontWeight: isRouteActive(item.href) ? 700 : undefined,
                      }}
                    >
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}

              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {currentUser ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="block w-full text-center px-4 py-2.5 rounded-md bg-amber-500 text-white text-sm font-bold uppercase tracking-wider"
                      >
                        Admin Portal
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className="block w-full text-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-md text-sm font-semibold text-slate-900 dark:text-slate-100"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block w-full text-center px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/enquiry"
                      onClick={closeMobileMenu}
                      className="block w-full text-center px-4 py-2.5 rounded-md text-sm font-semibold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Get a Quote
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
});

export default Navbar;
