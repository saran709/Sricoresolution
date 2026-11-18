import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useAdPolicyGuard Hook
 *
 * Ensures document.body never carries ad-related classes or attributes
 * (such as `adsbygoogle-noablate` or `data-google-ad-ignore`) that trigger
 * third-party ad-blocker cosmetic filters (`display: none !important` on body).
 */
export function useAdPolicyGuard() {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    document.body.removeAttribute('data-google-ad-ignore');
    document.body.classList.remove('adsbygoogle-noablate');
  }, [location.pathname]);
}

