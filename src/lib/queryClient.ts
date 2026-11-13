import { QueryClient } from '@tanstack/react-query';

const isNonRetryableError = (error: unknown): boolean => {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error || '').toLowerCase();
  return (
    message.includes('permission-denied') ||
    message.includes('permission denied') ||
    message.includes('insufficient permissions') ||
    message.includes('unauthenticated') ||
    message.includes('not-found')
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache validity
      gcTime: 1000 * 60 * 20,   // 20 minutes retained in memory cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: (failureCount, error) => {
        if (isNonRetryableError(error)) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
