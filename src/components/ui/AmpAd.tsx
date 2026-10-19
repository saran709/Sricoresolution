import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isRouteEligibleForAds } from '../../lib/adEligibility';

interface AmpAdProps {
  className?: string;
}

/**
 * Google AdSense AMP Ad unit
 * Automatically verifies route eligibility before mounting and collapses
 * cleanly so that no blank boxes or white gaps appear when unfilled.
 */
export function AmpAd({ className = '' }: AmpAdProps) {
  const location = useLocation();
  const isEligible = isRouteEligibleForAds(location.pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAdContent, setHasAdContent] = useState<boolean>(false);

  useEffect(() => {
    if (!isEligible) return;

    const el = containerRef.current;
    if (!el) return;

    const checkAdStatus = () => {
      const ampElem = el.querySelector('amp-ad');
      if (ampElem) {
        const isUnfilled = ampElem.classList.contains('amp-unfilled') || 
                           ampElem.getAttribute('data-ad-status') === 'unfilled';
        const hasIframe = ampElem.querySelector('iframe') !== null;
        if (hasIframe && !isUnfilled) {
          setHasAdContent(true);
        }
      }
    };

    checkAdStatus();

    const observer = new MutationObserver(() => {
      checkAdStatus();
    });

    observer.observe(el, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [isEligible, location.pathname]);

  // NEVER render on ineligible screens (login, admin, dashboard, payment, error, etc.)
  if (!isEligible) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`amp-ad-slot-wrapper w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-200 ${
        hasAdContent ? 'my-4 opacity-100' : 'h-0 min-h-0 max-h-0 m-0 p-0 opacity-0 pointer-events-none'
      } ${className}`}
    >
      <div className="w-full max-w-4xl text-[10px] text-slate-400 uppercase tracking-widest text-center py-1 font-medium">
        Advertisement
      </div>
      <amp-ad
        width="100vw"
        height="320"
        type="adsense"
        data-ad-client="ca-pub-5684687588450520"
        data-ad-slot="2126661300"
        data-auto-format="rspv"
        data-full-width=""
      >
        <div overflow=""></div>
      </amp-ad>
    </div>
  );
}

export default AmpAd;
