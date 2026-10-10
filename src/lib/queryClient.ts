import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache validity
      gcTime: 1000 * 60 * 15,    // 15 minutes before garbage collection
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
