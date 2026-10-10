import { useState, useEffect } from 'react';

/**
 * Hook to manage AdSense ad visibility based on loading state.
 * Returns true when the dashboard data has successfully fetched.
 */
export function useAdVisibility(isLoading: boolean) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  return isReady;
}
