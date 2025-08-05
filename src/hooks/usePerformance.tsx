import React, { useEffect } from 'react';

// Preload critical resources for faster page loads
export const usePreloadCriticalResources = () => {
  useEffect(() => {
    // Preload Google OAuth script when user is likely to need it
    const preloadGoogleOAuth = () => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = 'https://accounts.google.com/gsi/client';
      document.head.appendChild(link);
    };

    // Preload after a short delay to not block initial render
    const timer = setTimeout(preloadGoogleOAuth, 500);

    return () => clearTimeout(timer);
  }, []);
};

// Hook to improve perceived performance with skeleton loading
export const usePageLoadingState = () => {
  const LoadingSkeleton = () => (
    <div className="flex items-center justify-center w-full bg-gray-100 rounded-md h-11 animate-pulse">
      <div className="w-6 h-6 mr-2 bg-gray-300 rounded-full animate-pulse"></div>
      <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
    </div>
  );

  return {
    LoadingSkeleton
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with web-vitals library if installed
      console.log('Performance monitoring active');
    }

    // Monitor memory usage if available
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      console.log('Memory usage:', {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + ' MB'
      });
    }
  }, []);
};
