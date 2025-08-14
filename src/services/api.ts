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
  priority: BackendPriority; // Backend format: 'high' | 'medium' | 'low'
  displayPriority?: FrontendPriority; // Frontend format: 'urgent' | 'important' | 'not important'
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

interface V1MessageResponse {
  messages: Array<{
    id: number;
    source: string;
    sender_domain: string;
    subject_preview: string;
    received_at: string;
    predicted_priority: string;
    predicted_context: string;
    prediction_confidence: number;
    processed_at: string | null;
    privacy_protected: boolean;
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
  filters: {
    source: string | null;
    priority: string | null;
    context: string | null;
    search: string | null;
    days: number | null;
  };
  privacy_protected: boolean;
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

// Priority mapping types
export type BackendPriority = 'high' | 'medium' | 'low';
export type FrontendPriority = 'urgent' | 'important' | 'not important';

// Priority mapping utilities
export const priorityMapping = {
  // Backend to Frontend mapping
  toFrontend: (backendPriority: BackendPriority): FrontendPriority => {
    const mapping: Record<BackendPriority, FrontendPriority> = {
      'high': 'urgent',
      'medium': 'important', 
      'low': 'not important'
    };
    return mapping[backendPriority];
  },
  
  // Frontend to Backend mapping
  toBackend: (frontendPriority: FrontendPriority): BackendPriority => {
    const mapping: Record<FrontendPriority, BackendPriority> = {
      'urgent': 'high',
      'important': 'medium',
      'not important': 'low'
    };
    return mapping[frontendPriority];
  }
};

// Feedback API Types
export interface FeedbackRequest {
  message_id: number;
  feedback_priority?: BackendPriority;
  feedback_context?: 'work' | 'personal' | 'general';
}

export interface FeedbackResponse {
  operation: string;
  message_id: number;
  feedback: {
    priority?: string;
    context?: string;
  };
  result: {
    status: string;
    message: string;
    feedback_type: string;
    updates_applied: number;
  };
  api_version: string;
}

export interface FeedbackSummary {
  operation: string;
  user_id: number;
  period_days: number;
  summary: {
    total_feedback: number;
    feedback_breakdown: {
      priority_corrections: number;
      context_corrections: number;
      both_corrections: number;
    };
    feedback_quality: 'excellent' | 'good' | 'poor';
    model_improvement: {
      samples_available: number;
      samples_used: number;
      next_training_eligible: boolean;
    };
    summary_generated: string;
  };
  api_version: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// NOTE: TokenManager removed - using cookie-based authentication

class ApiService {
  // TokenManager disabled for cookie-based authentication
  // private tokenManager: TokenManager;

  constructor() {
    // TokenManager disabled for cookie-based authentication
    // this.tokenManager = new TokenManager(this);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  // Initialize token management (disabled for cookie-based auth)
  initializeTokenManagement(): void {
    // Disabled for cookie-based authentication
    // this.tokenManager.startAutoRefresh();
    console.log('🍪 Cookie-based authentication - token management disabled');
  }

  // Stop token management (disabled for cookie-based auth)
  stopTokenManagement(): void {
    // Disabled for cookie-based authentication  
    // this.tokenManager.stopAutoRefresh();
    console.log('🍪 Cookie-based authentication - token management disabled');
  }

  // Validate token and refresh if needed (disabled for cookie-based auth)
  async ensureValidToken(): Promise<boolean> {
    // Disabled for cookie-based authentication
    // return await this.tokenManager.validateAndRefreshIfNeeded();
    console.log('🍪 Cookie-based authentication - token validation disabled');
    return true; // Always return true for cookie-based auth
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Skip token validation for cookie-based authentication
    // The backend will handle authentication via cookies
    
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Always include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        // Keep token support for backward compatibility, but cookies take precedence
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // For cookie-based authentication, don't try to refresh tokens
        // If we get a 401, it means the user needs to re-authenticate
        if (response.status === 401) {
          console.log('❌ Authentication failed - redirecting to login');
          this.clearAuthData();
          if (typeof window !== 'undefined') {
            window.location.href = '/oauth2-login';
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

  // OAuth2 Authentication - NEW COOKIE-BASED METHODS
  async getMe(): Promise<ApiResponse<ProfileUser>> {
    return this.request<ProfileUser>('/auth/me', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
  }

  // V1 API: User Profile Management
  async getUserProfile(): Promise<ProfileUser> {
    const response = await this.request<ProfileUser>('/api/v1/user/profile');
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to get user profile');
  }

  // LEGACY - Keep for backward compatibility but redirect to new V1 endpoint
  async getProfile(): Promise<ApiResponse<ProfileUser>> {
    return this.request<ProfileUser>('/api/v1/user/profile');
  }

  // DEPRECATED - Token-based methods (kept for backward compatibility)
  // These are no longer used with cookie-based authentication
  async refreshToken(): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> {
    console.warn('⚠️ refreshToken is deprecated - using cookie-based authentication');
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async refreshCurrentToken(): Promise<ApiResponse<{ access_token: string }>> {
    console.warn('⚠️ refreshCurrentToken is deprecated - using cookie-based authentication');
    return this.request<{ access_token: string }>('/auth/refresh-token', {
      method: 'POST',
    });
  }

  async getTokenInfo(): Promise<ApiResponse<any>> {
    console.warn('⚠️ getTokenInfo is deprecated - using cookie-based authentication');
    return this.request('/auth/token-info', {
      method: 'GET',
    });
  }

  // V1 API: Analytics & Dashboard
  async getDashboardData(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/analytics/dashboard');
  }

  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    return this.request<AnalyticsData>('/api/v1/analytics/overview');
  }

  // V1 API: Messages Management  
  async getProcessedMessages(limit = 20, offset = 0): Promise<ApiResponse<ProcessedMessagesResponse>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    return this.request<ProcessedMessagesResponse>(`/api/v1/messages/processed?${params.toString()}`);
  }

  async getMessages(limit = 20, offset = 0, source?: string, priority?: string, context?: string, search?: string, days?: number): Promise<ApiResponse<V1MessageResponse>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (source) params.append('source', source);
    if (priority) params.append('priority', priority);
    if (context) params.append('context', context);
    if (search) params.append('search', search);
    if (days) params.append('days', days.toString());
    
    return this.request<V1MessageResponse>(`/api/v1/messages/?${params.toString()}`);
  }

  async getMessageById(messageId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/messages/${messageId}`);
  }

  async deleteMessage(messageId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async fetchMessages(source: string = 'all', max_messages: number = 50, force_sync: boolean = false): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/messages/fetch', {
      method: 'POST',
      body: JSON.stringify({ source, max_messages, force_sync }),
    });
  }

  async getMessagesAnalytics(days: number = 30, source?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ days: days.toString() });
    if (source) params.append('source', source);
    return this.request<any>(`/api/v1/messages/analytics/summary?${params.toString()}`);
  }

  // V1 API: Gmail Integration
  async getGmailStatus(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/gmail/status');
  }

  async connectGmail(): Promise<ApiResponse<{ authUrl: string }>> {
    return this.request<{ authUrl: string }>('/auth/google/init', {
      method: 'POST',
    });
  }

  async fetchGmailMessages(options: any = {}): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/messages/fetch', {
      method: 'POST',
      body: JSON.stringify({
        source: options.source || 'gmail',
        max_messages: options.max_messages || 50,
        force_sync: options.force_sync || false
      }),
    });
  }

  async getGmailAnalytics(days: number = 30): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ days: days.toString() });
    return this.request<any>(`/api/v1/gmail/analytics?${params.toString()}`);
  }

  // Legacy Gmail methods (kept for backward compatibility)
  async getGmailMessages(pageToken?: string): Promise<ApiResponse<GmailResponse>> {
    const params = new URLSearchParams();
    if (pageToken) params.append('pageToken', pageToken);
    
    return this.request<GmailResponse>(`/gmail/messages?${params.toString()}`);
  }

  async getGmailMessage(messageId: string): Promise<ApiResponse<GmailMessage>> {
    return this.request<GmailMessage>(`/gmail/messages/${messageId}`);
  }

  async analyzeGmailMessage(messageId: string): Promise<ApiResponse<{
    priority: BackendPriority;
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

  async updatePriority(id: string, priority: BackendPriority): Promise<ApiResponse<void>> {
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

  // V1 API: Feedback for message prediction improvement
  async submitPredictionFeedback(messageId: string, correctedPriority?: BackendPriority, correctedContext?: 'work' | 'personal' | 'general'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (correctedPriority) params.append('feedback_priority', correctedPriority);
    if (correctedContext) params.append('feedback_context', correctedContext);
    const url = `/api/v1/messages/${messageId}/feedback${params.toString() ? '?' + params.toString() : ''}`;
    return this.request(url, { method: 'POST' });
  }

  async predictMessagePriority(messageData: any, options: any = {}): Promise<ApiResponse<any>> {
    return this.request('/api/v1/prediction/predict', {
      method: 'POST',
      body: JSON.stringify({ 
        subject: messageData.subject,
        sender_domain: messageData.sender_domain || messageData.from,
        source: messageData.source || 'gmail',
        metadata: options 
      }),
    });
  }

  // V1 API: User Analytics
  async getUserAnalytics(userId: number, options: any = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      days: options.days?.toString() || '30',
      includeTrends: options.includeTrends?.toString() || 'true'
    });
    return this.request(`/api/v1/analytics/user/${userId}?${params.toString()}`);
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/analytics/dashboard');
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

  async initGoogleAuth(userId: string): Promise<ApiResponse<any>> {
    return this.request('/auth/google/init', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getGmailMessagesLive(limit: number): Promise<ApiResponse<any>> {
    return this.request(`/gmail/messages/live?limit=${limit}`);
  }

  // =============================================================================
  // PRIORITY MAPPING UTILITIES
  // =============================================================================

  /**
   * Convert backend priority to frontend display priority
   * @param backendPriority - Backend priority ('high' | 'medium' | 'low')
   * @returns Frontend priority ('urgent' | 'important' | 'not important')
   */
  mapPriorityToFrontend(backendPriority: BackendPriority): FrontendPriority {
    return priorityMapping.toFrontend(backendPriority);
  }

  /**
   * Convert frontend display priority to backend priority
   * @param frontendPriority - Frontend priority ('urgent' | 'important' | 'not important')
   * @returns Backend priority ('high' | 'medium' | 'low')
   */
  mapPriorityToBackend(frontendPriority: FrontendPriority): BackendPriority {
    return priorityMapping.toBackend(frontendPriority);
  }

  /**
   * Transform email message to include display priority
   * @param message - Email message from backend
   * @returns Email message with displayPriority field added
   */
  enrichMessageWithDisplayPriority(message: EmailMessage): EmailMessage & { displayPriority: FrontendPriority } {
    return {
      ...message,
      displayPriority: this.mapPriorityToFrontend(message.priority)
    };
  }

  // =============================================================================
  // FEEDBACK METHODS
  // =============================================================================

  // Submit feedback for message (v1 API - Recommended)
  async submitMessageFeedback(
    messageId: number, 
    feedbackPriority?: BackendPriority,
    feedbackContext?: 'work' | 'personal' | 'general'
  ): Promise<ApiResponse<FeedbackResponse>> {
    const params = new URLSearchParams();
    if (feedbackPriority) params.append('feedback_priority', feedbackPriority);
    if (feedbackContext) params.append('feedback_context', feedbackContext);
    
    const url = `/api/v1/messages/${messageId}/feedback${params.toString() ? '?' + params.toString() : ''}`;
    return this.request<FeedbackResponse>(url, { method: 'POST' });
  }

  // Get feedback summary (v1 API)
  async getFeedbackSummary(days = 30): Promise<ApiResponse<FeedbackSummary>> {
    return this.request<FeedbackSummary>(`/api/v1/prediction/feedback/summary?days=${days}`);
  }

  // Submit feedback (Legacy route)
  async submitFeedbackLegacy(feedbackData: FeedbackRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/feedback/', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
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
  V1MessageResponse,
  AnalyticsData,
  LoginRequest,
  RegisterRequest,
};
