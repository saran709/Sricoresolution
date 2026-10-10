import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon } from 'lucide-react';
import { APP_CONFIG } from '../../config';
import { Container } from '../ui/Container';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <img src="/logo.png" alt="Sricore Solutions Logo" className="h-10 w-auto object-contain" />
              <span className="text-xl font-bold tracking-tight text-slate-900">SRICORE<span className="text-blue-600">SOLUTIONS</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {APP_CONFIG.navigation.main.map((item) => {
              if (item.children) {
                return (
                  <div key={item.name} className="relative group">
                    <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-50 transition-colors">
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={cn(
                              "block px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50",
                              location.pathname === child.href && "text-blue-600 bg-slate-50"
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "text-blue-600 border-b-2 border-blue-600 rounded-none" 
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {currentUser ? (
              <Link 
                to="/dashboard" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                {userProfile?.firstName || 'Dashboard'}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-semibold rounded text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
            

          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
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
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 max-h-[80vh] overflow-y-auto">
            {APP_CONFIG.navigation.main.map((item) => (
              <React.Fragment key={item.name}>
                {item.children ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-base font-medium text-slate-900">{item.name}</div>
                    <div className="pl-6 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          onClick={closeMobileMenu}
                          className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-900 hover:bg-slate-50"
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
                  className="block w-full text-center px-4 py-3 bg-slate-100 rounded-md shadow-sm text-base font-medium text-slate-900"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block w-full text-center px-4 py-2.5 border border-slate-300 rounded-md shadow-sm text-base font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block w-full text-center px-4 py-2.5 bg-blue-600 rounded-md shadow-sm text-base font-semibold text-white hover:bg-blue-700"
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
  );
}
