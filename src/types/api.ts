// Gmail API Types
export interface GmailMessage {
  id: string;
  thread_id: string;
  subject_hash?: string;
  sender_domain: string;
  received_at: string;
  predicted_priority: 'high' | 'medium' | 'low';
  prediction_confidence: number;
  labels: string[];
}

export interface GmailStats {
  total_messages: number;
  unread_messages: number;
  priority_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
  top_senders: Array<{
    domain: string;
    count: number;
    priority_avg: 'high' | 'medium' | 'low';
  }>;
  period_days: number;
}

export interface GmailConnectionStatus {
  connected: boolean;
  email?: string;
  permissions?: string[];
  connected_at?: string;
  status?: string;
}

export interface GmailFetchOptions {
  limit?: number;
  privacyMode?: boolean;
  query?: string;
  maxResults?: number;
  pageToken?: string;
}

export interface GmailFetchResponse {
  messages: GmailMessage[];
  total_processed: number;
  privacy_mode: boolean;
  next_page_token?: string;
}

// Analytics API Types
export interface MessageStats {
  total_processed: number;
  daily_average: number;
  peak_day: string;
  peak_count: number;
}

export interface PriorityDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface SourceBreakdown {
  gmail: number;
  other: number;
}

export interface Trends {
  volume_trend: 'increasing' | 'decreasing' | 'stable';
  priority_trend: 'increasing' | 'decreasing' | 'stable';
  response_time_trend: 'improving' | 'declining' | 'stable';
}

export interface Insight {
  type: string;
  message: string;
  confidence: number;
}

export interface UserAnalytics {
  user_id: number;
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  message_stats: MessageStats;
  priority_distribution: PriorityDistribution;
  source_breakdown: SourceBreakdown;
  trends: Trends;
  insights: Insight[];
}

export interface SystemMetrics {
  system_health: {
    status: string;
    uptime_seconds: number;
    version: string;
  };
  performance: {
    avg_response_time_ms: number;
    cache_hit_rate: number;
    db_connection_pool: {
      active: number;
      idle: number;
      total: number;
    };
  };
  usage_stats: {
    total_users: number;
    active_users_24h: number;
    api_requests_24h: number;
    messages_processed_24h: number;
  };
}

export interface AnalyticsOptions {
  days?: number;
  includeTrends?: boolean;
}
