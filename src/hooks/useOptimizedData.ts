import { useState, useEffect, useMemo } from 'react';
import { useOAuth2Auth } from '../context/OAuth2AuthContext';
import { useData } from '../context/DataContext';

// Optimized hook to prevent unnecessary re-renders
export const useOptimizedAuthData = () => {
  const AuthContext = useOAuth2Auth();
  const dataContext = useData();

  // Memoize stable values to prevent re-renders
  const memoizedAuth = useMemo(() => ({
    user: AuthContext.user,
    isAuthenticated: AuthContext.isAuthenticated,
    isLoading: AuthContext.isLoading,
    logout: AuthContext.logout,
  }), [
    AuthContext.user,
    AuthContext.isAuthenticated,
    AuthContext.isLoading,
    AuthContext.logout,
  ]);

  const memoizedData = useMemo(() => ({
    messages: dataContext.messages,
    analytics: dataContext.analytics,
    isLoadingMessages: dataContext.isLoadingMessages,
    isLoadingAnalytics: dataContext.isLoadingAnalytics,
    error: dataContext.error,
    fetchMessages: dataContext.fetchMessages,
    fetchAnalytics: dataContext.fetchAnalytics,
    predictMessage: dataContext.predictMessage,
    submitFeedback: dataContext.submitFeedback,
    triggerMessageFetch: dataContext.triggerMessageFetch,
    refreshData: dataContext.refreshData,
  }), [
    dataContext.messages,
    dataContext.analytics,
    dataContext.isLoadingMessages,
    dataContext.isLoadingAnalytics,
    dataContext.error,
    dataContext.fetchMessages,
    dataContext.fetchAnalytics,
    dataContext.predictMessage,
    dataContext.submitFeedback,
    dataContext.triggerMessageFetch,
    dataContext.refreshData,
  ]);

  return {
    auth: memoizedAuth,
    data: memoizedData,
  };
};

// Hook to debounce search input
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
