import { useState, useEffect } from 'react';
import { AnalyticsService } from '../services/analyticsService';
import type { 
  UserAnalytics, 
  SystemMetrics, 
  Trends, 
  Insight 
} from '../types/api';

interface UserAnalyticsOptions {
  days?: number;
  includeTrends?: boolean;
}

interface UseAnalyticsReturn {
  // State
  analytics: UserAnalytics | null;
  systemMetrics: SystemMetrics | null;
  trends: Trends | null;
  insights: Insight | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchUserAnalytics: (options?: UserAnalyticsOptions) => Promise<UserAnalytics | undefined>;
  fetchSystemMetrics: () => Promise<SystemMetrics>;
  fetchMessageTrends: (days?: number) => Promise<Trends | undefined>;
  fetchPriorityInsights: (days?: number) => Promise<Insight | undefined>;
  refreshAnalytics: (options?: UserAnalyticsOptions) => Promise<UserAnalytics | undefined>;
  clearError: () => void;
}

export const useAnalytics = (userId: string | null): UseAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [insights, setInsights] = useState<Insight | null>(null);

  // Fetch analytics on userId change
  useEffect(() => {
    if (userId) {
      fetchUserAnalytics();
    }
  }, [userId]);

  const fetchUserAnalytics = async (options: UserAnalyticsOptions = {}): Promise<UserAnalytics | undefined> => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getUserAnalytics(userId, options);
      setAnalytics(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemMetrics = async (): Promise<SystemMetrics> => {
    try {
      setError(null);
      const data = await AnalyticsService.getSystemMetrics();
      setSystemMetrics(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    }
  };

  const fetchMessageTrends = async (days = 30): Promise<Trends | undefined> => {
    if (!userId) return;

    try {
      setError(null);
      const data = await AnalyticsService.getMessageTrends(userId, days);
      setTrends(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    }
  };

  const fetchPriorityInsights = async (days = 30): Promise<Insight | undefined> => {
    if (!userId) return;

    try {
      setError(null);
      const data = await AnalyticsService.getPriorityInsights(userId, days);
      setInsights(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    }
  };

  const refreshAnalytics = (options: UserAnalyticsOptions = {}): Promise<UserAnalytics | undefined> => {
    return fetchUserAnalytics(options);
  };

  const clearError = (): void => setError(null);

  return {
    // State
    analytics,
    systemMetrics,
    trends,
    insights,
    loading,
    error,
    
    // Actions
    fetchUserAnalytics,
    fetchSystemMetrics,
    fetchMessageTrends,
    fetchPriorityInsights,
    refreshAnalytics,
    clearError
  };
};
