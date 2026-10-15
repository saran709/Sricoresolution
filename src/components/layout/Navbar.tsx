import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon, ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '../../config';
import { Container } from '../ui/Container';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useWebsiteSettings } from '../../contexts/WebsiteSettingsContext';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { settings } = useWebsiteSettings();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const primaryColor = settings?.theme?.primary || '#d97706';
  const announcement = settings?.announcement;

  return (
    <>
      {/* Top Announcement Bar if enabled */}
      {announcement?.enabled && announcement?.text && (
        <div 
          className="w-full text-xs py-1.5 px-3 transition-colors"
          style={{ 
            backgroundColor: announcement.bgColor || primaryColor, 
            color: announcement.textColor || '#ffffff' 
          }}
        >
          <Container>
            <div className="flex items-center justify-center gap-2 text-center flex-wrap font-medium">
              <span>{announcement.text}</span>
              {announcement.linkText && (
                <Link
                  to={announcement.linkUrl || '/career'}
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

      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
        <Container>
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                <img 
                  src={settings?.logoUrl || "/logo.png"} 
                  alt={settings?.brandName || "Sricore Solutions Logo"} 
                  className="h-10 w-auto object-contain" 
                  onError={(e) => {
                    // Fallback if logo fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {settings?.brandName ? (
                    <>
                      {settings.brandName.split(' ')[0]}
                      <span style={{ color: primaryColor }} className="ml-0.5">
                        {settings.brandName.split(' ').slice(1).join(' ') || 'SOLUTIONS'}
                      </span>
                    </>
                  ) : (
                    <>SRICORE<span style={{ color: primaryColor }}>SOLUTIONS</span></>
                  )}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
              {APP_CONFIG.navigation.main.map((item) => {
                if (item.children) {
                  return (
                    <div key={item.name} className="relative group">
                      <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        {item.name}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={cn(
                                "block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                                location.pathname === child.href && "font-semibold bg-slate-50 dark:bg-slate-800"
                              )}
                              style={{
                                color: location.pathname === child.href ? primaryColor : undefined
                              }}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                const isCareerRoute = (item.href === '/career' || item.href === '/careers') && 
                  (location.pathname === '/career' || location.pathname === '/careers' || location.pathname === '/internships');
                const isActive = location.pathname === item.href || isCareerRoute;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "font-semibold border-b-2 rounded-none" 
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                    style={{
                      color: isActive ? primaryColor : undefined,
                      borderColor: isActive ? primaryColor : undefined
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />

              {currentUser ? (
                <div className="flex items-center gap-2">
                  {userProfile?.role === 'ADMINISTRATOR' && (
                    <Link 
                      to="/admin" 
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-600 text-white uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Admin Portal
                    </Link>
                  )}
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    {userProfile?.firstName || 'Dashboard'}
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
                    to="/register" 
                    className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-semibold rounded text-white shadow-sm transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile actions & menu button */}
            <div className="flex md:hidden items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
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

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="px-3 pt-3 pb-4 space-y-1 sm:px-4 max-h-[80vh] overflow-y-auto">
              {/* Appearance Row */}
              <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Appearance</span>
                <ThemeToggle variant="pill" showLabel={false} />
              </div>

              {APP_CONFIG.navigation.main.map((item) => (
                <React.Fragment key={item.name}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-base font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                      <div className="pl-6 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            onClick={closeMobileMenu}
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                      style={{
                        color: (location.pathname === item.href || ((item.href === '/career' || item.href === '/careers') && (location.pathname === '/career' || location.pathname === '/careers' || location.pathname === '/internships'))) 
                          ? primaryColor 
                          : undefined,
                        fontWeight: (location.pathname === item.href || ((item.href === '/career' || item.href === '/careers') && (location.pathname === '/career' || location.pathname === '/careers' || location.pathname === '/internships')))
                          ? 600
                          : undefined
                      }}
                    >
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
              <div className="pt-4 pb-2 space-y-2">
                {currentUser ? (
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="block w-full text-center px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-md shadow-sm text-base font-medium text-slate-900 dark:text-slate-100"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block w-full text-center px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block w-full text-center px-4 py-2.5 rounded-md shadow-sm text-base font-semibold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Sign Up
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
}
