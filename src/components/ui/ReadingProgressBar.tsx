import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Determines whether the current route is a long-form article, case study,
 * service/solution description, or policy document that benefits from a
 * scroll-based reading progress indicator.
 */
export function isLongFormContentRoute(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // Exclude interactive forms, auth views, and portal workspaces
  if (
    normalized === '/internships/apply' ||
    normalized === '/contact' ||
    normalized === '/enquiry' ||
    normalized.startsWith('/login') ||
    normalized.startsWith('/register') ||
    normalized.startsWith('/setup') ||
    normalized.startsWith('/forgot-password') ||
    normalized.startsWith('/unauthorized') ||
    normalized.startsWith('/admin') ||
    normalized.startsWith('/dashboard')
  ) {
    return false;
  }

  return (
    normalized === '/services' ||
    normalized.startsWith('/services/') ||
    normalized.startsWith('/solutions/') ||
    normalized === '/projects' ||
    normalized.startsWith('/projects/') ||
    normalized === '/about' ||
    normalized === '/internships' ||
    normalized === '/careers' ||
    normalized === '/career' ||
    normalized === '/editorial-policy' ||
    normalized === '/privacy' ||
    normalized === '/terms'
  );
}

/**
 * Returns a human-readable context label for the current long-form page type.
 */
function getReadingContextLabel(pathname: string): string {
  const normalized = pathname.toLowerCase();
  if (normalized.startsWith('/projects/')) return 'Case Study';
  if (normalized === '/projects') return 'Portfolio';
  if (normalized.startsWith('/services') || normalized.startsWith('/solutions')) {
    return 'Service Guide';
  }
  if (normalized === '/editorial-policy' || normalized === '/privacy' || normalized === '/terms') {
    return 'Policy Document';
  }
  if (normalized === '/internships') return 'Program Guide';
  if (normalized === '/careers' || normalized === '/career') return 'Careers Guide';
  return 'Article';
}

