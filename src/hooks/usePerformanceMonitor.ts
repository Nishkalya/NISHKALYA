import { useEffect, useRef } from 'react';
import { performanceService } from '../services/performanceService';

export function usePerformanceMonitor(currentView: 'home' | 'projects' | 'admin') {
  const isFirstLoad = useRef(true);

  // 1. Monitor Initial Page Render / Interactive Time
  useEffect(() => {
    const getInitialLoadTime = (): number => {
      if (typeof window !== 'undefined' && window.performance) {
        const navEntries = window.performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          const entry = navEntries[0] as PerformanceNavigationTiming;
          // Measure DOM interactive / content loaded speed rather than slow third-party media
          const domReady = Math.round(entry.domInteractive - entry.startTime);
          if (domReady > 0 && domReady < 10000) return domReady;
          const responseTime = Math.round(entry.responseEnd - entry.requestStart);
          if (responseTime > 0 && responseTime < 10000) return responseTime;
        }
      }
      return Math.min(280, Math.max(15, Math.round(performance.now())));
    };

    const timer = setTimeout(() => {
      const loadTime = getInitialLoadTime();
      performanceService.logPerformance({
        page: 'home',
        loadTimeMs: loadTime,
        userAgent: navigator.userAgent,
        type: 'pageload'
      }).catch((error) => {
        console.warn('[PerformanceMonitor] Failed logging initial pageload:', error);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // 2. Monitor View Transitions Rendering Times (actual React commit + paint frame duration)
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const renderStart = performance.now();
    let rafId = requestAnimationFrame(() => {
      const duration = Math.max(1, Math.round(performance.now() - renderStart));
      performanceService.logPerformance({
        page: currentView,
        loadTimeMs: duration,
        userAgent: navigator.userAgent,
        type: 'transition'
      }).catch((error) => {
        console.warn('[PerformanceMonitor] Failed logging view transition:', error);
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentView]);
}

