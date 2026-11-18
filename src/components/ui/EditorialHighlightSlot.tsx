import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export interface EditorialHighlightSlotProps {
  className?: string;
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal';
  fullWidthResponsive?: boolean;
}

const ALLOWED_ROUTE_PATTERNS: RegExp[] = [
  /^\/projects\/[a-zA-Z0-9_-]+$/,
  /^\/projects\/?$/,
  /^\/solutions\/software\/?$/,
  /^\/solutions\/hardware\/?$/,
  /^\/solutions\/ai-ml\/?$/,
  /^\/services\/research\/?$/,
  /^\/services\/?$/,
];

function isPathEligible(pathname: string): boolean {
  if (!pathname) return false;
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return ALLOWED_ROUTE_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Ad-blocker resilient, policy-compliant optional sponsor slot.
 * - Uses a neutral module name so browser ad-blockers (uBlock Origin, Brave, AdBlock Plus)
 *   never block the parent page's ES module graph with ERR_BLOCKED_BY_CLIENT.
 * - Gracefully detects script blocking or unfilled state and collapses to zero height
 *   so the website remains 100% visible and functional when ad blockers are enabled.
 */
export function EditorialHighlightSlot({
  className = '',
  adSlot = '2126661300',
  adFormat = 'auto',
  fullWidthResponsive = true,
}: EditorialHighlightSlotProps) {
  const location = useLocation();
  const isEligible = isPathEligible(location.pathname);
  const slotRef = useRef<HTMLModElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFilled, setIsFilled] = useState(false);
  const [isBlockedOrUnfilled, setIsBlockedOrUnfilled] = useState(false);

  useEffect(() => {
    setIsFilled(false);
    setIsBlockedOrUnfilled(false);

    if (!isEligible || typeof window === 'undefined') return;

    let mounted = true;
    let rafId: number | null = null;
    let statusTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;

    const handleBlocked = () => {
      if (mounted) {
        setIsBlockedOrUnfilled(true);
      }
    };

    const loadAndPush = () => {
      if (!mounted) return;
      const el = slotRef.current;
      const wrap = wrapperRef.current;
      if (!el || !wrap || !el.isConnected) return;

      if (
        el.getAttribute('data-slot-initialized') === 'true' ||
        el.getAttribute('data-adsbygoogle-status') ||
        el.getAttribute('data-ad-status')
      ) {
        return;
      }

      const width = Math.max(
        el.offsetWidth,
        Math.floor(el.getBoundingClientRect().width),
        Math.floor(wrap.getBoundingClientRect().width)
      );

      if (width <= 0) {
        handleBlocked();
        return;
      }

      el.setAttribute('data-slot-initialized', 'true');

      try {
        const scriptId = 'sricore-optional-partner-sdk';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.async = true;
          script.src =
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5684687588450520';
          script.crossOrigin = 'anonymous';
          script.onerror = () => {
            handleBlocked();
          };
          document.head.appendChild(script);
        }

        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch {
        handleBlocked();
      }
    };

    rafId = window.requestAnimationFrame(() => {
      loadAndPush();
    });

    const inspectStatus = () => {
      if (!mounted || !slotRef.current) return;
      const status = slotRef.current.getAttribute('data-ad-status');
      if (status === 'unfilled') {
        setIsBlockedOrUnfilled(true);
      } else if (status === 'filled') {
        setIsFilled(true);
      }
    };

    // If the ad script is blocked by an extension or does not fill promptly, collapse cleanly
    statusTimer = setTimeout(() => {
      if (!mounted || !slotRef.current) return;
      const status = slotRef.current.getAttribute('data-ad-status');
      if (status !== 'filled') {
        setIsBlockedOrUnfilled(true);
      }
    }, 1800);

    if (typeof MutationObserver !== 'undefined' && slotRef.current) {
      observer = new MutationObserver(inspectStatus);
      observer.observe(slotRef.current, {
        attributes: true,
        attributeFilter: ['data-ad-status'],
      });
    }

    return () => {
      mounted = false;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (statusTimer) clearTimeout(statusTimer);
      observer?.disconnect();
    };
  }, [isEligible, location.pathname]);

  if (!isEligible || isBlockedOrUnfilled) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className={`w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-200 ${
        isFilled ? `my-6 ${className}` : 'h-0 min-h-0 max-h-0 my-0 opacity-0 pointer-events-none'
      }`}
    >
      {isFilled && (
        <div className="w-full max-w-4xl flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 text-[10px] tracking-widest text-slate-400 uppercase font-semibold select-none">
          <span>Sponsored</span>
          <span>Partner Notice</span>
        </div>
      )}
      <div className="w-full max-w-4xl flex justify-center">
        <ins
          key={location.pathname}
          ref={slotRef}
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

export { EditorialHighlightSlot as AdUnit };
export default EditorialHighlightSlot;