export interface ReadingProgressBarProps {
  /** Optional ref to a specific article/content container; defaults to `<main>` */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Force enable even on routes not in the default long-form list */
  forceEnable?: boolean;
  /** Optional custom label for the reading indicator */
  label?: string;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  targetRef,
  forceEnable = false,
  label,
}) => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isScrollableContent, setIsScrollableContent] = useState(false);
  const [totalReadMinutes, setTotalReadMinutes] = useState(2);
  const rafIdRef = useRef<number | null>(null);

  const isEligibleRoute = forceEnable || isLongFormContentRoute(location.pathname);
  const contextLabel = label || getReadingContextLabel(location.pathname);

  const getTargetElement = useCallback((): HTMLElement | null => {
    if (targetRef?.current) {
      return targetRef.current;
    }
    return document.querySelector('main');
  }, [targetRef]);

  const calculateReadingMetrics = useCallback(() => {
    const targetEl = getTargetElement();
    if (!targetEl) {
      setIsScrollableContent(false);
      setProgress(0);
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
    const rect = targetEl.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const elementHeight = targetEl.offsetHeight;

    // Require content to be meaningfully taller than the viewport to display reading progress
    const scrollableDistance = elementHeight - viewportHeight * 0.8;
    if (scrollableDistance < 240) {
      setIsScrollableContent(false);
      setProgress(0);
      return;
    }

    setIsScrollableContent(true);

    const scrolledPastTop = window.scrollY - elementTop;
    const rawRatio = scrolledPastTop / scrollableDistance;
    const clampedPercent = Math.min(100, Math.max(0, Math.round(rawRatio * 100)));
    setProgress(clampedPercent);
  }, [getTargetElement]);

  const estimateWordCountMinutes = useCallback(() => {
    const targetEl = getTargetElement();
    if (!targetEl) return;
    const text = targetEl.innerText || targetEl.textContent || '';
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    // Average technical reading speed ~210 words per minute
    const minutes = Math.max(1, Math.ceil(wordCount / 210));
    setTotalReadMinutes(minutes);
  }, [getTargetElement]);

  useEffect(() => {
    if (!isEligibleRoute) {
      setProgress(0);
      setIsScrollableContent(false);
      return;
    }

    const scheduleCalculation = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        calculateReadingMetrics();
      });
    };

    // Initial measurement after route DOM settles
    const initTimer = window.setTimeout(() => {
      estimateWordCountMinutes();
      calculateReadingMetrics();
    }, 80);

    window.addEventListener('scroll', scheduleCalculation, { passive: true });
    window.addEventListener('resize', scheduleCalculation, { passive: true });

    const targetEl = getTargetElement();
    let resizeObserver: ResizeObserver | null = null;
    if (targetEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        estimateWordCountMinutes();
        scheduleCalculation();
      });
      resizeObserver.observe(targetEl);
    }

    return () => {
      window.clearTimeout(initTimer);
      window.removeEventListener('scroll', scheduleCalculation);
      window.removeEventListener('resize', scheduleCalculation);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [
    isEligibleRoute,
    location.pathname,
    location.search,
    calculateReadingMetrics,
    estimateWordCountMinutes,
    getTargetElement,
  ]);

  if (!isEligibleRoute || !isScrollableContent) {
    return null;
  }

  const remainingMinutes = Math.max(
    1,
    Math.ceil(totalReadMinutes * Math.max(0, 1 - progress / 100))
  );
  const isComplete = progress >= 98;
  const showFloatingBadge = progress >= 4;

  // SVG circular ring geometry (r = 9, circumference = 2 * pi * 9 ≈ 56.55)
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Sticky Top Reading Progress Bar anchored directly beneath the Navbar */}
      <div
        role="progressbar"
        aria-label={`${contextLabel} reading progress`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="sticky top-16 z-40 w-full h-1 bg-slate-200/70 dark:bg-slate-800/70 overflow-hidden pointer-events-none"
      >
        <div
          className="h-full w-full origin-left transition-transform duration-100 ease-out"
          style={{
            transform: `scaleX(${progress / 100})`,
            background:
              'linear-gradient(90deg, var(--theme-primary, #d97706) 0%, var(--theme-accent, #f59e0b) 100%)',
          }}
        />
      </div>

      {/* Floating Reading Progress & Time-Remaining Pill (Bottom-Left) */}
      <div
        className={cn(
          'fixed bottom-5 left-5 z-40 transition-all duration-300',
          showFloatingBadge
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        )}
      >
        <button
          type="button"
          onClick={handleScrollToTop}
          title="Back to top of page"
          aria-label={`${contextLabel} reading progress ${progress}%. Click to scroll to top.`}
          className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 shadow-lg hover:border-amber-500 dark:hover:border-amber-400 transition-all cursor-pointer"
        >
          {/* Circular Progress Ring or Complete Checkmark */}
          <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
            {isComplete ? (
              <CheckCircle2
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                style={{ color: 'var(--theme-primary, #d97706)' }}
              />
            ) : (
              <>
                <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    fill="none"
                    stroke="var(--theme-primary, #d97706)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-150 ease-out"
                  />
                </svg>
                <BookOpen
                  className="w-2.5 h-2.5 absolute text-slate-500 dark:text-slate-400 group-hover:hidden"
                  aria-hidden="true"
                />
                <ArrowUp
                  className="w-3 h-3 absolute hidden group-hover:block"
                  style={{ color: 'var(--theme-primary, #d97706)' }}
                  aria-hidden="true"
                />
              </>
            )}
          </div>

          {/* Reading Percentage & Time Left Readout */}
          <div className="flex items-center gap-2 text-xs leading-none">
            <span className="font-bold tabular-nums text-slate-900 dark:text-white">
              {isComplete ? 'Read complete' : `${progress}% read`}
            </span>
            <span
              className="hidden sm:inline-block text-slate-300 dark:text-slate-700"
              aria-hidden="true"
            >
              ·
            </span>
            <span className="hidden sm:inline-block font-medium text-slate-500 dark:text-slate-400">
              {isComplete ? 'Back to top' : `${remainingMinutes} min left`}
            </span>
          </div>
        </button>
      </div>
    </>
  );
};

export default ReadingProgressBar;
