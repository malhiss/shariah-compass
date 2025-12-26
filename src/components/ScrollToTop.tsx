import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip on first mount to avoid scroll on initial page load
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Find the main scrollable container
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'instant' });
    }
    // Also scroll window in case layout changes
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
