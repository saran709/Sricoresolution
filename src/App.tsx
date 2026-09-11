/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppRouter } from './router';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
    </ErrorBoundary>
  );
}
