/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from './lib/queryClient';
import { AppRouter } from './router';
import { AuthProvider } from './contexts/AuthContext';
import { WebsiteSettingsProvider } from './contexts/WebsiteSettingsContext';

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebsiteSettingsProvider>
            <AppRouter />
          </WebsiteSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
