/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { AppRouter } from './router';
import { Navbar } from './components/Navbar';
import { MetadataManager } from './components/seo/MetadataManager';
import { AuthProvider } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import { WebsiteSettingsProvider } from './contexts/WebsiteSettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TopProgressBar } from './components/ui/TopProgressBar';

const Newsletter = lazy(() =>
  import('./components/Newsletter').then((m) => ({ default: m.Newsletter }))
);
const Footer = lazy(() =>
  import('./components/Footer').then((m) => ({ default: m.Footer }))
);
const ThemeToggle = lazy(() =>
  import('./components/ThemeToggle').then((m) => ({ default: m.ThemeToggle }))
);
const QuickContactFAB = lazy(() =>
  import('./components/forms/QuickContactFAB').then((m) => ({
    default: m.QuickContactFAB,
  }))
);

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RBACProvider>
            <WebsiteSettingsProvider>
              <ThemeProvider>
                <BrowserRouter>
                  <TopProgressBar />
                  <MetadataManager />
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <AppRouter />
                    <Suspense fallback={null}>
                      <Newsletter />
                      <Footer />
                      <QuickContactFAB />
                      <ThemeToggle variant="fab" />
                    </Suspense>
                  </div>
                </BrowserRouter>
              </ThemeProvider>
            </WebsiteSettingsProvider>
          </RBACProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
