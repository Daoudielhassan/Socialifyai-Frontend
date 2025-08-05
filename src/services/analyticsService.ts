import ApiService from './api';
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

export class AnalyticsService {
  // Get user analytics with various options
  static async getUserAnalytics(userId: string, options: UserAnalyticsOptions = {}): Promise<UserAnalytics> {
    const { days = 30, includeTrends = true } = options;
    
    try {
      const params = new URLSearchParams({
        days: days.toString(),
        include_trends: includeTrends.toString()
      });

      const response = await ApiService.request<UserAnalytics>(`/api/v1/analytics/user/${userId}?${params}`);
      return response.data || response as unknown as UserAnalytics;
    } catch (error) {
      throw new Error(`Failed to fetch user analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get system metrics
  static async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const response = await ApiService.request<SystemMetrics>('/api/v1/analytics/system');
      return response.data || response as unknown as SystemMetrics;
    } catch (error) {
      throw new Error(`Failed to fetch system metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get specific analytics data
  static async getMessageTrends(userId: string, days = 30): Promise<Trends> {
    try {
      const params = new URLSearchParams({
        days: days.toString()
      });

      const response = await ApiService.request<Trends>(`/api/v1/analytics/user/${userId}/trends?${params}`);
      return response.data || response as unknown as Trends;
    } catch (error) {
      throw new Error(`Failed to fetch message trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get priority insights
  static async getPriorityInsights(userId: string, days = 30): Promise<Insight> {
    try {
      const params = new URLSearchParams({
        days: days.toString()
      });

      const response = await ApiService.request<Insight>(`/api/v1/analytics/user/${userId}/priority-insights?${params}`);
      return response.data || response as unknown as Insight;
    } catch (error) {
      throw new Error(`Failed to fetch priority insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
