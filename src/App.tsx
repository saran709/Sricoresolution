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
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthProvider } from './contexts/AuthContext';
import { WebsiteSettingsProvider } from './contexts/WebsiteSettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebsiteSettingsProvider>
            <ThemeProvider>
              <BrowserRouter>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <AppRouter />
                  <Newsletter />
                  <Footer />
                  <ThemeToggle variant="fab" />
                </div>
              </BrowserRouter>
            </ThemeProvider>
          </WebsiteSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
