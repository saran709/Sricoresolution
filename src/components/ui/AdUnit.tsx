import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isRouteEligibleForAds } from '../../lib/adEligibility';

interface AdUnitProps {
  className?: string;
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal';
  fullWidthResponsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

/**
 * Policy-Compliant Google AdSense Ad Unit Component
 * 
 * Enforces Google Publisher Policies:
 * - Checks route against explicit eligibility allowlist (blocks auth, admin, dashboards, form screens)
 * - Renders a distinct "ADVERTISEMENT" label so ads are never confused with editorial content
 * - Auto-collapses cleanly if unfilled to prevent blank white boxes or layout disruption
 * - Does not inject intrusive popups or disruptive shifts
 */
export function AdUnit({
  className = '',
  adSlot = '2126661300',
  adFormat = 'auto',
  fullWidthResponsive = true
}: AdUnitProps) {
  const location = useLocation();
  const isEligible = isRouteEligibleForAds(location.pathname);
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
    setIsUnfilled(false);
    setAdLoaded(false);

    if (!isEligible || typeof window === 'undefined') return;

    let isMounted = true;
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const ensureAdSenseScript = () => {
      const scriptId = 'google-adsense-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5684687588450520';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    };

    const tryPushAd = (): boolean => {
      if (!isMounted) return false;
      const adEl = adRef.current;
      const containerEl = containerRef.current;
      if (!adEl || !containerEl || !adEl.isConnected) return false;

      // Never push if this <ins> element has already been initialized or queued
      if (
        adEl.getAttribute('data-ad-pushed') === 'true' ||
        adEl.getAttribute('data-adsbygoogle-status') ||
        adEl.getAttribute('data-ad-status') ||
        adEl.children.length > 0
      ) {
        return true;
      }

      // Ensure the slot has a positive available width before calling adsbygoogle.push({})
      const availableWidth = Math.max(
        adEl.offsetWidth,
        Math.floor(adEl.getBoundingClientRect().width),
        Math.floor(containerEl.getBoundingClientRect().width)
      );

      if (availableWidth <= 0) {
        return false;
      }

      adEl.setAttribute('data-ad-pushed', 'true');
      try {
        ensureAdSenseScript();
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (e) {
        console.debug('AdSense unit push note:', e);
      }
      return true;
    };

    // Defer push until after layout frame (also prevents duplicate push in React StrictMode)
    rafId = window.requestAnimationFrame(() => {
      if (!isMounted) return;
      const pushed = tryPushAd();
      if (!pushed && typeof ResizeObserver !== 'undefined' && containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (tryPushAd() && resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
          }
        });
        resizeObserver.observe(containerRef.current);
      }
    });

    // Monitor ad element status
    const checkStatus = () => {
      if (!isMounted || !adRef.current) return;
      const status = adRef.current.getAttribute('data-ad-status');
      if (status === 'unfilled') {
        setIsUnfilled(true);
      } else if (status === 'filled') {
        setAdLoaded(true);
      }
    };

    const timer = setTimeout(checkStatus, 1500);

    const observer = new MutationObserver(() => {
      checkStatus();
    });

    if (adRef.current) {
      observer.observe(adRef.current, { attributes: true, attributeFilter: ['data-ad-status'] });
    }

    return () => {
      isMounted = false;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isEligible, location.pathname]);

  // NEVER render on ineligible routes (login, admin, dashboard, payment, legal, etc.)
  if (!isEligible) {
    return null;
  }

  // If Google reported unfilled, collapse entirely
  if (isUnfilled) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`my-8 w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${className}`}
      aria-label="Sponsored Content"
      data-ad-loaded={adLoaded ? 'true' : 'false'}
    >
      {/* Explicit Advertisement Header per Google AdSense Policy */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 text-[10px] tracking-widest text-slate-400 uppercase font-semibold select-none">
        <span>Advertisement</span>
        <span>Google AdSense</span>
      </div>

      <div className="w-full max-w-4xl flex justify-center min-h-[90px] bg-slate-50/50 rounded-lg p-2 border border-slate-100">
        <ins
          key={location.pathname}
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minWidth: '250px', minHeight: '90px' }}
          data-ad-client="ca-pub-5684687588450520"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}

export default AdUnit;
