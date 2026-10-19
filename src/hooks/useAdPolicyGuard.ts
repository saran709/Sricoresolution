import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isRouteEligibleForAds } from '../lib/adEligibility';

/**
 * useAdPolicyGuard Hook
 * 
 * Automatically instructs Google AdSense crawlers and Auto Ads scripts
 * to ignore screens without publisher content, private dashboards, and forms.
 * 
 * Sets standard Google publisher attributes on document body:
 * - data-google-ad-ignore="true"
 * - class="adsbygoogle-noablate"
 */
export function useAdPolicyGuard() {
  const location = useLocation();

  useEffect(() => {
    const isEligible = isRouteEligibleForAds(location.pathname);

    if (!isEligible) {
      document.body.setAttribute('data-google-ad-ignore', 'true');
      document.body.classList.add('adsbygoogle-noablate');
      
      // Clean up any stray auto-ads if injected
      const strayAds = document.querySelectorAll('.adsbygoogle-noablate ins.adsbygoogle');
      strayAds.forEach(el => {
        if (!el.closest('.amp-ad-slot-wrapper') && !el.closest('[aria-label="Sponsored Content"]')) {
          el.remove();
        }
      });
    } else {
      document.body.removeAttribute('data-google-ad-ignore');
      document.body.classList.remove('adsbygoogle-noablate');
    }
  }, [location.pathname]);
}
