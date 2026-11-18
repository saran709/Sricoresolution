/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import { Footer } from './components/Footer';
import { ThemeToggle } from './components/ThemeToggle';
import { QuickContactFAB } from './components/forms/QuickContactFAB';

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
                  <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-clip">
                    <Navbar />
                    <AppRouter />
                    <Footer />
                    <QuickContactFAB />
                    <ThemeToggle variant="fab" />
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
