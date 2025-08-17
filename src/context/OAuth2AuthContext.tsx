import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '../services/api.ts';

interface User {
  id: number;
  email: string;
  full_name: string;
  auth_method: string;
  created_at: string;
  last_login: string;
  settings: {
    privacy_level: string;
    ai_suggestions: boolean;
    notification_frequency: string;
    timezone: string;
  };
  connected_services: {
    gmail: {
      connected: boolean;
      permissions: string[];
      last_sync: string;
    };
  };
}

interface OAuth2AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initiateGoogleAuth: () => Promise<void>;
  handleAuthCallback: (code: string, state: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const OAuth2AuthContext = createContext<OAuth2AuthContextType | undefined>(undefined);

export function useOAuth2Auth() {
  const context = useContext(OAuth2AuthContext);
  if (!context) {
    throw new Error('useOAuth2Auth must be used within OAuth2AuthProvider');
  }
  return context;
}

interface OAuth2AuthProviderProps {
  children: ReactNode;
}

export function OAuth2AuthProvider({ children }: OAuth2AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on app start
  useEffect(() => {
    checkUrlParamsAuth();
  }, []);

  const checkUrlParamsAuth = async () => {
    try {
      // Check for OAuth callback parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userId = urlParams.get('user_id');
      const email = urlParams.get('email');
      const name = urlParams.get('name') || urlParams.get('full_name');

      console.log('🔐 Checking URL parameters for OAuth data...');
      console.log('🔐 URL:', window.location.href);
      console.log('🔐 URL Search:', window.location.search);
      console.log('🔐 Token in URL:', token ? 'present (not used with httpOnly cookies)' : 'null');
      console.log('🔐 User ID:', userId);
      console.log('🔐 Email:', email);
      console.log('🔐 Name:', name);

      // With httpOnly cookies, we don't use tokens from URL parameters
      // The server should have already set the httpOnly cookies
      // We only use the URL parameters for initial user data if available
      
      if (userId && email) {
        console.log('🔐 Found user data in URL parameters');
        
        // Don't store tokens - they should be httpOnly cookies
        // ApiService.setToken() is deprecated for httpOnly cookie setup
        
        // Create user object from URL parameters
        const user = {
          id: parseInt(userId || '0'),
          email: email || '',
          full_name: name || email || 'User',
          auth_method: 'oauth',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          settings: {
            privacy_level: 'high',
            ai_suggestions: true,
            notification_frequency: 'daily',
            timezone: 'UTC'
          },
          connected_services: {
            gmail: {
              connected: true,
              permissions: ['read'],
              last_sync: new Date().toISOString()
            }
          }
        };

        console.log('🔐 Created user object from URL params:', user);

        // Store user data in session for UI purposes only (not security)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('user_email', user.email);
          sessionStorage.setItem('user_name', user.full_name);
        }

        setUser(user);
        setIsAuthenticated(true);
        
        console.log('✅ OAuth2 authentication successful from URL (httpOnly cookies):', user.email);
        
        // Clean up the URL
        const cleanUrl = window.location.pathname;
        console.log('🔐 Cleaning URL, redirecting to:', cleanUrl);
        window.history.replaceState({}, document.title, cleanUrl);
        
        setIsLoading(false);
        return;
      } else {
        console.log('🔐 No user data in URL, trying authentication validation...');
      }

      // Fallback: validate existing authentication via API call
      await validateToken();
    } catch (error: any) {
      console.error('❌ URL params auth failed, trying token validation:', error);
      await validateToken();
    }
  };

  const validateToken = async () => {
    try {
      // With httpOnly cookies, we don't check localStorage for tokens
      // Instead, we make an API call to see if we're authenticated
      console.log('🔐 Validating authentication via API call (httpOnly cookies)...');
      
      try {
        const response = await ApiService.getProfile();
        if (response.data) {
          // Map ProfileUser to OAuth2 User format
          const profileUser = response.data;
          const mappedUser: User = {
            id: profileUser.id,
            email: profileUser.email,
            full_name: profileUser.full_name,
            auth_method: profileUser.auth_method,
            created_at: profileUser.created_at,
            last_login: profileUser.last_login,
            settings: {
              privacy_level: 'high',
              ai_suggestions: true,
              notification_frequency: 'daily',
              timezone: 'UTC'
            },
            connected_services: {
              gmail: {
                connected: profileUser.gmail_connected,
                permissions: ['read'],
                last_sync: new Date().toISOString()
              }
            }
          };
          setUser(mappedUser);
          setIsAuthenticated(true);
          console.log('✅ Authentication validation successful (httpOnly cookies):', mappedUser.email);
        }
      } catch (profileError: any) {
        console.warn('⚠️ User profile fetch failed - not authenticated:', profileError.message);
        // With httpOnly cookies, if the API call fails, we're not authenticated
        // No fallback to localStorage since tokens are not accessible
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error('❌ Authentication validation failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateGoogleAuth = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('🔐 Initiating Google OAuth...');
      
      // Store current URL for redirect after auth
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('oauth_redirect_url', window.location.pathname);
      }
      
      // Make GET request to get authorization URL using the init endpoint
      const response = await ApiService.request<{ authorization_url?: string; auth_url?: string; url?: string }>('/auth/google/init', {
        method: 'GET'
      });
      
      console.log('🔐 OAuth initiation response:', response);
      console.log('🔐 Response keys:', Object.keys(response));
      console.log('🔐 Response type:', typeof response);
      console.log('🔐 Full response:', JSON.stringify(response, null, 2));
      
      // The API service returns the backend JSON directly (not wrapped in ApiResponse)
      // Backend returns: {"authorization_url": "https://..."}
      // So we access it directly on the response object
      const authUrl = (response as any).authorization_url || 
                     (response as any).auth_url || 
                     (response as any).url;
      
      if (authUrl) {
        console.log('🔐 Found authorization URL:', authUrl);
        console.log('🔐 Redirecting to authorization URL...');
        
        // Redirect to Google OAuth
        window.location.href = authUrl;
      } else {
        console.error('🔐 No authorization URL found in response');
        console.error('🔐 Response structure:', response);
        console.error('🔐 Available properties:', Object.keys(response));
        throw new Error('No authorization URL received from server');
      }
    } catch (error: any) {
      console.error('❌ OAuth initiation failed:', error);
      setError(error.message || 'Failed to initiate Google authentication');
      setIsLoading(false);
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 Processing OAuth callback (httpOnly cookies)...');
      console.log('🔐 Code:', code?.substring(0, 20) + '...');
      console.log('🔐 State:', state);
      
      const response = await ApiService.handleOAuthCallback(code, state);
      console.log('🔐 Callback response:', response);
      
      // With httpOnly cookies, the server sets the authentication cookies automatically
      // We don't need to manually handle tokens - they're set as httpOnly cookies
      // The response should contain user data or success confirmation
      
      let userData;
      if (response.data) {
        // If response is wrapped in ApiResponse format
        const responseData = response.data as any;
        userData = responseData.user || responseData.user_info || responseData;
      } else {
        // If response is direct data
        const responseAny = response as any;
        userData = responseAny.user || responseAny.user_info || responseAny;
      }
      
      if (!userData || !userData.email) {
        // If no user data in response, try to fetch user profile
        // The httpOnly cookies should now be set, so this should work
        try {
          const profileResponse = await ApiService.getProfile();
          if (profileResponse.data) {
            userData = {
              id: profileResponse.data.id,
              email: profileResponse.data.email,
              name: profileResponse.data.full_name,
              full_name: profileResponse.data.full_name,
              auth_method: profileResponse.data.auth_method,
              created_at: profileResponse.data.created_at,
              last_login: profileResponse.data.last_login,
              gmail_connected: profileResponse.data.gmail_connected
            };
          } else {
            throw new Error('No user data received from server');
          }
        } catch (profileError) {
          throw new Error('Authentication succeeded but failed to fetch user profile');
        }
      }
      
      // Map backend user data to frontend user format
      const user = {
        id: userData.user_id || userData.id,
        email: userData.email,
        full_name: userData.name || userData.full_name,
        auth_method: userData.auth_method || 'oauth',
        created_at: userData.created_at || new Date().toISOString(),
        last_login: userData.last_login || new Date().toISOString(),
        settings: userData.settings || {
          privacy_level: 'high',
          ai_suggestions: true,
          notification_frequency: 'daily',
          timezone: 'UTC'
        },
        connected_services: {
          gmail: {
            connected: userData.gmail_connected || false,
            permissions: ['read'],
            last_sync: new Date().toISOString()
          }
        }
      };
      
      // With httpOnly cookies, tokens are managed server-side
      // No need to call ApiService.setToken() - cookies are already set
      
      // Store user data in session for UI purposes only (not security)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('user_email', user.email);
        sessionStorage.setItem('user_name', user.full_name);
      }
      
      setUser(user);
      setIsAuthenticated(true);
      
      console.log('✅ OAuth2 authentication successful (httpOnly cookies):', user.email);
      
      // Redirect to original URL or dashboard
      const redirectUrl = sessionStorage.getItem('oauth_redirect_url') || '/dashboard';
      sessionStorage.removeItem('oauth_redirect_url');
      
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    } catch (error: any) {
      console.error('❌ OAuth callback error:', error);
      setError(error.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      setError(null);
      const profileUser = await ApiService.getUserProfile();
      // Map ProfileUser to OAuth2 User format
      const mappedUser: User = {
        id: profileUser.id,
        email: profileUser.email,
        full_name: profileUser.full_name,
        auth_method: profileUser.auth_method,
        created_at: profileUser.created_at,
        last_login: profileUser.last_login,
        settings: {
          privacy_level: 'high',
          ai_suggestions: true,
          notification_frequency: 'daily',
          timezone: 'UTC'
        },
        connected_services: {
          gmail: {
            connected: profileUser.gmail_connected,
            permissions: ['read'],
            last_sync: new Date().toISOString()
          }
        }
      };
      setUser(mappedUser);
    } catch (error: any) {
      console.error('Failed to refresh user profile:', error);
      setError(error.message || 'Failed to refresh profile');
    }
  };

  const logout = async () => {
    try {
      // Call server-side logout to clear httpOnly cookies
      await ApiService.logout();
      console.log('✅ Server-side logout successful (httpOnly cookies cleared)');
    } catch (error) {
      console.warn('⚠️ Server logout failed, proceeding with local logout:', error);
    } finally {
      // Clear local auth data (but not tokens since they're httpOnly)
      ApiService.clearAuthData();
      
      // Clear user state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('🔐 Local logout completed (httpOnly cookies cleared by server)');
      
      // Redirect to OAuth2 login
      if (typeof window !== 'undefined') {
        window.location.href = '/oauth2-login';
      }
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: OAuth2AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    initiateGoogleAuth,
    handleAuthCallback,
    logout,
    refreshUserProfile,
    error,
    clearError
  };

  return (
    <OAuth2AuthContext.Provider value={value}>
      {children}
    </OAuth2AuthContext.Provider>
  );
}

// Error boundary for OAuth2 authentication
export class OAuth2ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('OAuth2 Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Error
            </h1>
            <p className="text-gray-600 mb-4">
              Something went wrong with authentication. Please try again.
            </p>
            <button
              onClick={() => window.location.href = '/oauth2-login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OAuth2AuthContext;
