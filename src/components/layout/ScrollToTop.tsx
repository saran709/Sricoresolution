import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that on every navigation and redirection,
 * the viewport and any inner scroll containers immediately reset to the top (0, 0).
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Disable automatic browser scroll restoration that might retain previous scroll positions
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => {
      const scrollableElements = document.querySelectorAll(
        'main, [data-scroll-container], .overflow-y-auto, .overflow-auto'
      );

      // If there's a specific hash anchor (e.g. #faq), try to scroll to it
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      // 1. Scroll window and document
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 2. Reset any nested scroll containers (e.g. Admin layout main, modal scroll areas)
      scrollableElements.forEach((el) => {
        el.scrollTop = 0;
      });
    };

    // Batch all scroll writes after the route's DOM update has committed.
    const rafId = requestAnimationFrame(scrollToTop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [pathname, search, hash]);

  return null;
}
