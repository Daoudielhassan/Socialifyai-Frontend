interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  category: string;
  timestamp: string;
  snippet?: string;
  hasAttachments?: boolean;
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: {
      data?: string;
      size: number;
    };
  };
  internalDate: string;
}

interface GmailResponse {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

interface AnalyticsData {
  totalEmails: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  categoryBreakdown: Record<string, number>;
  confidenceStats: {
    averageConfidence: number;
    highConfidenceCount: number;
  };
  timeStats: {
    dailyCount: Array<{ date: string; count: number }>;
    weeklyTrends: Array<{ week: string; count: number }>;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  getAuthToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // OAuth2 Authentication
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  async refreshToken(): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Dashboard & Analytics
  async getDashboardData(): Promise<ApiResponse<any>> {
    return this.request<any>('/dashboard');
  }

  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    return this.request<AnalyticsData>('/analytics');
  }

  // Gmail Integration
  async connectGmail(): Promise<ApiResponse<{ authUrl: string }>> {
    return this.request<{ authUrl: string }>('/gmail/connect', {
      method: 'POST',
    });
  }

  async getGmailMessages(pageToken?: string): Promise<ApiResponse<GmailResponse>> {
    const params = new URLSearchParams();
    if (pageToken) params.append('pageToken', pageToken);
    
    return this.request<GmailResponse>(`/gmail/messages?${params.toString()}`);
  }

  async getGmailMessage(messageId: string): Promise<ApiResponse<GmailMessage>> {
    return this.request<GmailMessage>(`/gmail/messages/${messageId}`);
  }

  async analyzeGmailMessage(messageId: string): Promise<ApiResponse<{
    priority: 'high' | 'medium' | 'low';
    confidence: number;
    category: string;
    summary: string;
  }>> {
    return this.request(`/gmail/messages/${messageId}/analyze`, {
      method: 'POST',
    });
  }

  // Email Management
  async getEmails(page = 1, limit = 20): Promise<ApiResponse<{
    emails: EmailMessage[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return this.request(`/emails?page=${page}&limit=${limit}`);
  }

  async getEmailById(id: string): Promise<ApiResponse<EmailMessage>> {
    return this.request<EmailMessage>(`/emails/${id}`);
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/emails/${id}/read`, {
      method: 'PATCH',
    });
  }

  async updatePriority(id: string, priority: 'high' | 'medium' | 'low'): Promise<ApiResponse<void>> {
    return this.request<void>(`/emails/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
  }

  // Settings
  async updateSettings(settings: Record<string, any>): Promise<ApiResponse<void>> {
    return this.request<void>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getSettings(): Promise<ApiResponse<Record<string, any>>> {
    return this.request<Record<string, any>>('/settings');
  }

  // OAuth2 specific methods
  async handleOAuthCallback(code: string, state: string): Promise<any> {
    return this.request('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  async getUserProfile(): Promise<User> {
    const response = await this.getProfile();
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to get user profile');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Server logout failed:', error);
    }
  }

  clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_email');
    sessionStorage.removeItem('user_name');
  }

  // Additional methods used by DataContext
  async getProcessedMessages(params: any): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/messages/processed?${queryParams}`);
  }

  async fetchGmailMessages(options: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams(options);
    return this.request(`/gmail/messages?${params}`);
  }

  async fetchMessages(source: string): Promise<ApiResponse<any>> {
    return this.request(`/messages/${source}`);
  }

  async submitPredictionFeedback(messageId: string, correctedPriority: string, feedbackScore: number, correctedContext: string): Promise<ApiResponse<any>> {
    return this.request(`/messages/${messageId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ 
        correctedPriority, 
        feedbackScore, 
        correctedContext 
      }),
    });
  }

  async predictMessagePriority(messageData: any, options: any): Promise<ApiResponse<any>> {
    return this.request('/ai/predict-priority', {
      method: 'POST',
      body: JSON.stringify({ message: messageData, options }),
    });
  }

  async getUserAnalytics(userId: number, options: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams(options);
    return this.request(`/analytics/user/${userId}?${params}`);
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request('/dashboard/stats');
  }

  // Additional methods used by GmailTest
  debugAuthState(): any {
    const token = this.getAuthToken();
    let isExpired = false;
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        isExpired = payload.exp && payload.exp < now;
      } catch (error) {
        console.error('Error parsing token:', error);
        isExpired = true;
      }
    }
    
    return {
      hasToken: !!token,
      isExpired,
      tokenSource: localStorage.getItem('access_token') ? 'localStorage' : 'sessionStorage'
    };
  }

  async getGmailStatus(): Promise<ApiResponse<any>> {
    return this.request('/gmail/status');
  }

  async initGoogleAuth(userId: string): Promise<ApiResponse<any>> {
    return this.request('/auth/google/init', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getGmailMessagesLive(limit: number): Promise<ApiResponse<any>> {
    return this.request(`/gmail/messages/live?limit=${limit}`);
  }
}

export default new ApiService();
export type {
  ApiResponse,
  User,
  EmailMessage,
  GmailMessage,
  GmailResponse,
  AnalyticsData,
  LoginRequest,
  RegisterRequest,
};
