# 📡 API Reference - Socialify Backend v2.1

## Base URL
```
Production: https://api.socialify.ai
Development: http://localhost:8000
```

## 🚀 Quick Start for Frontend Integration

### Environment Setup
```javascript
// .env.local (Next.js/React)
NEXT_PUBLIC_SOCIALIFY_API_URL=http://localhost:8000
SOCIALIFY_API_URL=http://localhost:8000

// For production
NEXT_PUBLIC_SOCIALIFY_API_URL=https://api.socialify.ai
SOCIALIFY_API_URL=https://api.socialify.ai
```

### Base API Client Setup
```javascript
// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_SOCIALIFY_API_URL || 'http://localhost:8000';

class SocialifyAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('socialify_token', token);
    }
  }

  getToken() {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('socialify_token');
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new APIError(error.error, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError({
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: error.message
      }, 0);
    }
  }
}

class APIError extends Error {
  constructor(errorData, status) {
    super(errorData.message);
    this.code = errorData.code;
    this.details = errorData.details;
    this.status = status;
    this.requestId = errorData.request_id;
  }
}

export const api = new SocialifyAPI();
export { APIError };
```

## Authentication

All API endpoints require JWT authentication via Google OAuth2.

### Authentication Flow

1. **Initiate OAuth Flow**
   ```http
   GET /auth/google
   ```
   
2. **Handle OAuth Callback**
   ```http
   GET /auth/google/callback?code={authorization_code}
   ```
   
3. **Use JWT Token**
   ```http
   Authorization: Bearer {jwt_token}
   ```

### 🔐 Frontend Authentication Implementation

#### React Hook for Authentication
```javascript
// hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      api.setToken(token);
      const profile = await api.request('/api/v1/user/profile');
      setUser(profile);
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const initiateGoogleAuth = async () => {
    try {
      setError(null);
      const { auth_url } = await api.request('/auth/google');
      window.location.href = auth_url;
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAuthCallback = async (code, state) => {
    try {
      setLoading(true);
      const response = await api.request(`/auth/google/callback?code=${code}&state=${state}`);
      api.setToken(response.access_token);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('socialify_token');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login: initiateGoogleAuth,
      logout,
      handleAuthCallback,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### Next.js Authentication Pages
```javascript
// pages/auth/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const { handleAuthCallback } = useAuth();
  const { code, state, error } = router.query;

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
      router.push('/login?error=' + error);
      return;
    }

    if (code && state) {
      handleAuthCallback(code, state)
        .then(() => {
          router.push('/dashboard');
        })
        .catch((error) => {
          console.error('Callback error:', error);
          router.push('/login?error=callback_failed');
        });
    }
  }, [code, state, error]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}

// pages/login.js
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, loading, error } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Socialify
          </h2>
        </div>
        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <button
            onClick={login}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## API Endpoints

### 🔑 Authentication Endpoints

#### Get Google OAuth URL
```http
GET /auth/google
```

**Response:**
```json
{
  "auth_url": "https://accounts.google.com/oauth/authorize?...",
  "state": "random_state_string"
}
```

#### OAuth Callback
```http
GET /auth/google/callback?code={code}&state={state}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

### 📬 Gmail API (`/api/v1/gmail/`)

#### Connect Gmail Account
```http
POST /api/v1/gmail/connect
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "force_reconnect": false
}
```

**Response:**
```json
{
  "status": "connected",
  "email": "user@gmail.com",
  "permissions": ["gmail.readonly"],
  "connected_at": "2025-08-05T16:30:00Z"
}
```

#### Frontend Integration - Gmail Service
```javascript
// services/gmailService.js
import { api } from '../lib/api';

