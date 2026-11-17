import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { startProgress, doneProgress } from '../../lib/topProgressBar';

const FETCH_TOKEN = 'react_query_fetching';
const MUTATION_TOKEN = 'react_query_mutating';
const ROUTE_TOKEN = 'route_navigation';
const LINK_PRE_NAVIGATION_TOKEN = 'link_click_navigation';

/**
 * Component that mounts inside Suspense fallbacks (e.g. PageLoader, DashboardModuleSkeleton)
 * so lazy-loaded route/module chunk downloads keep the top progress bar active.
 */
export function SuspenseProgressIndicator() {
  useEffect(() => {
    const stop = startProgress();
    return () => {
      stop();
    };
  }, []);

  return null;
}

/**
 * Global TopProgressBar orchestrator that synchronizes:
 * 1. Immediate feedback on internal link clicks before lazy route chunks resolve
 * 2. Route transitions (pathname, search, hash changes)
 * 3. TanStack React Query active queries & mutations
 * 4. Same-origin API fetch requests (/api/*)
 */
export function TopProgressBar() {
  const location = useLocation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isInitialMount = useRef(true);

  // 1. Track route location transitions
  useEffect(() => {
    // Release any pre-navigation link click token now that location has updated
    doneProgress(LINK_PRE_NAVIGATION_TOKEN);

    if (isInitialMount.current) {
      isInitialMount.current = false;
      const stopInitial = startProgress(ROUTE_TOKEN);
      const timer = setTimeout(() => {
        stopInitial();
      }, 220);
      return () => {
        clearTimeout(timer);
        stopInitial();
      };
    }

    const stopRoute = startProgress(ROUTE_TOKEN);
    const timer = setTimeout(() => {
      stopRoute();
    }, 240);

    return () => {
      clearTimeout(timer);
      stopRoute();
    };
  }, [location.pathname, location.search, location.hash]);

  // 2. Track active TanStack React Query data fetching
  useEffect(() => {
    if (isFetching > 0) {
      startProgress(FETCH_TOKEN);
    } else {
      doneProgress(FETCH_TOKEN);
    }
    return () => {
      doneProgress(FETCH_TOKEN);
    };
  }, [isFetching]);

  // 3. Track active TanStack React Query mutations
  useEffect(() => {
    if (isMutating > 0) {
      startProgress(MUTATION_TOKEN);
    } else {
      doneProgress(MUTATION_TOKEN);
    }
    return () => {
      doneProgress(MUTATION_TOKEN);
    };
  }, [isMutating]);

  // 4. Immediate feedback on internal link clicks + same-origin /api/* fetch calls
  useEffect(() => {
    let linkReleaseTimer: ReturnType<typeof setTimeout> | null = null;

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('rel')?.includes('external')
      ) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        const currentPathWithSearch = window.location.pathname + window.location.search;
        const targetPathWithSearch = url.pathname + url.search;

        if (targetPathWithSearch !== currentPathWithSearch) {
          startProgress(LINK_PRE_NAVIGATION_TOKEN);
          if (linkReleaseTimer) clearTimeout(linkReleaseTimer);
          // Fallback release if navigation is blocked by a route guard or same-route transition
          linkReleaseTimer = setTimeout(() => {
            doneProgress(LINK_PRE_NAVIGATION_TOKEN);
          }, 1500);
        }
      } catch {
        // Ignore malformed hrefs
      }
    };

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      if (linkReleaseTimer) clearTimeout(linkReleaseTimer);
      doneProgress(LINK_PRE_NAVIGATION_TOKEN);
    };
  }, []);

  return null;
}
