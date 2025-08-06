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

interface ProfileUser {
  id: number;
  email: string;
  full_name: string;
  auth_method: string;
  created_at: string;
  last_login: string;
  is_active: boolean;
  gmail_connected: boolean;
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

interface ProcessedMessagesResponse {
  messages: EmailMessage[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_next: boolean;
  };
  api_version: string;
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

class TokenManager {
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  constructor(private apiService: ApiService) {}

  async checkTokenExpiry(): Promise<boolean> {
    try {
      const token = this.apiService.getAuthToken();
      if (!token) return false;

      const response = await this.apiService.getTokenInfo();
      return response.success !== false;
    } catch (error) {
      console.error('Token check failed:', error);
      return false;
    }
  }

  async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) return null;

    try {
      this.isRefreshing = true;
      console.log('🔄 Refreshing token...');
      
      const response = await this.apiService.refreshCurrentToken();
      
      if (response.data?.access_token) {
        const newToken = response.data.access_token;
        localStorage.setItem('access_token', newToken);
        console.log('✅ Token refreshed successfully');
        return newToken;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Clear invalid tokens
      this.apiService.clearAuthData();
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/oauth2-login';
      }
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  startAutoRefresh(): void {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Check and refresh token every 6 days (6 days * 24 hours * 60 minutes * 60 seconds * 1000 ms)
    const sixDaysInMs = 6 * 24 * 60 * 60 * 1000;
    
    this.refreshInterval = setInterval(async () => {
      const isValid = await this.checkTokenExpiry();
      if (isValid) {
        await this.refreshToken();
      }
    }, sixDaysInMs);

    console.log('🔄 Auto-refresh started: token will be refreshed every 6 days');
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('🛑 Auto-refresh stopped');
    }
  }

  async validateAndRefreshIfNeeded(): Promise<boolean> {
    const isValid = await this.checkTokenExpiry();
    if (!isValid) {
      const newToken = await this.refreshToken();
      return !!newToken;
    }
    return true;
  }
}

class ApiService {
  private tokenManager: TokenManager;

  constructor() {
    this.tokenManager = new TokenManager(this);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  // Initialize token management (call this after successful login)
  initializeTokenManagement(): void {
    this.tokenManager.startAutoRefresh();
  }

  // Stop token management (call this on logout)
  stopTokenManagement(): void {
    this.tokenManager.stopAutoRefresh();
  }

  // Validate token and refresh if needed before making requests
  async ensureValidToken(): Promise<boolean> {
    return await this.tokenManager.validateAndRefreshIfNeeded();
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Ensure token is valid before making the request
    if (this.getAuthToken()) {
      const isValid = await this.ensureValidToken();
      if (!isValid) {
        throw new Error('Authentication failed - please login again');
      }
    }

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
        // If we get a 401, try to refresh the token once
        if (response.status === 401 && token) {
          console.log('🔄 Got 401, attempting token refresh...');
          const newToken = await this.tokenManager.refreshToken();
          if (newToken) {
            // Retry the request with the new token
            const retryConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, retryConfig);
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              throw new Error(retryData.message || retryData.error || `HTTP ${retryResponse.status}`);
            }
            
            return retryData;
          }
        }
        
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // OAuth2 Authentication
  async getProfile(): Promise<ApiResponse<ProfileUser>> {
    return this.request<ProfileUser>('/auth/profile');
  }

  async refreshToken(): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // New token refresh endpoint
  async refreshCurrentToken(): Promise<ApiResponse<{ access_token: string }>> {
    return this.request<{ access_token: string }>('/auth/refresh-token', {
      method: 'POST',
    });
  }

  // Get token information
  async getTokenInfo(): Promise<ApiResponse<any>> {
    return this.request('/auth/token-info', {
      method: 'GET',
    });
  }

  // Dashboard & Analytics
  async getDashboardData(): Promise<ApiResponse<any>> {
    return this.request<any>('/dashboard');
  }

  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    return this.request<AnalyticsData>('/analytics');
  }

  // New Processed Messages endpoint
  async getProcessedMessages(limit = 20, offset = 0): Promise<ApiResponse<ProcessedMessagesResponse>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    return this.request<ProcessedMessagesResponse>(`/api/v1/messages/processed?${params.toString()}`);
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
    this.initializeTokenManagement();
  }

  async getUserProfile(): Promise<ProfileUser> {
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
    } finally {
      this.stopTokenManagement();
    }
  }

  clearAuthData(): void {
    this.stopTokenManagement();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_email');
    sessionStorage.removeItem('user_name');
  }

  // Additional methods used by DataContext
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
  ProfileUser,
  EmailMessage,
  GmailMessage,
  GmailResponse,
  ProcessedMessagesResponse,
  AnalyticsData,
  LoginRequest,
  RegisterRequest,
};