export class GmailService {
  // Connect Gmail account
  static async connectGmail(forceReconnect = false) {
    try {
      const response = await api.request('/api/v1/gmail/connect', {
        method: 'POST',
        body: JSON.stringify({ force_reconnect: forceReconnect })
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to connect Gmail: ${error.message}`);
    }
  }

  // Fetch messages with pagination
  static async fetchMessages({ 
    limit = 50, 
    privacyMode = true, 
    query = '', 
    maxResults = 100,
    pageToken = null 
  } = {}) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        privacy_mode: privacyMode.toString(),
        max_results: maxResults.toString(),
        ...(query && { query }),
        ...(pageToken && { page_token: pageToken })
      });

      const response = await api.request(`/api/v1/gmail/messages?${params}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  // Get Gmail statistics
  static async getStats(days = 30) {
    try {
      const response = await api.request(`/api/v1/gmail/stats?days=${days}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get Gmail stats: ${error.message}`);
    }
  }
}

// React Hook for Gmail integration
import { useState, useEffect } from 'react';

export const useGmail = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectGmail = async (forceReconnect = false) => {
    try {
      setLoading(true);
      setError(null);
      const result = await GmailService.connectGmail(forceReconnect);
      setIsConnected(result.status === 'connected');
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await GmailService.fetchMessages(options);
      setMessages(prev => options.pageToken ? [...prev, ...result.messages] : result.messages);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (days = 30) => {
    try {
      const result = await GmailService.getStats(days);
      setStats(result);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    messages,
    stats,
    loading,
    error,
    isConnected,
    connectGmail,
    fetchMessages,
    loadStats,
    clearError: () => setError(null)
  };
};
```

#### Fetch Messages
```http
GET /api/v1/gmail/messages?limit=50&privacy_mode=true&query=is:unread
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (int): Maximum messages to fetch (default: 100, max: 500)
- `privacy_mode` (bool): Enable privacy protection (default: true)
- `query` (string): Gmail search query (optional)
- `max_results` (int): Gmail API max results (default: 100)

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_12345",
      "thread_id": "thread_67890",
      "subject_hash": "abc123...",
      "sender_domain": "example.com",
      "received_at": "2025-08-05T16:25:00Z",
      "predicted_priority": "high",
      "prediction_confidence": 0.89,
      "labels": ["INBOX", "IMPORTANT"]
    }
  ],
  "total_processed": 25,
  "privacy_mode": true,
  "next_page_token": "token_for_next_page"
}
```

#### Gmail Statistics
```http
GET /api/v1/gmail/stats?days=30
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_messages": 1250,
  "unread_messages": 45,
  "priority_breakdown": {
    "high": 125,
    "medium": 800,
    "low": 325
  },
  "top_senders": [
    {
      "domain": "work.com",
      "count": 156,
      "priority_avg": "medium"
    }
  ],
  "period_days": 30
}
```

#### 📱 React Components for Gmail Integration

```javascript
// components/GmailConnect.jsx
import { useState } from 'react';
import { useGmail } from '../hooks/useGmail';

export const GmailConnect = () => {
  const { connectGmail, loading, error, isConnected } = useGmail();
  const [forceReconnect, setForceReconnect] = useState(false);

  const handleConnect = async () => {
    try {
      await connectGmail(forceReconnect);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  if (isConnected) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Gmail account connected successfully
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Gmail</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={forceReconnect}
            onChange={(e) => setForceReconnect(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-600">Force reconnect (if already connected)</span>
        </label>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Connecting...' : 'Connect Gmail Account'}
      </button>
    </div>
  );
};

// components/MessageList.jsx
import { useEffect, useState } from 'react';
import { useGmail } from '../hooks/useGmail';

export const MessageList = () => {
  const { messages, fetchMessages, loading, error } = useGmail();
  const [filters, setFilters] = useState({
    limit: 50,
    privacyMode: true,
    query: ''
  });
  const [nextPageToken, setNextPageToken] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async (loadMore = false) => {
    try {
      const result = await fetchMessages({
        ...filters,
        pageToken: loadMore ? nextPageToken : null
      });
      setNextPageToken(result.next_page_token);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    setNextPageToken(null);
    loadMessages();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-medium mb-4">Filter Messages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Query
            </label>
            <input
              type="text"
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              placeholder="e.g., is:unread, from:example.com"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Messages ({messages.length})</h3>
        </div>
        
        {messages.length === 0 && !loading ? (
          <div className="p-6 text-center text-gray-500">
            No messages found. Try adjusting your filters.
          </div>
        ) : (
          <div className="divide-y">
            {messages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {message.sender_domain}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        message.predicted_priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : message.predicted_priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {message.predicted_priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(message.prediction_confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Subject: {message.subject_hash}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{new Date(message.received_at).toLocaleString()}</span>
                      <span>Labels: {message.labels.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {nextPageToken && (
          <div className="p-4 border-t">
            <button
              onClick={() => loadMessages(true)}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More Messages'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 📊 Analytics API (`/api/v1/analytics/`)

#### User Analytics
```http
GET /api/v1/analytics/user/{user_id}?days=30&include_trends=true
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user_id": 123,
  "period": {
    "start_date": "2025-07-06",
    "end_date": "2025-08-05",
    "days": 30
  },
  "message_stats": {
    "total_processed": 1250,
    "daily_average": 41.7,
    "peak_day": "2025-08-01",
    "peak_count": 78
  },
  "priority_distribution": {
    "high": 0.15,
    "medium": 0.65,
    "low": 0.20
  },
  "source_breakdown": {
    "gmail": 1180,
    "other": 70
  },
  "trends": {
    "volume_trend": "increasing",
    "priority_trend": "stable",
    "response_time_trend": "improving"
  },
  "insights": [
    {
      "type": "pattern",
      "message": "Peak email volume occurs on Mondays",
      "confidence": 0.92
    }
  ]
}
```

#### 📈 Frontend Analytics Integration

```javascript
// services/analyticsService.js
import { api } from '../lib/api';

export class AnalyticsService {
  static async getUserAnalytics(userId, options = {}) {
    const { days = 30, includeTrends = true } = options;
    
    try {
      const params = new URLSearchParams({
        days: days.toString(),
        include_trends: includeTrends.toString()
      });

      const response = await api.request(`/api/v1/analytics/user/${userId}?${params}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch user analytics: ${error.message}`);
    }
  }

  static async getSystemMetrics() {
    try {
      const response = await api.request('/api/v1/analytics/system');
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch system metrics: ${error.message}`);
    }
  }
}

// hooks/useAnalytics.js
import { useState, useEffect } from 'react';
import { AnalyticsService } from '../services/analyticsService';

export const useAnalytics = (userId) => {
  const [analytics, setAnalytics] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserAnalytics = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getUserAnalytics(userId, options);
      setAnalytics(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const data = await AnalyticsService.getSystemMetrics();
      setSystemMetrics(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserAnalytics();
    }
  }, [userId]);

  return {
    analytics,
    systemMetrics,
    loading,
    error,
    fetchUserAnalytics,
    fetchSystemMetrics,
    clearError: () => setError(null)
  };
};

// components/AnalyticsDashboard.jsx
import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../hooks/useAuth';

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { analytics, loading, error, fetchUserAnalytics } = useAnalytics(user?.id);
  const [timeRange, setTimeRange] = useState(30);

  const handleTimeRangeChange = async (days) => {
    setTimeRange(days);
    await fetchUserAnalytics({ days, includeTrends: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading analytics: {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-500">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {[7, 14, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => handleTimeRangeChange(days)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              timeRange === days
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {days} days
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Messages
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.message_stats.total_processed.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Daily Average
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.message_stats.daily_average.toFixed(1)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Peak Day
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.message_stats.peak_count}
                </dd>
                <dd className="text-xs text-gray-500">
                  {new Date(analytics.message_stats.peak_day).toLocaleDateString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  High Priority
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {Math.round(analytics.priority_distribution.high * 100)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution Chart */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
        <div className="space-y-3">
          {Object.entries(analytics.priority_distribution).map(([priority, percentage]) => (
            <div key={priority} className="flex items-center">
              <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                {priority}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 ml-4">
                <div
                  className={`h-2 rounded-full ${
                    priority === 'high' ? 'bg-red-500' :
                    priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage * 100}%` }}
                ></div>
              </div>
              <div className="w-12 text-sm text-gray-600 text-right ml-2">
                {Math.round(percentage * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {analytics.insights && analytics.insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Insights</h3>
          <div className="space-y-3">
            {analytics.insights.map((insight, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      {insight.message}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Confidence: {Math.round(insight.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

#### System Metrics
```http
GET /api/v1/analytics/system
Authorization: Bearer {token}
```

**Response:**
```json
{
  "system_health": {
    "status": "healthy",
    "uptime_seconds": 86400,
    "version": "2.1.0-v1-api"
  },
  "performance": {
    "avg_response_time_ms": 245,
    "cache_hit_rate": 0.87,
    "db_connection_pool": {
      "active": 5,
      "idle": 15,
      "total": 20
    }
  },
  "usage_stats": {
    "total_users": 1250,
    "active_users_24h": 89,
    "api_requests_24h": 15642,
    "messages_processed_24h": 8934
  }
}
```

### 🤖 AI Prediction API (`/api/v1/prediction/`)

#### Predict Message Priority
```http
POST /api/v1/prediction/priority
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "message_metadata": {
    "subject_hash": "abc123...",
    "sender_domain": "work.com",
    "received_at": "2025-08-05T16:30:00Z",
    "labels": ["INBOX", "WORK"]
  },
  "context": {
    "user_timezone": "UTC",
    "business_hours": true,
    "recent_interactions": 5
  }
}
```

**Response:**
```json
{
  "prediction_id": "pred_12345",
  "predicted_priority": "high",
  "confidence": 0.89,
  "reasoning": [
    "Sender domain indicates business communication",
    "Received during business hours",
    "Similar messages previously marked as high priority"
  ],
  "alternative_predictions": [
    {
      "priority": "medium",
      "confidence": 0.11
    }
  ],
  "processing_time_ms": 45
}
```

#### Submit Prediction Feedback
```http
POST /api/v1/prediction/feedback
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "prediction_id": "pred_12345",
  "actual_priority": "medium",
  "feedback_quality": 4,
  "notes": "Was medium priority, not high"
}
```

**Response:**
```json
{
  "feedback_id": "feedback_67890",
  "status": "recorded",
  "will_retrain": true,
  "learning_impact": "medium"
}
```

### 👤 User Management API (`/api/v1/user/`)

#### Get User Profile
```http
GET /api/v1/user/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "full_name": "John Doe",
  "auth_method": "oauth",
  "created_at": "2025-01-15T10:30:00Z",
  "last_login": "2025-08-05T16:20:00Z",
  "settings": {
    "privacy_level": "strict",
    "ai_suggestions": true,
    "notification_frequency": "daily",
    "timezone": "UTC"
  },
  "connected_services": {
    "gmail": {
      "connected": true,
      "permissions": ["readonly"],
      "last_sync": "2025-08-05T16:25:00Z"
    }
  }
}
```

#### Update User Settings
```http
PUT /api/v1/user/settings
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "privacy_level": "balanced",
  "ai_suggestions": true,
  "notification_frequency": "weekly",
  "timezone": "America/New_York"
}
```

**Response:**
```json
{
  "status": "updated",
  "settings": {
    "privacy_level": "balanced",
    "ai_suggestions": true,
    "notification_frequency": "weekly",
    "timezone": "America/New_York"
  }
}
```

### 💬 Message Processing API (`/api/v1/messages/`)

#### Process Message Metadata
```http
POST /api/v1/messages/process
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "source": "gmail",
  "external_id": "msg_12345",
  "metadata": {
    "sender_domain": "work.com",
    "subject_preview": "Meeting Tomorrow",
    "received_at": "2025-08-05T16:30:00Z",
    "labels": ["INBOX", "WORK"]
  },
  "privacy_mode": true
}
```

**Response:**
```json
{
  "message_id": 789,
  "processing_status": "completed",
  "privacy_applied": true,
  "ai_analysis": {
    "predicted_priority": "high",
    "predicted_context": "meeting",
    "confidence": 0.87
  },
  "stored_metadata": {
    "subject_hash": "abc123...",
    "sender_domain": "work.com",
    "received_at": "2025-08-05T16:30:00Z"
  }
}
```

#### Get Processed Messages
```http
GET /api/v1/messages?source=gmail&limit=20&priority=high
Authorization: Bearer {token}
```

**Query Parameters:**
- `source` (string): Message source filter (gmail, whatsapp, etc.)
- `limit` (int): Number of messages to return (default: 20, max: 100)
- `priority` (string): Priority filter (high, medium, low)
- `date_from` (string): Start date (ISO format)
- `date_to` (string): End date (ISO format)

**Response:**
```json
{
  "messages": [
    {
      "id": 789,
      "source": "gmail",
      "external_id": "msg_12345",
      "sender_domain": "work.com",
      "subject_preview": "Meeting Tomorrow",
      "received_at": "2025-08-05T16:30:00Z",
      "predicted_priority": "high",
      "predicted_context": "meeting",
      "prediction_confidence": 0.87,
      "processed_at": "2025-08-05T16:30:15Z"
    }
  ],
  "total": 156,
  "page": 1,
  "pages": 8,
  "has_next": true
}
```

## Error Responses

All API endpoints use standardized error responses:

### Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "request_id": "req_12345",
    "timestamp": "2025-08-05T16:30:00Z"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_REQUIRED` - Missing or invalid authentication
- `AUTHORIZATION_FAILED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVICE_UNAVAILABLE` - External service unavailable
- `PRIVACY_VIOLATION` - Privacy policy violation detected

## Rate Limits

- **General API**: 1000 requests per hour per user
- **Gmail Sync**: 100 requests per hour per user
- **AI Predictions**: 500 requests per hour per user
- **Analytics**: 200 requests per hour per user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1691251200
```

## Webhooks (Future)

Webhook endpoints for real-time updates:

```http
POST /webhooks/gmail
POST /webhooks/predictions
POST /webhooks/analytics
```

## SDK Examples

### Python SDK
```python
from socialify_client import SocialifyClient

client = SocialifyClient(
    base_url="https://api.socialify.ai",
    token="your_jwt_token"
)

# Fetch Gmail messages
messages = client.gmail.fetch_messages(limit=50, privacy_mode=True)

# Get user analytics
analytics = client.analytics.get_user_analytics(days=30)

# Make AI prediction
prediction = client.prediction.predict_priority({
    "subject_hash": "abc123...",
    "sender_domain": "work.com"
})
```

### JavaScript SDK
```javascript
import { SocialifyClient } from '@socialify/client';

const client = new SocialifyClient({
  baseURL: 'https://api.socialify.ai',
  token: 'your_jwt_token'
});

// Fetch Gmail messages
const messages = await client.gmail.fetchMessages({
  limit: 50,
  privacyMode: true
});

// Get user analytics
const analytics = await client.analytics.getUserAnalytics({
  days: 30
});
```

## 🛠️ Frontend Best Practices & Error Handling

### Comprehensive Error Handling
```javascript
// utils/errorHandler.js
import { APIError } from '../lib/api';

export const handleAPIError = (error, context = '') => {
  console.error(`API Error ${context}:`, error);

  // Handle specific error codes
  switch (error.code) {
    case 'AUTHENTICATION_REQUIRED':
      // Redirect to login
      window.location.href = '/login';
      return 'Please log in to continue';
      
    case 'AUTHORIZATION_FAILED':
      return 'You don\'t have permission to perform this action';
      
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many requests. Please wait a moment and try again';
      
    case 'SERVICE_UNAVAILABLE':
      return 'Service is temporarily unavailable. Please try again later';
      
    case 'VALIDATION_ERROR':
      return `Invalid input: ${error.details?.issue || error.message}`;
      
    case 'NETWORK_ERROR':
      return 'Network connection failed. Please check your internet connection';
      
    default:
      return error.message || 'An unexpected error occurred';
  }
};

// Custom hook for error handling
export const useErrorHandler = () => {
  const [globalError, setGlobalError] = useState(null);

  const handleError = (error, context = '') => {
    const message = handleAPIError(error, context);
    setGlobalError({ message, context, timestamp: Date.now() });
    
    // Auto-clear error after 5 seconds
    setTimeout(() => setGlobalError(null), 5000);
    
    return message;
  };

  const clearError = () => setGlobalError(null);

  return { globalError, handleError, clearError };
};
```

### Loading States and UI Feedback
```javascript
// components/LoadingSpinner.jsx
export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
};

// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Rate Limiting and Request Management
```javascript
// utils/requestQueue.js
class RequestQueue {
  constructor(maxConcurrent = 5, rateLimitPerMinute = 60) {
    this.queue = [];
    this.running = [];
    this.maxConcurrent = maxConcurrent;
    this.rateLimitPerMinute = rateLimitPerMinute;
    this.requestTimes = [];
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running.length >= this.maxConcurrent) return;
    if (this.queue.length === 0) return;

    // Check rate limit
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(time => now - time < 60000);
    
    if (this.requestTimes.length >= this.rateLimitPerMinute) {
      // Wait until we can make another request
      const oldestRequest = Math.min(...this.requestTimes);
      const waitTime = 60000 - (now - oldestRequest);
      setTimeout(() => this.process(), waitTime);
      return;
    }

    const { requestFn, resolve, reject } = this.queue.shift();
    this.requestTimes.push(now);
    
    const runningRequest = requestFn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running = this.running.filter(r => r !== runningRequest);
        this.process();
      });

    this.running.push(runningRequest);
  }
}

export const requestQueue = new RequestQueue();

// Enhanced API client with queue
export class EnhancedSocialifyAPI extends SocialifyAPI {
  async request(endpoint, options = {}) {
    return requestQueue.add(() => super.request(endpoint, options));
  }
}
```

### Caching Strategy
```javascript
// utils/cache.js
class APICache {
  constructor(defaultTTL = 300000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, data, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Cache patterns for different data types
  getCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }
}

export const apiCache = new APICache();

// Cached request hook
export const useCachedRequest = (endpoint, params = {}, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { ttl = 300000, enabled = true } = options;

  const fetchData = async (forceRefresh = false) => {
    if (!enabled) return;

    const cacheKey = apiCache.getCacheKey(endpoint, params);
    
    if (!forceRefresh) {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await api.request(endpoint, { 
        method: 'GET',
        ...params 
      });
      
      apiCache.set(cacheKey, result, ttl);
      setData(result);
      return result;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, JSON.stringify(params), enabled]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    clearCache: () => {
      const cacheKey = apiCache.getCacheKey(endpoint, params);
      apiCache.delete(cacheKey);
    }
  };
};
```

### Real-time Updates (WebSocket/Polling)
```javascript
// hooks/useRealTimeUpdates.js
import { useState, useEffect, useRef } from 'react';

export const usePolling = (fetchFn, interval = 30000, enabled = true) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef();

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (error) {
        setError(error);
      }
    };

    // Initial fetch
    poll();

    // Set up polling
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchFn, interval, enabled]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = () => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(fetchFn, interval);
    }
  };

  return { data, error, stopPolling, startPolling };
};

// Example usage for real-time message updates
export const useRealTimeMessages = () => {
  const { fetchMessages } = useGmail();
  
  const { data: messages, error } = usePolling(
    () => fetchMessages({ limit: 20 }),
    30000, // Poll every 30 seconds
    true
  );

  return { messages, error };
};
```

### Performance Optimization
```javascript
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
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

// Example: Debounced search
export const useSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      searchFn(debouncedQuery)
        .then(setResults)
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [debouncedQuery, searchFn]);

  return { query, setQuery, results, loading };
};
```

### Security Best Practices
```javascript
// utils/security.js
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidJWT = (token) => {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Secure token storage
export const TokenStorage = {
  set: (token) => {
    if (typeof window !== 'undefined') {
      // Use sessionStorage for more security, or implement secure storage
      sessionStorage.setItem('socialify_token', token);
    }
  },
  
  get: () => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('socialify_token');
      return isValidJWT(token) ? token : null;
    }
    return null;
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('socialify_token');
    }
  }
};
```

---

For more examples and detailed integration guides, visit our [Developer Documentation](https://docs.socialify.ai).
