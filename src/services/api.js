// API Service pour gérer toutes les requêtes vers le backend
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Méthode pour récupérer le token d'authentification
  getAuthToken() {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('socialify_token') || sessionStorage.getItem('socialify_token') || sessionStorage.getItem('jwt_token');
    }
    return null;
  }

  // Set token method for new OAuth flow
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('socialify_token', token);
      // Remove old token storage
      sessionStorage.removeItem('socialify_token');
      sessionStorage.removeItem('jwt_token');
    }
  }

  // Méthode pour créer les headers avec authentification
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Méthode générique pour faire des requêtes
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.requireAuth !== false),
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${config.method || 'GET'} ${url}`, data);
      
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${config.method || 'GET'} ${url}`, error);
      
      // Si le token est expiré (401), on nettoie la session
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        this.clearAuthData();
        window.location.href = '/oauth2-login';
      }
      
      throw error;
    }
  }

  // Méthodes HTTP
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Méthode pour nettoyer les données d'authentification
  clearAuthData() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('socialify_token');
      sessionStorage.removeItem('socialify_token');
      sessionStorage.removeItem('jwt_token'); // Remove old token
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('user_name');
      localStorage.removeItem('user');
    }
  }

  // Méthode pour déboguer l'état de l'authentification
  debugAuthState() {
    const token = this.getAuthToken();
    const userEmail = sessionStorage.getItem('user_email');
    const userName = sessionStorage.getItem('user_name');
    
    console.log('🔍 Debug Auth State:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      userEmail,
      userName,
      sessionStorage: Object.keys(sessionStorage),
      localStorage: Object.keys(localStorage)
    });
    
    // Vérifier si le token est expiré (si c'est un JWT)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convertir en millisecondes
        const now = Date.now();
        const isExpired = now > exp;
        
        console.log('🕐 Token Info:', {
          exp: new Date(exp).toISOString(),
          now: new Date(now).toISOString(),
          isExpired,
          timeLeft: isExpired ? 'EXPIRED' : `${Math.round((exp - now) / 1000 / 60)} minutes`
        });
        
        return { hasToken: true, isExpired, userEmail, userName };
      } catch (error) {
        console.log('❌ Token parsing error:', error);
        return { hasToken: true, isExpired: true, userEmail, userName };
      }
    }
    
    return { hasToken: false, isExpired: true, userEmail, userName };
  }

  // === MÉTHODES D'AUTHENTIFICATION ===

  // Get Google OAuth URL - Fixed to match API reference
  async getGoogleAuthUrl() {
    return this.get('/auth/google', { requireAuth: false });
  }

  // Handle OAuth callback - Fixed to match API reference (GET only)
  async handleOAuthCallback(code, state) {
    return this.get(`/auth/google/callback?code=${code}&state=${state}`, { requireAuth: false });
  }

  // DEPRECATED: Remove email/password login - keeping for backward compatibility
  async login(email, password) {
    console.warn('⚠️ Email/password login is deprecated. Use OAuth2 flow instead.');
    return this.post('/auth/login', { email, password }, { requireAuth: false });
  }

  // DEPRECATED: Direct Google auth - keeping for backward compatibility  
  async googleAuth(credential) {
    console.warn('⚠️ Direct Google auth is deprecated. Use OAuth2 flow instead.');
    return this.post('/auth/google', { credential }, { requireAuth: false });
  }

  // Déconnexion
  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // === GMAIL API METHODS - Updated to match new backend structure ===

  // Connect Gmail account
  async connectGmail(forceReconnect = false) {
    return this.post('/api/v1/gmail/connect', { force_reconnect: forceReconnect });
  }

  // Fetch Gmail messages with privacy-first approach
  async fetchGmailMessages({ 
    maxMessages = 50, 
    forceSync = false 
  } = {}) {
    const body = {
      max_messages: maxMessages,
      force_sync: forceSync
    };
    return this.post('/api/v1/gmail/fetch', body);
  }

  // Get Gmail statistics
  async getGmailStats(days = 30) {
    return this.get(`/api/v1/gmail/stats?days=${days}`);
  }

  // === USER PROFILE & SETTINGS - Updated endpoints ===

  // Get user profile
  async getUserProfile() {
    return this.get('/api/v1/user/profile');
  }

  // Update user settings
  async updateUserSettings(settings) {
    return this.put('/api/v1/user/settings', settings);
  }

  // === ANALYTICS API - Updated endpoints ===

  // Get dashboard stats
  async getDashboardStats(days = 30) {
    const params = new URLSearchParams({ days: days.toString() });
    return this.get(`/dashboard/stats?${params}`);
  }

  // Get detailed analytics
  async getDashboardAnalytics(days = 30) {
    const params = new URLSearchParams({ days: days.toString() });
    return this.get(`/dashboard/analytics/detailed?${params}`);
  }

  // Get user analytics
  async getUserAnalytics(userId, options = {}) {
    const { days = 30, includeTrends = true } = options;
    const params = new URLSearchParams({
      days: days.toString(),
      include_trends: includeTrends.toString()
    });
    return this.get(`/api/v1/analytics/user/${userId}?${params}`);
  }

  // Get system metrics
  async getSystemMetrics() {
    return this.get('/api/v1/analytics/system');
  }

  // === AI PREDICTION API - Updated endpoints ===

  // Predict message priority
  async predictMessagePriority(messageMetadata, context = {}) {
    return this.post('/api/v1/prediction/priority', {
      message_metadata: messageMetadata,
      context: context
    });
  }

  // Submit prediction feedback
  async submitPredictionFeedback(predictionId, actualPriority, feedbackQuality = 5, notes = '') {
    return this.post('/api/v1/prediction/feedback', {
      prediction_id: predictionId,
      actual_priority: actualPriority,
      feedback_quality: feedbackQuality,
      notes: notes
    });
  }

  // === MESSAGE PROCESSING API - Updated endpoints ===

  // Process message metadata (privacy-first)
  async processMessage(source, externalId, metadata, privacyMode = true) {
    return this.post('/api/v1/messages/process', {
      source: source,
      external_id: externalId,
      metadata: metadata,
      privacy_mode: privacyMode
    });
  }

  // Get processed messages
  async getProcessedMessages(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/api/v1/messages?${queryParams}` : '/api/v1/messages';
    return this.get(endpoint);
  }

  // === DEPRECATED METHODS - Keeping for backward compatibility ===

  // DEPRECATED: Use getProcessedMessages instead
  async getMessages(params = {}) {
    console.warn('⚠️ getMessages is deprecated. Use getProcessedMessages instead.');
    return this.getProcessedMessages(params);
  }

  // DEPRECATED: Use fetchGmailMessages instead
  async fetchMessages(source = 'gmail') {
    console.warn('⚠️ fetchMessages is deprecated. Use fetchGmailMessages instead.');
    if (source === 'gmail') {
      return this.fetchGmailMessages();
    }
    return this.post('/messages/fetch', { source });
  }

  // DEPRECATED: Use predictMessagePriority instead
  async predictMessage(messageData) {
    console.warn('⚠️ predictMessage is deprecated. Use predictMessagePriority instead.');
    return this.predictMessagePriority(messageData);
  }

  // DEPRECATED: Use submitPredictionFeedback instead
  async submitFeedback(messageId, correctedPriority, correctedContext) {
    console.warn('⚠️ submitFeedback is deprecated. Use submitPredictionFeedback instead.');
    return this.submitPredictionFeedback(messageId, correctedPriority, 5, correctedContext);
  }

  // DEPRECATED: Use getUserAnalytics instead
  async getAnalytics(timeRange = '30d') {
    console.warn('⚠️ getAnalytics is deprecated. Use getUserAnalytics instead.');
    return this.get(`/analytics?range=${timeRange}`);
  }

  // DEPRECATED: Use updateUserSettings instead
  async getUserSettings() {
    console.warn('⚠️ getUserSettings is deprecated. Use getUserProfile instead.');
    return this.getUserProfile();
  }

  // === MÉTHODES DE TEST GMAIL ===

  // Test de santé de l'API
  async testHealth() {
    return this.get('/test/health', { requireAuth: false });
  }

  // Test de connexion à la base de données
  async testDatabase() {
    return this.get('/test/test-db');
  }

  // Test d'authentification
  async testAuth() {
    return this.get('/test/auth-check');
  }

  // Récupérer le statut Gmail de l'utilisateur
  async getGmailStatus() {
    return this.get('/test/gmail-status');
  }

  // Diagnostic complet de la connexion Gmail
  async diagnoseGmail() {
    return this.post('/test/gmail-diagnose');
  }

  // Récupérer les messages Gmail directement depuis l'API Gmail
  async getGmailMessagesLive(maxResults = 10) {
    return this.get(`/test/gmail-messages-live?max_results=${maxResults}`);
  }

  // Test de récupération Gmail (depuis la base de données)
  async testGmailFetch(maxMessages = 5) {
    return this.post('/test/gmail-fetch', { max_messages: maxMessages });
  }

  // Récupérer les informations détaillées du token Gmail
  async getGmailTokenInfo() {
    return this.get('/test/gmail-token-info');
  }

  // Obtenir une nouvelle URL d'autorisation Gmail
  async getGmailReauthUrl() {
    return this.get('/test/gmail-reauth-url');
  }

  // === MÉTHODES D'AUTHENTIFICATION GMAIL ===

  // Initialiser l'authentification Google/Gmail
  async initGoogleAuth(userId) {
    const params = userId ? `?user_id=${userId}` : '';
    return this.get(`/auth/google/init${params}`);
  }

  // Callback d'authentification Google
  async googleCallback(code, state) {
    return this.post('/auth/google/callback', { code, state }, { requireAuth: false });
  }
}

// Exporter une instance unique du service
export const apiService = new ApiService();
export default apiService;
