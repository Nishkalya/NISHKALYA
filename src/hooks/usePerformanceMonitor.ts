import { useEffect, useRef } from 'react';
import { performanceService } from '../services/performanceService';

export function usePerformanceMonitor(currentView: 'home' | 'projects' | 'admin') {
  const isFirstLoad = useRef(true);
  const transitionStart = useRef(performance.now());

  // 1. Monitor Initial Page Load Time
  useEffect(() => {
    const getInitialLoadTime = (): number | null => {
      if (typeof window === 'undefined' || !window.performance) return null;

      // Check modern PerformanceNavigationTiming API
      const navEntries = window.performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const entry = navEntries[0] as PerformanceNavigationTiming;
        const loadTime = entry.duration || (entry.loadEventEnd - entry.startTime);
        if (loadTime > 0) return Math.round(loadTime);
      }

      // Check legacy performance.timing API
      const timing = window.performance.timing;
      if (timing) {
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        if (loadTime > 0) return loadTime;
      }

      return null;
    };

    const logPageLoad = () => {
      // Run in a small delay to ensure load event metrics are officially locked
      setTimeout(async () => {
        let loadTime = getInitialLoadTime();
        if (!loadTime || loadTime <= 0) {
          // Accurate backup: use time elapsed since browser navigation start
          loadTime = Math.round(performance.now());
        }

        try {
          await performanceService.logPerformance({
            page: 'home',
            loadTimeMs: loadTime,
            userAgent: navigator.userAgent,
            type: 'pageload'
          });
        } catch (error) {
          console.warn('[PerformanceMonitor] Failed logging initial pageload:', error);
        }
      }, 500);
    };

    if (document.readyState === 'complete') {
      logPageLoad();
    } else {
      window.addEventListener('load', logPageLoad);
      return () => window.removeEventListener('load', logPageLoad);
    }
  }, []);

  // 2. Monitor View Transitions Rendering Times
  useEffect(() => {
    // Skip logging transition for the initial boot load as pageload handles that
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const duration = Math.round(performance.now() - transitionStart.current);

    const logTransition = async () => {
      try {
        await performanceService.logPerformance({
          page: currentView,
          loadTimeMs: Math.max(1, duration),
          userAgent: navigator.userAgent,
          type: 'transition'
        });
      } catch (error) {
        console.warn('[PerformanceMonitor] Failed logging view transition:', error);
      }
    };

    logTransition();

    return () => {
      // Record timestamp right before the view changes
      transitionStart.current = performance.now();
    };
  }, [currentView]);
}
