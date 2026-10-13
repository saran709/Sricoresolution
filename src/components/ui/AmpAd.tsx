import React, { useEffect, useRef, useState } from 'react';

interface AmpAdProps {
  className?: string;
}

/**
 * Renders the Google AdSense AMP Ad unit while automatically collapsing 
 * and hiding any empty allocated space so that no blank boxes or large 
 * white gaps appear when the ad is unfilled or inactive.
 */
export function AmpAd({ className = '' }: AmpAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAdContent, setHasAdContent] = useState<boolean>(false);

  useEffect(() => {
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
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`amp-ad-slot-wrapper w-full flex justify-center overflow-hidden transition-all duration-200 ${
        hasAdContent ? 'my-2 opacity-100' : 'h-0 min-h-0 max-h-0 m-0 p-0 opacity-0 pointer-events-none'
      } ${className}`}
    >
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
